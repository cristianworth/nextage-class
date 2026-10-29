import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import type { Workspace } from '../src/domain/models'

const key = 'nextage-class:public-demo:v1'
const legacyKey = 'nextage-class:workspace:v1'
const legacyRaw = '{"existingLocalData":"preserve this exact value"}'
const thursday = new Date('2026-10-29T15:00:00.000Z')
type SavedDemo = { version: 1; createdAt: string; workspace: Workspace }

async function stored(page: Page): Promise<SavedDemo> {
  return page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)!), key)
}

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

async function enterStudent(page: Page) {
  await page.getByRole('button', { name: 'Ver como aluno', exact: true }).click()
}

async function sendRequest(page: Page, date: string, hour: string) {
  await page.getByLabel('Data da aula', { exact: true }).fill(date)
  await page.getByLabel('Horário disponível', { exact: true }).selectOption(hour)
  await page.getByRole('button', { name: 'Enviar pedido', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Pedido enviado')
}

async function capture(page: Page, path: string) {
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    window.scrollTo(0, 0)
  })
  await page.screenshot({ path, fullPage: true })
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ({ legacyKey, legacyRaw }) => {
      if (localStorage.getItem(legacyKey) === null) localStorage.setItem(legacyKey, legacyRaw)
    },
    { legacyKey, legacyRaw },
  )
})

test('built demo loads assets under its subdirectory, keeps local data and makes no operational calls', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  const operational: string[] = []
  const failed: string[] = []
  const loadedFonts: string[] = []
  const expectedOrigin = new URL(testInfo.project.use.baseURL!).origin
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (
      url.protocol.startsWith('http') &&
      (url.origin !== expectedOrigin || url.pathname.includes('/api/'))
    )
      operational.push(url.origin + url.pathname)
  })
  page.on('requestfailed', (request) => failed.push(request.url()))
  page.on('response', (response) => {
    if (response.url().includes('.woff2') && response.ok()) loadedFonts.push(response.url())
  })
  await page.clock.install({ time: thursday })
  await page.goto('./')
  await expect(
    page.getByRole('heading', { name: 'Sua semana de aulas', exact: true }),
  ).toBeVisible()
  await expect(page.locator('.calendar-table .lesson-block')).toHaveCount(10)
  expect((await stored(page)).workspace.version).toBe(6)
  expect(await page.evaluate((oldKey) => localStorage.getItem(oldKey), legacyKey)).toBe(legacyRaw)
  await expect(page.locator('.brand-mark')).toHaveAttribute('src', '/nextage-class/favicon.svg')
  expect(
    await page.locator('.brand-mark').evaluate((image: HTMLImageElement) => image.naturalWidth),
  ).toBeGreaterThan(0)
  await page.evaluate(() => document.fonts.ready)
  expect(loadedFonts.length).toBeGreaterThan(0)
  const icon = await page.locator('link[rel="icon"]').getAttribute('href')
  expect(new URL(icon!, page.url()).pathname).toBe('/nextage-class/favicon.svg')
  const favicon = await page.request.get(new URL(icon!, page.url()).href)
  expect(favicon.ok()).toBe(true)
  expect(favicon.headers()['content-type']).toContain('image/svg+xml')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused()
  await capture(page, testInfo.outputPath('agenda-desktop.png'))
  await teacherPage(page, 'Alunos')
  const lara = page.locator('.student-card').filter({ hasText: 'Lara Santos' })
  await expect(lara).toContainText('Inglês para viajar')
  await expect(lara).toContainText('Making a travel plan')
  await teacherPage(page, 'Agenda')
  await page.getByRole('button', { name: 'Próxima semana', exact: true }).click()
  await page
    .locator('.calendar-table .lesson-block')
    .filter({ hasText: 'Lara Santos' })
    .first()
    .click()
  await expect(page.getByRole('dialog')).toContainText('Conferir as perguntas do homework')
  await expect(page.getByRole('button', { name: 'Editar preparação', exact: true })).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Sua semana de aulas', exact: true }),
  ).toBeVisible()
  expect(errors).toEqual([])
  expect(operational).toEqual([])
  expect(failed).toEqual([])
})

