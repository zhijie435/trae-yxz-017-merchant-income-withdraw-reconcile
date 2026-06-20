import { ref } from 'vue'
import type {
  AccountInfoData,
  AccountInfoResponse,
} from '../../shared/types'

/**
 * 账户信息请求组合式函数
 */
export function useAccountInfo() {
  const accountInfo = ref<AccountInfoData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAccountInfo() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch('/api/account/info')
      if (!res.ok) {
        throw new Error(`请求失败 (${res.status})`)
      }
      const json: AccountInfoResponse = await res.json()
      if (json.code === 0) {
        accountInfo.value = json.data
      } else {
        error.value = json.message || '获取账户信息失败'
      }
    } catch {
      error.value = '网络异常，请稍后重试'
    } finally {
      loading.value = false
    }
  }

  return { accountInfo, loading, error, fetchAccountInfo }
}
