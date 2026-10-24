import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

const key = 'nextage-class:workspace:v1'
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-23T15:00:00Z') })
  await page.goto('/')
})
async function navigate(page: Page, name: string) {
  await page
    .getByRole('navigation', { name: 'Navegação principal' })
    .getByRole('button', { name, exact: true })
    .click()
}
async function createMaterial(page: Page, title = 'Asking for directions') {
  await navigate(page, 'Acervo')
  await page.getByRole('button', { name: 'Novo material', exact: true }).click()
  await page.getByRole('textbox', { name: 'Título', exact: true }).fill(title)
  await page.getByRole('checkbox', { name: 'A2', exact: true }).check()
  await page
    .getByRole('textbox', { name: 'Conteúdo do material', exact: true })
    .fill('Turn left at the park. Ask for the nearest station.')
  await page.getByRole('button', { name: 'Salvar material', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  return page.evaluate(
    ({ key, title }) =>
      JSON.parse(localStorage.getItem(key)!).materials.find(
        (item: { title: string }) => item.title === title,
      ).id as string,
    { key, title },
  )
}
async function schedule(page: Page, date: string, hour: number, weekly = false) {
  await navigate(page, 'Agenda')
  await page.getByRole('button', { name: 'Nova aula', exact: true }).click()
  await page.getByRole('combobox', { name: 'Aluno', exact: true }).selectOption('student-lara')
  await page.getByLabel('Data da aula').fill(date)
  await page.getByRole('combobox', { name: 'Horário', exact: true }).selectOption(String(hour))
  if (weekly) await page.getByLabel('Repetir toda semana').check()
  await page.getByRole('button', { name: 'Agendar aula', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
}
async function openLaraAt(page: Page, hour: string) {
  await page
    .locator('.calendar-table .lesson-block')
    .filter({ hasText: 'Lara Santos' })
    .filter({ hasText: hour })
    .click()
}

test('prepara, registra material e homework, corrige e mantém a versão histórica após editar o acervo', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const materialId = await createMaterial(page)
  await page.screenshot({ path: '../work/screenshots/materials-desktop.png', fullPage: true })
  await navigate(page, 'Agenda')
  await openLaraAt(page, '10:00')
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Conteúdo trabalhado', exact: true })
    .fill('Perguntas para pedir direções.')
  await page.getByRole('combobox', { name: 'Livro/material' }).selectOption(materialId)
  await page.getByLabel('Homework passado').fill('Exercícios 1 a 5')
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
  await schedule(page, '2026-10-23', 14)
  await openLaraAt(page, '14:00')
  await expect(page.getByRole('dialog')).toContainText('Perguntas para pedir direções.')
  await expect(page.getByRole('dialog')).toContainText('Exercícios 1 a 5')
  await page.getByRole('button', { name: 'Marcar como corrigido', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('Nenhum homework anterior pendente.')
  await page.getByRole('button', { name: 'Preparar aula', exact: true }).click()
  await page.getByRole('combobox', { name: 'Material planejado' }).selectOption(materialId)
  await page
    .getByLabel('Anotações para esta aula')
    .fill('Retomar as perguntas e simular uma viagem.')
  await page.getByRole('button', { name: 'Salvar preparação', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('Material planejado: Asking for directions')
  await page.getByRole('button', { name: 'Fechar', exact: true }).last().click()
  await page.clock.setFixedTime(new Date('2026-10-23T18:00:00Z'))
  await page.reload()
  await openLaraAt(page, '14:00')
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
  await expect(page.getByRole('combobox', { name: 'Livro/material' })).toHaveValue(materialId)
  await page
    .getByRole('textbox', { name: 'Conteúdo trabalhado', exact: true })
    .fill('Simulação de viagem com direções.')
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
  await navigate(page, 'Acervo')
  await page
    .getByRole('button', { name: 'Ler material Asking for directions', exact: true })
    .click()
  await page.getByRole('button', { name: 'Editar material', exact: true }).click()
  await page.getByRole('textbox', { name: 'Título', exact: true }).fill('Directions revised')
  await page
    .getByRole('textbox', { name: 'Conteúdo do material', exact: true })
    .fill('A new version of the material.')
  await page.getByRole('button', { name: 'Salvar material', exact: true }).click()
  await navigate(page, 'Histórico')
  const entry = page
    .locator('.history-card')
    .filter({ hasText: 'Simulação de viagem com direções.' })
  await entry.getByText('Conteúdo do material utilizado', { exact: false }).click()
  await expect(entry).toContainText('Turn left at the park.')
  await expect(entry).not.toContainText('A new version of the material.')
  await entry.getByRole('button', { name: /Editar registro/ }).click()
  await expect(page.getByRole('combobox', { name: 'Livro/material' })).toHaveValue('saved')
  await page
    .getByRole('textbox', { name: 'Conteúdo trabalhado', exact: true })
    .fill('Conteúdo ajustado, material preservado.')
  await page.getByRole('button', { name: 'Salvar registro', exact: true }).click()
  await page.reload()
  await navigate(page, 'Histórico')
  const updated = page
    .locator('.history-card')
    .filter({ hasText: 'Conteúdo ajustado, material preservado.' })
  await updated.getByText('Conteúdo do material utilizado', { exact: false }).click()
  await expect(updated).toContainText('Turn left at the park.')
  const source = page.locator('.history-card').filter({ hasText: 'Exercícios 1 a 5' })
  await expect(source).toContainText('CORRIGIDO')
  await source.getByRole('button', { name: 'Marcar como pendente', exact: true }).click()
  await expect(source).toContainText('PENDENTE')
  await page.screenshot({
    path: '../work/screenshots/history-pedagogy-desktop.png',
    fullPage: true,
  })
  expect(errors).toEqual([])
})

test('plano de ocorrência acompanha remarcação individual e depois da série', async ({ page }) => {
  await schedule(page, '2026-10-27', 8, true)
  await page.getByRole('button', { name: 'Próxima semana', exact: true }).click()
  await page.getByRole('button', { name: 'Próxima semana', exact: true }).click()
  await openLaraAt(page, '08:00')
  await page.getByRole('button', { name: 'Preparar aula', exact: true }).click()
  await page.getByRole('combobox', { name: 'Material planejado' }).selectOption('material-a2')
  await page.getByLabel('Anotações para esta aula').fill('Plano para esta ocorrência')
  await page.getByRole('button', { name: 'Salvar preparação', exact: true }).click()
  await page.getByRole('button', { name: 'Remarcar aula', exact: true }).click()
  await page.getByLabel('Nova data').fill('2026-11-05')
  await page.getByRole('combobox', { name: 'Novo horário', exact: true }).selectOption('11')
  await page.getByRole('button', { name: 'Salvar remarcação', exact: true }).click()
  await page.getByRole('button', { name: 'Semana anterior', exact: true }).click()
  await openLaraAt(page, '08:00')
  await expect(page.getByRole('dialog')).not.toContainText('Plano para esta ocorrência')
  await page.getByRole('button', { name: 'Remarcar aula', exact: true }).click()
  await page.getByLabel('Esta e as próximas', { exact: true }).check()
  await page.getByLabel('Nova data').fill('2026-10-28')
  await page.getByRole('combobox', { name: 'Novo horário', exact: true }).selectOption('9')
  await page.getByRole('button', { name: 'Salvar remarcação', exact: true }).click()
  await page.getByRole('button', { name: 'Próxima semana', exact: true }).click()
  await expect(page.locator('.calendar-table .lesson-block')).toHaveCount(1)
  await openLaraAt(page, '09:00')
  await expect(page.getByRole('dialog')).toContainText('Plano para esta ocorrência')
  await page.getByRole('button', { name: 'Fechar', exact: true }).last().click()
  await page.reload()
  expect(
    await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).plans.length, key),
  ).toBe(1)
})

test('falha ao salvar material mantém formulário e permite buscar vazio sem perder dados', async ({
  page,
}) => {
  await navigate(page, 'Acervo')
  await page.getByLabel('Buscar no acervo').fill('not found')
  await expect(page.getByRole('heading', { name: 'Nenhum material encontrado' })).toBeVisible()
  await page.getByLabel('Buscar no acervo').fill('')
  await page.getByLabel('Filtrar acervo por nível').selectOption('A2')
  await expect(page.locator('.material-card')).toHaveCount(1)
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('quota', 'QuotaExceededError')
    }
  })
  await page.getByRole('button', { name: 'Novo material', exact: true }).click()
  await page.getByRole('textbox', { name: 'Título', exact: true }).fill('Texto que não foi salvo')
  await page.getByRole('checkbox', { name: 'A2', exact: true }).check()
  await page
    .getByRole('textbox', { name: 'Conteúdo do material', exact: true })
    .fill('Conteúdo preservado no formulário.')
  await page.getByRole('button', { name: 'Salvar material', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('não conseguiu salvar')
  await expect(
    page.getByRole('textbox', { name: 'Conteúdo do material', exact: true }),
  ).toHaveValue('Conteúdo preservado no formulário.')
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
  await expect(page.locator('.material-card')).toHaveCount(1)
})

test('link manual é validado e acervo/preparação funcionam no celular', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await navigate(page, 'Alunos')
  await page.getByRole('button', { name: 'Editar Lara Santos', exact: true }).click()
  await page.getByLabel('Link da aula').fill('https://user:password@example.test/room')
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('sem usuário ou senha')
  await page.getByLabel('Link da aula').fill('https://meet.example.test/room')
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
  await schedule(page, '2026-10-26', 8)
  await page.getByRole('button', { name: 'Próxima semana', exact: true }).click()
  await openLaraAt(page, '08:00')
  await expect(page.getByRole('link', { name: 'Abrir link da aula' })).toHaveAttribute(
    'href',
    'https://meet.example.test/room',
  )
  await expect(page.getByRole('link', { name: 'Abrir link da aula' })).toHaveAttribute(
    'rel',
    'noopener noreferrer',
  )
  await page.getByRole('button', { name: 'Preparar aula', exact: true }).click()
  await page.getByLabel('Anotações para esta aula').fill('Retomar a conversação.')
  await page.getByRole('button', { name: 'Salvar preparação', exact: true }).click()
  expect(
    await page
      .getByRole('dialog')
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true)
  await page.screenshot({ path: '../work/screenshots/preparation-mobile.png', fullPage: true })
  await page.getByRole('button', { name: 'Fechar', exact: true }).last().click()
  await navigate(page, 'Acervo')
  await page.getByLabel('Filtrar acervo por nível').selectOption('A2')
  await expect(page.locator('.material-card')).toHaveCount(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: '../work/screenshots/materials-mobile.png', fullPage: true })
  await page.getByRole('button', { name: /Ler material/ }).click()
  await expect(page.getByRole('dialog')).toContainText('Plan a two-day trip')
})

test('migra v2 sem reset e salva v5 mantendo agenda e histórico', async ({ page }) => {
  await schedule(page, '2026-10-27', 8, true)
  const before = await page.evaluate((key) => {
    const data = JSON.parse(localStorage.getItem(key)!)
    delete data.materials
    delete data.plans
    delete data.books
    data.version = 2
    localStorage.setItem(key, JSON.stringify(data))
    return data
  }, key)
  await page.reload()
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).version, key)).toBe(2)
  await navigate(page, 'Acervo')
  await expect(page.getByRole('heading', { name: 'Seu acervo começa com uma ideia' })).toBeVisible()
  await createMaterial(page)
  const after = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key)
  expect(after.version).toBe(5)
  expect(after.series).toEqual(before.series)
  expect(after.lessons).toEqual(before.lessons)
  expect(after.records).toEqual(before.records)
  await page.reload()
  await navigate(page, 'Acervo')
  await expect(page.locator('.material-card')).toHaveCount(1)
})

test('conteúdo do acervo aparece como texto sem executar HTML', async ({ page }) => {
  await navigate(page, 'Acervo')
  await page.getByRole('button', { name: 'Novo material', exact: true }).click()
  await page.getByRole('textbox', { name: 'Título', exact: true }).fill('Literal markup')
  await page.getByRole('checkbox', { name: 'B1', exact: true }).check()
  const content = '<img src=x onerror="window.unexpectedScript=true">'
  await page.getByRole('textbox', { name: 'Conteúdo do material', exact: true }).fill(content)
  await page.getByRole('button', { name: 'Salvar material', exact: true }).click()
  await page.getByRole('button', { name: 'Ler material Literal markup', exact: true }).click()
  await expect(page.locator('.material-text')).toHaveText(content)
  await expect(page.getByRole('dialog').locator('img')).toHaveCount(0)
  expect(
    await page.evaluate(() => (window as unknown as Record<string, unknown>).unexpectedScript),
  ).toBeUndefined()
})
