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
async function book(page: Page, title: string, levels = ['A1']) {
  await nav(page, 'Acervo')
  await page.getByRole('button', { name: 'Novo livro', exact: true }).click()
  await page.getByRole('textbox', { name: 'Título do livro', exact: true }).fill(title)
  for (const level of levels) await page.getByRole('checkbox', { name: level, exact: true }).check()
  await page.getByRole('button', { name: 'Salvar livro', exact: true }).click()
  return page.evaluate(
    ({ key, title }) =>
      JSON.parse(localStorage.getItem(key)!).books.find(
        (book: { title: string }) => book.title === title,
      ).id as string,
    { key, title },
  )
}
async function unitForm(page: Page, bookId: string, title: string, number: number) {
  await page.getByRole('button', { name: 'Novo material', exact: true }).click()
  await page.getByRole('textbox', { name: 'Título', exact: true }).fill(title)
  await page.getByRole('combobox', { name: 'Tipo de material', exact: true }).selectOption('unit')
  await page.getByRole('combobox', { name: 'Livro', exact: true }).selectOption(bookId)
  await page
    .getByRole('spinbutton', { name: 'Número da unidade', exact: true })
    .fill(String(number))
  await page
    .getByRole('textbox', { name: 'Conteúdo do material', exact: true })
    .fill('Texto próprio para esta unidade.')
}
async function assign(page: Page, bookId: string, level?: string) {
  await nav(page, 'Alunos')
  await page.getByRole('button', { name: 'Editar Sofia Lima', exact: true }).click()
  if (level) await page.getByRole('combobox', { name: 'Nível', exact: true }).selectOption(level)
  await page.getByRole('combobox', { name: 'Livro principal', exact: true }).selectOption(bookId)
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
}
async function launch(page: Page, last = false) {
  await nav(page, 'Agenda')
  const lessons = page.locator('.calendar-table .lesson-block').filter({ hasText: 'Sofia Lima' })
  await (last ? lessons.last() : lessons.first()).click()
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
}
async function saveRecord(page: Page, content: string) {
  await page.getByRole('textbox', { name: 'Conteúdo trabalhado', exact: true }).fill(content)
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
}

