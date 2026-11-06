import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium, expect } from '@playwright/test'
import { createServer } from 'vite'
import { verifyCatalog } from './catalog.mjs'
import { verifySchedule } from './schedule.mjs'

const required = (name) => {
  if (!process.env[name]) throw new Error(`Missing test fixture: ${name}`)
  return process.env[name]
}
const api = new URL(required('NEXTAGE_BROWSER_API'))
if (api.hostname !== '127.0.0.1' || api.protocol !== 'http:')
  throw new Error('The integrated browser test requires a loopback API.')
const name = required('NEXTAGE_BROWSER_NAME')
const layout = required('NEXTAGE_BROWSER_LAYOUT')
const authUrl = 'https://test-project.supabase.co'
const tokens = {
  teacher: required('NEXTAGE_BROWSER_TEACHER_TOKEN'),
  student: required('NEXTAGE_BROWSER_STUDENT_TOKEN'),
}
const user = (role) => ({
  id: JSON.parse(Buffer.from(tokens[role].split('.')[1], 'base64url').toString()).sub,
  aud: 'authenticated',
  role: 'authenticated',
  email: `${role}@example.test`,
  app_metadata: {},
  user_metadata: { role: 'teacher' },
  created_at: '2026-11-04T12:00:00Z',
})
process.env.VITE_APP_MODE = 'pilot'
process.env.VITE_SUPABASE_URL = authUrl
process.env.VITE_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_integrated_browser_test'
const artifacts = fileURLToPath(new URL('../../work/verification-3c1/connected/', import.meta.url))
await mkdir(artifacts, { recursive: true })
const server = await createServer({
  envDir: false,
  mode: 'integration',
  server: {
    host: '127.0.0.1',
    port: 4179,
    strictPort: true,
    open: false,
    proxy: { '/api': api.origin },
  },
})
let browser
let page
try {
  await server.listen()
  const origin = 'http://127.0.0.1:4179'
  browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL, headless: true })
  const context = await browser.newContext({
    baseURL: origin,
    viewport: {
      width: Number(required('NEXTAGE_BROWSER_WIDTH')),
      height: Number(required('NEXTAGE_BROWSER_HEIGHT')),
    },
    timezoneId: 'America/Sao_Paulo',
    serviceWorkers: 'block',
  })
  const external = []
  let currentRole = 'teacher'
  // Only identity issuance is simulated. Application requests reach Kestrel and PostgreSQL.
  await context.route('**/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.origin === origin) return route.continue()
    if (url.origin !== authUrl) {
      external.push(url.origin)
      return route.abort()
    }
    const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' }
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    if (url.pathname === '/auth/v1/token') {
      const body = request.postDataJSON()
      if (body.email) currentRole = body.email.startsWith('student') ? 'student' : 'teacher'
      return route.fulfill({
        headers,
        json: {
          access_token: tokens[currentRole],
          refresh_token: `fictitious-refresh-${currentRole}`,
          token_type: 'bearer',
          expires_in: 600,
          user: user(currentRole),
        },
      })
    }
    if (url.pathname === '/auth/v1/user') return route.fulfill({ headers, json: user(currentRole) })
    if (url.pathname === '/auth/v1/logout') return route.fulfill({ headers, status: 204 })
    throw new Error('Unexpected Auth operation in the integrated student test.')
  })
  page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.setDefaultTimeout(15_000)
  async function login(role) {
    await page.getByLabel('E-mail', { exact: false }).fill(`${role}@example.test`)
    await page.getByLabel('Senha', { exact: false }).fill('Fictitious browser input 2026!')
    await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  }
  async function fits() {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  await page.goto(origin)
  await login('teacher')
  await expect(page.getByRole('heading', { name: 'Seus alunos', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Novo aluno', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Nome do aluno').fill(name)
  await dialog.getByRole('combobox', { name: 'Nível', exact: true }).selectOption('A1')
  await dialog.getByLabel('Início das aulas').fill('2026-11-04')
  await dialog.getByLabel('Telefone', { exact: true }).fill('11987654321')
  await expect(dialog.getByLabel('Telefone', { exact: true })).toHaveValue('(11) 98765-4321')
  await dialog.getByLabel('Ocupação', { exact: true }).fill('Dados fictícios')
  await dialog.getByLabel(/^Interesses/).fill('Viagens')
  await dialog.getByLabel('Link da aula').fill('https://example.test/aula')
  const createdResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/students') && response.request().method() === 'POST',
  )
  await dialog.getByRole('button', { name: 'Cadastrar aluno', exact: true }).click()
  const created = await createdResponse
  expect(created.status()).toBe(201)
  const original = await created.json()
  await expect(dialog).toHaveCount(0)
  await page.reload()
  await page.getByRole('button', { name: `Editar ${name}`, exact: true }).click()
  await expect(dialog.getByLabel('Telefone', { exact: true })).toHaveValue('(11) 98765-4321')
  await expect(dialog.getByLabel('Início das aulas')).toHaveValue('2026-11-04')
  await dialog.getByLabel('Nome do aluno').fill('Alteração descartada')
  await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click()
  await page.reload()
  await page.getByRole('button', { name: `Editar ${name}`, exact: true }).click()
  await expect(dialog.getByLabel('Nome do aluno')).toHaveValue(name)
  await dialog.getByLabel('Nome do aluno').fill(`${name} editado`)
  await dialog.getByLabel('Telefone', { exact: true }).fill('1134567890')
  await expect(dialog.getByLabel('Telefone', { exact: true })).toHaveValue('(11) 3456-7890')
  await dialog.getByRole('combobox', { name: 'Nível', exact: true }).selectOption('B1')
  await dialog.getByLabel(/^Interesses/).fill('Conversação')
  await dialog.getByLabel('Link da aula').fill('https://user:example@example.test/aula')
  const invalidResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'PUT' && response.url().includes('/api/students/'),
  )
  await dialog.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
  expect((await invalidResponse).status()).toBe(400)
  await expect(dialog.getByRole('alert')).toContainText('sem usuário ou senha')
  await expect(dialog.getByLabel('Nome do aluno')).toHaveValue(`${name} editado`)
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
  await dialog.getByLabel('Link da aula').fill('https://example.test/aula')
  const updatedResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'PUT' && response.url().includes('/api/students/'),
  )
  await dialog.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
  const updated = await updatedResponse
  expect(updated.status()).toBe(200)
  const saved = await updated.json()
  expect(saved.id).toBe(original.id)
  expect(saved.createdAt).toBe(original.createdAt)
  await expect(dialog).toHaveCount(0)
  await page.reload()
  await expect(page.getByRole('heading', { name: `${name} editado`, exact: true })).toBeVisible()
  await fits()
  await page.screenshot({ path: `${artifacts}/${layout}-students.png`, fullPage: true })
  await page.getByRole('button', { name: `Editar ${name} editado`, exact: true }).click()
  await expect(dialog.getByRole('combobox', { name: 'Nível', exact: true })).toHaveValue('B1')
  await expect(dialog.getByLabel(/^Interesses/)).toHaveValue('Conversação')
  await expect(dialog.getByLabel('Link da aula')).toHaveValue('https://example.test/aula')
  await fits()
  await page.screenshot({ path: `${artifacts}/${layout}-edit.png`, fullPage: true })
  await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click()
  const anonymous = await page.request.get('/api/students')
  expect(anonymous.status()).toBe(401)
  await verifyCatalog(page, name, layout, original.id)
  await verifySchedule(page, name, layout, original.id)
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(
    new Date(),
  )
  const previousMonday = new Date(`${today}T12:00:00Z`)
  previousMonday.setUTCDate(
    previousMonday.getUTCDate() - ((previousMonday.getUTCDay() + 6) % 7) - 7,
  )
  let chosenDay = -1
  let chosenHour = -1
  for (let day = 0; day < 5 && chosenDay < 0; day++) {
    const date = new Date(previousMonday)
    date.setUTCDate(date.getUTCDate() + day)
    for (let hour = 7; hour <= 22; hour++) {
      const past = await page.request.post('/api/agenda/lessons', {
        headers: { Authorization: `Bearer ${tokens.teacher}` },
        data: {
          studentId: original.id,
          date: date.toISOString().slice(0, 10),
          hour,
          weekly: false,
          endDate: null,
        },
      })
      if (past.status() === 200) {
        chosenDay = day
        chosenHour = hour
        break
      }
      expect(past.status()).toBe(409)
    }
  }
  expect(chosenDay).toBeGreaterThanOrEqual(0)
  await page.reload()
  await page.getByRole('button', { name: 'Agenda', exact: true }).click()
  const grid = page.getByRole('region', { name: 'Agenda semanal' })
  await grid.getByRole('button', { name: 'Semana anterior' }).click()
  if (layout === 'mobile') await grid.locator('.mobile-days button').nth(chosenDay).click()
  await grid
    .getByRole('button', {
      name: new RegExp(`${name} editado,.*${String(chosenHour).padStart(2, '0')}:00`),
    })
    .click()
  await dialog.getByRole('button', { name: 'Lançar aula', exact: true }).click()
  await dialog.getByLabel('Conteúdo trabalhado').fill('Conteúdo integrado fictício')
  await dialog.getByRole('button', { name: 'Lançar aula', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await page.getByRole('button', { name: 'Histórico', exact: true }).click()
  await expect(
    page
      .locator('.history-card')
      .filter({ hasText: `${name} editado` })
      .filter({ hasText: 'Conteúdo integrado fictício' }),
  ).toHaveCount(1)
  await page.reload()
  await page.getByRole('button', { name: 'Histórico', exact: true }).click()
  const record = page
    .locator('.history-card')
    .filter({ hasText: `${name} editado` })
    .filter({ hasText: 'Conteúdo integrado fictício' })
  await record.getByRole('button', { name: /Editar registro/ }).click()
  await dialog.getByLabel('Conteúdo trabalhado').fill('Conteúdo integrado corrigido')
  await dialog.getByRole('button', { name: 'Salvar registro', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await page.reload()
  await page.getByRole('button', { name: 'Histórico', exact: true }).click()
  await expect(
    page
      .locator('.history-card')
      .filter({ hasText: `${name} editado` })
      .filter({ hasText: 'Conteúdo integrado corrigido' }),
  ).toHaveCount(1)
  await page.getByRole('button', { name: 'Agenda', exact: true }).click()
  const upcomingGrid = page.getByRole('region', { name: 'Agenda semanal' })
  await upcomingGrid.getByRole('button', { name: 'Próxima semana' }).click()
  if (layout === 'mobile') await upcomingGrid.locator('.mobile-days button').nth(1).click()
  const upcomingHour = layout === 'mobile' ? 17 : 11
  await upcomingGrid
    .getByRole('button', { name: new RegExp(`${name} editado,.*${upcomingHour}:00`) })
    .click()
  await expect(dialog).toContainText('Conteúdo integrado corrigido')
  await dialog.locator('.form-actions').getByRole('button', { name: 'Fechar', exact: true }).click()
  await page.getByRole('button', { name: 'Sair', exact: true }).click()
  await expect(page.getByRole('heading', { name: `${name} editado`, exact: true })).toHaveCount(0)
  await login('student')
  await expect(page.getByRole('region', { name: 'Acesso do aluno', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Novo aluno', exact: true })).toHaveCount(0)
  const denied = await page.request.put(`/api/students/${encodeURIComponent(original.id)}`, {
    headers: { Authorization: `Bearer ${tokens.student}` },
    data: { ...saved, name: 'Alteração indevida' },
  })
  expect(denied.status()).toBe(403)
  const deniedCatalog = await page.request.get('/api/catalog', {
    headers: { Authorization: `Bearer ${tokens.student}` },
  })
  expect(deniedCatalog.status()).toBe(403)
  const deniedAgenda = await page.request.get('/api/agenda', {
    headers: { Authorization: `Bearer ${tokens.student}` },
  })
  expect(deniedAgenda.status()).toBe(403)
  await page.getByRole('button', { name: 'Sair', exact: true }).click()
  await login('teacher')
  await expect(page.getByRole('heading', { name: `${name} editado`, exact: true })).toBeVisible()
  const invitations = await page.request.get('/api/invitations', {
    headers: { Authorization: `Bearer ${tokens.teacher}` },
  })
  expect(invitations.status()).toBe(200)
  expect((await invitations.json()).filter((item) => item.studentId === original.id)).toEqual([])
  expect(errors).toEqual([])
  expect(external).toEqual([])
  console.log(`PASS ${layout}: students, catalog, schedule, reload, logout/login, 401/403.`)
} catch (error) {
  if (page) await page.screenshot({ path: `${artifacts}/${layout}-failure.png`, fullPage: true })
  console.error(error instanceof Error ? error.message : 'Integrated browser test failed.')
  process.exitCode = 1
} finally {
  await browser?.close()
  await server.close()
}
