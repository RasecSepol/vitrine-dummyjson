import { expect, test } from '@playwright/test'

test.describe('Catálogo público', () => {
  test('busca um produto, abre os detalhes e adiciona ao carrinho', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('heading', { name: 'Produtos', level: 1 })).toBeVisible()

    await page.getByRole('textbox', { name: 'Buscar produtos' }).fill('iphone')
    await expect(page).toHaveURL(/q=iphone/)

    const firstCard = page.getByRole('article').first()
    await expect(firstCard.getByRole('heading')).toContainText(/iphone/i)
    const productName = (await firstCard.getByRole('heading').textContent())?.trim() ?? ''

    await firstCard.getByRole('link', { name: /Ver detalhes de/ }).click()
    await expect(page).toHaveURL(/\/produtos\/\d+$/)
    await expect(page.getByRole('heading', { name: productName, level: 1 })).toBeVisible()

    await page.getByRole('textbox', { name: 'Quantidade' }).fill('2')
    await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()

    const cartLink = page.getByRole('link', { name: /Carrinho/ })
    await expect(cartLink).toContainText('2')
    await cartLink.click()

    await expect(page).toHaveURL(/\/carrinho$/)
    await expect(page.getByRole('link', { name: productName })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrar para finalizar' })).toBeVisible()
  })

  test('filtra por categoria e pagina os resultados', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('textbox', { name: 'Categoria' }).click()
    await page.getByRole('option', { name: 'Smartphones' }).click()

    await expect(page).toHaveURL(/categoria=smartphones/)
    await expect(page.getByRole('article').first()).toContainText('smartphones')

    await page.getByRole('button', { name: 'Próxima página' }).click()
    await expect(page).toHaveURL(/pagina=2/)
    await expect(page.getByRole('article').first()).toContainText('smartphones')
  })

  test('links diretos para rotas internas funcionam após recarregar', async ({ page }) => {
    await page.goto('produtos/1')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    await page.goto('rota-que-nao-existe')
    await expect(page.getByText('A página que você procurou não existe.')).toBeVisible()
  })
})
