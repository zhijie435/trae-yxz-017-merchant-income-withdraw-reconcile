/**
 * 前后端共享类型定义 - 账户信息
 * 金额单位均为「分」，前端展示时换算为「元」
 */

export interface AccountInfoData {
  /** 门店名称 */
  storeName: string
  /** 门店编号 */
  storeNo: string
  /** 账户余额（分） */
  accountBalance: number
  /** 可提现金额（分） */
  availableAmount: number
  /** 冻结金额（分） */
  frozenAmount: number
  /** 累计营收（分） */
  totalRevenue: number
  /** 冻结原因说明 */
  frozenReason: string
}

export interface ApiResponse<T> {
  /** 0 表示成功 */
  code: number
  message: string
  data: T
}

export type AccountInfoResponse = ApiResponse<AccountInfoData>
