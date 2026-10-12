import { expect, test } from '@playwright/test'
import { login } from './helpers'

test.describe('Fluxo de autenticação', () => {
  test('bloqueia o admin, faz login, redireciona e faz logout', async ({ page }) => {
    // Acesso direto (deep link) à rota protegida sem sessão.
    await page.goto('admin')
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'Área administrativa' })).toBeVisible()

    await login(page)
    await expect(page).toHaveURL(/\/admin$/)
    await expect(page.getByRole('table', { name: 'Produtos cadastrados' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Admin' })).toHaveClass(/active/)

    // A sessão sobrevive a um recarregamento da página.
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Painel administrativo' })).toBeVisible()

    await page.getByRole('button', { name: /Menu do usuário/ }).click()
    await page.getByRole('menuitem', { name: 'Sair' }).click()
    await expect(page).toHaveURL(/\/vitrine-dummyjson\/?$/)
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible()

    await page.goto('admin')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('mostra erro amigável com credenciais inválidas', async ({ page }) => {
    await page.goto('login')
    await page.getByRole('textbox', { name: 'Usuário' }).fill('emilys')
    await page.getByLabel('Senha').fill('senha-errada')
    await page.getByRole('button', { name: 'Entrar', exact: true }).click()

    await expect(page.getByRole('alert')).toContainText('Invalid credentials')
    await expect(page).toHaveURL(/\/login$/)
  })
})
