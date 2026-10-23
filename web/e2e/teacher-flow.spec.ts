import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

const storageKey = 'nextage-class:workspace:v1'

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-23T15:00:00Z') })
  await page.goto('/')
})

async function navigate(page: Page, name: 'Alunos' | 'Agenda' | 'Histórico') {
  await page
    .getByRole('navigation', { name: 'Navegação principal' })
    .getByRole('button', { name, exact: true })
    .click()
}

async function newLesson(page: Page, studentId: string, date: string, hour: number) {
  await page.getByRole('button', { name: 'Nova aula', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('combobox', { name: 'Aluno', exact: true }).selectOption(studentId)
  await dialog.getByLabel('Data da aula').fill(date)
  await dialog.getByRole('combobox', { name: 'Horário', exact: true }).selectOption(String(hour))
  await dialog.getByRole('button', { name: 'Agendar aula', exact: true }).click()
}

test('cadastra, agenda, recusa conflito, lança, edita e preserva histórico após recarga', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await navigate(page, 'Alunos')
  await page.getByRole('button', { name: 'Novo aluno', exact: true }).click()
  await page.getByLabel('Nome do aluno').fill('Ana Demo')
  await page.getByRole('combobox', { name: 'Nível', exact: true }).selectOption('B1')
  await page.getByRole('button', { name: 'Cadastrar aluno', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Ana Demo' })).toBeVisible()
  const studentId = await page.evaluate(
    (key) =>
      JSON.parse(localStorage.getItem(key)!).students.find(
        (student: { name: string }) => student.name === 'Ana Demo',
      ).id as string,
    storageKey,
  )
  await navigate(page, 'Agenda')
  await newLesson(page, studentId, '2026-10-19', 8)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await newLesson(page, 'student-sofia', '2026-10-19', 8)
  await expect(page.getByRole('alert')).toContainText('ocupado por Ana Demo')
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
  await page.locator('.lesson-block').filter({ hasText: 'Ana Demo' }).click()
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
  await page
    .getByLabel('Conteúdo trabalhado')
    .fill('Praticamos apresentações e perguntas do cotidiano.')
  await page.getByLabel('Livro ou material').fill('Conversação · Unidade 1')
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
  await navigate(page, 'Histórico')
  await page.getByLabel('Filtrar histórico por aluno').selectOption(studentId)
  await expect(page.locator('.history-card')).toHaveCount(1)
  await page.getByRole('button', { name: /Editar registro de Ana Demo/ }).click()
  await page
    .getByLabel('Conteúdo trabalhado')
    .fill('Conteúdo corrigido: apresentações profissionais.')
  await page.getByRole('button', { name: 'Salvar registro', exact: true }).click()
  await expect(page.locator('.history-card')).toHaveCount(1)
  await page.reload()
  await navigate(page, 'Alunos')
  await page.getByRole('button', { name: 'Editar Ana Demo', exact: true }).click()
  await page.getByLabel('Nome do aluno').fill('Ana Atualizada')
  await page.getByRole('combobox', { name: 'Nível', exact: true }).selectOption('C1')
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
  await navigate(page, 'Histórico')
  await page.getByLabel('Filtrar histórico por aluno').selectOption(studentId)
  await expect(page.getByRole('heading', { name: 'Ana Demo', exact: true })).toBeVisible()
  await expect(page.locator('.history-card')).toContainText('B1')
  await expect(page.locator('.history-card')).toContainText(
    'Conteúdo corrigido: apresentações profissionais.',
  )
  await expect(page.locator('.history-card')).toContainText('Última atualização')
  expect(errors).toEqual([])
})

test('aula futura não permite lançamento', async ({ page }) => {
  await page
    .locator('.lesson-block')
    .filter({ hasText: 'Mateus Costa' })
    .filter({ hasText: '22:00' })
    .click()
  await expect(page.getByRole('button', { name: 'Lançar aula', exact: true })).toBeDisabled()
  await expect(page.getByRole('dialog')).toContainText('após o término')
})

test('falta sem justificativa fica no histórico sem exigir conteúdo', async ({ page }) => {
  await page.locator('.lesson-block').filter({ hasText: 'Sofia Lima' }).first().click()
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
  await page.getByLabel('Falta do aluno', { exact: true }).check()
  await page.getByRole('button', { name: 'Lançar aula', exact: true }).click()
  await navigate(page, 'Histórico')
  await page.getByLabel('Filtrar histórico por aluno').selectOption('student-sofia')
  await expect(page.locator('.history-card')).toHaveCount(1)
  await expect(page.locator('.history-card')).toContainText('Falta do aluno')
})

test('dados corrompidos são preservados até reset confirmado', async ({ page }) => {
  await page.evaluate((key) => localStorage.setItem(key, '{corrupted'), storageKey)
  await page.reload()
  await expect(page.getByRole('alert')).toContainText('foram preservados')
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe('{corrupted')
  await page.getByRole('button', { name: 'Reiniciar demo', exact: true }).click()
  await page.getByRole('button', { name: 'Manter meus dados', exact: true }).click()
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe('{corrupted')
  await page.getByRole('button', { name: 'Reiniciar demo', exact: true }).click()
  await page.getByRole('button', { name: 'Sim, reiniciar demo', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Sua semana de aulas' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Sua semana de aulas' })).toBeVisible()
})

test('gravação recusada mantém formulário e dados anteriores', async ({ page }) => {
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('quota', 'QuotaExceededError')
    }
  })
  await navigate(page, 'Alunos')
  await page.getByRole('button', { name: 'Novo aluno', exact: true }).click()
  await page.getByLabel('Nome do aluno').fill('Não deve ser salvo')
  await page.getByRole('combobox', { name: 'Nível', exact: true }).selectOption('A1')
  await page.getByRole('button', { name: 'Cadastrar aluno', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('não conseguiu salvar')
  await expect(page.getByLabel('Nome do aluno')).toHaveValue('Não deve ser salvo')
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Não deve ser salvo', exact: true })).toHaveCount(
    0,
  )
})

