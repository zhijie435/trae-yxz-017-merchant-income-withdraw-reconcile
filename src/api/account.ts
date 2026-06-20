import { apiClient } from './client'
import type { AccountInfoData } from '../../shared/types'

export const accountApi = {
  getInfo: () => apiClient.get<AccountInfoData>('/api/account/info'),
}
