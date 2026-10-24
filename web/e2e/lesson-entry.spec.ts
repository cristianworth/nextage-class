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
async function launchLara(page: Page) {
  await page
    .locator('.calendar-table .lesson-block')
    .filter({ hasText: 'Lara Santos' })
    .filter({ hasText: '10:00' })
    .click()
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
}
async function emptyCatalog(page: Page) {
  await page.getByRole('button', { name: 'Reiniciar demo', exact: true }).click()
  await page.getByRole('button', { name: 'Sim, reiniciar demo', exact: true }).click()
  await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key)!)
    state.materials = []
    localStorage.setItem(key, JSON.stringify(state))
  }, key)
  await page.reload()
}

test('nível é informativo, seleção única é filtrada e editar após promoção preserva o original', async ({
  page,
}) => {
  await launchLara(page)
  const dialog = page.getByRole('dialog')
  await expect(dialog.locator('.record-level')).toContainText('A2')
  await expect(dialog.getByRole('combobox', { name: /Nível/ })).toHaveCount(0)
  await expect(dialog.getByRole('textbox', { name: /Livro/ })).toHaveCount(0)
  const select = dialog.getByRole('combobox', { name: 'Livro/material' })
  expect(
    await select
      .locator('option')
      .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value)),
  ).toEqual(['', 'material-a2'])
  await select.selectOption('material-a2')
  await dialog
    .getByRole('textbox', { name: 'Conteúdo trabalhado', exact: true })
    .fill('Conteúdo A2 registrado.')
  await dialog.getByRole('button', { name: 'Lançar aula', exact: true }).click()
  await navigate(page, 'Acervo')
  await page
    .getByRole('button', { name: 'Ler material Planning a weekend trip', exact: true })
    .click()
  await page.getByRole('button', { name: 'Editar material', exact: true }).click()
  await page.getByRole('checkbox', { name: 'A2', exact: true }).uncheck()
  await page.getByRole('checkbox', { name: 'B1', exact: true }).check()
  await page.getByRole('button', { name: 'Salvar material', exact: true }).click()
  await navigate(page, 'Alunos')
  await page.getByRole('button', { name: 'Editar Lara Santos', exact: true }).click()
  await page.getByRole('combobox', { name: 'Nível', exact: true }).selectOption('C1')
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
  await navigate(page, 'Histórico')
  await page
    .locator('.history-card')
    .filter({ hasText: 'Conteúdo A2 registrado.' })
    .getByRole('button', { name: /Editar registro/ })
    .click()
  await expect(dialog.locator('.record-level')).toContainText('A2')
  await expect(select).toHaveValue('saved')
  await expect(select.locator('option[value="material-a2"]')).toHaveCount(0)
  await expect(select.locator('option[value="material-c1"]')).toHaveCount(0)
  await dialog
    .getByRole('textbox', { name: 'Conteúdo trabalhado', exact: true })
    .fill('Conteúdo histórico corrigido.')
  await dialog.getByRole('button', { name: 'Salvar registro', exact: true }).click()
  const state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key)
  expect(
    state.students.find((student: { id: string }) => student.id === 'student-lara').level,
  ).toBe('C1')
  expect(
    state.records.find(
      (record: { content: string }) => record.content === 'Conteúdo histórico corrigido.',
    ).level,
  ).toBe('A2')
  await page.reload()
  await navigate(page, 'Histórico')
  await expect(
    page.locator('.history-card').filter({ hasText: 'Conteúdo histórico corrigido.' }),
  ).toContainText('A2')
})

test('sem acervo permite lançamento; material livre antigo e dados são preservados ao adicionar exemplos', async ({
  page,
}) => {
  await emptyCatalog(page)
  await launchLara(page)
  await expect(page.getByRole('combobox', { name: 'Livro/material' })).toHaveValue('')
  await expect(page.getByRole('dialog')).toContainText('Nenhum material cadastrado para este nível')
  await page
    .getByRole('textbox', { name: 'Conteúdo trabalhado', exact: true })
    .fill('Conversação sem material.')
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
  await navigate(page, 'Histórico')
  await page
    .locator('.history-card')
    .filter({ hasText: 'Travel essentials' })
    .getByRole('button', { name: /Editar registro/ })
    .click()
  await expect(page.getByRole('combobox', { name: 'Livro/material' })).toHaveValue('legacy')
  await page
    .getByRole('textbox', { name: 'Conteúdo trabalhado', exact: true })
    .fill('Conteúdo antigo revisado.')
  await page.getByRole('button', { name: 'Salvar registro', exact: true }).click()
  const before = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key)
  await navigate(page, 'Acervo')
  await page.getByRole('button', { name: 'Adicionar exemplos', exact: true }).click()
  await expect(page.locator('.material-card')).toHaveCount(9)
  await page.getByRole('button', { name: 'Adicionar exemplos', exact: true }).click()
  await expect(page.locator('.material-card')).toHaveCount(9)
  const after = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key)
  expect(after.records).toEqual(before.records)
  expect(after.students).toEqual(before.students)
  expect(after.lessons).toEqual(before.lessons)
  await page.reload()
  await navigate(page, 'Histórico')
  await expect(
    page.locator('.history-card').filter({ hasText: 'Conteúdo antigo revisado.' }),
  ).toContainText('Travel essentials')
})

test('falha ao adicionar exemplos preserva o acervo vazio e permite tentar novamente', async ({
  page,
}) => {
  await emptyCatalog(page)
  const before = await page.evaluate((key) => localStorage.getItem(key), key)
  await navigate(page, 'Acervo')
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('quota', 'QuotaExceededError')
    }
  })
  await page.getByRole('button', { name: 'Adicionar exemplos', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('não conseguiu salvar')
  await expect(page.locator('.material-card')).toHaveCount(0)
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(before)
  await page.reload()
  await navigate(page, 'Acervo')
  await page.getByRole('button', { name: 'Adicionar exemplos', exact: true }).click()
  await expect(page.locator('.material-card')).toHaveCount(9)
})

test('lançamento no celular mostra unidades filtradas e mantém homework disponível', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.locator('.mobile-days button').nth(1).click()
  await page
    .locator('.calendar-table .lesson-block:visible')
    .filter({ hasText: 'Sofia Lima' })
    .click()
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
  const dialog = page.getByRole('dialog')
  const select = dialog.getByRole('combobox', { name: 'Livro/material' })
  expect(
    await select
      .locator('option')
      .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value)),
  ).toEqual(['', 'material-a1', 'material-a1-2', 'material-a1-3', 'material-a1-4'])
  await expect(dialog.getByRole('combobox', { name: /Nível/ })).toHaveCount(0)
  await select.selectOption('material-a1-3')
  await dialog.getByLabel('Concluí esta unidade', { exact: true }).check()
  await expect(dialog.locator('.course-continuation')).toContainText('Unidade 4')
  await expect(dialog.getByRole('textbox', { name: /Homework passado/ })).toHaveCount(1)
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
  await page.screenshot({ path: '../work/screenshots/lesson-entry-mobile.png' })
})
