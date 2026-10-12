import {
  categoryListSchema,
  deletedProductSchema,
  productListSchema,
  productSchema,
  type Category,
  type Product,
  type ProductFormValues,
  type ProductList,
} from '../schemas/product'
import { api, parseResponse } from './api'

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating-desc' | 'title-asc'

export interface ProductQuery {
  page: number
  pageSize: number
  search?: string
  category?: string | null
  sort?: SortOption
}

type SortableField = 'price' | 'rating' | 'title'

const SORT_PARAMS: Record<SortOption, { sortBy?: SortableField; order?: 'asc' | 'desc' }> = {
  relevance: {},
  'price-asc': { sortBy: 'price', order: 'asc' },
  'price-desc': { sortBy: 'price', order: 'desc' },
  'rating-desc': { sortBy: 'rating', order: 'desc' },
  'title-asc': { sortBy: 'title', order: 'asc' },
}

function sortLocally(products: Product[], sort: SortOption): Product[] {
  const { sortBy, order } = SORT_PARAMS[sort]
  if (!sortBy) return products
  const direction = order === 'desc' ? -1 : 1
  return [...products].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title) * direction
    return ((a[sortBy] ?? 0) - (b[sortBy] ?? 0)) * direction
  })
}

export async function fetchProducts(query: ProductQuery, signal?: AbortSignal): Promise<ProductList> {
  const { page, pageSize, category, sort = 'relevance' } = query
  const search = query.search?.trim() ?? ''
  const skip = (page - 1) * pageSize

  // A DummyJSON não combina busca textual com categoria; nesse caso buscamos a
  // categoria inteira (poucos itens) e filtramos/paginamos no cliente.
  if (search && category) {
    const response = await api.get(`/products/category/${encodeURIComponent(category)}`, {
      params: { limit: 0 },
      signal,
    })
    const all = parseResponse(response, productListSchema).products
    const term = search.toLowerCase()
    const filtered = sortLocally(
      all.filter(
        (product) =>
          product.title.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term),
      ),
      sort,
    )
    return {
      products: filtered.slice(skip, skip + pageSize),
      total: filtered.length,
      skip,
      limit: pageSize,
    }
  }

  const params = { limit: pageSize, skip, ...SORT_PARAMS[sort] }
  let url = '/products'
  if (search) url = '/products/search'
  else if (category) url = `/products/category/${encodeURIComponent(category)}`

  const response = await api.get(url, {
    params: search ? { ...params, q: search } : params,
    signal,
  })
  return parseResponse(response, productListSchema)
}

export async function fetchProduct(id: number, signal?: AbortSignal): Promise<Product> {
  // silent: a própria página de detalhes mostra o erro (ex.: produto inexistente).
  const response = await api.get(`/products/${id}`, { signal, silent: true })
  return parseResponse(response, productSchema)
}

export async function fetchCategories(signal?: AbortSignal): Promise<Category[]> {
  const response = await api.get('/products/categories', { signal })
  return parseResponse(response, categoryListSchema)
}

export async function createProduct(values: ProductFormValues): Promise<Product> {
  const response = await api.post('/products/add', values)
  return parseResponse(response, productSchema)
}

export async function updateProduct(id: number, values: ProductFormValues): Promise<Product> {
  const response = await api.put(`/products/${id}`, values)
  return parseResponse(response, productSchema)
}

export async function deleteProduct(id: number): Promise<boolean> {
  const response = await api.delete(`/products/${id}`)
  return parseResponse(response, deletedProductSchema).isDeleted
}
