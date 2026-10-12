import { z } from 'zod'

export const cartItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  price: z.number(),
  thumbnail: z.string(),
  quantity: z.number().int().positive(),
})

export const cartItemsSchema = z.array(cartItemSchema)

export const checkoutResponseSchema = z.object({
  id: z.number(),
  total: z.number(),
  discountedTotal: z.number().optional(),
  totalProducts: z.number(),
  totalQuantity: z.number(),
})

export type CartItem = z.infer<typeof cartItemSchema>
export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>
