/**
 * 前后端共享类型定义 - 账户信息与收益记录
 * 金额单位均为「分」，前端展示时换算为「元」
 */

export interface AccountInfoData {
  storeName: string
  storeNo: string
  accountBalance: number
  availableAmount: number
  frozenAmount: number
  totalRevenue: number
  frozenReason: string
}

export interface RevenueStatsData {
  recordCount: number
  todayRevenue: number
  monthRevenue: number
  totalRevenue: number
}

export type RevenueRecordStatus = 'success' | 'pending' | 'failed'

export interface RevenueRecord {
  id: string
  orderNo: string
  tradeTime: string
  type: string
  amount: number
  status: RevenueRecordStatus
  remark: string
}

export interface RevenueListData {
  list: RevenueRecord[]
  total: number
  page: number
  pageSize: number
}

export interface RevenueListQuery {
  page?: number
  pageSize?: number
  startDate?: string
  endDate?: string
  type?: string
  status?: string
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export type AccountInfoResponse = ApiResponse<AccountInfoData>
export type RevenueStatsResponse = ApiResponse<RevenueStatsData>
export type RevenueListResponse = ApiResponse<RevenueListData>

export interface CityPartner {
  id: string
  name: string
  phone: string
  city: string
  splitRatio: number
  status: 'active' | 'inactive'
  createdAt: string
  remark?: string
}

export interface CityPartnerForm {
  name: string
  phone: string
  city: string
  splitRatio: number
  status: 'active' | 'inactive'
  remark?: string
}

export interface CityPartnerListData {
  list: CityPartner[]
  total: number
  page: number
  pageSize: number
}

export interface CityPartnerListQuery {
  page?: number
  pageSize?: number
  city?: string
  status?: string
  keyword?: string
}

export type SplitRecordStatus = 'success' | 'pending' | 'failed'

export interface SplitRecord {
  id: string
  orderNo: string
  partnerId: string
  partnerName: string
  tradeTime: string
  totalAmount: number
  splitRatio: number
  splitAmount: number
  status: SplitRecordStatus
  remark: string
}

export interface SplitRecordStatsData {
  recordCount: number
  todaySplitAmount: number
  monthSplitAmount: number
  totalSplitAmount: number
}

export interface SplitRecordListData {
  list: SplitRecord[]
  total: number
  page: number
  pageSize: number
}

export interface SplitRecordListQuery {
  page?: number
  pageSize?: number
  startDate?: string
  endDate?: string
  partnerId?: string
  status?: string
}

export type CityPartnerListResponse = ApiResponse<CityPartnerListData>
export type CityPartnerResponse = ApiResponse<CityPartner>
export type SplitRecordStatsResponse = ApiResponse<SplitRecordStatsData>
export type SplitRecordListResponse = ApiResponse<SplitRecordListData>
