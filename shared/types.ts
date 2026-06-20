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
  [key: string]: unknown
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
  [key: string]: unknown
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
  [key: string]: unknown
}

export type CityPartnerListResponse = ApiResponse<CityPartnerListData>
export type CityPartnerResponse = ApiResponse<CityPartner>
export type SplitRecordStatsResponse = ApiResponse<SplitRecordStatsData>
export type SplitRecordListResponse = ApiResponse<SplitRecordListData>

export type BankAccountType = 'debit' | 'credit' | 'public'
export type BankAccountStatus = 'active' | 'inactive'

export interface BankAccount {
  id: string
  accountName: string
  bankBranch: string
  accountNo: string
  bankName?: string
  type: BankAccountType
  isDefault: boolean
  status: BankAccountStatus
  createdAt: string
  remark?: string
}

export interface BankAccountForm {
  accountName: string
  bankBranch: string
  accountNo: string
  bankName?: string
  type: BankAccountType
  isDefault: boolean
  status: BankAccountStatus
  remark?: string
}

export interface BankAccountListData {
  list: BankAccount[]
  total: number
  page: number
  pageSize: number
}

export interface BankAccountListQuery {
  page?: number
  pageSize?: number
  type?: string
  status?: string
  keyword?: string
  [key: string]: unknown
}

export type BankAccountListResponse = ApiResponse<BankAccountListData>
export type BankAccountResponse = ApiResponse<BankAccount>

export type WithdrawStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled'

export interface WithdrawRecord {
  id: string
  withdrawNo: string
  amount: number
  fee: number
  actualAmount: number
  bankAccountId: string
  bankAccountName: string
  bankName: string
  bankBranch: string
  accountNo: string
  status: WithdrawStatus
  applyTime: string
  processTime?: string
  completeTime?: string
  remark?: string
  failReason?: string
}

export interface WithdrawRecordStatsData {
  recordCount: number
  todayWithdrawAmount: number
  monthWithdrawAmount: number
  totalWithdrawAmount: number
  processingCount: number
}

export interface WithdrawRecordListData {
  list: WithdrawRecord[]
  total: number
  page: number
  pageSize: number
}

export interface WithdrawRecordListQuery {
  page?: number
  pageSize?: number
  startDate?: string
  endDate?: string
  status?: string
  [key: string]: unknown
}

export interface WithdrawForm {
  amount: number
  bankAccountId: string
  remark?: string
}

export interface WithdrawSubmitResult {
  id: string
  withdrawNo: string
  amount: number
  fee: number
  actualAmount: number
  status: WithdrawStatus
}

export type WithdrawStatsData = WithdrawRecordStatsData
export type WithdrawListData = WithdrawRecordListData
export type WithdrawListQuery = WithdrawRecordListQuery
export type WithdrawStatsResponse = ApiResponse<WithdrawRecordStatsData>
export type WithdrawRecordStatsResponse = ApiResponse<WithdrawRecordStatsData>
export type WithdrawListResponse = ApiResponse<WithdrawRecordListData>
export type WithdrawRecordListResponse = ApiResponse<WithdrawRecordListData>
export type WithdrawSubmitResponse = ApiResponse<WithdrawSubmitResult>

export interface ReconciliationExportQuery {
  startDate: string
  endDate: string
  type: 'revenue' | 'split' | 'withdraw' | 'all'
}

export interface ListDataWithTotal<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
