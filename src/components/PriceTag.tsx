import { Group, Text, type MantineSize } from '@mantine/core'
import { discountedPrice, formatPrice } from '../utils/format'

interface PriceTagProps {
  price: number
  discountPercentage?: number
  size?: MantineSize
}

export function PriceTag({ price, discountPercentage, size = 'lg' }: PriceTagProps) {
  const hasDiscount = discountPercentage !== undefined && discountPercentage >= 1
  return (
    <Group gap="xs" align="baseline">
      <Text fw={700} size={size} c="teal">
        {formatPrice(hasDiscount ? discountedPrice(price, discountPercentage) : price)}
      </Text>
      {hasDiscount && (
        <Text size="sm" c="dimmed" td="line-through" aria-label={`Preço original ${formatPrice(price)}`}>
          {formatPrice(price)}
        </Text>
      )}
    </Group>
  )
}
