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
  await page.getByRole('button', { name: 'Nova sequência', exact: true }).click()
  await page.getByRole('textbox', { name: 'Título da sequência', exact: true }).fill(title)
  for (const level of levels) await page.getByRole('checkbox', { name: level, exact: true }).check()
  await page.getByRole('button', { name: 'Salvar sequência', exact: true }).click()
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
  await page.getByRole('combobox', { name: 'Sequência', exact: true }).selectOption(bookId)
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
  await page
    .getByRole('combobox', { name: 'Sequência principal', exact: true })
    .selectOption(bookId)
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
  await page.getByRole('button', { name: 'Sequências', exact: true }).click()
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
    .getByRole('combobox', { name: 'Conteúdo utilizado', exact: true })
    .selectOption('material-a1-3')
  await saveRecord(page, 'Continuamos a unidade longa do livro A.')
  const second = await book(page, 'Alternative book')
  await unitForm(page, second, 'Alternative topic', 1)
  await page.getByRole('button', { name: 'Salvar material', exact: true }).click()
  await assign(page, second)
  await launch(page, true)
  await expect(
    page
      .getByRole('combobox', { name: 'Conteúdo utilizado', exact: true })
      .locator('option:checked'),
  ).toContainText('Alternative book')
  await saveRecord(page, 'Trabalhamos o livro B.')
  await assign(page, 'legacy-book/A1')
  await expect(
    page.locator('.student-card').filter({ hasText: 'Sofia Lima' }).locator('.student-course'),
  ).toContainText('Unidade 3')
  await nav(page, 'Acervo')
  await page.getByRole('button', { name: 'Sequências', exact: true }).click()
  await page
    .getByRole('button', { name: 'Editar sequência Sequência A1 (acervo anterior)', exact: true })
    .click()
  await page
    .getByRole('textbox', { name: 'Título da sequência', exact: true })
    .fill('Book A revised')
  await page.getByRole('checkbox', { name: 'A2', exact: true }).check()
  await page.getByRole('button', { name: 'Salvar sequência', exact: true }).click()
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
  await expect(page.getByRole('combobox', { name: 'Conteúdo utilizado', exact: true })).toHaveValue(
    'saved',
  )
  await expect(page.locator('.record-level')).toContainText('A1')
})

