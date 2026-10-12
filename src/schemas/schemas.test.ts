import { describe, expect, it } from 'vitest'
import { loginFormSchema, sessionSchema } from './auth'
import { productFormSchema, productListSchema, productSchema } from './product'

describe('schemas Zod', () => {
  it('aceita um produto da DummyJSON e aplica valores padrão', () => {
    const result = productSchema.safeParse({ id: 195, title: 'Novo', price: 10 })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tags).toEqual([])
      expect(result.data.stock).toBe(0)
    }
  })

  it('rejeita respostas com formato inesperado', () => {
    expect(productSchema.safeParse({ id: '1', title: 'x', price: 'caro' }).success).toBe(false)
    expect(productListSchema.safeParse({ products: [] }).success).toBe(false)
  })

  it('valida o formulário de produto com mensagens em português', () => {
    const result = productFormSchema.safeParse({
      title: 'TV',
      description: 'curta',
      category: '',
      price: -1,
      stock: 1.5,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      expect(errors.title).toContain('O título deve ter pelo menos 3 caracteres')
      expect(errors.description).toContain('A descrição deve ter pelo menos 10 caracteres')
      expect(errors.category).toContain('Selecione uma categoria')
      expect(errors.price).toContain('O preço deve ser maior que zero')
      expect(errors.stock).toContain('O estoque deve ser um número inteiro')
    }
  })

  it('valida as credenciais de login', () => {
    expect(loginFormSchema.safeParse({ username: '', password: '123' }).success).toBe(false)
    expect(loginFormSchema.safeParse({ username: 'emilys', password: 'emilyspass' }).success).toBe(true)
  })

  it('rejeita sessões salvas sem token', () => {
    expect(sessionSchema.safeParse({ expiresAt: 1, user: {} }).success).toBe(false)
  })
})
