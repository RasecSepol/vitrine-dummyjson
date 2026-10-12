import type { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../contexts/AuthProvider'
import { AUTH_UNAUTHORIZED_EVENT } from '../services/api'
import { loginRequest } from '../services/authService'
import { SESSION_KEY } from '../services/sessionStorage'
import { fakeSession, seedSession } from '../test/renderWithProviders'
import { useAuth } from './useAuth'

vi.mock('../services/authService', () => ({ loginRequest: vi.fn() }))

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>

describe('useAuth', () => {
  beforeEach(() => {
    vi.mocked(loginRequest).mockReset()
  })

  it('lança um erro claro quando usado fora do AuthProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useAuth())).toThrow('useAuth deve ser usado dentro de um <AuthProvider>.')
  })

  it('faz login, persiste o token e faz logout', async () => {
    vi.mocked(loginRequest).mockResolvedValue(fakeSession)
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isAuthenticated).toBe(false)

    await act(() => result.current.login({ username: 'emilys', password: 'emilyspass' }))

    expect(loginRequest).toHaveBeenCalledWith({ username: 'emilys', password: 'emilyspass' })
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.firstName).toBe('Emily')
    expect(JSON.parse(localStorage.getItem(SESSION_KEY) ?? '{}').token).toBe('fake-jwt-token')

    act(() => result.current.logout())
    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it('restaura a sessão salva e ignora sessões expiradas', () => {
    seedSession()
    const { result, unmount } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.token).toBe('fake-jwt-token')
    unmount()

    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...fakeSession, expiresAt: Date.now() - 1000 }))
    const { result: expired } = renderHook(() => useAuth(), { wrapper })
    expect(expired.current.isAuthenticated).toBe(false)
  })

  it('encerra a sessão quando a API responde 401', () => {
    seedSession()
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isAuthenticated).toBe(true)

    act(() => {
      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT))
    })
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('remove os ouvintes de evento ao desmontar (cleanup)', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useAuth(), { wrapper })
    unmount()
    const removed = removeSpy.mock.calls.map(([type]) => type)
    expect(removed).toEqual(expect.arrayContaining(['storage', AUTH_UNAUTHORIZED_EVENT]))
  })
})
