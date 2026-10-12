import type { ComponentProps, ReactElement, ReactNode } from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { render, type RenderOptions } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { AuthProvider } from '../contexts/AuthProvider'
import { CartProvider } from '../contexts/CartProvider'
import { SESSION_KEY } from '../services/sessionStorage'
import type { Session } from '../schemas/auth'

export const fakeSession: Session = {
  token: 'fake-jwt-token',
  expiresAt: Date.now() + 60 * 60_000,
  user: {
    id: 1,
    username: 'emilys',
    email: 'emily.johnson@x.dummyjson.com',
    firstName: 'Emily',
    lastName: 'Johnson',
    image: 'https://dummyjson.com/icon/emilys/128',
  },
}

export function seedSession(session: Session = fakeSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, expiresAt: Date.now() + 60 * 60_000 }))
}

/** Mostra a rota atual para que os testes possam verificar redirecionamentos. */
export function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

interface ProvidersProps {
  children: ReactNode
  initialEntries?: ComponentProps<typeof MemoryRouter>['initialEntries']
}

// Contextos reais, mas com roteador e armazenamento em memória (jsdom).
export function TestProviders({ children, initialEntries = ['/'] }: ProvidersProps) {
  return (
    <MantineProvider>
      <Notifications />
      <AuthProvider>
        <CartProvider>
          <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
        </CartProvider>
      </AuthProvider>
    </MantineProvider>
  )
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string
  /** Quando informado, o elemento é montado dentro de <Route path={path}>. */
  path?: string
}

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', path, ...options }: RenderWithProvidersOptions = {},
) {
  const content = path ? (
    <Routes>
      <Route path={path} element={ui} />
    </Routes>
  ) : (
    ui
  )
  return render(<TestProviders initialEntries={[route]}>{content}</TestProviders>, options)
}
