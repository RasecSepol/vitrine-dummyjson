import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { cartItemsSchema, type CartItem } from '../schemas/cart'
import { CartContext, type CartContextValue, type CartProduct } from './CartContext'

export const CART_KEY = 'vitrine:cart'

function loadCart(): CartItem[] {
  try {
    const parsed = cartItemsSchema.safeParse(JSON.parse(localStorage.getItem(CART_KEY) ?? '[]'))
    return parsed.success ? parsed.data : []
  } catch {
    return []
  }
}

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart())

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  // Todas as atualizações criam novos arrays/objetos (map, filter e spread),
  // nunca mutando o estado anterior.
  const addItem = useCallback((product: CartProduct, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id)
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      }
      const { id, title, price, thumbnail } = product
      return [...current, { id, title, price, thumbnail, quantity }]
    })
  }, [])

  const removeItem = useCallback((productId: number) => {
    setItems((current) => current.filter((item) => item.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((item) => item.id !== productId)
        : current.map((item) => (item.id === productId ? { ...item, quantity } : item)),
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    return { items, totalItems, totalPrice, addItem, updateQuantity, removeItem, clearCart }
  }, [items, addItem, updateQuantity, removeItem, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
