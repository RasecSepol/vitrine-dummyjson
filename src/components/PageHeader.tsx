import type { ReactNode } from 'react'
import { Group, Stack, Text, Title } from '@mantine/core'

interface PageHeaderProps {
  title: string
  description?: string
  /** Ações exibidas à direita do título (botões, filtros etc.). */
  children?: ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-end" mb="lg" wrap="wrap" gap="md">
      <Stack gap={4}>
        <Title order={1} size="h2">
          {title}
        </Title>
        {description && <Text c="dimmed">{description}</Text>}
      </Stack>
      {children && <Group gap="sm">{children}</Group>}
    </Group>
  )
}
