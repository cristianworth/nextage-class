import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { expect } from '@playwright/test'

function addDays(date, days) {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

export async function verifySchedule(page, name, layout, studentId) {
  const artifacts = fileURLToPath(
    new URL('../../work/verification-3c3/connected/', import.meta.url),
  )
  await mkdir(artifacts, { recursive: true })
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(
    new Date(),
  )
  const weekday = new Date(`${today}T12:00:00Z`).getUTCDay()
  const monday = addDays(today, 7 - ((weekday + 6) % 7))
  const wednesday = addDays(monday, 2)
  const tuesday = addDays(monday, 1)
  const nextTuesday = addDays(tuesday, 7)
  const start = layout === 'mobile' ? 15 : 9
  const time = (hour) => `${String(hour).padStart(2, '0')}:00`
  const title = `${name} · Pausa de teste`
  const navigation = page.getByRole('navigation', { name: 'Área da professora' })
  const grid = page.getByRole('region', { name: 'Agenda semanal' })
  const dialog = page.getByRole('dialog')
  const next = () => grid.getByRole('button', { name: 'Próxima semana' }).click()
  const slot = (hour) =>
    grid.getByRole('button', { name: new RegExp(`${name} editado,.*${time(hour)}`) })
  const blockedSlot = () =>
    grid.getByRole('button', { name: new RegExp(`${title}.*${time(start)}`) })

  async function openAgenda() {
    await navigation.getByRole('button', { name: 'Agenda', exact: true }).click()
    await expect(grid).toBeVisible()
  }
  async function selectDay(index) {
    if (layout === 'mobile') await grid.locator('.mobile-days button').nth(index).click()
  }
  async function fillLesson(weekly) {
    await page.getByRole('button', { name: 'Nova aula', exact: true }).click()
    await dialog.getByRole('combobox', { name: 'Aluno', exact: true }).selectOption(studentId)
    await dialog.getByLabel('Data da aula').fill(monday)
    await dialog.getByRole('combobox', { name: 'Horário', exact: true }).selectOption(String(start))
    if (weekly) {
      await dialog.getByLabel('Repetir toda semana').check()
      await dialog.getByLabel(/^Repetir até/).fill(addDays(monday, 21))
    }
    await dialog.getByRole('button', { name: 'Agendar aula' }).click()
  }

  await openAgenda()
  await next()
  await fillLesson(true)
  await expect(dialog).toHaveCount(0)
  await expect(slot(start)).toBeVisible()
  await fillLesson(false)
  await expect(dialog.getByRole('alert')).toContainText('Conflito em')
  await expect(dialog.getByLabel('Data da aula')).toHaveValue(monday)
  await expect(dialog.getByRole('combobox', { name: 'Aluno', exact: true })).toHaveValue(studentId)
  await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click()

  await slot(start).click()
  await expect(dialog.getByRole('link', { name: 'Abrir link da aula' })).toHaveAttribute(
    'href',
    'https://example.test/aula',
  )
  await dialog.getByRole('button', { name: 'Remarcar aula' }).click()
  await expect(dialog.getByLabel('Somente esta aula')).toBeChecked()
  await dialog.getByLabel('Nova data').fill(wednesday)
  await dialog
    .getByRole('combobox', { name: 'Novo horário', exact: true })
    .selectOption(String(start + 1))
  await dialog.getByRole('button', { name: 'Salvar remarcação' }).click()
  await expect(dialog).toHaveCount(0)
  await expect(slot(start)).toHaveCount(0)
  await selectDay(2)
  await slot(start + 1).click()
  await dialog.getByRole('button', { name: 'Remarcar aula' }).click()
  await dialog.getByLabel('Esta e as próximas').check()
  await dialog.getByLabel('Nova data').fill(tuesday)
  await dialog
    .getByRole('combobox', { name: 'Novo horário', exact: true })
    .selectOption(String(start + 2))
  await dialog.getByRole('button', { name: 'Salvar remarcação' }).click()
  await expect(dialog).toHaveCount(0)
  await expect(slot(start + 1)).toHaveCount(0)
  await selectDay(1)
  await expect(slot(start + 2)).toBeVisible()
  await next()
  await selectDay(1)
  await expect(slot(start + 2)).toBeVisible()

  await page.getByRole('button', { name: 'Bloquear horário', exact: true }).click()
  await dialog.getByLabel('Descrição').fill(title)
  await dialog.getByLabel('Data do bloqueio').fill(nextTuesday)
  await dialog.getByRole('combobox', { name: 'Das', exact: true }).selectOption(String(start))
  await dialog.getByRole('combobox', { name: 'Até', exact: true }).selectOption(String(start + 1))
  await dialog.getByLabel('Repetir toda semana').check()
  await dialog.getByRole('button', { name: 'Salvar bloqueio' }).click()
  await expect(dialog).toHaveCount(0)
  await expect(blockedSlot()).toBeVisible()

  await page.reload()
  await openAgenda()
  await next()
  await next()
  await selectDay(1)
  await expect(blockedSlot()).toBeVisible()
  await expect(slot(start + 2)).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await slot(start + 2).scrollIntoViewIfNeeded()
  await page.screenshot({ path: `${artifacts}/${layout}-schedule.png`, fullPage: true })
  await blockedSlot().click()
  await dialog.getByRole('button', { name: 'Remover bloqueio semanal' }).click()
  await dialog.getByRole('button', { name: 'Confirmar remoção' }).click()
  await expect(dialog).toHaveCount(0)
  await expect(blockedSlot()).toHaveCount(0)
  await expect(slot(start + 2)).toBeVisible()
}
