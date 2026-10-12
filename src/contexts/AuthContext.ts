import { createContext } from 'react'
import type { AuthUser, LoginFormValues } from '../schemas/auth'

export interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (credentials: LoginFormValues) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
