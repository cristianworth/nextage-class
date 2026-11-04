import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { expect } from '@playwright/test'

export async function verifyCatalog(page, name, layout, studentId) {
  const artifacts = fileURLToPath(
    new URL('../../work/verification-3c2/connected/', import.meta.url),
  )
  await mkdir(artifacts, { recursive: true })
  const navigation = page.getByRole('navigation', { name: 'Área da professora' })
  const dialog = page.getByRole('dialog')
  const firstTitle = `${name} — Viagens`
  const secondTitle = `${name} — Conversação`
  const unitTitle = `${name} — Chegadas`
  const tenthTitle = `${name} — Revisão`
  const supportTitle = `${name} — Apoio`
  const literal =
    '<img src="invalid" onerror="window.catalogExecuted=true"> Texto literal de apoio.'
  await navigation.getByRole('button', { name: 'Acervo', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Seu acervo de materiais' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Adicionar exemplos' })).toHaveCount(0)

  async function saveButton(label, path, method = 'POST', status = 201) {
    const pending = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === path && response.request().method() === method,
    )
    await dialog.getByRole('button', { name: label, exact: true }).click()
    const response = await pending
    expect(response.status()).toBe(status)
    return response.json()
  }
  async function newBook(title, levels) {
    await page.getByRole('button', { name: 'Nova sequência', exact: true }).click()
    await dialog.getByLabel('Título da sequência').fill(title)
    for (const level of levels)
      await dialog.getByRole('checkbox', { name: level, exact: true }).check()
    const book = await saveButton('Salvar sequência', '/api/books')
    await expect(dialog).toHaveCount(0)
    return book
  }
  const first = await newBook(firstTitle, ['A1', 'A2'])
  const second = await newBook(secondTitle, ['B1'])

  async function fillUnit(title, number, content) {
    await page.getByRole('button', { name: 'Novo material', exact: true }).click()
    await dialog.getByLabel('Título', { exact: false }).first().fill(title)
    await dialog.getByLabel('Tipo de material').selectOption('unit')
    await dialog.getByRole('combobox', { name: /^Sequência/ }).selectOption(first.id)
    await dialog.getByLabel('Número da unidade').fill(String(number))
    await dialog.getByLabel(/^Conteúdo do material/).fill(content)
  }
  await fillUnit(unitTitle, 2, 'Texto da segunda unidade.')
  const unit = await saveButton('Salvar material', '/api/materials')
  await expect(dialog).toHaveCount(0)
  await fillUnit(tenthTitle, 2, 'Texto da décima unidade.')
  await saveButton('Salvar material', '/api/materials', 'POST', 409)
  await expect(dialog.getByRole('alert')).toContainText('Já existe a Unidade 2')
  await expect(dialog.getByLabel(/^Conteúdo do material/)).toHaveValue('Texto da décima unidade.')
  await dialog.getByLabel('Número da unidade').fill('10')
  await saveButton('Salvar material', '/api/materials')
  await expect(dialog).toHaveCount(0)

  await page.getByRole('button', { name: 'Novo material', exact: true }).click()
  await dialog.getByLabel('Título', { exact: false }).first().fill(supportTitle)
  await dialog.getByRole('checkbox', { name: 'B1', exact: true }).check()
  await dialog.getByLabel(/^Conteúdo do material/).fill(literal)
  await saveButton('Salvar material', '/api/materials')
  await expect(dialog).toHaveCount(0)
  await page.reload()
  await navigation.getByRole('button', { name: 'Acervo', exact: true }).click()
  await page.getByRole('textbox', { name: 'Buscar no acervo' }).fill(name)
  await page.getByLabel('Filtrar acervo por nível').selectOption('A1')
  await expect(page.locator('.material-grid article h2')).toHaveText([unitTitle, tenthTitle])
  await page.getByRole('button', { name: `Ler material ${unitTitle}`, exact: true }).click()
  await dialog.getByRole('button', { name: 'Editar material', exact: true }).click()
  await dialog.getByLabel(/^Conteúdo do material/).fill('Conteúdo atualizado e persistido.')
  const changed = await saveButton('Salvar material', `/api/materials/${unit.id}`, 'PUT', 200)
  expect(changed.createdAt).toBe(unit.createdAt)
  await expect(dialog).toHaveCount(0)
  await page.getByLabel('Filtrar acervo por nível').selectOption('B1')
  await expect(page.locator('.material-grid article h2')).toHaveText([supportTitle])
  await page.getByRole('button', { name: `Ler material ${supportTitle}`, exact: true }).click()
  await expect(dialog.locator('.material-text')).toHaveText(literal)
  await expect(dialog.locator('img')).toHaveCount(0)
  expect(await page.evaluate(() => window.catalogExecuted)).toBeUndefined()
  await dialog.getByRole('button', { name: 'Fechar', exact: true }).last().click()

  await page.getByLabel('Filtrar acervo por nível').selectOption('')
  await page.getByRole('button', { name: 'Sequências', exact: true }).click()
  await page.getByRole('button', { name: `Editar sequência ${firstTitle}`, exact: true }).click()
  await dialog.getByRole('checkbox', { name: 'A1', exact: true }).uncheck()
  const editedBook = await saveButton('Salvar sequência', `/api/books/${first.id}`, 'PUT', 200)
  expect(editedBook.createdAt).toBe(first.createdAt)
  await expect(dialog).toHaveCount(0)
  await page.getByRole('button', { name: 'Materiais', exact: true }).click()
  await page.getByLabel('Filtrar acervo por nível').selectOption('A1')
  await expect(page.getByText('Nenhum material encontrado', { exact: true })).toBeVisible()
  await page.getByLabel('Filtrar acervo por nível').selectOption('A2')
  await expect(page.locator('.material-grid article h2')).toHaveText([unitTitle, tenthTitle])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: `${artifacts}/${layout}-catalog.png`, fullPage: true })
  await page.getByRole('button', { name: `Ler material ${unitTitle}`, exact: true }).click()
  await expect(dialog.locator('.material-text')).toHaveText('Conteúdo atualizado e persistido.')
  await page.screenshot({ path: `${artifacts}/${layout}-material.png`, fullPage: true })
  await dialog.getByRole('button', { name: 'Fechar', exact: true }).last().click()

  await navigation.getByRole('button', { name: 'Alunos', exact: true }).click()
  await page.getByRole('button', { name: `Editar ${name} editado`, exact: true }).click()
  await dialog.getByRole('combobox', { name: 'Nível', exact: true }).selectOption('A2')
  await dialog.getByLabel('Sequência principal', { exact: false }).selectOption(first.id)
  await saveButton(
    'Salvar alterações',
    `/api/students/${encodeURIComponent(studentId)}`,
    'PUT',
    200,
  )
  await expect(dialog).toHaveCount(0)
  await page.reload()
  await page.getByRole('button', { name: `Editar ${name} editado`, exact: true }).click()
  await expect(dialog.getByLabel('Sequência principal', { exact: false })).toHaveValue(first.id)
  await dialog.getByRole('combobox', { name: 'Nível', exact: true }).selectOption('B1')
  await expect(
    dialog.getByText('A sequência atual não atende este nível.', { exact: false }),
  ).toBeVisible()
  await dialog.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await page.reload()
  await expect(
    page.getByText(`Sequência: ${firstTitle} · não atende este nível`, { exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: `Editar ${name} editado`, exact: true }).click()
  await dialog.getByLabel('Sequência principal', { exact: false }).selectOption('')
  await dialog.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await page.getByRole('button', { name: `Editar ${name} editado`, exact: true }).click()
  await expect(dialog.getByLabel('Sequência principal', { exact: false })).toHaveValue('')
  await dialog.getByLabel('Sequência principal', { exact: false }).selectOption(second.id)
  await dialog.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await page.reload()
  await page.getByRole('button', { name: `Editar ${name} editado`, exact: true }).click()
  await expect(dialog.getByLabel('Sequência principal', { exact: false })).toHaveValue(second.id)
  await page.screenshot({ path: `${artifacts}/${layout}-primary-sequence.png`, fullPage: true })
  await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click()
}
