import { createContext } from 'react'
import type { CartItem } from '../schemas/cart'
import type { Product } from '../schemas/product'

export type CartProduct = Pick<Product, 'id' | 'title' | 'price' | 'thumbnail'>

export interface CartContextValue {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addItem: (product: CartProduct, quantity?: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  removeItem: (productId: number) => void
  clearCart: () => void
}

export const CartContext = createContext<CartContextValue | undefined>(undefined)