test('migração v4 preserva progresso e homework corrigido, sem escrever durante leitura', async ({
  page,
}) => {
  await launch(page)
  await page
    .getByRole('combobox', { name: 'Conteúdo utilizado', exact: true })
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
  await page.getByRole('button', { name: 'Nova sequência', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Título da sequência', exact: true })
    .fill('Mobile English')
  await page.getByRole('checkbox', { name: 'A1', exact: true }).check()
  await page.getByRole('checkbox', { name: 'A2', exact: true }).check()
  const before = await page.evaluate((key) => localStorage.getItem(key), key)
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('quota', 'QuotaExceededError')
    }
  })
  await page.getByRole('button', { name: 'Salvar sequência', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('não conseguiu salvar')
  await expect(page.getByRole('textbox', { name: 'Título da sequência', exact: true })).toHaveValue(
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

test('sequência autoral permite omitir unidade e retomá-la depois sem concluir automaticamente', async ({
  page,
}) => {
  const sequence = await book(page, 'Speaking com Nara')
  for (const [number, title] of [
    [1, 'Apresentações'],
    [2, 'Gramática'],
    [3, 'Conversação'],
  ] as const) {
    await unitForm(page, sequence, title, number)
    await page.getByRole('button', { name: 'Salvar material', exact: true }).click()
  }
  const units = (await page.evaluate(
    ({ key, sequence }) =>
      JSON.parse(localStorage.getItem(key)!)
        .materials.filter((material: { bookId?: string }) => material.bookId === sequence)
        .map((material: { id: string; lessonNumber: number }) => ({
          id: material.id,
          number: material.lessonNumber,
        })),
    { key, sequence },
  )) as { id: string; number: number }[]
  const unit = (number: number) => units.find((item) => item.number === number)!.id
  await assign(page, sequence)
  await launch(page)
  await expect(page.getByRole('combobox', { name: 'Conteúdo utilizado', exact: true })).toHaveValue(
    unit(1),
  )
  await page.getByLabel('Concluí esta unidade', { exact: true }).check()
  await saveRecord(page, 'Apresentações da sequência própria.')
  await launch(page, true)
  const select = page.getByRole('combobox', { name: 'Conteúdo utilizado', exact: true })
  await expect(select).toHaveValue(unit(2))
  await select.selectOption(unit(3))
  await expect(page.getByLabel('Concluí esta unidade', { exact: true })).not.toBeChecked()
  await saveRecord(page, 'Foco em speaking; gramática fica para depois.')
  const state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key)
  expect(
    state.records.some(
      (record: { materialSnapshot?: { id: string } }) => record.materialSnapshot?.id === unit(2),
    ),
  ).toBe(false)
  await page.reload()
  await nav(page, 'Alunos')
  await expect(
    page.locator('.student-card').filter({ hasText: 'Sofia Lima' }).locator('.student-course'),
  ).toContainText('Unidade 3')
  await nav(page, 'Histórico')
  await page
    .locator('.history-card')
    .filter({ hasText: 'Foco em speaking; gramática fica para depois.' })
    .getByRole('button', { name: /Editar registro/ })
    .click()
  await page.getByLabel('Concluí esta unidade', { exact: true }).check()
  await page.getByRole('button', { name: 'Salvar registro', exact: true }).click()
  await nav(page, 'Alunos')
  await expect(
    page.locator('.student-card').filter({ hasText: 'Sofia Lima' }).locator('.student-course'),
  ).toContainText('Fim da sequência disponível')
  await nav(page, 'Agenda')
  await page.getByRole('button', { name: 'Nova aula', exact: true }).click()
  await page.getByRole('combobox', { name: 'Aluno', exact: true }).selectOption('student-sofia')
  await page.getByLabel('Data da aula').fill('2026-10-23')
  await page.getByRole('combobox', { name: 'Horário', exact: true }).selectOption('7')
  await page.getByRole('button', { name: 'Agendar aula', exact: true }).click()
  await page
    .locator('.calendar-table .lesson-block')
    .filter({ hasText: 'Sofia Lima' })
    .filter({ hasText: '07:00' })
    .click()
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
  await expect(select).toHaveValue('')
  await select.selectOption(unit(2))
  await saveRecord(page, 'Retomamos gramática por escolha da professora.')
  await page.reload()
  await nav(page, 'Alunos')
  await expect(
    page.locator('.student-card').filter({ hasText: 'Sofia Lima' }).locator('.student-course'),
  ).toContainText('Unidade 2')
})

test('apoio A1 fica separado das unidades e pode ser lançado no celular sem alterar sequência', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.locator('.mobile-days button').nth(1).click()
  await launch(page)
  const select = page.getByRole('combobox', { name: 'Conteúdo utilizado', exact: true })
  await expect(select.locator('optgroup[label="Materiais de apoio"] option')).toHaveText([
    'Speaking warm-up',
  ])
  await select.selectOption('material-a1-speaking')
  await expect(page.getByLabel('Concluí esta unidade', { exact: true })).toHaveCount(0)
  expect(
    await page
      .getByRole('dialog')
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true)
  await page.screenshot({ path: '../work/screenshots/support-entry-mobile.png' })
  await saveRecord(page, 'Conversação com apoio avulso.')
  await page.reload()
  await nav(page, 'Histórico')
  const entry = page.locator('.history-card').filter({ hasText: 'Conversação com apoio avulso.' })
  await expect(entry).toContainText('Speaking warm-up')
  await expect(entry.locator('.course-panel')).toHaveCount(0)
  await nav(page, 'Alunos')
  await expect(
    page.locator('.student-card').filter({ hasText: 'Sofia Lima' }).locator('.student-course'),
  ).toContainText('Unidade 1')
})
