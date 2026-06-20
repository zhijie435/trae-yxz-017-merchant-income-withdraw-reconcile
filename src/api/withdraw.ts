import { apiClient } from './client'
import type {
  BankAccount,
  WithdrawRecord,
  WithdrawForm,
  WithdrawStatsData,
  WithdrawListData,
  WithdrawListQuery,
} from '../../shared/types'

export const withdrawApi = {
  getStats: () => apiClient.get<WithdrawStatsData>('/api/withdraw/stats'),
  getList: (params: WithdrawListQuery) => apiClient.get<WithdrawListData>('/api/withdraw/list', { params }),
  getAvailableAmount: () => apiClient.get<{ availableAmount: number }>('/api/withdraw/available-amount'),
  getAvailableAccounts: () => apiClient.get<BankAccount[]>('/api/withdraw/available-accounts'),
  create: (form: WithdrawForm) => apiClient.post<WithdrawRecord>('/api/withdraw', form),
  cancel: (id: string) => apiClient.post<boolean>(`/api/withdraw/${id}/cancel`),
  export: (params: Omit<WithdrawListQuery, 'page' | 'pageSize'>) =>
    apiClient.download('/api/withdraw/export', { params }),
}
