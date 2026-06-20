import { ref, reactive, computed } from 'vue'
import { usePagination } from './usePagination'
import type { ApiError } from '../api/client'

export interface ListData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface ListQuery {
  page?: number
  pageSize?: number
  [key: string]: unknown
}

export interface UseListOptions<T, Q extends ListQuery> {
  defaultQuery?: Partial<Q>
  defaultPageSize?: number
  fetchFn: (query: Q) => Promise<ListData<T>>
  autoFetch?: boolean
}

export function useList<T, Q extends ListQuery>(options: UseListOptions<T, Q>) {
  const {
    defaultQuery = {} as Partial<Q>,
    defaultPageSize = 10,
    fetchFn,
    autoFetch = false,
  } = options

  const pagination = usePagination({ defaultPageSize })

  const query = reactive<Q>({
    ...defaultQuery,
    page: pagination.currentPage.value,
    pageSize: pagination.pageSize.value,
  } as Q)

  const listData = ref<ListData<T>>({
    list: [],
    total: 0,
    page: pagination.currentPage.value,
    pageSize: pagination.pageSize.value,
  })
  const list = computed(() => listData.value.list)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function buildQuery(): Q {
    return {
      ...query,
      page: pagination.currentPage.value,
      pageSize: pagination.pageSize.value,
    } as Q
  }

  async function fetch(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const result = await fetchFn(buildQuery())
      listData.value = result
      pagination.setTotal(result.total)
    } catch (err) {
      error.value = (err as ApiError).message || '获取数据失败'
      listData.value = {
        list: [],
        total: 0,
        page: pagination.currentPage.value,
        pageSize: pagination.pageSize.value,
      }
      pagination.setTotal(0)
    } finally {
      loading.value = false
    }
  }

  function refresh(): void {
    fetch()
  }

  function handleFilter(): void {
    pagination.resetPage()
    fetch()
  }

  function handleReset(resetQuery?: Partial<Q>): void {
    Object.assign(query, defaultQuery, resetQuery)
    pagination.resetPage()
    fetch()
  }

  function handlePageChange(page: number): void {
    pagination.goPage(page)
    fetch()
  }

  if (autoFetch) {
    fetch()
  }

  return {
    listData,
    list,
    loading,
    error,
    query,
    ...pagination,
    fetch,
    refresh,
    handleFilter,
    handleReset,
    handlePageChange,
  }
}
