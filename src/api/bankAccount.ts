import { apiClient } from './client'
import type { BankAccount, BankAccountForm, BankAccountListData, BankAccountListQuery } from '../../shared/types'

export const bankAccountApi = {
  getDefault: () => apiClient.get<BankAccount>('/api/bank-account/default'),
  getList: (params: BankAccountListQuery) => apiClient.get<BankAccountListData>('/api/bank-account/list', { params }),
  getDetail: (id: string) => apiClient.get<BankAccount>(`/api/bank-account/${id}`),
  create: (form: BankAccountForm) => apiClient.post<BankAccount>('/api/bank-account', form),
  update: (id: string, form: BankAccountForm) => apiClient.put<BankAccount>(`/api/bank-account/${id}`, form),
  delete: (id: string) => apiClient.delete<boolean>(`/api/bank-account/${id}`),
  setDefault: (id: string) => apiClient.post<boolean>(`/api/bank-account/${id}/default`),
}
