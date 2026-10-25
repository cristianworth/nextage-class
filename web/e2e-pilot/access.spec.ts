import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const TEACHER = '11111111-1111-4111-8111-111111111111'
const STUDENT = '22222222-2222-4222-8222-222222222222'
const PASSWORD = 'A fictitious password 2026!'
const person = {
  id: 'student-example',
  name: 'Aluno Exemplo',
  level: 'A1',
  startDate: '2026-10-01',
  phone: '',
  occupation: '',
  interests: '',
  meetingUrl: '',
  createdAt: '2026-10-25T12:00:00Z',
}

function authUser(id: string) {
  return {
    id,
    aud: 'authenticated',
    role: 'authenticated',
    email: id === TEACHER ? 'teacher@example.test' : 'student@example.test',
    app_metadata: {},
    user_metadata: { role: 'teacher' },
    created_at: '2026-10-25T12:00:00Z',
  }
}
function authSession(id: string) {
  const exp = Math.floor(Date.now() / 1000) + 3600
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url')
  return {
    access_token: `${encode({ alg: 'ES256', typ: 'JWT' })}.${encode({ sub: id, aud: 'authenticated', exp })}.test-signature`,
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: exp,
    refresh_token: `test-refresh-${id}`,
    user: authUser(id),
  }
}
function profile(id: string) {
  return {
    userId: id,
    displayName: id === TEACHER ? 'Professora Exemplo' : 'Aluno Exemplo',
    role: id === TEACHER ? 'teacher' : 'student',
    studentId: id === TEACHER ? null : person.id,
  }
}
async function mockServices(
  page: Page,
  options: { loginFails?: boolean; unlinked?: boolean } = {},
) {
  const calls = { passwords: [] as string[], recovered: [] as string[], invites: 0, refreshes: 0 }
  let current = TEACHER
  await page.route('https://auth.nextage.test/auth/v1/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const body =
      request.method() === 'POST' || request.method() === 'PUT' ? request.postDataJSON() : {}
    const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' }
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    if (url.pathname.endsWith('/token')) {
      if (url.searchParams.get('grant_type') === 'refresh_token') calls.refreshes++
      if (options.loginFails)
        return route.fulfill({
          status: 400,
          headers,
          json: { error_code: 'invalid_credentials', msg: 'PRIVATE PROVIDER DETAIL' },
        })
      if (body?.email) current = body.email.startsWith('student') ? STUDENT : TEACHER
      return route.fulfill({ headers, json: authSession(current) })
    }
    if (url.pathname.endsWith('/recover')) {
      calls.recovered.push(body.email)
      return route.fulfill({ headers, json: {} })
    }
    if (url.pathname.endsWith('/logout')) return route.fulfill({ status: 204, headers })
    if (url.pathname.endsWith('/user')) {
      const token = request.headers().authorization ?? ''
      if (token.startsWith('Bearer '))
        current = JSON.parse(Buffer.from(token.slice(7).split('.')[1], 'base64url').toString()).sub
      if (request.method() === 'PUT') calls.passwords.push(body.password)
      return route.fulfill({ headers, json: authUser(current) })
    }
    return route.fulfill({ status: 404, headers, json: {} })
  })
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    if (path === '/api/session') {
      const bearer = route.request().headers().authorization!.slice(7)
      const id = JSON.parse(Buffer.from(bearer.split('.')[1], 'base64url').toString()).sub
      return route.fulfill(options.unlinked ? { status: 403, json: {} } : { json: profile(id) })
    }
    if (path === '/api/students') return route.fulfill({ json: [person] })
    if (path === '/api/invitations') return route.fulfill({ json: [] })
    if (path.endsWith('/invitation')) calls.invites++
    return route.fulfill({ status: 404, json: {} })
  })
  return calls
}
async function login(page: Page, role = 'teacher') {
  await page.getByLabel('E-mail', { exact: false }).fill(`${role}@example.test`)
  await page.getByLabel('Senha', { exact: false }).fill(PASSWORD)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
}
async function assertFits(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
}

