import { checkoutResponseSchema, type CartItem, type CheckoutResponse } from '../schemas/cart'
import { api, parseResponse } from './api'

export async function checkoutCart(userId: number, items: CartItem[]): Promise<CheckoutResponse> {
  const response = await api.post('/carts/add', {
    userId,
    products: items.map(({ id, quantity }) => ({ id, quantity })),
  })
  return parseResponse(response, checkoutResponseSchema)
}
