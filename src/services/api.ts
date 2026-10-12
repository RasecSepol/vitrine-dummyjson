import axios, { AxiosError, type AxiosResponse } from 'axios'
import { notifications } from '@mantine/notifications'
import type { ZodType, ZodTypeDef } from 'zod'
import { getToken } from './sessionStorage'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Quando true, o interceptor de resposta não exibe a notificação de erro. */
    silent?: boolean
  }
}

export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized'

export const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Injeta o JWT em todas as requisições quando o usuário estiver logado.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === AxiosError.ECONNABORTED) {
      return 'O servidor demorou demais para responder. Tente novamente.'
    }
    if (!error.response) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.'
    }
    const data: unknown = error.response.data
    if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
      return data.message
    }
    if (error.response.status >= 500) {
      return 'O servidor encontrou um erro. Tente novamente em instantes.'
    }
    return `Erro ${error.response.status} ao processar a requisição.`
  }
  if (error instanceof Error) return error.message
  return 'Ocorreu um erro inesperado.'
}

// Captura falhas de rede/HTTP e mostra uma mensagem amigável ao usuário.
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isCancel(error)) return Promise.reject(error)

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT))
      }
      if (!error.config?.silent) {
        notifications.show({
          id: `api-error-${error.config?.url ?? 'unknown'}`,
          color: 'red',
          title: 'Falha na comunicação',
          message: getErrorMessage(error),
        })
      }
    }
    return Promise.reject(error)
  },
)

export class InvalidResponseError extends Error {
  constructor(endpoint: string) {
    super(`A resposta de ${endpoint} veio em um formato inesperado.`)
    this.name = 'InvalidResponseError'
  }
}

// Valida o corpo da resposta com Zod antes de entregá-lo para a interface.
export function parseResponse<Output, Input>(
  response: AxiosResponse<unknown>,
  schema: ZodType<Output, ZodTypeDef, Input>,
): Output {
  const result = schema.safeParse(response.data)
  if (!result.success) {
    console.error(result.error.flatten())
    throw new InvalidResponseError(response.config.url ?? 'API')
  }
  return result.data
}
