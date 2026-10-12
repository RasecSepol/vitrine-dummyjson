import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchCategories, fetchProducts } from '../services/productService'
import { makeProduct, makeProductList } from '../test/fixtures'
import { renderWithProviders } from '../test/renderWithProviders'
import { ProductsPage } from './ProductsPage'

vi.mock('../services/productService', () => ({
  fetchProducts: vi.fn(),
  fetchCategories: vi.fn(),
}))

describe('<ProductsPage />', () => {
  beforeEach(() => {
    vi.mocked(fetchCategories).mockResolvedValue([{ slug: 'beauty', name: 'Beauty' }])
    vi.mocked(fetchProducts).mockReset()
  })

  it('lista os produtos retornados pela API', async () => {
    vi.mocked(fetchProducts).mockResolvedValue(
      makeProductList([makeProduct({ id: 1, title: 'Batom' }), makeProduct({ id: 2, title: 'Perfume' })]),
    )
    renderWithProviders(<ProductsPage />)

    expect(await screen.findByRole('heading', { name: 'Batom' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Perfume' })).toBeInTheDocument()
    expect(fetchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, search: '', category: null }),
      expect.any(AbortSignal),
    )
  })

  it('busca pelo texto digitado (com debounce)', async () => {
    vi.mocked(fetchProducts).mockImplementation(async ({ search }) =>
      makeProductList(search ? [makeProduct({ id: 3, title: 'iPhone 13' })] : [makeProduct({ title: 'Batom' })]),
    )
    const user = userEvent.setup()
    renderWithProviders(<ProductsPage />)
    await screen.findByRole('heading', { name: 'Batom' })

    await user.type(screen.getByRole('textbox', { name: 'Buscar produtos' }), 'phone')

    expect(await screen.findByRole('heading', { name: 'iPhone 13' })).toBeInTheDocument()
    await waitFor(() =>
      expect(fetchProducts).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'phone', page: 1 }),
        expect.any(AbortSignal),
      ),
    )
    // Uma única requisição de busca para "phone", não uma por tecla.
    const searches = vi.mocked(fetchProducts).mock.calls.filter(([query]) => query.search)
    expect(searches).toHaveLength(1)
  })

  it('informa quando nenhum produto é encontrado', async () => {
    vi.mocked(fetchProducts).mockResolvedValue(makeProductList([]))
    renderWithProviders(<ProductsPage />, { route: '/?q=xyz' })

    expect(await screen.findByText('Nenhum produto encontrado para os filtros escolhidos.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Buscar produtos' })).toHaveValue('xyz')
  })

  it('mostra o erro e permite tentar novamente', async () => {
    vi.mocked(fetchProducts)
      .mockRejectedValueOnce(new Error('Falha simulada'))
      .mockResolvedValue(makeProductList([makeProduct({ title: 'Recuperado' })]))
    const user = userEvent.setup()
    renderWithProviders(<ProductsPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha simulada')
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(await screen.findByRole('heading', { name: 'Recuperado' })).toBeInTheDocument()
  })
})
