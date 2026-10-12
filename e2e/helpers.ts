import { expect, type Page } from '@playwright/test'

// Conta pública de testes documentada pela DummyJSON.
export const TEST_USER = { username: 'emilys', password: 'emilyspass' }

export async function login(page: Page) {
  await page.getByRole('textbox', { name: 'Usuário' }).fill(TEST_USER.username)
  await page.getByLabel('Senha').fill(TEST_USER.password)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Painel administrativo' })).toBeVisible()
}