for (const timestamp of ['2026-10-24T02:30:00.000Z', '2026-10-25T18:00:00.000Z']) {
  test(`first visit at ${timestamp} still provides upcoming student lessons`, async ({ page }) => {
    await page.clock.install({ time: new Date(timestamp) })
    await page.goto('./')
    await expect(page.locator('.calendar-table .lesson-block')).toHaveCount(10)
    await enterStudent(page)
    await expect(page.locator('.student-lesson').first()).toBeVisible()
    await expect(page.locator('.student-surface')).toContainText('Escrever quatro perguntas')
    const saved = await stored(page)
    await page.reload()
    expect(await stored(page)).toEqual(saved)
  })
}

test('a visitor records a past lesson, reloads it and sees only shared content as the student', async ({
  page,
}, testInfo) => {
  await page.clock.install({ time: thursday })
  await page.goto('./')
  await page.getByRole('button', { name: 'Semana anterior', exact: true }).click()
  await page.getByRole('button', { name: /Sofia Lima, 21 de out/ }).click()
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
  await page.getByLabel('Conteúdo trabalhado', { exact: true }).fill('PRIVATE_PUBLIC_DEMO_NOTES')
  await page
    .getByRole('combobox', { name: 'Conteúdo utilizado', exact: true })
    .selectOption('material-a1')
  await page.getByLabel('Homework passado').fill('Write three questions about your daily routine.')
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
  const saved = await stored(page)
  expect(
    saved.workspace.records.find((record) => record.lessonId === 'public-lesson-to-record'),
  ).toMatchObject({ content: 'PRIVATE_PUBLIC_DEMO_NOTES' })
  await page.reload()
  expect(await stored(page)).toEqual(saved)
  await teacherPage(page, 'Histórico')
  await page.getByLabel('Filtrar histórico por aluno').selectOption('student-sofia')
  await expect(page.locator('.history-card').first()).toContainText('PRIVATE_PUBLIC_DEMO_NOTES')
  await enterStudent(page)
  await page.getByLabel('Aluno da simulação').selectOption('student-sofia')
  await studentPage(page, 'Meu histórico')
  const latest = page.locator('.student-record').first()
  await expect(latest).toContainText('Write three questions about your daily routine.')
  await expect(latest).toContainText('Meeting someone new')
  await expect(page.locator('.student-surface')).not.toContainText('PRIVATE_PUBLIC_DEMO_NOTES')
  await latest.getByText('Ler material desta aula', { exact: true }).click()
  await expect(latest.locator('.material-text')).toContainText('Introduce yourself')
  await studentPage(page, 'Meu acervo')
  await expect(page.locator('.student-library')).toContainText('Meeting someone new')
  await expect(page.locator('.student-library')).not.toContainText('Making a travel plan')
  await capture(page, testInfo.outputPath('student-desktop.png'))
})

test('pending requests do not reserve time; approval, conflict and refusal persist through both views', async ({
  page,
}) => {
  await page.clock.install({ time: thursday })
  await page.goto('./')
  const originalLessons = (await stored(page)).workspace.lessons
  await enterStudent(page)
  await studentPage(page, 'Solicitações')
  await sendRequest(page, '2026-11-02', '8')
  await page.getByLabel('Aluno da simulação').selectOption('student-mateus')
  await studentPage(page, 'Solicitações')
  await sendRequest(page, '2026-11-02', '8')
  expect((await stored(page)).workspace.lessons).toEqual(originalLessons)
  await page.getByRole('button', { name: 'Voltar à professora', exact: true }).click()
  await teacherPage(page, 'Solicitações')
  const lara = page
    .getByRole('article', { name: 'Pedido de Lara Santos', exact: true })
    .filter({ hasText: 'segunda-feira' })
  const mateus = page.getByRole('article', { name: 'Pedido de Mateus Costa', exact: true })
  await lara.getByRole('button', { name: 'Aprovar pedido', exact: true }).click()
  const afterApproval = await stored(page)
  await mateus.getByRole('button', { name: 'Aprovar pedido', exact: true }).click()
  await expect(mateus.getByRole('alert')).toContainText('Conflito')
  expect(await stored(page)).toEqual(afterApproval)
  await mateus.getByRole('button', { name: 'Recusar pedido', exact: true }).click()
  const decided = await stored(page)
  expect(decided.workspace.lessons).toEqual(afterApproval.workspace.lessons)
  await teacherPage(page, 'Agenda')
  await page.getByRole('button', { name: 'Próxima semana', exact: true }).click()
  await expect(
    page
      .locator('.calendar-table .lesson-block')
      .filter({ hasText: 'Lara Santos' })
      .filter({ hasText: '08:00' }),
  ).toBeVisible()
  await enterStudent(page)
  await studentPage(page, 'Solicitações')
  await expect(page.locator('.request-card').filter({ hasText: 'Aprovado' })).toHaveCount(1)
  await page.getByLabel('Aluno da simulação').selectOption('student-mateus')
  await studentPage(page, 'Solicitações')
  await expect(page.locator('.request-card')).toHaveCount(1)
  await expect(page.locator('.request-card')).toContainText('Recusado')
  await page.reload()
  expect(await stored(page)).toEqual(decided)
})

