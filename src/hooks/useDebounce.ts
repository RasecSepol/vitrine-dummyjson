import { useEffect, useState } from 'react'

// Atrasa a propagação de um valor (ex.: texto da busca) até o usuário parar de digitar.
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timeoutId)
  }, [value, delay])

  return debounced
}