test('pesquisa e filtro vazio têm retorno claro', async ({ page }) => {
  await navigate(page, 'Alunos')
  await page.getByLabel('Buscar aluno').fill('nome inexistente')
  await expect(page.getByRole('heading', { name: 'Nenhum aluno encontrado' })).toBeVisible()
  await navigate(page, 'Histórico')
  await page.getByLabel('Filtrar histórico por aluno').selectOption('student-diego')
  await expect(page.locator('.history-card')).toHaveCount(0)
  await expect(
    page.getByRole('heading', { name: 'A próxima história começa em uma aula' }),
  ).toBeVisible()
})

test('semanas navegam e Hoje retorna à semana de referência', async ({ page }) => {
  const title = page.locator('.week-navigation h2')
  const initial = await title.textContent()
  await page.getByRole('button', { name: 'Próxima semana', exact: true }).click()
  await expect(title).not.toHaveText(initial!)
  await page.getByRole('button', { name: 'Hoje', exact: true }).click()
  await expect(title).toHaveText(initial!)
  await page.screenshot({ path: '../work/screenshots/agenda-desktop.png', fullPage: true })
})

test('celular oferece consulta por dia e não ultrapassa a largura da tela', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('.mobile-days')).toBeVisible()
  await page.locator('.mobile-days button').first().click()
  await expect(page.locator('.mobile-days button').first()).toHaveAttribute('aria-pressed', 'true')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  await page.screenshot({ path: '../work/screenshots/agenda-mobile.png', fullPage: true })
  await navigate(page, 'Alunos')
  await expect(page.getByRole('heading', { name: 'Seus alunos' })).toBeVisible()
  await page.screenshot({ path: '../work/screenshots/alunos-mobile.png', fullPage: true })
})
