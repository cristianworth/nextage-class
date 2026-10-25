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
async function student(page: Page) {
  await page.getByRole('button', { name: 'Ver como aluno', exact: true }).click()
  await page
    .getByRole('navigation', { name: 'Navegação do aluno' })
    .getByRole('button', { name: 'Solicitações', exact: true })
    .click()
}
async function send(page: Page, date: string, hour: string, weekly = false, endDate = '') {
  await page.getByLabel('Tipo de pedido', { exact: true }).selectOption(weekly ? 'weekly' : 'once')
  await page.getByLabel(weekly ? 'Primeira aula' : 'Data da aula', { exact: true }).fill(date)
  if (weekly) await page.getByLabel('Repetir até', { exact: true }).fill(endDate)
  await page.getByLabel('Horário disponível', { exact: true }).selectOption(hour)
  await page.getByRole('button', { name: 'Enviar pedido', exact: true }).click()
}
async function stored(page: Page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key)
}
async function teacher(page: Page) {
  await page.getByRole('button', { name: 'Voltar à professora', exact: true }).click()
  await nav(page, 'Solicitações')
}

test('combina pedidos semanais e avulsos, persiste e só confirma após aprovação', async ({
  page,
}) => {
  await student(page)
  await expect(page.getByLabel('Tipo de pedido')).toHaveValue('once')
  await send(page, '2026-10-26', '10', true)
  await expect(page.getByRole('status')).toContainText('Pedido enviado')
  await send(page, '2026-10-27', '10', true)
  await send(page, '2026-10-28', '11', true, '2026-11-25')
  await send(page, '2026-10-30', '7')
  let state = await stored(page)
  expect(state.requests).toHaveLength(4)
  expect(state.series).toHaveLength(0)
  const originalLessons = state.lessons
  await expect(page.locator('.request-card')).toHaveCount(4)
  await teacher(page)
  await expect(page.locator('.request-card')).toHaveCount(4)
  const monday = page.locator('.request-card').filter({ hasText: 'Toda segunda-feira' })
  await monday.getByRole('button', { name: 'Aprovar pedido', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Horário semanal confirmado')
  const once = page.locator('.request-card').filter({ hasText: 'sexta-feira' })
  await once.getByRole('button', { name: 'Aprovar pedido', exact: true }).click()
  state = await stored(page)
  expect(state.series).toHaveLength(1)
  expect(state.series[0]).toMatchObject({
    studentId: 'student-lara',
    endDate: null,
    segments: [{ date: '2026-10-26', hour: 10, fromIndex: 0 }],
  })
  expect(state.lessons).toHaveLength(originalLessons.length + 1)
  await page.getByLabel('Situação do pedido').selectOption('approved')
  await expect(page.locator('.request-card')).toHaveCount(2)
  await expect(page.getByRole('button', { name: 'Aprovar pedido', exact: true })).toHaveCount(0)
  await page.reload()
  await student(page)
  await expect(page.locator('.request-card').filter({ hasText: 'Aprovado' })).toHaveCount(2)
  await page.getByRole('button', { name: 'Minhas aulas', exact: true }).click()
  await expect(
    page.locator('.student-lesson').filter({ hasText: 'segunda-feira' }).first(),
  ).toContainText('10:00')
  await expect(
    page.locator('.student-lesson').filter({ hasText: 'sexta-feira' }).first(),
  ).toContainText('07:00')
})

test('dois alunos pedem o mesmo horário e a segunda aprovação fica pendente após conflito', async ({
  page,
}) => {
  await student(page)
  await send(page, '2026-10-26', '8')
  await page.getByLabel('Aluno da simulação').selectOption('student-mateus')
  await page.getByRole('button', { name: 'Solicitações', exact: true }).click()
  await expect(page.locator('.request-card')).toHaveCount(0)
  await expect(page.getByLabel('Tipo de pedido')).toHaveValue('once')
  await send(page, '2026-10-26', '8')
  await expect(page.locator('.request-card')).toHaveCount(1)
  await expect(page.locator('.student-surface')).not.toContainText('Lara Santos')
  await teacher(page)
  const lara = page.getByRole('article', { name: 'Pedido de Lara Santos', exact: true })
  const mateus = page.getByRole('article', { name: 'Pedido de Mateus Costa', exact: true })
  await lara.getByRole('button', { name: 'Aprovar pedido', exact: true }).click()
  const before = await stored(page)
  await mateus.getByRole('button', { name: 'Aprovar pedido', exact: true }).click()
  await expect(mateus.getByRole('alert')).toContainText('Conflito')
  expect(await stored(page)).toEqual(before)
  await mateus.getByRole('button', { name: 'Recusar pedido', exact: true }).click()
  const decided = await stored(page)
  expect(decided.lessons).toEqual(before.lessons)
  expect(
    decided.requests.find(
      (request: { studentId: string }) => request.studentId === 'student-mateus',
    ).status,
  ).toBe('declined')
  await student(page)
  await page.getByLabel('Aluno da simulação').selectOption('student-mateus')
  await page.getByRole('button', { name: 'Solicitações', exact: true }).click()
  await expect(page.locator('.request-card')).toHaveCount(1)
  await expect(page.locator('.request-card')).toContainText('Recusado')
})

test('disponibilidade esconde nomes, bloqueios e conflitos semanais distantes; formulário trata períodos inválidos', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Nova aula', exact: true }).click()
  await page.getByRole('combobox', { name: 'Aluno', exact: true }).selectOption('student-mateus')
  await page.getByLabel('Data da aula', { exact: true }).fill('2030-10-28')
  await page.getByRole('combobox', { name: 'Horário', exact: true }).selectOption('9')
  await page.getByRole('button', { name: 'Agendar aula', exact: true }).click()
  await student(page)
  await page.getByLabel('Tipo de pedido').selectOption('weekly')
  await page.getByLabel('Primeira aula').fill('2026-10-26')
  await expect(page.getByLabel('Horário disponível').locator('option[value="9"]')).toHaveCount(0)
  await page.getByLabel('Repetir até').fill('2030-10-27')
  await expect(page.getByLabel('Horário disponível').locator('option[value="9"]')).toHaveCount(1)
  await page.getByLabel('Primeira aula').fill('2026-10-24')
  await expect(
    page.getByText('Escolha uma data de segunda a sexta, a partir de hoje.'),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Enviar pedido', exact: true })).toBeDisabled()
  await page.getByLabel('Primeira aula').fill('2026-10-26')
  await page.getByLabel('Repetir até').fill('2026-10-25')
  await expect(
    page.getByText('O término deve ser igual ou posterior à primeira aula.'),
  ).toBeVisible()
  await expect(page.locator('.student-surface')).not.toContainText('Mateus Costa')
})

test('erro de gravação mantém formulário e pendência, sem falso sucesso nem aula extra', async ({
  page,
}) => {
  await student(page)
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    Object.assign(window, {
      restoreStorage: () => {
        Storage.prototype.setItem = original
      },
    })
    Storage.prototype.setItem = () => {
      throw new Error('QuotaExceededError')
    }
  })
  await send(page, '2026-10-26', '22')
  await expect(page.getByRole('alert')).toContainText('não conseguiu salvar')
  await expect(page.getByLabel('Horário disponível')).toHaveValue('22')
  await expect(page.getByRole('status')).toHaveCount(0)
  await expect(page.locator('.request-card')).toHaveCount(0)
  await page.evaluate(() => (window as unknown as { restoreStorage: () => void }).restoreStorage())
  await page.getByRole('button', { name: 'Enviar pedido', exact: true }).click()
  await teacher(page)
  const before = await stored(page)
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error('QuotaExceededError')
    }
  })
  await page.getByRole('button', { name: 'Aprovar pedido', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('não conseguiu salvar')
  await expect(page.locator('.request-card')).toContainText('Pendente')
  expect(await stored(page)).toEqual(before)
  await page.reload()
  await nav(page, 'Solicitações')
  await page.getByRole('button', { name: 'Aprovar pedido', exact: true }).click()
  expect((await stored(page)).lessons).toHaveLength(before.lessons.length + 1)
})

