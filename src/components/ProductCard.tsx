import { Link } from 'react-router-dom'
import { Badge, Button, Card, Group, Image, Stack, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconShoppingCartPlus, IconStarFilled } from '@tabler/icons-react'
import { useCart } from '../hooks/useCart'
import type { Product } from '../schemas/product'
import { PriceTag } from './PriceTag'
import classes from './ProductCard.module.css'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  const handleAdd = () => {
    addItem(product)
    notifications.show({
      color: 'teal',
      title: 'Adicionado ao carrinho',
      message: product.title,
    })
  }

  return (
    <Card withBorder radius="md" padding="md" className={classes.card} component="article">
      <Card.Section>
        <Image
          src={product.thumbnail}
          alt={product.title}
          h={180}
          className={classes.image}
          loading="lazy"
          fallbackSrc="https://placehold.co/300x180?text=Sem+imagem"
        />
      </Card.Section>

      <Stack gap="xs" mt="md" style={{ flex: 1 }}>
        <Group justify="space-between" gap="xs" wrap="nowrap">
          <Badge variant="light" size="sm">
            {product.category}
          </Badge>
          {product.rating !== undefined && (
            <Group gap={4} wrap="nowrap" aria-label={`Nota ${product.rating.toFixed(1)}`}>
              <IconStarFilled size={14} color="var(--mantine-color-yellow-5)" aria-hidden />
              <Text size="sm">{product.rating.toFixed(1)}</Text>
            </Group>
          )}
        </Group>

        <Text fw={600} className={classes.title} component="h2" size="md" m={0}>
          {product.title}
        </Text>

        <PriceTag price={product.price} discountPercentage={product.discountPercentage} />

        <Group grow gap="xs" className={classes.footer}>
          <Button
            component={Link}
            to={`/produtos/${product.id}`}
            variant="default"
            aria-label={`Ver detalhes de ${product.title}`}
          >
            Detalhes
          </Button>
          <Button
            onClick={handleAdd}
            leftSection={<IconShoppingCartPlus size={16} />}
            aria-label={`Adicionar ${product.title} ao carrinho`}
          >
            Adicionar
          </Button>
        </Group>
      </Stack>
    </Card>
  )
}
