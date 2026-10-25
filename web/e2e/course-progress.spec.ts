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
async function launchSofia(page: Page, position: 'first' | 'last' = 'first') {
  const lessons = page.locator('.calendar-table .lesson-block').filter({ hasText: 'Sofia Lima' })
  await (position === 'first' ? lessons.first() : lessons.last()).click()
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
}
async function record(page: Page, content: string, completed = false) {
  await page.getByRole('textbox', { name: 'Conteúdo trabalhado', exact: true }).fill(content)
  if (completed) await page.getByLabel('Concluí esta unidade', { exact: true }).check()
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
}
async function addFriday(page: Page) {
  await page.getByRole('button', { name: 'Nova aula', exact: true }).click()
  await page.getByRole('combobox', { name: 'Aluno', exact: true }).selectOption('student-sofia')
  await page.getByLabel('Data da aula').fill('2026-10-23')
  await page.getByRole('combobox', { name: 'Horário', exact: true }).selectOption('8')
  await page.getByRole('button', { name: 'Agendar aula', exact: true }).click()
  await page
    .locator('.calendar-table .lesson-block')
    .filter({ hasText: 'Sofia Lima' })
    .filter({ hasText: '08:00' })
    .click()
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
}

test('Unidade 3 ocupa dois encontros, conclusão sugere 4 e editar o passado preserva retomada', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await launchSofia(page)
  await expect(page.getByRole('combobox', { name: 'Conteúdo utilizado' })).toHaveValue(
    'material-a1',
  )
  await page.getByRole('combobox', { name: 'Conteúdo utilizado' }).selectOption('material-a1-3')
  await expect(page.getByLabel('Concluí esta unidade', { exact: true })).not.toBeChecked()
  await record(page, 'Unidade 3: primeira parte e temas extras.')
  await launchSofia(page, 'last')
  await expect(page.getByRole('combobox', { name: 'Conteúdo utilizado' })).toHaveValue(
    'material-a1-3',
  )
  await page.getByLabel('Concluí esta unidade', { exact: true }).check()
  await expect(page.locator('.course-continuation')).toContainText('Unidade 4')
  await record(page, 'Terminamos a Unidade 3.', true)
  await page.reload()
  await navigate(page, 'Histórico')
  await page.getByLabel('Filtrar histórico por aluno').selectOption('student-sofia')
  const done = page.locator('.history-card').filter({ hasText: 'Terminamos a Unidade 3.' })
  await expect(done.locator('.course-panel')).toContainText('Unidade 3')
  await expect(done.locator('.course-panel')).toContainText('Concluída')
  await expect(done.locator('.course-panel')).toContainText('Continuidade indicada: Unidade 4')
  const old = page.locator('.history-card').filter({ hasText: 'primeira parte e temas extras' })
  await old.getByRole('button', { name: /Editar registro/ }).click()
  await page
    .getByRole('textbox', { name: 'Conteúdo trabalhado', exact: true })
    .fill('Primeiro encontro revisado.')
  await page.getByRole('button', { name: 'Salvar registro', exact: true }).click()
  await navigate(page, 'Alunos')
  await expect(
    page.locator('.student-card').filter({ hasText: 'Sofia Lima' }).locator('.student-course'),
  ).toContainText('Unidade 4')
  await navigate(page, 'Agenda')
  await addFriday(page)
  await expect(page.getByRole('combobox', { name: 'Conteúdo utilizado' })).toHaveValue(
    'material-a1-4',
  )
  await page.screenshot({ path: '../work/screenshots/course-progress-desktop.png', fullPage: true })
  expect(errors).toEqual([])
})

test('falha ao salvar conclusão não avança o progresso nem perde o formulário', async ({
  page,
}) => {
  await launchSofia(page)
  await page.getByRole('combobox', { name: 'Conteúdo utilizado' }).selectOption('material-a1-3')
  await record(page, 'Ainda na Unidade 3.')
  await launchSofia(page, 'last')
  await page
    .getByRole('textbox', { name: 'Conteúdo trabalhado', exact: true })
    .fill('Conclusão não salva')
  await page.getByLabel('Concluí esta unidade', { exact: true }).check()
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('quota', 'QuotaExceededError')
    }
  })
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('não conseguiu salvar')
  await expect(page.getByLabel('Concluí esta unidade', { exact: true })).toBeChecked()
  await expect(page.getByRole('textbox', { name: 'Conteúdo trabalhado', exact: true })).toHaveValue(
    'Conclusão não salva',
  )
  await page.reload()
  await launchSofia(page, 'last')
  await expect(page.getByRole('combobox', { name: 'Conteúdo utilizado' })).toHaveValue(
    'material-a1-3',
  )
  await expect(page.getByLabel('Concluí esta unidade', { exact: true })).not.toBeChecked()
})

