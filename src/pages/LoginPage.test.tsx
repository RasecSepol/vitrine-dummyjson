import { Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loginRequest } from '../services/authService'
import { LocationDisplay, TestProviders, fakeSession } from '../test/renderWithProviders'
import { LoginPage } from './LoginPage'

vi.mock('../services/authService', () => ({ loginRequest: vi.fn() }))

function renderLogin(initialEntry: string | { pathname: string; state: unknown } = '/login') {
  return render(
    <TestProviders initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<LocationDisplay />} />
      </Routes>
    </TestProviders>,
  )
}

describe('<LoginPage />', () => {
  beforeEach(() => {
    vi.mocked(loginRequest).mockReset()
  })

  it('mostra os erros de validação do Zod sem chamar a API', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Informe o usuário')).toBeInTheDocument()
    expect(screen.getByText('A senha deve ter pelo menos 6 caracteres')).toBeInTheDocument()
    expect(loginRequest).not.toHaveBeenCalled()
  })

  it('autentica e redireciona para o painel administrativo', async () => {
    vi.mocked(loginRequest).mockResolvedValue(fakeSession)
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByRole('textbox', { name: /usuário/i }), 'emilys')
    await user.type(screen.getByLabelText(/senha/i), 'emilyspass')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByTestId('location')).toHaveTextContent('/admin')
    expect(loginRequest).toHaveBeenCalledWith({ username: 'emilys', password: 'emilyspass' })
  })

  it('volta para a página de origem depois do login', async () => {
    vi.mocked(loginRequest).mockResolvedValue(fakeSession)
    const user = userEvent.setup()
    renderLogin({ pathname: '/login', state: { from: '/carrinho' } })

    await user.type(screen.getByRole('textbox', { name: /usuário/i }), 'emilys')
    await user.type(screen.getByLabelText(/senha/i), 'emilyspass')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByTestId('location')).toHaveTextContent('/carrinho')
  })

  it('exibe a mensagem da API quando as credenciais são inválidas', async () => {
    vi.mocked(loginRequest).mockImplementation(async () => {
      const config = { headers: new AxiosHeaders() }
      throw new AxiosError('Bad Request', 'ERR_BAD_REQUEST', config, null, {
        data: { message: 'Invalid credentials' },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config,
      })
    })
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByRole('textbox', { name: /usuário/i }), 'emilys')
    await user.type(screen.getByLabelText(/senha/i), 'senhaerrada')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials')
    expect(screen.queryByTestId('location')).not.toBeInTheDocument()
  })
})
