import { z } from 'zod'

export const reviewSchema = z.object({
  rating: z.number(),
  comment: z.string(),
  date: z.string(),
  reviewerName: z.string(),
  reviewerEmail: z.string().optional(),
})

// Os endpoints de criação/edição da DummyJSON devolvem apenas os campos enviados,
// por isso vários campos têm valor padrão em vez de serem obrigatórios.
export const productSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().default(''),
  category: z.string().default(''),
  price: z.number(),
  discountPercentage: z.number().optional(),
  rating: z.number().optional(),
  stock: z.number().default(0),
  brand: z.string().optional(),
  tags: z.array(z.string()).default([]),
  thumbnail: z.string().default(''),
  images: z.array(z.string()).default([]),
  availabilityStatus: z.string().optional(),
  warrantyInformation: z.string().optional(),
  shippingInformation: z.string().optional(),
  returnPolicy: z.string().optional(),
  reviews: z.array(reviewSchema).default([]),
})

export const productListSchema = z.object({
  products: z.array(productSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
})

export const categorySchema = z.object({
  slug: z.string(),
  name: z.string(),
  url: z.string().optional(),
})

export const categoryListSchema = z.array(categorySchema)

export const deletedProductSchema = productSchema.extend({
  isDeleted: z.boolean(),
  deletedOn: z.string().optional(),
})

// Schema do formulário administrativo (cadastro/edição de produto).
export const productFormSchema = z.object({
  title: z.string().trim().min(3, 'O título deve ter pelo menos 3 caracteres'),
  description: z.string().trim().min(10, 'A descrição deve ter pelo menos 10 caracteres'),
  category: z.string().min(1, 'Selecione uma categoria'),
  brand: z.string().trim().optional(),
  price: z
    .number({ invalid_type_error: 'Informe o preço' })
    .positive('O preço deve ser maior que zero'),
  stock: z
    .number({ invalid_type_error: 'Informe o estoque' })
    .int('O estoque deve ser um número inteiro')
    .min(0, 'O estoque não pode ser negativo'),
})

export type Review = z.infer<typeof reviewSchema>
export type Product = z.infer<typeof productSchema>
export type ProductList = z.infer<typeof productListSchema>
export type Category = z.infer<typeof categorySchema>
export type ProductFormValues = z.infer<typeof productFormSchema>
