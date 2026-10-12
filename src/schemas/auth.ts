import { z } from 'zod'

export const loginFormSchema = z.object({
  username: z.string().trim().min(1, 'Informe o usuário'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

export const authUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  image: z.string().optional(),
})

export const loginResponseSchema = authUserSchema.extend({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
})

// Formato salvo no localStorage: validado novamente ao reabrir a aplicação.
export const sessionSchema = z.object({
  token: z.string(),
  expiresAt: z.number(),
  user: authUserSchema,
})

export type LoginFormValues = z.infer<typeof loginFormSchema>
export type AuthUser = z.infer<typeof authUserSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>
export type Session = z.infer<typeof sessionSchema>
