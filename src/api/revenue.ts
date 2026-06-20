import { apiClient } from './client'
import type { RevenueStatsData, RevenueListData, RevenueListQuery } from '../../shared/types'

export const revenueApi = {
  getStats: () => apiClient.get<RevenueStatsData>('/api/revenue/stats'),
  getList: (params: RevenueListQuery) => apiClient.get<RevenueListData>('/api/revenue/list', { params }),
  export: (params: Omit<RevenueListQuery, 'page' | 'pageSize'>) =>
    apiClient.download('/api/revenue/export', { params }),
}
