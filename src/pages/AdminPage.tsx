import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Image,
  LoadingOverlay,
  Modal,
  Pagination,
  SimpleGrid,
  Table,
  Text,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconEdit, IconInfoCircle, IconPlus, IconTrash } from '@tabler/icons-react'
import { ErrorState } from '../components/ErrorState'
import { PageHeader } from '../components/PageHeader'
import { ProductForm } from '../components/ProductForm'
import { useAuth } from '../hooks/useAuth'
import { useFetch } from '../hooks/useFetch'
import type { Product, ProductFormValues } from '../schemas/product'
import {
  createProduct,
  deleteProduct,
  fetchCategories,
  fetchProducts,
  updateProduct,
} from '../services/productService'
import { formatPrice } from '../utils/format'

const ADMIN_PAGE_SIZE = 10

// A DummyJSON simula escrita: devolve o resultado mas não persiste.
// Guardamos as alterações localmente para refletir na tabela.
interface LocalChanges {
  created: Product[]
  updated: Record<number, Product>
  deletedIds: number[]
}

type ModalState =
  | { type: 'closed' }
  | { type: 'create' }
  | { type: 'edit'; product: Product }
  | { type: 'delete'; product: Product }

function toFormValues(product: Product): ProductFormValues {
  return {
    title: product.title,
    description: product.description,
    category: product.category,
    brand: product.brand ?? '',
    price: product.price,
    stock: product.stock,
  }
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card withBorder radius="md">
      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
        {label}
      </Text>
      <Text fw={700} size="xl">
        {value}
      </Text>
    </Card>
  )
}

