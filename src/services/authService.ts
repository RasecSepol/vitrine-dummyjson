import { loginResponseSchema, type LoginFormValues, type Session } from '../schemas/auth'
import { api, parseResponse } from './api'

export const SESSION_DURATION_MINUTES = 60

export async function loginRequest(credentials: LoginFormValues): Promise<Session> {
  const response = await api.post(
    '/auth/login',
    { ...credentials, expiresInMins: SESSION_DURATION_MINUTES },
    // O formulário de login já mostra o erro em um Alert próprio.
    { silent: true },
  )
  const data = parseResponse(response, loginResponseSchema)
  return {
    token: data.accessToken,
    expiresAt: Date.now() + SESSION_DURATION_MINUTES * 60_000,
    user: {
      id: data.id,
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      image: data.image,
    },
  }
}
