import type { AccountInfoData } from '../../shared/types.js'

/**
 * 账户信息 Mock 数据
 * 金额单位：分
 */
export const mockAccountInfo: AccountInfoData = {
  storeName: '南京新街口旗舰店',
  storeNo: 'NJ-00128',
  accountBalance: 1286750,
  availableAmount: 982300,
  frozenAmount: 304450,
  totalRevenue: 56982100,
  frozenReason: '存在进行中的提现申请，对应金额暂时冻结',
}
