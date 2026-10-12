import type { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CART_KEY, CartProvider } from '../contexts/CartProvider'
import { makeProduct } from '../test/fixtures'
import { useCart } from './useCart'

const wrapper = ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>

describe('useCart', () => {
  it('lança um erro claro quando usado fora do CartProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useCart())).toThrow('useCart deve ser usado dentro de um <CartProvider>.')
  })

  it('adiciona itens e soma a quantidade de produtos repetidos', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    const product = makeProduct({ id: 7, price: 10 })

    act(() => result.current.addItem(product))
    act(() => result.current.addItem(product, 2))

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(3)
    expect(result.current.totalItems).toBe(3)
    expect(result.current.totalPrice).toBe(30)
  })

  it('atualiza o estado de forma imutável', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.addItem(makeProduct({ id: 1 })))

    const previousItems = result.current.items
    const previousItem = previousItems[0]
    act(() => result.current.updateQuantity(1, 4))

    expect(result.current.items).not.toBe(previousItems)
    expect(result.current.items[0]).not.toBe(previousItem)
    expect(previousItem.quantity).toBe(1)
    expect(result.current.items[0].quantity).toBe(4)
  })

  it('remove itens, limpa o carrinho e persiste no localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem(makeProduct({ id: 1 }))
      result.current.addItem(makeProduct({ id: 2 }))
    })
    expect(JSON.parse(localStorage.getItem(CART_KEY) ?? '[]')).toHaveLength(2)

    act(() => result.current.removeItem(1))
    expect(result.current.items.map((item) => item.id)).toEqual([2])

    act(() => result.current.updateQuantity(2, 0))
    expect(result.current.items).toEqual([])

    act(() => result.current.addItem(makeProduct({ id: 3 })))
    act(() => result.current.clearCart())
    expect(result.current.totalItems).toBe(0)
    expect(localStorage.getItem(CART_KEY)).toBe('[]')
  })

  it('restaura o carrinho salvo e ignora dados corrompidos', () => {
    localStorage.setItem(CART_KEY, JSON.stringify([{ id: 9, title: 'Salvo', price: 5, thumbnail: '', quantity: 2 }]))
    const { result, unmount } = renderHook(() => useCart(), { wrapper })
    expect(result.current.totalItems).toBe(2)
    unmount()

    localStorage.setItem(CART_KEY, '{ isso não é json')
    const { result: corrupted } = renderHook(() => useCart(), { wrapper })
    expect(corrupted.current.items).toEqual([])
  })
})
