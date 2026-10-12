import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  Alert,
  Button,
  Center,
  Code,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { IconAlertCircle, IconInfoCircle } from '@tabler/icons-react'
import { useAuth } from '../hooks/useAuth'
import { loginFormSchema, type LoginFormValues } from '../schemas/auth'
import { getErrorMessage } from '../services/api'

// Lê o destino original guardado pelo ProtectedRoute (LoginRedirectState).
function getRedirectTarget(state: unknown): string {
  if (state && typeof state === 'object' && 'from' in state && typeof state.from === 'string') {
    return state.from
  }
  return '/admin'
}

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = getRedirectTarget(location.state)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<LoginFormValues>({
    mode: 'uncontrolled',
    initialValues: { username: '', password: '' },
    validate: zodResolver(loginFormSchema),
  })

  if (isAuthenticated && !submitting) {
    return <Navigate to={redirectTo} replace />
  }

  const handleSubmit = async (values: LoginFormValues) => {
    setError(null)
    setSubmitting(true)
    try {
      await login(values)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <Center py="xl">
      <Paper withBorder shadow="sm" radius="md" p="xl" w="100%" maw={420}>
        <Title order={1} size="h2" ta="center">
          Área administrativa
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb="lg">
          Entre com uma conta da DummyJSON para gerenciar os produtos.
        </Text>

        <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
          <Stack>
            {error && (
              <Alert color="red" icon={<IconAlertCircle />} title="Não foi possível entrar" role="alert">
                {error}
              </Alert>
            )}
            <TextInput
              label="Usuário"
              autoComplete="username"
              withAsterisk
              key={form.key('username')}
              {...form.getInputProps('username')}
            />
            <PasswordInput
              label="Senha"
              autoComplete="current-password"
              withAsterisk
              key={form.key('password')}
              {...form.getInputProps('password')}
            />
            <Button type="submit" loading={submitting} fullWidth>
              Entrar
            </Button>
          </Stack>
        </form>

        <Alert variant="light" color="blue" icon={<IconInfoCircle />} mt="lg" role="note">
          <Text size="sm">
            Conta de teste pública da DummyJSON: <Code>emilys</Code> / <Code>emilyspass</Code>
          </Text>
        </Alert>
      </Paper>
    </Center>
  )
}
