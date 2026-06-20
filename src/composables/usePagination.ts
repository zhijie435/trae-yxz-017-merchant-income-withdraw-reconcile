import { ref, computed } from 'vue'

export interface PaginationOptions {
  defaultPage?: number
  defaultPageSize?: number
}

export function usePagination(options: PaginationOptions = {}) {
  const { defaultPage = 1, defaultPageSize = 10 } = options

  const currentPage = ref(defaultPage)
  const pageSize = ref(defaultPageSize)
  const total = ref(0)

  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

  const pageNumbers = computed(() => {
    const current = currentPage.value
    const total = totalPages.value
    const pages: (number | '...')[] = []

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      if (current > 3) pages.push('...')
      const start = Math.max(2, current - 1)
      const end = Math.min(total - 1, current + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (current < total - 2) pages.push('...')
      pages.push(total)
    }

    return pages
  })

  const canGoPrev = computed(() => currentPage.value > 1)
  const canGoNext = computed(() => currentPage.value < totalPages.value)

  function goPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  function goPrev() {
    if (canGoPrev.value) {
      currentPage.value--
    }
  }

  function goNext() {
    if (canGoNext.value) {
      currentPage.value++
    }
  }

  function setTotal(value: number) {
    total.value = value
  }

  function resetPage() {
    currentPage.value = 1
  }

  return {
    currentPage,
    pageSize,
    total,
    totalPages,
    pageNumbers,
    canGoPrev,
    canGoNext,
    goPage,
    goPrev,
    goNext,
    setTotal,
    resetPage,
  }
}
