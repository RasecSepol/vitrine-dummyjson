import type { ReactNode } from 'react'
import { Alert, Button, Stack } from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'

interface ErrorStateProps {
  message: string
  title?: string
  onRetry?: () => void
  children?: ReactNode
}

export function ErrorState({ message, title = 'Algo deu errado', onRetry, children }: ErrorStateProps) {
  return (
    <Alert color="red" title={title} icon={<IconAlertTriangle />} role="alert">
      <Stack gap="sm" align="flex-start">
        {message}
        {onRetry && (
          <Button size="xs" variant="light" color="red" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
        {children}
      </Stack>
    </Alert>
  )
}
