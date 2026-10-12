import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Box,
  Center,
  Group,
  LoadingOverlay,
  Pagination,
  Select,
  SimpleGrid,
  Text,
  TextInput,
} from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { ErrorState } from '../components/ErrorState'
import { PageHeader } from '../components/PageHeader'
import { ProductCard } from '../components/ProductCard'
import { useDebounce } from '../hooks/useDebounce'
import { useFetch } from '../hooks/useFetch'
import { fetchCategories, fetchProducts, type SortOption } from '../services/productService'

export const PAGE_SIZE = 12

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevância' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
  { value: 'rating-desc', label: 'Melhor avaliação' },
  { value: 'title-asc', label: 'Nome (A-Z)' },
]

function isSortOption(value: string | null): value is SortOption {
  return SORT_OPTIONS.some((option) => option.value === value)
}

export function ProductsPage() {
  // Filtros ficam na URL: links diretos e o botão "voltar" preservam a busca.
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('pagina')) || 1)
  const category = searchParams.get('categoria')
  const sortParam = searchParams.get('ordem')
  const sort: SortOption = isSortOption(sortParam) ? sortParam : 'relevance'
  const query = searchParams.get('q') ?? ''

  const [searchInput, setSearchInput] = useState(query)
  const debouncedSearch = useDebounce(searchInput, 400)

  // Se a busca mudar por fora (ex.: clicar em "Produtos" no menu), o campo acompanha.
  const [previousQuery, setPreviousQuery] = useState(query)
  if (query !== previousQuery) {
    setPreviousQuery(query)
    setSearchInput(query)
  }

  const updateParams = useCallback(
    (changes: Record<string, string | null>) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current)
        Object.entries(changes).forEach(([key, value]) => {
          if (value) next.set(key, value)
          else next.delete(key)
        })
        return next
      })
    },
    [setSearchParams],
  )

  // Quando o texto "assenta", grava na URL e volta para a primeira página.
  useEffect(() => {
    const term = debouncedSearch.trim()
    setSearchParams(
      (current) => {
        if ((current.get('q') ?? '') === term) return current
        const next = new URLSearchParams(current)
        if (term) next.set('q', term)
        else next.delete('q')
        next.delete('pagina')
        return next
      },
      { replace: true },
    )
  }, [debouncedSearch, setSearchParams])

  const loadProducts = useCallback(
    (signal: AbortSignal) =>
      fetchProducts({ page, pageSize: PAGE_SIZE, search: query, category, sort }, signal),
    [page, query, category, sort],
  )
  const { state, reload } = useFetch(loadProducts)
  const { state: categoriesState } = useFetch(fetchCategories)

  const products = state.data?.products ?? []
  const totalPages = state.data ? Math.ceil(state.data.total / PAGE_SIZE) : 0
  const categories = categoriesState.data ?? []

  return (
    <>
      <PageHeader
        title="Produtos"
        description="Navegue pelo catálogo, filtre por categoria e adicione itens ao carrinho."
      />

      <Group align="flex-end" mb="lg" gap="sm" grow preventGrowOverflow={false}>
        <TextInput
          label="Buscar produtos"
          placeholder="Ex.: phone, perfume, laptop..."
          leftSection={<IconSearch size={16} />}
          value={searchInput}
          onChange={(event) => setSearchInput(event.currentTarget.value)}
          miw={220}
        />
        <Select
          label="Categoria"
          placeholder="Todas"
          clearable
          searchable
          data={categories.map((item) => ({ value: item.slug, label: item.name }))}
          value={category}
          onChange={(value) => updateParams({ categoria: value, pagina: null })}
          miw={180}
        />
        <Select
          label="Ordenar por"
          data={SORT_OPTIONS}
          value={sort}
          allowDeselect={false}
          onChange={(value) => updateParams({ ordem: value === 'relevance' ? null : value, pagina: null })}
          miw={160}
        />
      </Group>

      {state.status === 'error' && <ErrorState message={state.error} onRetry={reload} />}

      <Box pos="relative" mih={200}>
        <LoadingOverlay
          visible={state.status === 'loading'}
          zIndex={10}
          overlayProps={{ blur: 2 }}
          loaderProps={{ 'aria-label': 'Carregando produtos' }}
        />

        {state.status === 'success' && products.length === 0 && (
          <Center py="xl">
            <Text c="dimmed">Nenhum produto encontrado para os filtros escolhidos.</Text>
          </Center>
        )}

        <SimpleGrid cols={{ base: 1, xs: 2, md: 3, lg: 4 }} spacing="lg">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </SimpleGrid>
      </Box>

      {totalPages > 1 && (
        <Group justify="space-between" mt="xl" wrap="wrap">
          <Text size="sm" c="dimmed">
            {state.data?.total} produtos encontrados
          </Text>
          <Pagination
            total={totalPages}
            value={Math.min(page, totalPages)}
            onChange={(value) => {
              updateParams({ pagina: value > 1 ? String(value) : null })
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            getControlProps={(control) => ({
              'aria-label': control === 'next' ? 'Próxima página' : 'Página anterior',
            })}
          />
        </Group>
      )}
    </>
  )
}
