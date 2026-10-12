import { expect, test } from '@playwright/test'
import { login } from './helpers'

test.describe('Gestão de produtos (área administrativa)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('login')
    await login(page)
  })

  test('valida o formulário e cadastra um novo produto', async ({ page }) => {
    await page.getByRole('button', { name: 'Novo produto' }).click()
    const dialog = page.getByRole('dialog', { name: 'Novo produto' })

    // Validação com Zod antes de chamar a API.
    await dialog.getByRole('button', { name: 'Cadastrar' }).click()
    await expect(dialog.getByText('O título deve ter pelo menos 3 caracteres')).toBeVisible()

    await dialog.getByRole('textbox', { name: 'Título' }).fill('Cafeteira Playwright')
    await dialog.getByRole('textbox', { name: 'Descrição' }).fill('Produto criado pelo teste ponta a ponta.')
    await dialog.getByRole('textbox', { name: 'Categoria' }).click()
    await page.getByRole('option', { name: 'Kitchen Accessories' }).click()
    await dialog.getByRole('textbox', { name: 'Preço (US$)' }).fill('199,90')
    await dialog.getByRole('textbox', { name: 'Estoque' }).fill('15')
    await dialog.getByRole('button', { name: 'Cadastrar' }).click()

    await expect(dialog).toBeHidden()
    const row = page.getByRole('row', { name: /Cafeteira Playwright/ })
    await expect(row).toBeVisible()
    await expect(row).toContainText('Novo')
    await expect(row).toContainText('199,90')
  })

  test('edita e exclui um produto existente', async ({ page }) => {
    const table = page.getByRole('table', { name: 'Produtos cadastrados' })
    const firstRow = table.getByRole('row').nth(1)
    const title = (await firstRow.getByRole('link').textContent())?.trim() ?? ''

    await firstRow.getByRole('button', { name: `Editar ${title}` }).click()
    const dialog = page.getByRole('dialog', { name: 'Editar produto' })
    await dialog.getByRole('textbox', { name: 'Título' }).fill(`${title} (editado)`)
    await dialog.getByRole('button', { name: 'Salvar alterações' }).click()
    await expect(dialog).toBeHidden()
    await expect(table).toContainText(`${title} (editado)`)

    await table.getByRole('button', { name: `Excluir ${title} (editado)` }).click()
    const confirm = page.getByRole('dialog', { name: 'Excluir produto' })
    await confirm.getByRole('button', { name: 'Excluir' }).click()
    await expect(confirm).toBeHidden()
    await expect(table).not.toContainText(`${title} (editado)`)
  })
})
