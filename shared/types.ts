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
