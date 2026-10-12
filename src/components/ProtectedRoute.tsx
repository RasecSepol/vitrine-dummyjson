import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export interface LoginRedirectState {
  from: string
}

// Rota "guarda": só renderiza as rotas filhas se houver sessão ativa;
// caso contrário redireciona para o login lembrando a página de origem.
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    const state: LoginRedirectState = { from: location.pathname + location.search }
    return <Navigate to="/login" replace state={state} />
  }

  return <Outlet />
}
