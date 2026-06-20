import type { AccountInfoData } from '../../shared/types.js'
import { mockAccountInfo } from '../data/mockAccount.js'

/**
 * 账户信息服务层
 * 模拟从数据源获取账户信息
 */
export async function fetchAccountInfo(): Promise<AccountInfoData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockAccountInfo)
    }, 300)
  })
}
