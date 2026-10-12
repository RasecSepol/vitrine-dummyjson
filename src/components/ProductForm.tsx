import { useState } from 'react'
import { Button, Group, NumberInput, Select, SimpleGrid, Stack, TextInput, Textarea } from '@mantine/core'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { productFormSchema, type Category, type ProductFormValues } from '../schemas/product'

// O NumberInput do Mantine usa '' quando o campo está vazio.
type ProductFormState = Omit<ProductFormValues, 'price' | 'stock'> & {
  price: number | ''
  stock: number | ''
}

const EMPTY_VALUES: ProductFormState = {
  title: '',
  description: '',
  category: '',
  brand: '',
  price: '',
  stock: '',
}

interface ProductFormProps {
  categories: Category[]
  initialValues?: ProductFormValues
  submitLabel?: string
  onSubmit: (values: ProductFormValues) => Promise<void>
  onCancel?: () => void
}

export function ProductForm({
  categories,
  initialValues,
  submitLabel = 'Salvar',
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<ProductFormState, (values: ProductFormState) => ProductFormValues>({
    mode: 'controlled',
    initialValues: initialValues ? { ...EMPTY_VALUES, ...initialValues } : EMPTY_VALUES,
    validate: zodResolver(productFormSchema),
    transformValues: (values) => productFormSchema.parse(values),
  })

  const handleSubmit = async (values: ProductFormValues) => {
    setSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate aria-label="Formulário de produto">
      <Stack>
        <TextInput label="Título" withAsterisk {...form.getInputProps('title')} />
        <Textarea
          label="Descrição"
          withAsterisk
          autosize
          minRows={3}
          {...form.getInputProps('description')}
        />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Select
            label="Categoria"
            withAsterisk
            searchable
            data={categories.map((category) => ({ value: category.slug, label: category.name }))}
            {...form.getInputProps('category')}
          />
          <TextInput label="Marca" {...form.getInputProps('brand')} />
          <NumberInput
            label="Preço (US$)"
            withAsterisk
            min={0}
            decimalScale={2}
            fixedDecimalScale
            decimalSeparator=","
            thousandSeparator="."
            {...form.getInputProps('price')}
          />
          <NumberInput
            label="Estoque"
            withAsterisk
            min={0}
            allowDecimal={false}
            {...form.getInputProps('stock')}
          />
        </SimpleGrid>
        <Group justify="flex-end">
          {onCancel && (
            <Button variant="default" onClick={onCancel} disabled={submitting}>
              Cancelar
            </Button>
          )}
          <Button type="submit" loading={submitting}>
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
