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
async function library(page: Page, studentId = 'student-sofia') {
  await page.getByRole('button', { name: 'Ver como aluno', exact: true }).click()
  await page
    .getByRole('combobox', { name: 'Aluno da simulação', exact: true })
    .selectOption(studentId)
  await page.getByRole('button', { name: 'Meu acervo', exact: true }).click()
}
async function launchSofia(page: Page, last = false) {
  await nav(page, 'Agenda')
  const lessons = page.locator('.calendar-table .lesson-block').filter({ hasText: 'Sofia Lima' })
  await (last ? lessons.last() : lessons.first()).click()
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
}
async function unit(page: Page, bookId: string, number: number, title: string, content: string) {
  await page.getByRole('button', { name: 'Novo material', exact: true }).click()
  await page.getByRole('textbox', { name: 'Título', exact: true }).fill(title)
  await page.getByRole('combobox', { name: 'Tipo de material', exact: true }).selectOption('unit')
  await page.getByRole('combobox', { name: 'Sequência', exact: true }).selectOption(bookId)
  await page
    .getByRole('spinbutton', { name: 'Número da unidade', exact: true })
    .fill(String(number))
  await page.getByRole('textbox', { name: 'Conteúdo do material', exact: true }).fill(content)
  await page.getByRole('button', { name: 'Salvar material', exact: true }).click()
}

test('acervo mostra conteúdo não utilizado, permite busca/tipo e descarta leitura ao trocar aluno sem gravar', async ({
  page,
}) => {
  const before = await page.evaluate((key) => localStorage.getItem(key), key)
  await library(page)
  const area = page.getByRole('region', { name: 'Acervo do aluno', exact: true })
  await expect(area.locator('.student-library-card')).toHaveCount(5)
  await expect(area.getByRole('region', { name: 'Minha sequência', exact: true })).toContainText(
    'Unidade 1',
  )
  await area.getByRole('button', { name: /Ler .*Unidade 4/ }).click()
  await expect(
    area.getByRole('region', { name: 'Leitura do material', exact: true }),
  ).toContainText('Practice a short conversation at a café.')
  await area.getByRole('button', { name: 'Fechar leitura', exact: true }).click()
  await area.getByRole('textbox', { name: 'Buscar no meu acervo', exact: true }).fill('warm-up')
  await expect(area.locator('.student-library-card')).toHaveCount(1)
  await area.getByRole('combobox', { name: 'Tipo de conteúdo', exact: true }).selectOption('units')
  await expect(area).toContainText('Nenhum conteúdo encontrado')
  await area.getByRole('textbox', { name: 'Buscar no meu acervo', exact: true }).fill('')
  await expect(area.locator('.student-library-card')).toHaveCount(4)
  await area.getByRole('button', { name: /Ler .*Unidade 2/ }).click()
  await page
    .getByRole('combobox', { name: 'Aluno da simulação', exact: true })
    .selectOption('student-lara')
  await page.getByRole('button', { name: 'Meu acervo', exact: true }).click()
  await expect(area.getByRole('region', { name: 'Leitura do material', exact: true })).toHaveCount(
    0,
  )
  await expect(
    area.getByRole('textbox', { name: 'Buscar no meu acervo', exact: true }),
  ).toHaveValue('')
  await expect(area.getByRole('combobox', { name: 'Tipo de conteúdo', exact: true })).toHaveValue(
    'all',
  )
  await expect(area.locator('.student-library-card')).toHaveCount(1)
  await expect(area).toContainText('Planning a weekend trip')
  await expect(area).not.toContainText('Everyday routines')
  await area
    .getByRole('textbox', { name: 'Buscar no meu acervo', exact: true })
    .fill('Everyday routines')
  await expect(area).toContainText('Nenhum conteúdo encontrado')
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(before)
})

test('sequência compartilhada herda níveis, ordena unidades e leitura mostra texto literal', async ({
  page,
}) => {
  await nav(page, 'Acervo')
  await page.getByRole('button', { name: 'Nova sequência', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Título da sequência', exact: true })
    .fill('Shared English')
  for (const level of ['A1', 'A2'])
    await page.getByRole('checkbox', { name: level, exact: true }).check()
  await page.getByRole('button', { name: 'Salvar sequência', exact: true }).click()
  const bookId = await page.evaluate(
    (key) =>
      JSON.parse(localStorage.getItem(key)!).books.find(
        (book: { title: string }) => book.title === 'Shared English',
      ).id as string,
    key,
  )
  const literal = '<img src=x onerror="window.unexpectedLibraryScript=true">'
  await unit(page, bookId, 10, 'A topic', literal)
  await unit(page, bookId, 2, 'Z topic', 'Original shared text')
  await page.getByRole('button', { name: 'Novo material', exact: true }).click()
  await page.getByRole('textbox', { name: 'Título', exact: true }).fill('Shared support')
  for (const level of ['A2', 'B1'])
    await page.getByRole('checkbox', { name: level, exact: true }).check()
  await page
    .getByRole('textbox', { name: 'Conteúdo do material', exact: true })
    .fill('Support for both levels')
  await page.getByRole('button', { name: 'Salvar material', exact: true }).click()
  const before = await page.evaluate((key) => localStorage.getItem(key), key)
  await library(page, 'student-lara')
  const area = page.getByRole('region', { name: 'Acervo do aluno', exact: true })
  const shared = area.getByRole('region', { name: 'Unidades de Shared English', exact: true })
  await expect(shared.locator('h4')).toHaveText(['Unidade 2 — Z topic', 'Unidade 10 — A topic'])
  await expect(
    area.locator('.student-library-card').filter({ hasText: 'Shared support' }),
  ).toHaveCount(1)
  await shared.getByRole('button', { name: /Ler .*Unidade 10/ }).click()
  await expect(
    area
      .getByRole('region', { name: 'Leitura do material', exact: true })
      .locator('.material-text'),
  ).toHaveText(literal)
  await expect(area.locator('.student-material-reader img')).toHaveCount(0)
  expect(await page.evaluate(() => Reflect.get(window, 'unexpectedLibraryScript'))).toBeUndefined()
  await area.getByRole('button', { name: 'Fechar leitura', exact: true }).click()
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: '../work/screenshots/student-library-desktop.png', fullPage: true })
  await page
    .getByRole('combobox', { name: 'Aluno da simulação', exact: true })
    .selectOption('student-mateus')
  await page.getByRole('button', { name: 'Meu acervo', exact: true }).click()
  await expect(
    area.locator('.student-library-card').filter({ hasText: 'Shared support' }),
  ).toHaveCount(1)
  await expect(area).not.toContainText('Shared English')
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(before)
})

