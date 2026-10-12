import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { notifications } from '@mantine/notifications'
import type { LoginFormValues, Session } from '../schemas/auth'
import { AUTH_UNAUTHORIZED_EVENT } from '../services/api'
import { loginRequest } from '../services/authService'
import { SESSION_KEY, clearSession, loadSession, saveSession } from '../services/sessionStorage'
import { AuthContext, type AuthContextValue } from './AuthContext'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Inicialização preguiçosa: a sessão salva só é lida no primeiro render.
  const [session, setSession] = useState<Session | null>(() => loadSession())

  const login = useCallback(async (credentials: LoginFormValues) => {
    const newSession = await loginRequest(credentials)
    saveSession(newSession)
    setSession(newSession)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  // Encerra a sessão automaticamente quando o token expira.
  useEffect(() => {
    if (!session) return
    const timeoutId = window.setTimeout(() => {
      logout()
      notifications.show({
        color: 'yellow',
        title: 'Sessão expirada',
        message: 'Faça login novamente para acessar a área administrativa.',
      })
    }, session.expiresAt - Date.now())
    return () => window.clearTimeout(timeoutId)
  }, [session, logout])

  // Mantém abas diferentes sincronizadas e reage a respostas 401 da API.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === SESSION_KEY) setSession(loadSession())
    }
    const handleUnauthorized = () => logout()

    window.addEventListener('storage', handleStorage)
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)
    }
  }, [logout])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: session !== null,
      login,
      logout,
    }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
