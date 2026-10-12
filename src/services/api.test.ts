import { AxiosError, AxiosHeaders, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'
import { describe, expect, it, vi } from 'vitest'
import { seedSession } from '../test/renderWithProviders'
import { AUTH_UNAUTHORIZED_EVENT, api, getErrorMessage } from './api'

vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }))

// Adapter falso: captura a configuração final (após os interceptors) sem ir à rede.
function captureAdapter() {
  let captured: InternalAxiosRequestConfig | undefined
  const adapter: AxiosAdapter = async (config) => {
    captured = config
    return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
  }
  return { adapter, getConfig: () => captured }
}

describe('api (Axios)', () => {
  it('usa a baseURL da DummyJSON', () => {
    expect(api.defaults.baseURL).toBe('https://dummyjson.com')
  })

  it('não envia Authorization quando não há sessão', async () => {
    const { adapter, getConfig } = captureAdapter()
    await api.get('/products', { adapter })
    expect(getConfig()?.headers.get('Authorization')).toBeUndefined()
  })

  it('injeta o token JWT no cabeçalho Authorization', async () => {
    seedSession()
    const { adapter, getConfig } = captureAdapter()
    await api.get('/auth/me', { adapter })
    expect(getConfig()?.headers.get('Authorization')).toBe('Bearer fake-jwt-token')
  })

  it('dispara o evento de sessão inválida em respostas 401', async () => {
    const listener = vi.fn()
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, listener)
    const adapter: AxiosAdapter = (config) =>
      Promise.reject(
        new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
          data: { message: 'Token Expired!' },
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config,
        }),
      )

    await expect(api.get('/auth/me', { adapter })).rejects.toThrow()
    expect(listener).toHaveBeenCalledOnce()
    window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, listener)
  })

  it('traduz falhas em mensagens amigáveis', () => {
    const config = { headers: new AxiosHeaders() }
    const networkError = new AxiosError('Network Error', 'ERR_NETWORK', config)
    expect(getErrorMessage(networkError)).toMatch(/Não foi possível conectar/)

    const serverError = new AxiosError('fail', 'ERR_BAD_RESPONSE', config, null, {
      data: {},
      status: 500,
      statusText: 'Error',
      headers: {},
      config,
    })
    expect(getErrorMessage(serverError)).toMatch(/servidor encontrou um erro/)

    const apiMessage = new AxiosError('fail', 'ERR_BAD_REQUEST', config, null, {
      data: { message: 'Invalid credentials' },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config,
    })
    expect(getErrorMessage(apiMessage)).toBe('Invalid credentials')
  })
})
