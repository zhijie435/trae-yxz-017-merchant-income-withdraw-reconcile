import { apiClient } from './client'
import type {
  CityPartner,
  CityPartnerForm,
  CityPartnerListData,
  CityPartnerListQuery,
  SplitRecordStatsData,
  SplitRecordListData,
  SplitRecordListQuery,
} from '../../shared/types'

export const partnerApi = {
  getActivePartners: () => apiClient.get<CityPartner[]>('/api/partner/active'),
  getPartners: (params: CityPartnerListQuery) => apiClient.get<CityPartnerListData>('/api/partner/list', { params }),
  getPartner: (id: string) => apiClient.get<CityPartner>(`/api/partner/${id}`),
  createPartner: (form: CityPartnerForm) => apiClient.post<CityPartner>('/api/partner', form),
  updatePartner: (id: string, form: CityPartnerForm) => apiClient.put<CityPartner>(`/api/partner/${id}`, form),
  deletePartner: (id: string) => apiClient.delete<boolean>(`/api/partner/${id}`),
  getSplitStats: () => apiClient.get<SplitRecordStatsData>('/api/partner/splits/stats'),
  getSplitList: (params: SplitRecordListQuery) => apiClient.get<SplitRecordListData>('/api/partner/splits/list', { params }),
  exportSplitList: (params: Omit<SplitRecordListQuery, 'page' | 'pageSize'>) =>
    apiClient.download('/api/partner/splits/export', { params }),
}
