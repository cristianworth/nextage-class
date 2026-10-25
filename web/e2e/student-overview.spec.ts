import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
const key = 'nextage-class:workspace:v1'
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-23T15:00:00Z') })
  await page.goto('/')
})
async function nav(page: Page, name: string) {
  await page
    .getByRole('navigation', { name: 'Navegação principal' })
    .getByRole('button', { name, exact: true })
    .click()
}
async function preview(page: Page) {
  await page.getByRole('button', { name: 'Ver como aluno', exact: true }).click()
}
async function schedule(page: Page, date: string, hour: string, weekly = false) {
  await nav(page, 'Agenda')
  await page.getByRole('button', { name: 'Nova aula', exact: true }).click()
  await page.getByRole('combobox', { name: 'Aluno', exact: true }).selectOption('student-lara')
  await page.getByLabel('Data da aula').fill(date)
  await page.getByRole('combobox', { name: 'Horário', exact: true }).selectOption(hour)
  if (weekly) await page.getByLabel('Repetir toda semana').check()
  await page.getByRole('button', { name: 'Agendar aula', exact: true }).click()
}

test('consulta material e homework próprios, preserva cópia histórica e não mostra texto reservado', async ({
  page,
}) => {
  await page
    .locator('.calendar-table .lesson-block')
    .filter({ hasText: 'Lara Santos' })
    .filter({ hasText: '10:00' })
    .click()
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Conteúdo trabalhado', exact: true })
    .fill('PRIVATE_CLASS_NOTES')
  await page
    .getByRole('combobox', { name: 'Conteúdo utilizado', exact: true })
    .selectOption('material-a2')
  await page.getByLabel('Homework passado').fill('Read and discuss the dialogue')
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
  await nav(page, 'Alunos')
  await page.getByRole('button', { name: 'Editar Lara Santos', exact: true }).click()
  await page.getByLabel('Telefone', { exact: true }).fill('PRIVATE_PHONE')
  await page.getByLabel('Ocupação', { exact: true }).fill('PRIVATE_JOB')
  await page.getByRole('textbox', { name: 'Interesses', exact: true }).fill('PRIVATE_INTEREST')
  await page.getByLabel('Link da aula').fill('https://meet.example.test/lara')
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
  await schedule(page, '2026-10-26', '7')
  await preview(page)
  const surface = page.getByRole('region', { name: 'Área do aluno', exact: true })
  await expect(surface).toContainText('Lara Santos')
  for (const hidden of [
    'PRIVATE_CLASS_NOTES',
    'PRIVATE_PHONE',
    'PRIVATE_JOB',
    'PRIVATE_INTEREST',
    'Mateus Costa',
    'Sofia Lima',
  ])
    await expect(surface).not.toContainText(hidden)
  await expect(
    surface.getByRole('link', { name: 'Abrir link da aula', exact: true }),
  ).toHaveAttribute('href', 'https://meet.example.test/lara')
  await expect(surface).toContainText('Read and discuss the dialogue')
  await surface.getByRole('button', { name: 'Meu histórico', exact: true }).click()
  await expect(surface).toContainText('Planning a weekend trip')
  await expect(surface).toContainText('HOMEWORK · PENDENTE')
  await surface.getByText('Ler material desta aula', { exact: true }).click()
  await expect(surface.locator('.material-text')).toContainText('Plan a two-day trip')
  await expect(
    surface.getByRole('button', { name: /Editar|Marcar como|Lançar|Agendar/ }),
  ).toHaveCount(0)
  await surface
    .getByRole('textbox', { name: 'Buscar material ou homework', exact: true })
    .fill('PRIVATE_CLASS_NOTES')
  await expect(surface).toContainText('Nenhum resultado encontrado')
  await page.getByRole('button', { name: 'Voltar à professora', exact: true }).click()
  await nav(page, 'Histórico')
  await page
    .locator('.history-card')
    .filter({ hasText: 'PRIVATE_CLASS_NOTES' })
    .getByRole('button', { name: 'Marcar como corrigido', exact: true })
    .click()
  await nav(page, 'Acervo')
  await page
    .getByRole('button', { name: 'Ler material Planning a weekend trip', exact: true })
    .click()
  await page.getByRole('button', { name: 'Editar material', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Conteúdo do material', exact: true })
    .fill('REVISED_CATALOG_CONTENT')
  await page.getByRole('button', { name: 'Salvar material', exact: true }).click()
  await preview(page)
  await expect(surface).toContainText('Nenhum homework pendente')
  await surface.getByRole('button', { name: 'Meu histórico', exact: true }).click()
  await expect(surface).toContainText('HOMEWORK · CORRIGIDO')
  await expect(surface).not.toContainText('REVISED_CATALOG_CONTENT')
  await expect(surface).not.toContainText('PRIVATE_CLASS_NOTES')
  await page.screenshot({ path: '../work/screenshots/student-history-desktop.png', fullPage: true })
})

test('simulação troca apenas a consulta e não grava modo, seleção ou navegação', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Reiniciar demo', exact: true }).click()
  await page.getByRole('button', { name: 'Sim, reiniciar demo', exact: true }).click()
  const before = await page.evaluate((key) => localStorage.getItem(key), key)
  await preview(page)
  const surface = page.getByRole('region', { name: 'Área do aluno', exact: true })
  await surface.getByRole('button', { name: 'Meu histórico', exact: true }).click()
  await expect(surface).toContainText('Travel essentials')
  await page
    .getByRole('combobox', { name: 'Aluno da simulação', exact: true })
    .selectOption('student-mateus')
  await expect(surface).toContainText('Mateus Costa')
  await expect(surface).not.toContainText('Lara Santos')
  await expect(surface).toContainText('22:00')
  await surface.getByRole('button', { name: 'Meu histórico', exact: true }).click()
  await expect(surface).toContainText('Seu histórico começa com a primeira aula')
  await expect(surface).not.toContainText('Travel essentials')
  await page
    .getByRole('combobox', { name: 'Aluno da simulação', exact: true })
    .selectOption('student-lara')
  await expect(surface.getByRole('button', { name: 'Minhas aulas', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  )
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(before)
  await page.reload()
  await expect(page.getByRole('button', { name: 'Ver como aluno', exact: true })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Aluno da simulação', exact: true })).toHaveCount(
    0,
  )
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(before)
})

test('próximas aulas acompanham remarcação semanal sem duplicar ocorrência', async ({ page }) => {
  await schedule(page, '2026-10-27', '8', true)
  await page.getByRole('button', { name: 'Próxima semana', exact: true }).click()
  await page
    .locator('.calendar-table .lesson-block')
    .filter({ hasText: 'Lara Santos' })
    .filter({ hasText: '08:00' })
    .click()
  await page.getByRole('button', { name: 'Remarcar aula', exact: true }).click()
  await page.getByLabel('Nova data').fill('2026-10-29')
  await page.getByRole('combobox', { name: 'Novo horário', exact: true }).selectOption('11')
  await page.getByRole('button', { name: 'Salvar remarcação', exact: true }).click()
  await preview(page)
  const lessons = page.locator('.student-lesson')
  await expect(lessons).toHaveCount(6)
  await expect(lessons.first()).toContainText('29')
  await expect(lessons.first()).toContainText('11:00')
  await expect(lessons.nth(1)).toContainText('08:00')
  await expect(page.getByRole('region', { name: 'Área do aluno', exact: true })).not.toContainText(
    'Mateus Costa',
  )
  await page.screenshot({ path: '../work/screenshots/student-agenda-desktop.png', fullPage: true })
})

test('celular mostra estados vazios e consulta sem ultrapassar largura; base sem alunos não usa fallback', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await preview(page)
  const surface = page.getByRole('region', { name: 'Área do aluno', exact: true })
  await expect(surface).toContainText('Nenhuma próxima aula')
  await expect(surface).toContainText('Nenhum homework pendente')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await surface.getByRole('button', { name: 'Meu histórico', exact: true }).click()
  await surface
    .getByRole('textbox', { name: 'Buscar material ou homework', exact: true })
    .fill('not found')
  await expect(surface).toContainText('Nenhum resultado encontrado')
  await page.screenshot({ path: '../work/screenshots/student-mobile.png', fullPage: true })
  await page.getByRole('button', { name: 'Voltar à professora', exact: true }).click()
  await page.getByRole('button', { name: 'Reiniciar demo', exact: true }).click()
  await page.getByRole('button', { name: 'Sim, reiniciar demo', exact: true }).click()
  await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key)!)
    state.students = []
    state.lessons = []
    state.records = []
    state.series = []
    state.plans = []
    localStorage.setItem(key, JSON.stringify(state))
  }, key)
  await page.reload()
  await preview(page)
  await expect(
    page.getByRole('combobox', { name: 'Aluno da simulação', exact: true }),
  ).toBeDisabled()
  await expect(
    page.getByRole('heading', { name: 'Nenhum aluno para consultar', exact: true }),
  ).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