test('continuidade acompanha lançamento e promoção retira catálogo A1 preservando material no histórico', async ({
  page,
}) => {
  await launchSofia(page)
  await page
    .getByRole('combobox', { name: 'Conteúdo utilizado', exact: true })
    .selectOption('material-a1-3')
  await page
    .getByRole('textbox', { name: 'Conteúdo trabalhado', exact: true })
    .fill('PRIVATE_STUDENT_NOTES')
  await page.getByLabel('Homework passado').fill('Practice the questions')
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
  await library(page)
  const primary = page.getByRole('region', { name: 'Minha sequência', exact: true })
  await expect(primary).toContainText('Unidade 3')
  await page.getByRole('button', { name: 'Abrir unidade sugerida', exact: true }).click()
  await expect(
    page.getByRole('region', { name: 'Leitura do material', exact: true }),
  ).toContainText('Name places near your home')
  await page.getByRole('button', { name: 'Voltar à professora', exact: true }).click()
  await launchSofia(page, true)
  await page
    .getByRole('textbox', { name: 'Conteúdo trabalhado', exact: true })
    .fill('Finished the unit with extra topics')
  await page.getByLabel('Concluí esta unidade', { exact: true }).check()
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
  await library(page)
  await expect(primary).toContainText('Unidade 4')
  await page.getByRole('button', { name: 'Voltar à professora', exact: true }).click()
  await nav(page, 'Acervo')
  await page
    .getByRole('button', { name: 'Ler material Around the neighborhood', exact: true })
    .click()
  await page.getByRole('button', { name: 'Editar material', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Conteúdo do material', exact: true })
    .fill('REVISED_LIBRARY_CONTENT')
  await page.getByRole('button', { name: 'Salvar material', exact: true }).click()
  await library(page)
  await page.getByRole('button', { name: /Ler .*Unidade 3/ }).click()
  await expect(
    page.getByRole('region', { name: 'Leitura do material', exact: true }),
  ).toContainText('REVISED_LIBRARY_CONTENT')
  await page.getByRole('button', { name: 'Voltar à professora', exact: true }).click()
  await nav(page, 'Alunos')
  await page.getByRole('button', { name: 'Editar Sofia Lima', exact: true }).click()
  await page.getByRole('combobox', { name: 'Nível', exact: true }).selectOption('A2')
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
  await library(page)
  const area = page.getByRole('region', { name: 'Acervo do aluno', exact: true })
  await expect(area.locator('.student-library-card')).toHaveCount(1)
  await expect(area).toContainText('Planning a weekend trip')
  await expect(area).not.toContainText('Around the neighborhood')
  await expect(primary).toContainText('precisa ser ajustada pela professora')
  await page.getByRole('button', { name: 'Meu histórico', exact: true }).click()
  const history = page.getByRole('region', { name: 'Histórico do aluno', exact: true })
  await expect(history).toContainText('Around the neighborhood')
  await expect(history).not.toContainText('REVISED_LIBRARY_CONTENT')
  await expect(history).not.toContainText('PRIVATE_STUDENT_NOTES')
  await history.getByText('Ler material desta aula', { exact: true }).first().click()
  await expect(history.locator('.material-text').first()).toContainText(
    'Name places near your home',
  )
})

test('leitura e filtro cabem no celular; catálogo vazio e recarga mantêm estados claros', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await library(page)
  await page.getByRole('button', { name: /Ler .*Unidade 3/ }).click()
  await expect(page.getByRole('region', { name: 'Leitura do material', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: '../work/screenshots/student-library-reader-mobile.png' })
  await page.getByRole('button', { name: 'Fechar leitura', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Buscar no meu acervo', exact: true })
    .fill('No such content')
  await expect(page.getByRole('region', { name: 'Acervo do aluno', exact: true })).toContainText(
    'Nenhum conteúdo encontrado',
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Voltar à professora', exact: true }).click()
  await page.getByRole('button', { name: 'Reiniciar demo', exact: true }).click()
  await page.getByRole('button', { name: 'Sim, reiniciar demo', exact: true }).click()
  await page.evaluate((key) => {
    const data = JSON.parse(localStorage.getItem(key)!)
    data.materials = []
    localStorage.setItem(key, JSON.stringify(data))
  }, key)
  await page.reload()
  await library(page)
  await expect(page.getByRole('region', { name: 'Acervo do aluno', exact: true })).toContainText(
    'Nenhum material no seu nível',
  )
  await expect(page.getByRole('region', { name: 'Minha sequência', exact: true })).toContainText(
    'ainda não adicionou unidades',
  )
  await page.reload()
  await library(page)
  await expect(page.locator('.student-library-card')).toHaveCount(0)
})
