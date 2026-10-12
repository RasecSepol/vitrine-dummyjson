import { Link } from 'react-router-dom'
import { Button, Center, Stack, Text, Title } from '@mantine/core'

export function NotFoundPage() {
  return (
    <Center py={80}>
      <Stack align="center" gap="sm">
        <Title order={1}>404</Title>
        <Text c="dimmed">A página que você procurou não existe.</Text>
        <Button component={Link} to="/">
          Voltar para o catálogo
        </Button>
      </Stack>
    </Center>
  )
}
