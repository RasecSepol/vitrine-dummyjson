// A DummyJSON trabalha com preços em dólar.
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' })

export function formatPrice(value: number): string {
  return currency.format(value)
}

export function discountedPrice(price: number, discountPercentage = 0): number {
  return Math.round(price * (1 - discountPercentage / 100) * 100) / 100
}
