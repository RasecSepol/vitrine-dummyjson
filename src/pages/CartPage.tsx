import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ActionIcon,
  Anchor,
  Button,
  Card,
  Center,
  Group,
  Image,
  NumberInput,
  Stack,
  Table,
  Text,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconShoppingCartOff, IconTrash } from '@tabler/icons-react'
import { PageHeader } from '../components/PageHeader'
import type { LoginRedirectState } from '../components/ProtectedRoute'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { checkoutCart } from '../services/cartService'
import { formatPrice } from '../utils/format'

export function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [checkingOut, setCheckingOut] = useState(false)

  // Finalizar a compra é uma ação restrita: exige login.
  const handleCheckout = async () => {
    if (!isAuthenticated || !user) {
      const state: LoginRedirectState = { from: '/carrinho' }
      navigate('/login', { state })
      return
    }
    setCheckingOut(true)
    try {
      const order = await checkoutCart(user.id, items)
      clearCart()
      notifications.show({
        color: 'teal',
        title: `Pedido #${order.id} registrado!`,
        message: `${order.totalQuantity} itens · total ${formatPrice(order.discountedTotal ?? order.total)}`,
      })
      navigate('/')
    } catch {
      // A falha já foi exibida pelo interceptor do Axios.
    } finally {
      setCheckingOut(false)
    }
  }

  if (items.length === 0) {
    return (
      <>
        <PageHeader title="Carrinho" />
        <Center py={60}>
          <Stack align="center" gap="sm">
            <IconShoppingCartOff size={48} stroke={1.5} aria-hidden />
            <Text c="dimmed">Seu carrinho está vazio.</Text>
            <Button component={Link} to="/">
              Ver produtos
            </Button>
          </Stack>
        </Center>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Carrinho" description={`${totalItems} itens selecionados`}>
        <Button variant="subtle" color="red" onClick={clearCart}>
          Esvaziar carrinho
        </Button>
      </PageHeader>

      <Table.ScrollContainer minWidth={560}>
        <Table verticalSpacing="sm" striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Produto</Table.Th>
              <Table.Th>Preço</Table.Th>
              <Table.Th>Quantidade</Table.Th>
              <Table.Th>Subtotal</Table.Th>
              <Table.Th aria-label="Ações" />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Group gap="sm" wrap="nowrap">
                    <Image src={item.thumbnail || undefined} alt="" w={48} h={48} fit="contain" radius="sm" />
                    <Anchor component={Link} to={`/produtos/${item.id}`} size="sm">
                      {item.title}
                    </Anchor>
                  </Group>
                </Table.Td>
                <Table.Td>{formatPrice(item.price)}</Table.Td>
                <Table.Td>
                  <NumberInput
                    aria-label={`Quantidade de ${item.title}`}
                    value={item.quantity}
                    min={1}
                    allowDecimal={false}
                    w={90}
                    onChange={(value) => typeof value === 'number' && updateQuantity(item.id, value)}
                  />
                </Table.Td>
                <Table.Td>{formatPrice(item.price * item.quantity)}</Table.Td>
                <Table.Td>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    aria-label={`Remover ${item.title}`}
                    onClick={() => removeItem(item.id)}
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Group justify="flex-end" mt="lg">
        <Card withBorder radius="md" miw={280}>
          <Stack gap="sm">
            <Group justify="space-between">
              <Text>Total</Text>
              <Text fw={700} size="xl" data-testid="cart-total">
                {formatPrice(totalPrice)}
              </Text>
            </Group>
            <Button onClick={handleCheckout} loading={checkingOut} fullWidth>
              {isAuthenticated ? 'Finalizar compra' : 'Entrar para finalizar'}
            </Button>
          </Stack>
        </Card>
      </Group>
    </>
  )
}
