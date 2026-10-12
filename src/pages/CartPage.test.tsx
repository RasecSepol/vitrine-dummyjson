import { Route, Routes } from 'react-router-dom'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CART_KEY } from '../contexts/CartProvider'
import { checkoutCart } from '../services/cartService'
import { LocationDisplay, TestProviders, seedSession } from '../test/renderWithProviders'
import { CartPage } from './CartPage'

vi.mock('../services/cartService', () => ({ checkoutCart: vi.fn() }))

function seedCart() {
  localStorage.setItem(
    CART_KEY,
    JSON.stringify([
      { id: 1, title: 'Batom', price: 10, thumbnail: '', quantity: 2 },
      { id: 2, title: 'Perfume', price: 50, thumbnail: '', quantity: 1 },
    ]),
  )
}

function renderCart() {
  return render(
    <TestProviders initialEntries={['/carrinho']}>
      <Routes>
        <Route path="/carrinho" element={<CartPage />} />
        <Route path="*" element={<LocationDisplay />} />
      </Routes>
    </TestProviders>,
  )
}

describe('<CartPage />', () => {
  it('mostra mensagem quando o carrinho está vazio', () => {
    renderCart()
    expect(screen.getByText('Seu carrinho está vazio.')).toBeInTheDocument()
  })

  it('calcula o total e remove itens', async () => {
    seedCart()
    const user = userEvent.setup()
    renderCart()

    expect(screen.getByTestId('cart-total')).toHaveTextContent('70,00')
    const rows = screen.getAllByRole('row')
    expect(within(rows[1]).getByText('Batom')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remover Batom' }))
    expect(screen.queryByText('Batom')).not.toBeInTheDocument()
    expect(screen.getByTestId('cart-total')).toHaveTextContent('50,00')
  })

  it('exige login para finalizar a compra', async () => {
    seedCart()
    const user = userEvent.setup()
    renderCart()

    await user.click(screen.getByRole('button', { name: 'Entrar para finalizar' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/login')
    expect(checkoutCart).not.toHaveBeenCalled()
  })

  it('envia o pedido quando o usuário está logado', async () => {
    seedCart()
    seedSession()
    vi.mocked(checkoutCart).mockResolvedValue({ id: 51, total: 70, totalProducts: 2, totalQuantity: 3 })
    const user = userEvent.setup()
    renderCart()

    await user.click(screen.getByRole('button', { name: 'Finalizar compra' }))

    expect(checkoutCart).toHaveBeenCalledWith(1, expect.arrayContaining([expect.objectContaining({ id: 1, quantity: 2 })]))
    expect(await screen.findByTestId('location')).toHaveTextContent('/')
    expect(JSON.parse(localStorage.getItem(CART_KEY) ?? '[]')).toEqual([])
  })
})