test('login errors are friendly; recovery does not confirm an account exists', async ({ page }) => {
  const calls = await mockServices(page, { loginFails: true })
  await page.goto('/')
  await login(page)
  await expect(page.getByRole('alert')).toContainText('Confira o e-mail e a senha')
  await expect(page.getByText('PRIVATE PROVIDER DETAIL')).toHaveCount(0)
  await page.getByRole('button', { name: 'Esqueci minha senha' }).click()
  await page.getByLabel('E-mail').fill('unknown@example.test')
  await page.getByRole('button', { name: 'Solicitar recuperação', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Se houver uma conta')
  expect(calls.recovered).toEqual(['unknown@example.test'])
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Recupere seu acesso' })).toBeVisible()
})

test('server role controls the screen, signout removes forms and persisted context', async ({
  page,
}) => {
  await mockServices(page)
  await page.goto('/')
  await login(page)
  await expect(page.getByRole('heading', { name: 'Seus alunos' })).toBeVisible()
  await page.getByRole('button', { name: 'Novo aluno' }).click()
  await page.getByLabel('Nome do aluno').fill('Unsaved private context')
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
  await page.getByRole('button', { name: 'Sair', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Entre no seu espaço' })).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('nextage-class:pilot-auth'))).toBeNull()
  await login(page, 'student')
  await expect(page.getByRole('region', { name: 'Acesso do aluno' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Novo aluno' })).toHaveCount(0)
  await expect(page.getByText('Unsaved private context')).toHaveCount(0)
  await page.reload()
  await expect(page.getByRole('region', { name: 'Acesso do aluno' })).toBeVisible()
})

test('an authenticated identity without an active link stays outside the application', async ({
  page,
}) => {
  await mockServices(page, { unlinked: true })
  await page.goto('/')
  await login(page)
  await expect(page.getByRole('alert')).toContainText('ainda não está vinculado')
  await expect(page.getByRole('button', { name: 'Novo aluno' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Sair', exact: true })).toBeVisible()
})

test('failed async student creation preserves the form; success allows an invitation', async ({
  page,
}) => {
  const calls = await mockServices(page)
  let attempts = 0
  await page.route('**/api/students', async (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: [] })
    attempts++
    return route.fulfill(
      attempts === 1
        ? { status: 503, json: {} }
        : { json: { ...person, ...route.request().postDataJSON() } },
    )
  })
  await page.goto('/')
  await login(page)
  await page.getByRole('button', { name: 'Novo aluno' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Nome do aluno').fill(person.name)
  await dialog.getByLabel('Nível').selectOption('A1')
  await dialog.getByRole('button', { name: 'Cadastrar aluno' }).click()
  await expect(dialog.getByRole('alert')).toBeVisible()
  await expect(dialog.getByLabel('Nome do aluno')).toHaveValue(person.name)
  await expect(dialog.getByLabel('Sequência principal')).toHaveCount(0)
  await dialog.getByRole('button', { name: 'Cadastrar aluno' }).click()
  await expect(dialog).toHaveCount(0)
  await expect(page.getByRole('heading', { name: person.name })).toBeVisible()
  expect(calls.invites).toBe(0)
  expect(attempts).toBe(2)
  await page.route('**/api/students/*/invitation', (route) => {
    calls.invites++
    return route.fulfill({
      json: {
        id: '33333333-3333-4333-8333-333333333333',
        studentId: person.id,
        email: 'student@example.test',
        status: 'sent',
        createdAt: '2026-10-25T12:00:00Z',
        updatedAt: '2026-10-25T12:00:00Z',
      },
    })
  })
  await page.getByRole('button', { name: 'Convidar aluno' }).click()
  await page.getByLabel('E-mail do aluno').fill('student@example.test')
  await page.getByRole('button', { name: 'Enviar convite' }).click()
  await expect(page.getByRole('status')).toContainText('Convite enviado.')
  await expect(page.getByRole('button', { name: 'Ver convite' })).toBeVisible()
  expect(calls.invites).toBe(1)
})

test('invitation failure shows review and never false success or automatic resend', async ({
  page,
}) => {
  await mockServices(page)
  const receipt = {
    id: '33333333-3333-4333-8333-333333333333',
    studentId: person.id,
    email: 'student@example.test',
    status: 'needs_review',
    createdAt: '2026-10-25T12:00:00Z',
    updatedAt: '2026-10-25T12:00:00Z',
  }
  let sends = 0
  await page.route('**/api/invitations', (route) => route.fulfill({ json: sends ? [receipt] : [] }))
  await page.route('**/api/students/*/invitation', (route) => {
    sends++
    return route.fulfill({
      status: 503,
      json: { title: 'Confira este convite antes de tentar novamente.' },
    })
  })
  await page.goto('/')
  await login(page)
  await page.getByRole('button', { name: 'Convidar aluno' }).click()
  await page.getByLabel('E-mail do aluno').fill(receipt.email)
  await page.getByRole('button', { name: 'Enviar convite' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText('Conferir envio', { exact: true })).toBeVisible()
  await expect(dialog.getByRole('alert')).toContainText('Confira este convite')
  await expect(dialog.getByRole('button', { name: 'Enviar convite' })).toHaveCount(0)
  await expect(page.getByText('Convite enviado.', { exact: false })).toHaveCount(0)
  expect(sends).toBe(1)
})

for (const mode of ['activate', 'recover']) {
  test(`${mode}: invalid link gives recovery; valid provider session sets the password`, async ({
    page,
  }) => {
    const calls = await mockServices(page)
    await page.goto(`/auth/${mode}#error=access_denied&error_description=PRIVATE_LINK_DETAIL`)
    await expect(page.getByText('Este link expirou', { exact: false })).toBeVisible()
    await expect(page.getByLabel('Nova senha')).toHaveCount(0)
    await expect(page.getByText('PRIVATE_LINK_DETAIL')).toHaveCount(0)
    const session = authSession(STUDENT)
    const fragment = new URLSearchParams({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: '3600',
      token_type: 'bearer',
      type: mode === 'recover' ? 'recovery' : 'invite',
    })
    await page.goto('about:blank')
    await page.goto(`http://127.0.0.1:4178/auth/${mode}#${fragment}`)
    await page.getByLabel('Nova senha').fill(PASSWORD)
    await page.getByLabel('Confirmar senha').fill('A different password')
    await page.getByRole('button', { name: 'Salvar senha e continuar' }).click()
    await expect(page.getByRole('alert')).toHaveText('As senhas precisam ser iguais.')
    await page.getByLabel('Confirmar senha').fill(PASSWORD)
    await page.getByRole('button', { name: 'Salvar senha e continuar' }).click()
    await expect(page.getByRole('region', { name: 'Acesso do aluno' })).toBeVisible()
    expect(calls.passwords).toEqual([PASSWORD])
    expect(new URL(page.url()).hash).toBe('')
  })
}

test('late teacher responses cannot appear after switching to a student', async ({ page }) => {
  await mockServices(page)
  let release!: () => void
  const pending = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/api/students', async (route) => {
    await pending
    await route
      .fulfill({ json: [{ ...person, name: 'Previous account private name' }] })
      .catch(() => {})
  })
  await page.goto('/')
  await login(page)
  await expect(page.getByText('Carregando alunos…')).toBeVisible()
  await page.getByRole('button', { name: 'Sair', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Entre no seu espaço' })).toBeVisible()
  await login(page, 'student')
  release()
  await expect(page.getByRole('region', { name: 'Acesso do aluno' })).toBeVisible()
  await expect(page.getByText('Previous account private name')).toHaveCount(0)
})

test('an API rejection refreshes the token once without discarding the form', async ({ page }) => {
  const calls = await mockServices(page)
  let attempts = 0
  await page.route('**/api/students', (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: [] })
    attempts++
    return route.fulfill({ status: attempts === 1 ? 401 : 503, json: {} })
  })
  await page.goto('/')
  await login(page)
  await page.getByRole('button', { name: 'Novo aluno' }).click()
  await page.getByLabel('Nome do aluno').fill('Retain this name')
  await page.getByLabel('Nível').selectOption('A2')
  await page.getByRole('button', { name: 'Cadastrar aluno' }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByLabel('Nome do aluno')).toHaveValue('Retain this name')
  expect(attempts).toBe(2)
  expect(calls.refreshes).toBe(1)
})

test('failed signout hides protected data and provides a retry', async ({ page }) => {
  await mockServices(page)
  let attempts = 0
  await page.route('https://auth.nextage.test/auth/v1/logout*', (route) => {
    if (route.request().method() === 'OPTIONS') return route.fallback()
    attempts++
    return route.fulfill(
      attempts === 1
        ? {
            status: 500,
            json: { msg: 'PRIVATE DETAIL' },
            headers: { 'Access-Control-Allow-Origin': '*' },
          }
        : { status: 204, headers: { 'Access-Control-Allow-Origin': '*' } },
    )
  })
  await page.goto('/')
  await login(page)
  await expect(page.getByRole('heading', { name: person.name })).toBeVisible()
  await page.getByRole('button', { name: 'Sair', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Não foi possível encerrar')
  await expect(page.getByRole('heading', { name: person.name })).toHaveCount(0)
  await page.getByRole('button', { name: 'Tentar sair novamente' }).click()
  await expect(page.getByRole('heading', { name: 'Entre no seu espaço' })).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('nextage-class:pilot-auth'))).toBeNull()
})

test('desktop and mobile access forms and student cards fit the screen', async ({
  page,
}, testInfo) => {
  await mockServices(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Entre no seu espaço' })).toBeVisible()
  await assertFits(page)
  await page.screenshot({ path: testInfo.outputPath('signin-desktop.png'), fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await assertFits(page)
  await page.screenshot({ path: testInfo.outputPath('signin-mobile.png'), fullPage: true })
  await login(page)
  await expect(page.getByRole('heading', { name: person.name })).toBeVisible()
  await assertFits(page)
  await page.getByRole('button', { name: 'Novo aluno' }).click()
  await assertFits(page)
  await page.screenshot({ path: testInfo.outputPath('student-form-mobile.png'), fullPage: true })
})
