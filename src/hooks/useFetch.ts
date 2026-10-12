import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { getErrorMessage } from '../services/api'

export type FetchState<T> =
  | { status: 'loading'; data: T | null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: T | null; error: string }

export interface UseFetchResult<T> {
  state: FetchState<T>
  reload: () => void
}

/**
 * Executa `fetcher` sempre que ele mudar (memorize-o com useCallback) e expõe
 * os estados de carregamento, sucesso e erro. Requisições antigas são
 * canceladas no cleanup com AbortController.
 */
export function useFetch<T>(fetcher: (signal: AbortSignal) => Promise<T>): UseFetchResult<T> {
  const [state, setState] = useState<FetchState<T>>({ status: 'loading', data: null, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    // Mantém os dados anteriores na tela enquanto carrega (evita "piscar").
    setState((previous) => ({ status: 'loading', data: previous.data, error: null }))

    fetcher(controller.signal)
      .then((data) => setState({ status: 'success', data, error: null }))
      .catch((error: unknown) => {
        if (axios.isCancel(error)) return
        setState((previous) => ({
          status: 'error',
          data: previous.data,
          error: getErrorMessage(error),
        }))
      })

    return () => controller.abort()
  }, [fetcher, attempt])

  const reload = useCallback(() => setAttempt((value) => value + 1), [])

  return { state, reload }
}
