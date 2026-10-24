import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

const storageKey = 'nextage-class:workspace:v1'
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-23T15:00:00Z') })
  await page.goto('/')
})

async function createWeekly(page: Page, date = '2026-10-27', hour = 8) {
  await page.getByRole('button', { name: 'Nova aula', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('combobox', { name: 'Aluno', exact: true }).selectOption('student-lara')
  await dialog.getByLabel('Data da aula').fill(date)
  await dialog.getByRole('combobox', { name: 'Horário', exact: true }).selectOption(String(hour))
  await dialog.getByLabel('Repetir toda semana').check()
  await expect(dialog.getByLabel('Repetir até')).toHaveValue('')
  await dialog.getByRole('button', { name: 'Agendar aula', exact: true }).click()
  await expect(dialog).toHaveCount(0)
}
async function openWeekly(page: Page) {
  await page.locator('.calendar-table .lesson-block').filter({ hasText: 'Lara Santos' }).click()
  await page.getByRole('button', { name: 'Remarcar aula', exact: true }).click()
  await expect(page.getByLabel('Somente esta aula', { exact: true })).toBeChecked()
}
async function reschedule(page: Page, date: string, hour: number, following = false) {
  if (following) await page.getByLabel('Esta e as próximas', { exact: true }).check()
  await page.getByLabel('Nova data').fill(date)
  await page.getByRole('combobox', { name: 'Novo horário', exact: true }).selectOption(String(hour))
  await page.getByRole('button', { name: 'Salvar remarcação', exact: true }).click()
}

test('remarca uma ocorrência e depois substitui exceção futura ao mudar a série', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await createWeekly(page)
  await page.getByRole('button', { name: 'Próxima semana', exact: true }).click()
  await expect(
    page.locator('.calendar-table .lesson-block').filter({ hasText: 'Semanal' }),
  ).toHaveCount(1)
  await page.getByRole('button', { name: 'Próxima semana', exact: true }).click()
  await openWeekly(page)
  await reschedule(page, '2026-11-05', 11)
  await expect(page.locator('.calendar-table .lesson-block')).toHaveCount(1)
  await expect(page.locator('.calendar-table .lesson-block')).toContainText('11:00')
  await page.getByRole('button', { name: 'Semana anterior', exact: true }).click()
  await openWeekly(page)
  await reschedule(page, '2026-10-28', 9, true)
  await page.getByRole('button', { name: 'Próxima semana', exact: true }).click()
  await expect(page.locator('.calendar-table .lesson-block')).toHaveCount(1)
  await expect(page.locator('.calendar-table .lesson-block')).toHaveAttribute(
    'aria-label',
    /04.*09:00/,
  )
  await page.reload()
  await page.getByRole('button', { name: 'Próxima semana', exact: true }).click()
  await page.getByRole('button', { name: 'Próxima semana', exact: true }).click()
  await expect(page.locator('.calendar-table .lesson-block')).toHaveCount(1)
  await expect(page.locator('.calendar-table .lesson-block')).toHaveAttribute(
    'aria-label',
    /04.*09:00/,
  )
  expect(errors).toEqual([])
})

test('bloqueio semanal avisa conflito sem mexer nas aulas e pode ser removido após confirmação', async ({
  page,
}) => {
  await createWeekly(page)
  await page.getByRole('button', { name: 'Próxima semana', exact: true }).click()
  await page.getByRole('button', { name: 'Bloquear horário', exact: true }).click()
  await page.getByLabel('Descrição', { exact: true }).fill('Compromisso')
  await page.getByLabel('Data do bloqueio').fill('2026-10-27')
  await page.getByRole('combobox', { name: 'Das', exact: true }).selectOption('7')
  await page.getByRole('combobox', { name: 'Até', exact: true }).selectOption('9')
  await page.getByLabel('Repetir toda semana').check()
  await page.getByRole('button', { name: 'Salvar bloqueio', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Conflito')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('combobox', { name: 'Até', exact: true }).selectOption('8')
  await page.getByRole('button', { name: 'Salvar bloqueio', exact: true }).click()
  await expect(page.locator('.blocked-block')).toHaveCount(1)
  await expect(
    page.locator('.calendar-table .lesson-block').filter({ hasText: 'Lara Santos' }),
  ).toHaveCount(1)
  await page.reload()
  await page.getByRole('button', { name: 'Próxima semana', exact: true }).click()
  await page.locator('.blocked-block').click()
  await page.getByRole('button', { name: 'Remover bloqueio semanal', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('todas as suas semanas')
  await page.getByRole('button', { name: 'Confirmar remoção', exact: true }).click()
  await expect(page.locator('.blocked-block')).toHaveCount(0)
  await expect(page.locator('.calendar-table .lesson-block')).toHaveCount(1)
})

test('carrega dados 1A e conserva histórico ao salvar a primeira série', async ({ page }) => {
  await page.getByRole('button', { name: 'Reiniciar demo', exact: true }).click()
  await page.getByRole('button', { name: 'Sim, reiniciar demo', exact: true }).click()
  const before = await page.evaluate((key) => {
    const data = JSON.parse(localStorage.getItem(key)!)
    delete data.series
    delete data.blocks
    delete data.materials
    delete data.plans
    data.version = 1
    localStorage.setItem(key, JSON.stringify(data))
    return data
  }, storageKey)
  await page.reload()
  expect(
    await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).version, storageKey),
  ).toBe(1)
  await createWeekly(page)
  const after = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey)
  expect(after.version).toBe(3)
  expect(after.records).toEqual(before.records)
  expect(after.lessons).toEqual(before.lessons)
  await page.reload()
  await page
    .getByRole('navigation', { name: 'Navegação principal' })
    .getByRole('button', { name: 'Histórico', exact: true })
    .click()
  await expect(page.locator('.history-card')).toHaveCount(1)
})

test('cadastro indica obrigatórios com asteriscos e não escreve opcional', async ({ page }) => {
  await page
    .getByRole('navigation', { name: 'Navegação principal' })
    .getByRole('button', { name: 'Alunos', exact: true })
    .click()
  await page.getByRole('button', { name: 'Novo aluno', exact: true }).click()
  await expect(page.getByRole('dialog')).not.toContainText('Opcional')
  await expect(page.locator('.required-marker')).toHaveCount(3)
  await expect(page.getByLabel('Nome do aluno')).toHaveAttribute('required', '')
  await expect(page.getByRole('combobox', { name: 'Nível', exact: true })).toHaveAttribute(
    'required',
    '',
  )
})

test('celular permite remarcar e criar bloqueio sem ultrapassar a tela', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await createWeekly(page, '2026-10-26')
  await page.getByRole('button', { name: 'Próxima semana', exact: true }).click()
  await openWeekly(page)
  await reschedule(page, '2026-10-26', 9)
  await expect(page.locator('.calendar-table .lesson-block:visible')).toContainText('09:00')
  await page.getByRole('button', { name: 'Bloquear horário', exact: true }).click()
  await page.getByLabel('Data do bloqueio').fill('2026-10-26')
  await page.getByRole('button', { name: 'Salvar bloqueio', exact: true }).click()
  await expect(page.locator('.blocked-block:visible')).toHaveCount(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: '../work/screenshots/weekly-mobile.png', fullPage: true })
})
