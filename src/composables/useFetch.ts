import { ref } from 'vue'
import type { ApiError } from '../api/client'

export interface UseFetchOptions<T> {
  initialValue?: T | null
  autoFetch?: boolean
}

export function useFetch<T>(
  fetchFn?: () => Promise<T>,
  options: UseFetchOptions<T> = {},
) {
  const { initialValue = null, autoFetch = false } = options

  const data = ref<T | null>(initialValue)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function execute(dynamicFn?: () => Promise<T>): Promise<T | null> {
    loading.value = true
    error.value = null

    try {
      const fn = dynamicFn || fetchFn
      if (!fn) {
        throw new Error('No fetch function provided')
      }
      const result = await fn()
      data.value = result
      return result
    } catch (err) {
      error.value = (err as ApiError).message || '获取数据失败'
      return null
    } finally {
      loading.value = false
    }
  }

  function reset(): void {
    data.value = initialValue
    error.value = null
  }

  if (autoFetch && fetchFn) {
    execute()
  }

  return {
    data,
    loading,
    error,
    execute,
    reset,
  }
}
