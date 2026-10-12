import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useCart } from '../hooks/useCart'
import { makeProduct } from '../test/fixtures'
import { renderWithProviders } from '../test/renderWithProviders'
import { ProductCard } from './ProductCard'

function CartCounter() {
  const { totalItems } = useCart()
  return <output aria-label="Itens no carrinho">{totalItems}</output>
}

describe('<ProductCard />', () => {
  const product = makeProduct({ id: 42, title: 'Notebook Gamer', price: 1200, discountPercentage: 10 })

  it('exibe as informações principais do produto', () => {
    renderWithProviders(<ProductCard product={product} />)

    expect(screen.getByRole('heading', { name: 'Notebook Gamer' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Notebook Gamer' })).toBeInTheDocument()
    expect(screen.getByText(/1\.080,00/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver detalhes de Notebook Gamer' })).toHaveAttribute(
      'href',
      '/produtos/42',
    )
  })

  it('adiciona o produto ao carrinho ao clicar no botão', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <ProductCard product={product} />
        <CartCounter />
      </>,
    )

    const button = screen.getByRole('button', { name: 'Adicionar Notebook Gamer ao carrinho' })
    await user.click(button)
    await user.click(button)

    expect(screen.getByRole('status', { name: 'Itens no carrinho' })).toHaveTextContent('2')
  })
})
