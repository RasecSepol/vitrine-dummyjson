import { startTransition } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import {
  Anchor,
  AppShell,
  Avatar,
  Badge,
  Burger,
  Button,
  Container,
  Drawer,
  Group,
  Menu,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconBuildingStore,
  IconLayoutDashboard,
  IconLogin,
  IconLogout,
  IconShoppingCart,
} from '@tabler/icons-react'
import { ThemeToggle } from '../components/ThemeToggle'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import classes from './MainLayout.module.css'

interface NavItemsProps {
  linkClassName: string
  onNavigate?: () => void
}

function NavItems({ linkClassName, onNavigate }: NavItemsProps) {
  const { totalItems } = useCart()
  const { isAuthenticated } = useAuth()
  const className = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${linkClassName} ${classes.active}` : linkClassName

  return (
    <>
      <NavLink to="/" end className={className} onClick={onNavigate}>
        <IconBuildingStore size={18} aria-hidden />
        Produtos
      </NavLink>
      <NavLink to="/carrinho" className={className} onClick={onNavigate}>
        <IconShoppingCart size={18} aria-hidden />
        Carrinho
        {totalItems > 0 && (
          <Badge size="sm" circle data-testid="cart-count">
            {totalItems}
          </Badge>
        )}
      </NavLink>
      {isAuthenticated && (
        <NavLink to="/admin" className={className} onClick={onNavigate}>
          <IconLayoutDashboard size={18} aria-hidden />
          Admin
        </NavLink>
      )}
    </>
  )
}

function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  if (!isAuthenticated || !user) {
    return (
      <Button component={Link} to="/login" variant="light" leftSection={<IconLogin size={16} />}>
        Entrar
      </Button>
    )
  }

  const handleLogout = () => {
    // O React Router atualiza a rota dentro de uma transição; colocando o logout
    // na mesma transição, os dois mudam juntos e o ProtectedRoute não chega a
    // redirecionar para /login antes de irmos para a página inicial.
    navigate('/', { replace: true })
    startTransition(() => logout())
  }

  return (
    <Menu position="bottom-end" withArrow>
      <Menu.Target>
        <UnstyledButton aria-label={`Menu do usuário ${user.firstName}`}>
          <Group gap="xs">
            <Avatar src={user.image} alt="" radius="xl" size="sm" />
            <Text size="sm" fw={500} visibleFrom="xs">
              {user.firstName}
            </Text>
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{user.email}</Menu.Label>
        <Menu.Item leftSection={<IconLayoutDashboard size={14} />} onClick={() => navigate('/admin')}>
          Painel administrativo
        </Menu.Item>
        <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>
          Sair
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}

export function MainLayout() {
  const [opened, { toggle, close }] = useDisclosure(false)

  return (
    <AppShell header={{ height: 64 }} padding="md">
      <AppShell.Header>
        <Container size="xl" h="100%">
          <Group h="100%" justify="space-between" wrap="nowrap">
            <Group gap="lg" wrap="nowrap">
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
                aria-label="Abrir menu de navegação"
              />
              <Link to="/" className={classes.brand}>
                <IconBuildingStore aria-hidden />
                Vitrine
              </Link>
              <Group component="nav" gap={4} visibleFrom="sm" aria-label="Navegação principal">
                <NavItems linkClassName={classes.link} />
              </Group>
            </Group>
            <Group gap="sm" wrap="nowrap">
              <ThemeToggle />
              <UserMenu />
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <Drawer opened={opened} onClose={close} title="Navegação" size="xs" hiddenFrom="sm">
        <Stack component="nav" gap={4} aria-label="Navegação móvel">
          <NavItems linkClassName={classes.mobileLink} onNavigate={close} />
        </Stack>
      </Drawer>

      <AppShell.Main>
        <Container size="xl">
          <Outlet />
          <footer className={classes.footer}>
            <Text size="sm" c="dimmed" ta="center">
              Dados fornecidos por{' '}
              <Anchor href="https://dummyjson.com" target="_blank" rel="noreferrer">
                DummyJSON
              </Anchor>{' '}
              · Projeto acadêmico em React + TypeScript
            </Text>
          </footer>
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