test('pedido duplicado não duplica e horário iniciado não pode ser aprovado', async ({ page }) => {
  await student(page)
  await send(page, '2026-10-26', '7')
  await send(page, '2026-10-26', '7')
  await expect(page.getByRole('alert')).toContainText('já tem um pedido pendente')
  expect((await stored(page)).requests).toHaveLength(1)
  await teacher(page)
  await page.clock.setSystemTime(new Date('2026-10-26T10:01:00Z'))
  await page.reload()
  await nav(page, 'Solicitações')
  await expect(page.getByRole('button', { name: 'Aprovar pedido', exact: true })).toBeDisabled()
  await expect(page.locator('.request-card')).toContainText('O primeiro horário já começou')
  await page.getByRole('button', { name: 'Recusar pedido', exact: true }).click()
  expect((await stored(page)).requests[0].status).toBe('declined')
})

test('migra v5 sem gravar na leitura e solicita sem perder acervo, histórico ou agenda', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Reiniciar demo', exact: true }).click()
  await page.getByRole('button', { name: 'Sim, reiniciar demo', exact: true }).click()
  const previous = await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key)!)
    delete state.requests
    state.version = 5
    const raw = JSON.stringify(state)
    localStorage.setItem(key, raw)
    return { state, raw }
  }, key)
  await page.reload()
  await student(page)
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(previous.raw)
  await send(page, '2026-10-26', '7')
  const next = await stored(page)
  expect(next.version).toBe(6)
  for (const collection of [
    'students',
    'lessons',
    'records',
    'series',
    'blocks',
    'materials',
    'books',
    'plans',
  ])
    expect(next[collection]).toEqual(previous.state[collection])
  await page.reload()
  await student(page)
  await expect(page.locator('.request-card')).toHaveCount(1)
})

test('solicitar e decidir no celular mantém navegação e página sem transbordamento', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await student(page)
  await send(page, '2026-10-26', '22', true)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: '../work/screenshots/student-requests-mobile.png', fullPage: true })
  await teacher(page)
  await expect(
    page.getByRole('heading', { name: 'Solicitações de horário', exact: true }),
  ).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: '../work/screenshots/teacher-requests-mobile.png', fullPage: true })
  await page.getByRole('button', { name: 'Aprovar pedido', exact: true }).click()
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.getByLabel('Situação do pedido').selectOption('all')
  await page.screenshot({
    path: '../work/screenshots/teacher-requests-desktop.png',
    fullPage: true,
  })
  await student(page)
  await page.screenshot({
    path: '../work/screenshots/student-requests-desktop.png',
    fullPage: true,
  })
})
