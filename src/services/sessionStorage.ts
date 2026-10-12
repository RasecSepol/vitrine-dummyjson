import { sessionSchema, type Session } from '../schemas/auth'

export const SESSION_KEY = 'vitrine:session'

// Lê a sessão salva no navegador e descarta dados inválidos ou expirados.
export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = sessionSchema.safeParse(JSON.parse(raw))
    if (!parsed.success || parsed.data.expiresAt <= Date.now()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return parsed.data
  } catch {
    return null
  }
}

export function saveSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function getToken(): string | null {
  return loadSession()?.token ?? null
}