test('migra v3 sem numerar materiais ou inventar conclusão e permite organizar sequência', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Reiniciar demo', exact: true }).click()
  await page.getByRole('button', { name: 'Sim, reiniciar demo', exact: true }).click()
  const raw = await page.evaluate((key) => {
    const data = JSON.parse(localStorage.getItem(key)!)
    data.version = 3
    delete data.requests
    delete data.books
    for (const material of data.materials) {
      delete material.lessonNumber
      delete material.bookId
      delete material.levels
    }
    for (const student of data.students) delete student.primaryBookId
    const raw = JSON.stringify(data)
    localStorage.setItem(key, raw)
    return raw
  }, key)
  await page.reload()
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(raw)
  await navigate(page, 'Acervo')
  await page.getByRole('button', { name: 'Nova sequência', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Título da sequência', exact: true })
    .fill('Livro migrado')
  await page.getByRole('checkbox', { name: 'A1', exact: true }).check()
  await page.getByRole('button', { name: 'Salvar sequência', exact: true }).click()
  const bookId = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).books[0].id as string,
    key,
  )
  await page
    .getByRole('button', { name: 'Ler material Around the neighborhood', exact: true })
    .click()
  await page.getByRole('button', { name: 'Editar material', exact: true }).click()
  await page.getByRole('combobox', { name: 'Tipo de material', exact: true }).selectOption('unit')
  await page.getByRole('combobox', { name: 'Sequência', exact: true }).selectOption(bookId)
  await page.getByRole('spinbutton', { name: /Número da unidade/ }).fill('3')
  await page.getByRole('button', { name: 'Salvar material', exact: true }).click()
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).version, key)).toBe(6)
  await navigate(page, 'Alunos')
  await page.getByRole('button', { name: 'Editar Sofia Lima', exact: true }).click()
  await page
    .getByRole('combobox', { name: 'Sequência principal', exact: true })
    .selectOption(bookId)
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
  await navigate(page, 'Agenda')
  await launchSofia(page)
  await expect(page.getByRole('combobox', { name: 'Conteúdo utilizado' })).toHaveValue(
    'material-a1-3',
  )
  await expect(page.getByLabel('Concluí esta unidade', { exact: true })).not.toBeChecked()
})

test('numeração duplicada é recusada e sequência cabe no celular', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await navigate(page, 'Acervo')
  await page.getByRole('button', { name: 'Novo material', exact: true }).click()
  await page.getByRole('textbox', { name: 'Título', exact: true }).fill('Outro conteúdo')
  await page.getByRole('combobox', { name: 'Tipo de material', exact: true }).selectOption('unit')
  await page
    .getByRole('combobox', { name: 'Sequência', exact: true })
    .selectOption('legacy-book/A1')
  await page
    .getByRole('textbox', { name: 'Conteúdo do material', exact: true })
    .fill('Texto próprio')
  await page.getByRole('spinbutton', { name: /Número da unidade/ }).fill('1')
  await page.getByRole('button', { name: 'Salvar material', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Já existe a Unidade 1')
  await page.getByRole('spinbutton', { name: /Número da unidade/ }).fill('10')
  await page.getByRole('button', { name: 'Salvar material', exact: true }).click()
  await page.getByLabel('Buscar no acervo').fill('Unidade 10')
  await expect(page.locator('.material-card')).toHaveCount(1)
  await navigate(page, 'Agenda')
  await page.locator('.mobile-days button').nth(1).click()
  await launchSofia(page)
  await expect(page.getByRole('combobox', { name: 'Conteúdo utilizado' })).toHaveValue(
    'material-a1',
  )
  await page.getByLabel('Concluí esta unidade', { exact: true }).check()
  await expect(page.locator('.course-continuation')).toContainText('Unidade 2')
  expect(
    await page
      .getByRole('dialog')
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true)
  await page.screenshot({ path: '../work/screenshots/course-progress-mobile.png', fullPage: true })
})
