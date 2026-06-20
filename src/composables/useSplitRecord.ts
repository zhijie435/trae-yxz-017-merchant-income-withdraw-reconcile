import { ref } from 'vue'
import type {
  SplitRecordStatsData,
  SplitRecordListData,
  SplitRecordStatsResponse,
  SplitRecordListResponse,
  SplitRecordListQuery,
} from '../../shared/types'

export function useSplitRecord() {
  const stats = ref<SplitRecordStatsData | null>(null)
  const statsLoading = ref(false)
  const statsError = ref<string | null>(null)

  const list = ref<SplitRecordListData | null>(null)
  const listLoading = ref(false)
  const listError = ref<string | null>(null)

  async function fetchStats() {
    statsLoading.value = true
    statsError.value = null
    try {
      const res = await fetch('/api/partner/splits/stats')
      if (!res.ok) throw new Error(`请求失败 (${res.status})`)
      const json: SplitRecordStatsResponse = await res.json()
      if (json.code === 0) {
        stats.value = json.data
      } else {
        statsError.value = json.message || '获取分账统计失败'
      }
    } catch {
      statsError.value = '网络异常，请稍后重试'
    } finally {
      statsLoading.value = false
    }
  }

  async function fetchList(query: SplitRecordListQuery) {
    listLoading.value = true
    listError.value = null
    try {
      const params = new URLSearchParams()
      if (query.page) params.set('page', String(query.page))
      if (query.pageSize) params.set('pageSize', String(query.pageSize))
      if (query.startDate) params.set('startDate', query.startDate)
      if (query.endDate) params.set('endDate', query.endDate)
      if (query.partnerId) params.set('partnerId', query.partnerId)
      if (query.status) params.set('status', query.status)

      const res = await fetch(`/api/partner/splits?${params.toString()}`)
      if (!res.ok) throw new Error(`请求失败 (${res.status})`)
      const json: SplitRecordListResponse = await res.json()
      if (json.code === 0) {
        list.value = json.data
      } else {
        listError.value = json.message || '获取分账记录列表失败'
      }
    } catch {
      listError.value = '网络异常，请稍后重试'
    } finally {
      listLoading.value = false
    }
  }

  return {
    stats,
    statsLoading,
    statsError,
    list,
    listLoading,
    listError,
    fetchStats,
    fetchList,
  }
}