test('restoration is confirmed and restores only public examples, preserving older local storage', async ({
  page,
}) => {
  await page.clock.install({ time: thursday })
  await page.goto('./')
  await teacherPage(page, 'Alunos')
  await page.getByRole('button', { name: 'Editar Lara Santos', exact: true }).click()
  await page.getByLabel('Nome do aluno').fill('Lara Edited Demo')
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
  const edited = await stored(page)
  await page.getByRole('button', { name: 'Reiniciar demo', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Reiniciar a demo?' })).toBeVisible()
  expect(await stored(page)).toEqual(edited)
  await page.getByRole('button', { name: 'Manter meus dados', exact: true }).click()
  expect(await stored(page)).toEqual(edited)
  await page.getByRole('button', { name: 'Reiniciar demo', exact: true }).click()
  await page.getByRole('button', { name: 'Sim, reiniciar demo', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Sua semana de aulas', exact: true }),
  ).toBeVisible()
  expect((await stored(page)).workspace.students[0].name).toBe('Lara Santos')
  expect(await page.evaluate((oldKey) => localStorage.getItem(oldKey), legacyKey)).toBe(legacyRaw)
  const restored = await stored(page)
  await page.reload()
  expect(await stored(page)).toEqual(restored)
})

test('a storage failure preserves the previous examples and the visitor’s form', async ({
  page,
}) => {
  await page.clock.install({ time: thursday })
  await page.goto('./')
  const before = await stored(page)
  await teacherPage(page, 'Alunos')
  await page.getByRole('button', { name: 'Editar Lara Santos', exact: true }).click()
  await page.getByLabel('Nome do aluno').fill('Unwritten visitor edit')
  await page.evaluate((publicKey) => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (storageKey, value) {
      if (storageKey === publicKey) throw new Error('QuotaExceededError')
      return original.call(this, storageKey, value)
    }
  }, key)
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('não conseguiu salvar')
  await expect(page.getByLabel('Nome do aluno')).toHaveValue('Unwritten visitor edit')
  expect(await stored(page)).toEqual(before)
})

test('mobile visitors can switch views, request and decide without horizontal overflow', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.clock.install({ time: thursday })
  await page.goto('./')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await capture(page, testInfo.outputPath('agenda-mobile.png'))
  await enterStudent(page)
  await studentPage(page, 'Solicitações')
  await sendRequest(page, '2026-11-02', '8')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await capture(page, testInfo.outputPath('student-requests-mobile.png'))
  await page.getByRole('button', { name: 'Voltar à professora', exact: true }).click()
  await teacherPage(page, 'Solicitações')
  await page
    .getByRole('article', { name: 'Pedido de Lara Santos', exact: true })
    .filter({ hasText: 'segunda-feira' })
    .getByRole('button', { name: 'Aprovar pedido', exact: true })
    .click()
  await expect(page.getByRole('status')).toContainText('aprovado')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
