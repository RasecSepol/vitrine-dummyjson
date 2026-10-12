import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Image,
  List,
  LoadingOverlay,
  NumberInput,
  Rating,
  SimpleGrid,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconArrowLeft, IconShoppingCartPlus } from '@tabler/icons-react'
import { ErrorState } from '../components/ErrorState'
import { PriceTag } from '../components/PriceTag'
import { useCart } from '../hooks/useCart'
import { useFetch } from '../hooks/useFetch'
import { fetchProduct } from '../services/productService'
import type { Product } from '../schemas/product'

function ProductGallery({ product }: { product: Product }) {
  const images = product.images.length > 0 ? product.images : [product.thumbnail]
  const [selected, setSelected] = useState(0)

  return (
    <Stack>
      <Card withBorder radius="md" p="xs">
        <Image src={images[selected]} alt={product.title} h={360} fit="contain" />
      </Card>
      {images.length > 1 && (
        <SimpleGrid cols={5} spacing="xs">
          {images.map((src, index) => (
            <UnstyledButton
              key={src}
              onClick={() => setSelected(index)}
              aria-label={`Ver imagem ${index + 1}`}
              aria-pressed={index === selected}
            >
              <Image
                src={src}
                alt=""
                h={64}
                fit="contain"
                radius="sm"
                style={{
                  outline: index === selected ? '2px solid var(--mantine-color-blue-filled)' : undefined,
                }}
              />
            </UnstyledButton>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  )
}

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState<number>(1)

  const productId = Number(id)
  const isValidId = Number.isInteger(productId) && productId > 0

  const loadProduct = useCallback(
    (signal: AbortSignal) =>
      isValidId ? fetchProduct(productId, signal) : Promise.reject(new Error('Identificador de produto inválido.')),
    [productId, isValidId],
  )
  const { state, reload } = useFetch(loadProduct)
  const product = state.status === 'success' ? state.data : null

  const handleAddToCart = () => {
    if (!product) return
    addItem(product, quantity)
    notifications.show({
      color: 'teal',
      title: 'Adicionado ao carrinho',
      message: `${quantity}x ${product.title}`,
    })
  }

  return (
    <Box pos="relative" mih={300}>
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={() => navigate(-1)}
        mb="md"
      >
        Voltar
      </Button>

      <LoadingOverlay visible={state.status === 'loading'} loaderProps={{ 'aria-label': 'Carregando produto' }} />

      {state.status === 'error' && (
        <ErrorState title="Produto indisponível" message={state.error} onRetry={reload}>
          <Button size="xs" variant="default" onClick={() => navigate('/')}>
            Ir para o catálogo
          </Button>
        </ErrorState>
      )}

      {product && (
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <ProductGallery key={product.id} product={product} />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              <Group gap="xs">
                <Badge variant="light">{product.category}</Badge>
                {product.brand && <Badge variant="outline">{product.brand}</Badge>}
                {product.availabilityStatus && (
                  <Badge color={product.stock > 0 ? 'teal' : 'red'} variant="dot">
                    {product.availabilityStatus}
                  </Badge>
                )}
              </Group>

              <Title order={1} size="h2">
                {product.title}
              </Title>

              {product.rating !== undefined && (
                <Group gap="xs">
                  <Rating value={product.rating} fractions={4} readOnly />
                  <Text size="sm" c="dimmed">
                    {product.rating.toFixed(1)} ({product.reviews.length} avaliações)
                  </Text>
                </Group>
              )}

              <PriceTag price={product.price} discountPercentage={product.discountPercentage} size="xl" />

              <Text>{product.description}</Text>

              <Group align="flex-end">
                <NumberInput
                  label="Quantidade"
                  min={1}
                  max={Math.max(product.stock, 1)}
                  value={quantity}
                  onChange={(value) => setQuantity(typeof value === 'number' && value > 0 ? value : 1)}
                  allowDecimal={false}
                  w={120}
                />
                <Button
                  leftSection={<IconShoppingCartPlus size={18} />}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  Adicionar ao carrinho
                </Button>
              </Group>
              <Text size="sm" c="dimmed">
                {product.stock} unidades em estoque
              </Text>

              <Divider />

              <List spacing={4} size="sm">
                {product.warrantyInformation && <List.Item>Garantia: {product.warrantyInformation}</List.Item>}
                {product.shippingInformation && <List.Item>Envio: {product.shippingInformation}</List.Item>}
                {product.returnPolicy && <List.Item>Devolução: {product.returnPolicy}</List.Item>}
              </List>

              {product.tags.length > 0 && (
                <Group gap={6}>
                  {product.tags.map((tag) => (
                    <Badge key={tag} size="xs" variant="default">
                      #{tag}
                    </Badge>
                  ))}
                </Group>
              )}
            </Stack>
          </Grid.Col>

          {product.reviews.length > 0 && (
            <Grid.Col span={12}>
              <Title order={2} size="h3" mb="sm">
                Avaliações
              </Title>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                {product.reviews.map((review) => (
                  <Card key={`${review.reviewerName}-${review.date}`} withBorder radius="md">
                    <Group justify="space-between" mb="xs">
                      <Text fw={600} size="sm">
                        {review.reviewerName}
                      </Text>
                      <Rating value={review.rating} readOnly size="xs" />
                    </Group>
                    <Text size="sm">{review.comment}</Text>
                    <Text size="xs" c="dimmed" mt="xs">
                      {new Date(review.date).toLocaleDateString('pt-BR')}
                    </Text>
                  </Card>
                ))}
              </SimpleGrid>
            </Grid.Col>
          )}
        </Grid>
      )}
    </Box>
  )
}
