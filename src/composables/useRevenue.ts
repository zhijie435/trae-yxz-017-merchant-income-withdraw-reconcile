import { ref } from 'vue'
import type {
  RevenueStatsData,
  RevenueListData,
  RevenueStatsResponse,
  RevenueListResponse,
  RevenueListQuery,
} from '../../shared/types'

/**
 * 收益记录相关请求组合式函数
 */
export function useRevenue() {
  const stats = ref<RevenueStatsData | null>(null)
  const statsLoading = ref(false)
  const statsError = ref<string | null>(null)

  const list = ref<RevenueListData | null>(null)
  const listLoading = ref(false)
  const listError = ref<string | null>(null)

  const exporting = ref(false)

  async function fetchStats() {
    statsLoading.value = true
    statsError.value = null
    try {
      const res = await fetch('/api/revenue/stats')
      if (!res.ok) throw new Error(`请求失败 (${res.status})`)
      const json: RevenueStatsResponse = await res.json()
      if (json.code === 0) {
        stats.value = json.data
      } else {
        statsError.value = json.message || '获取收益统计失败'
      }
    } catch {
      statsError.value = '网络异常，请稍后重试'
    } finally {
      statsLoading.value = false
    }
  }

  async function fetchList(query: RevenueListQuery) {
    listLoading.value = true
    listError.value = null
    try {
      const params = new URLSearchParams()
      if (query.page) params.set('page', String(query.page))
      if (query.pageSize) params.set('pageSize', String(query.pageSize))
      if (query.startDate) params.set('startDate', query.startDate)
      if (query.endDate) params.set('endDate', query.endDate)
      if (query.type) params.set('type', query.type)
      if (query.status) params.set('status', query.status)

      const res = await fetch(`/api/revenue/list?${params.toString()}`)
      if (!res.ok) throw new Error(`请求失败 (${res.status})`)
      const json: RevenueListResponse = await res.json()
      if (json.code === 0) {
        list.value = json.data
      } else {
        listError.value = json.message || '获取收益明细失败'
      }
    } catch {
      listError.value = '网络异常，请稍后重试'
    } finally {
      listLoading.value = false
    }
  }

  async function exportExcel(query: RevenueListQuery) {
    exporting.value = true
    try {
      const params = new URLSearchParams()
      if (query.startDate) params.set('startDate', query.startDate)
      if (query.endDate) params.set('endDate', query.endDate)
      if (query.type) params.set('type', query.type)
      if (query.status) params.set('status', query.status)

      const res = await fetch(`/api/revenue/export?${params.toString()}`)
      if (!res.ok) throw new Error(`导出失败 (${res.status})`)

      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition') || ''
      let fileName = '收益明细.xlsx'
      const match = disposition.match(/filename\*=UTF-8''(.+)/)
      if (match) fileName = decodeURIComponent(match[1])

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      exporting.value = false
    }
  }

  return {
    stats,
    statsLoading,
    statsError,
    list,
    listLoading,
    listError,
    exporting,
    fetchStats,
    fetchList,
    exportExcel,
  }
}