test('livros compartilham níveis, numeram unidades independentemente e apoio aceita vários níveis', async ({
  page,
}) => {
  const first = await book(page, 'Shared English', ['A1', 'A2'])
  await unitForm(page, first, 'First topic', 1)
  await page.getByRole('button', { name: 'Salvar material', exact: true }).click()
  await unitForm(page, first, 'Duplicate topic', 1)
  await page.getByRole('button', { name: 'Salvar material', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Já existe a Unidade 1')
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
  const second = await book(page, 'Other English', ['A1'])
  await unitForm(page, second, 'Same number, different book', 1)
  await page.getByRole('button', { name: 'Salvar material', exact: true }).click()
  await page.getByRole('button', { name: 'Novo material', exact: true }).click()
  await page.getByRole('textbox', { name: 'Título', exact: true }).fill('Shared support')
  await page.getByRole('checkbox', { name: 'A1', exact: true }).check()
  await page.getByRole('checkbox', { name: 'A2', exact: true }).check()
  await page
    .getByRole('textbox', { name: 'Conteúdo do material', exact: true })
    .fill('Extra practice.')
  await page.getByRole('button', { name: 'Salvar material', exact: true }).click()
  await page.getByLabel('Filtrar acervo por nível').selectOption('A2')
  await expect(page.locator('.material-card').filter({ hasText: 'First topic' })).toHaveCount(1)
  await expect(
    page.locator('.material-card').filter({ hasText: 'Same number, different book' }),
  ).toHaveCount(0)
  await expect(page.locator('.material-card').filter({ hasText: 'Shared support' })).toHaveCount(1)
  await page.getByLabel('Filtrar acervo por nível').selectOption('')
  await page.getByRole('button', { name: 'Livros', exact: true }).click()
  await page
    .locator('.book-card')
    .filter({ hasText: 'Shared English' })
    .getByRole('button', { name: 'Ver unidades', exact: true })
    .click()
  await expect(page.locator('.material-card')).toHaveCount(1)
  await expect(page.locator('.material-card')).toContainText('Unidade 1')
  await page.reload()
  await nav(page, 'Acervo')
  await expect(page.locator('.material-card').filter({ hasText: 'Shared support' })).toHaveCount(1)
  await page.screenshot({ path: '../work/screenshots/books-desktop.png', fullPage: true })
})

test('trocar e retornar retoma livro; promoção compartilhada e renomeação preservam histórico', async ({
  page,
}) => {
  await launch(page)
  await page
    .getByRole('combobox', { name: 'Livro/material', exact: true })
    .selectOption('material-a1-3')
  await saveRecord(page, 'Continuamos a unidade longa do livro A.')
  const second = await book(page, 'Alternative book')
  await unitForm(page, second, 'Alternative topic', 1)
  await page.getByRole('button', { name: 'Salvar material', exact: true }).click()
  await assign(page, second)
  await launch(page, true)
  await expect(
    page.getByRole('combobox', { name: 'Livro/material', exact: true }).locator('option:checked'),
  ).toContainText('Alternative book')
  await saveRecord(page, 'Trabalhamos o livro B.')
  await assign(page, 'legacy-book/A1')
  await expect(
    page.locator('.student-card').filter({ hasText: 'Sofia Lima' }).locator('.student-course'),
  ).toContainText('Unidade 3')
  await nav(page, 'Acervo')
  await page.getByRole('button', { name: 'Livros', exact: true }).click()
  await page
    .getByRole('button', { name: 'Editar livro Sequência A1 (acervo anterior)', exact: true })
    .click()
  await page.getByRole('textbox', { name: 'Título do livro', exact: true }).fill('Book A revised')
  await page.getByRole('checkbox', { name: 'A2', exact: true }).check()
  await page.getByRole('button', { name: 'Salvar livro', exact: true }).click()
  await assign(page, 'legacy-book/A1', 'A2')
  await page.reload()
  await nav(page, 'Alunos')
  await expect(
    page.locator('.student-card').filter({ hasText: 'Sofia Lima' }).locator('.student-course'),
  ).toContainText('Book A revised · Unidade 3')
  await nav(page, 'Histórico')
  const historical = page
    .locator('.history-card')
    .filter({ hasText: 'Continuamos a unidade longa' })
  await expect(historical).toContainText('Sequência A1 (acervo anterior)')
  await expect(historical).not.toContainText('Book A revised')
  await historical.getByRole('button', { name: /Editar registro/ }).click()
  await expect(page.getByRole('combobox', { name: 'Livro/material', exact: true })).toHaveValue(
    'saved',
  )
  await expect(page.locator('.record-level')).toContainText('A1')
})

test('migração v4 preserva progresso e homework corrigido, sem escrever durante leitura', async ({
  page,
}) => {
  await launch(page)
  await page
    .getByRole('combobox', { name: 'Livro/material', exact: true })
    .selectOption('material-a1-3')
  await page.getByLabel('Homework passado').fill('Practice the dialogue')
  await saveRecord(page, 'Unidade em andamento antes da migração.')
  await nav(page, 'Histórico')
  await page
    .locator('.history-card')
    .filter({ hasText: 'antes da migração' })
    .getByRole('button', { name: 'Marcar como corrigido', exact: true })
    .click()
  const raw = await page.evaluate((key) => {
    const data = JSON.parse(localStorage.getItem(key)!)
    delete data.books
    data.version = 4
    for (const student of data.students) delete student.primaryBookId
    for (const material of data.materials) {
      delete material.bookId
      delete material.levels
    }
    for (const record of data.records) {
      if (record.materialSnapshot) {
        delete record.materialSnapshot.bookId
        delete record.materialSnapshot.bookTitle
        delete record.materialSnapshot.levels
      }
      if (record.courseProgress?.next) {
        delete record.courseProgress.next.bookId
        delete record.courseProgress.next.bookTitle
      }
    }
    const raw = JSON.stringify(data)
    localStorage.setItem(key, raw)
    return raw
  }, key)
  await page.reload()
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(raw)
  await nav(page, 'Alunos')
  await expect(
    page.locator('.student-card').filter({ hasText: 'Sofia Lima' }).locator('.student-course'),
  ).toContainText('Unidade 3')
  await nav(page, 'Histórico')
  const entry = page.locator('.history-card').filter({ hasText: 'antes da migração' })
  await expect(entry).toContainText('Corrigido')
  await entry.getByRole('button', { name: /Editar registro/ }).click()
  await page
    .getByRole('textbox', { name: 'Conteúdo trabalhado', exact: true })
    .fill('Texto corrigido após migração.')
  await page.getByRole('button', { name: 'Salvar registro', exact: true }).click()
  const state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key)
  expect(state.version).toBe(5)
  expect(
    state.records.find(
      (record: { content: string }) => record.content === 'Texto corrigido após migração.',
    ).homework.correctedAt,
  ).not.toBeNull()
})

test('livro no celular mantém formulário e dados em falha de gravação', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await nav(page, 'Acervo')
  await page.getByRole('button', { name: 'Novo livro', exact: true }).click()
  await page.getByRole('textbox', { name: 'Título do livro', exact: true }).fill('Mobile English')
  await page.getByRole('checkbox', { name: 'A1', exact: true }).check()
  await page.getByRole('checkbox', { name: 'A2', exact: true }).check()
  const before = await page.evaluate((key) => localStorage.getItem(key), key)
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('quota', 'QuotaExceededError')
    }
  })
  await page.getByRole('button', { name: 'Salvar livro', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('não conseguiu salvar')
  await expect(page.getByRole('textbox', { name: 'Título do livro', exact: true })).toHaveValue(
    'Mobile English',
  )
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(before)
  expect(
    await page
      .getByRole('dialog')
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true)
  await page.screenshot({ path: '../work/screenshots/books-mobile.png' })
})
