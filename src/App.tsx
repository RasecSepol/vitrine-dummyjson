import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { AuthProvider } from './contexts/AuthProvider'
import { CartProvider } from './contexts/CartProvider'
import { AppRoutes } from './routes/AppRoutes'
import { theme } from './theme'

// Em produção o Vite define BASE_URL como "/vitrine-dummyjson/".
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

interface AppProvidersProps {
  children: ReactNode
}

// Provedores globais compartilhados entre a aplicação e os testes.
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Notifications position="top-right" />
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </MantineProvider>
  )
}

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter basename={basename}>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  )
}