export function AdminPage() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<ModalState>({ type: 'closed' })
  const [deleting, setDeleting] = useState(false)
  const [changes, setChanges] = useState<LocalChanges>({ created: [], updated: {}, deletedIds: [] })

  const loadProducts = useCallback(
    (signal: AbortSignal) => fetchProducts({ page, pageSize: ADMIN_PAGE_SIZE }, signal),
    [page],
  )
  const { state, reload } = useFetch(loadProducts)
  const { state: categoriesState } = useFetch(fetchCategories)

  const isLocal = useCallback(
    (id: number) => changes.created.some((product) => product.id === id),
    [changes.created],
  )

  const rows = useMemo(() => {
    const remote = state.data?.products ?? []
    const base = page === 1 ? [...changes.created, ...remote] : remote
    return base
      .filter((product) => !changes.deletedIds.includes(product.id))
      .map((product) => changes.updated[product.id] ?? product)
  }, [state.data, page, changes])

  const totalPages = state.data ? Math.ceil(state.data.total / ADMIN_PAGE_SIZE) : 0
  const closeModal = () => setModal({ type: 'closed' })

  const handleCreate = async (values: ProductFormValues) => {
    try {
      const created = await createProduct(values)
      setChanges((current) => {
        // A API sempre devolve o mesmo id para itens novos; geramos um id local único.
        const id = Math.max(created.id, ...current.created.map((product) => product.id + 1))
        return { ...current, created: [{ ...created, id }, ...current.created] }
      })
      notifications.show({ color: 'teal', title: 'Produto cadastrado', message: created.title })
      closeModal()
    } catch {
      // Erro exibido pelo interceptor; o modal continua aberto para nova tentativa.
    }
  }

  const handleUpdate = async (product: Product, values: ProductFormValues) => {
    try {
      // Itens criados nesta sessão não existem no servidor: atualizamos só localmente.
      const updated = isLocal(product.id)
        ? { ...product, ...values }
        : { ...product, ...(await updateProduct(product.id, values)) }
      setChanges((current) => ({
        ...current,
        created: current.created.map((item) => (item.id === product.id ? updated : item)),
        updated: { ...current.updated, [product.id]: updated },
      }))
      notifications.show({ color: 'teal', title: 'Produto atualizado', message: updated.title })
      closeModal()
    } catch {
      // Erro exibido pelo interceptor.
    }
  }

  const handleDelete = async (product: Product) => {
    setDeleting(true)
    try {
      if (!isLocal(product.id)) await deleteProduct(product.id)
      setChanges((current) => ({
        ...current,
        created: current.created.filter((item) => item.id !== product.id),
        deletedIds: [...current.deletedIds, product.id],
      }))
      notifications.show({ color: 'teal', title: 'Produto excluído', message: product.title })
      closeModal()
    } catch {
      // Erro exibido pelo interceptor.
    } finally {
      setDeleting(false)
    }
  }

  const categories = categoriesState.data ?? []
  const changesCount =
    changes.created.length + Object.keys(changes.updated).length + changes.deletedIds.length

  return (
    <>
      <PageHeader
        title="Painel administrativo"
        description={user ? `Olá, ${user.firstName} ${user.lastName}! Gerencie o catálogo abaixo.` : undefined}
      >
        <Button leftSection={<IconPlus size={16} />} onClick={() => setModal({ type: 'create' })}>
          Novo produto
        </Button>
      </PageHeader>

      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="lg">
        <StatCard label="Produtos na API" value={state.data?.total ?? '—'} />
        <StatCard label="Categorias" value={categories.length || '—'} />
        <StatCard label="Alterações nesta sessão" value={changesCount} />
      </SimpleGrid>

      <Alert variant="light" icon={<IconInfoCircle />} mb="lg" role="note">
        A DummyJSON simula cadastro, edição e exclusão: as requisições são enviadas e validadas, mas
        os dados não ficam salvos no servidor. As mudanças aparecem apenas nesta sessão.
      </Alert>

      {state.status === 'error' && <ErrorState message={state.error} onRetry={reload} />}

      <Box pos="relative">
        <LoadingOverlay visible={state.status === 'loading'} loaderProps={{ 'aria-label': 'Carregando tabela' }} />
        <Table.ScrollContainer minWidth={720}>
          <Table striped highlightOnHover verticalSpacing="xs" aria-label="Produtos cadastrados">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Produto</Table.Th>
                <Table.Th>Categoria</Table.Th>
                <Table.Th>Preço</Table.Th>
                <Table.Th>Estoque</Table.Th>
                <Table.Th>Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((product) => (
                <Table.Tr key={product.id}>
                  <Table.Td>{product.id}</Table.Td>
                  <Table.Td>
                    <Group gap="sm" wrap="nowrap">
                      {product.thumbnail && (
                        <Image src={product.thumbnail} alt="" w={36} h={36} fit="contain" radius="sm" />
                      )}
                      {isLocal(product.id) ? (
                        <Text size="sm">{product.title}</Text>
                      ) : (
                        <Anchor component={Link} to={`/produtos/${product.id}`} size="sm">
                          {product.title}
                        </Anchor>
                      )}
                      {isLocal(product.id) && (
                        <Badge size="xs" color="grape">
                          Novo
                        </Badge>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>{product.category}</Table.Td>
                  <Table.Td>{formatPrice(product.price)}</Table.Td>
                  <Table.Td>
                    <Badge color={product.stock > 10 ? 'teal' : product.stock > 0 ? 'yellow' : 'red'} variant="light">
                      {product.stock}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                      <ActionIcon
                        variant="subtle"
                        aria-label={`Editar ${product.title}`}
                        onClick={() => setModal({ type: 'edit', product })}
                      >
                        <IconEdit size={18} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        aria-label={`Excluir ${product.title}`}
                        onClick={() => setModal({ type: 'delete', product })}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Box>

      {totalPages > 1 && (
        <Group justify="center" mt="lg">
          <Pagination total={totalPages} value={page} onChange={setPage} />
        </Group>
      )}

      <Modal
        opened={modal.type === 'create' || modal.type === 'edit'}
        onClose={closeModal}
        title={modal.type === 'edit' ? 'Editar produto' : 'Novo produto'}
        size="lg"
      >
        {modal.type === 'create' && (
          <ProductForm
            categories={categories}
            submitLabel="Cadastrar"
            onSubmit={handleCreate}
            onCancel={closeModal}
          />
        )}
        {modal.type === 'edit' && (
          <ProductForm
            key={modal.product.id}
            categories={categories}
            initialValues={toFormValues(modal.product)}
            submitLabel="Salvar alterações"
            onSubmit={(values) => handleUpdate(modal.product, values)}
            onCancel={closeModal}
          />
        )}
      </Modal>

      <Modal opened={modal.type === 'delete'} onClose={closeModal} title="Excluir produto">
        {modal.type === 'delete' && (
          <>
            <Text mb="lg">
              Tem certeza que deseja excluir <strong>{modal.product.title}</strong>?
            </Text>
            <Group justify="flex-end">
              <Button variant="default" onClick={closeModal} disabled={deleting}>
                Cancelar
              </Button>
              <Button color="red" loading={deleting} onClick={() => handleDelete(modal.product)}>
                Excluir
              </Button>
            </Group>
          </>
        )}
      </Modal>
    </>
  )
}
