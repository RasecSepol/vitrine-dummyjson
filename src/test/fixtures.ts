import type { Product, ProductList } from '../schemas/product'

export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    title: 'Essence Mascara Lash Princess',
    description: 'A popular mascara known for its volumizing effects.',
    category: 'beauty',
    price: 9.99,
    discountPercentage: 0,
    rating: 4.5,
    stock: 5,
    brand: 'Essence',
    tags: ['beauty', 'mascara'],
    thumbnail: 'https://cdn.dummyjson.com/thumb.webp',
    images: ['https://cdn.dummyjson.com/1.webp'],
    reviews: [],
    ...overrides,
  }
}

export function makeProductList(products: Product[], total = products.length): ProductList {
  return { products, total, skip: 0, limit: products.length }
}
