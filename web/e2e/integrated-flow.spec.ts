import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

const storageKey = 'nextage-class:workspace:v1'
async function teacherPage(page: Page, name: string) {
  await page
    .getByRole('navigation', { name: 'Navegação principal' })
    .getByRole('button', { name, exact: true })
    .click()
}
async function studentPage(page: Page, name: string) {
  await page
    .getByRole('navigation', { name: 'Navegação do aluno' })
    .getByRole('button', { name, exact: true })
    .click()
}

test('approved weekly request survives rescheduling, lesson entry and student consultation', async ({
  page,
}) => {
  await page.clock.install({ time: new Date('2026-10-23T15:00:00Z') })
  await page.goto('/')
  await page.getByRole('button', { name: 'Ver como aluno', exact: true }).click()
  await studentPage(page, 'Solicitações')
  await page.getByLabel('Tipo de pedido').selectOption('weekly')
  await page.getByLabel('Primeira aula', { exact: true }).fill('2026-10-26')
  await page.getByLabel('Horário disponível', { exact: true }).selectOption('8')
  await page.getByRole('button', { name: 'Enviar pedido', exact: true }).click()
  await page.getByRole('button', { name: 'Voltar à professora', exact: true }).click()
  await teacherPage(page, 'Solicitações')
  await page.getByRole('button', { name: 'Aprovar pedido', exact: true }).click()
  const approved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).requests[0],
    storageKey,
  )

  await teacherPage(page, 'Agenda')
  await page.getByRole('button', { name: 'Próxima semana', exact: true }).click()
  await page
    .locator('.calendar-table .lesson-block')
    .filter({ hasText: 'Lara Santos' })
    .filter({ hasText: '08:00' })
    .click()
  await page.getByRole('button', { name: 'Remarcar aula', exact: true }).click()
  await expect(page.getByLabel('Somente esta aula', { exact: true })).toBeChecked()
  await page.getByLabel('Nova data', { exact: true }).fill('2026-10-30')
  await page.getByRole('combobox', { name: 'Novo horário', exact: true }).selectOption('9')
  await page.getByRole('button', { name: 'Salvar remarcação', exact: true }).click()
  await page.getByRole('button', { name: 'Ver como aluno', exact: true }).click()
  await expect(page.locator('.student-lesson').first()).toContainText('30')
  await expect(page.locator('.student-lesson').first()).toContainText('09:00')
  await studentPage(page, 'Solicitações')
  await expect(page.locator('.request-card')).toContainText('Toda segunda-feira')
  await expect(page.locator('.request-card')).toContainText('08:00')
  await expect(page.locator('.request-card')).toContainText('Aprovado')

  await page.clock.setSystemTime(new Date('2026-10-30T15:00:00Z'))
  await page.reload()
  await page
    .locator('.calendar-table .lesson-block')
    .filter({ hasText: 'Lara Santos' })
    .filter({ hasText: '09:00' })
    .click()
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Conteúdo trabalhado', exact: true })
    .fill('PRIVATE_INTEGRATED_NOTES')
  await page
    .getByRole('combobox', { name: 'Conteúdo utilizado', exact: true })
    .selectOption('material-a2')
  await page.getByLabel('Homework passado').fill('Practice the travel dialogue')
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey)
  expect(saved.requests[0]).toEqual(approved)
  expect(saved.records.at(-1).lessonId).toBe(`weekly/${approved.bookingId}/0`)

  await page.getByRole('button', { name: 'Ver como aluno', exact: true }).click()
  await expect(page.locator('.student-lesson').first()).toContainText('segunda-feira')
  await expect(page.locator('.student-lesson').first()).toContainText('08:00')
  await expect(page.locator('.student-surface')).toContainText('Practice the travel dialogue')
  await studentPage(page, 'Meu histórico')
  const latest = page.locator('.student-record').first()
  await expect(latest).toContainText('30 de outubro de 2026')
  await expect(latest).toContainText('09:00')
  await expect(latest).toContainText('Planning a weekend trip')
  await expect(latest).not.toContainText('PRIVATE_INTEGRATED_NOTES')
  await latest.getByText('Ler material desta aula', { exact: true }).click()
  await expect(latest.locator('.material-text')).toContainText('Plan a two-day trip')
  await studentPage(page, 'Meu acervo')
  await expect(page.locator('.student-library')).toContainText('Planning a weekend trip')
  await page.reload()
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey)).toEqual(
    saved,
  )
})
