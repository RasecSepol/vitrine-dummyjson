import { Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LocationDisplay, TestProviders, seedSession } from '../test/renderWithProviders'
import { ProtectedRoute } from './ProtectedRoute'

function renderAt(path: string) {
  return render(
    <TestProviders initialEntries={[path]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<h1>Conteúdo restrito</h1>} />
        </Route>
        <Route path="/login" element={<LocationDisplay />} />
      </Routes>
    </TestProviders>,
  )
}

describe('<ProtectedRoute />', () => {
  it('redireciona visitantes não autenticados para o login', () => {
    renderAt('/admin')
    expect(screen.queryByRole('heading', { name: 'Conteúdo restrito' })).not.toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/login')
  })

  it('libera a rota quando existe uma sessão válida', () => {
    seedSession()
    renderAt('/admin')
    expect(screen.getByRole('heading', { name: 'Conteúdo restrito' })).toBeInTheDocument()
  })
})
