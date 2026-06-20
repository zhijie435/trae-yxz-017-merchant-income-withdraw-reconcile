import { ref } from 'vue'
import type {
  BankAccount,
  BankAccountForm,
  BankAccountListData,
  BankAccountListQuery,
  BankAccountListResponse,
  BankAccountResponse,
} from '../../shared/types'

export function useBankAccount() {
  const list = ref<BankAccountListData | null>(null)
  const listLoading = ref(false)
  const listError = ref<string | null>(null)

  const detail = ref<BankAccount | null>(null)
  const detailLoading = ref(false)
  const detailError = ref<string | null>(null)

  const defaultAccount = ref<BankAccount | null>(null)

  const submitting = ref(false)
  const submitError = ref<string | null>(null)

  const deleting = ref(false)
  const settingDefault = ref(false)

  async function fetchList(query: BankAccountListQuery) {
    listLoading.value = true
    listError.value = null
    try {
      const params = new URLSearchParams()
      if (query.page) params.set('page', String(query.page))
      if (query.pageSize) params.set('pageSize', String(query.pageSize))
      if (query.type) params.set('type', query.type)
      if (query.status) params.set('status', query.status)
      if (query.keyword) params.set('keyword', query.keyword)

      const res = await fetch(`/api/bank-account?${params.toString()}`)
      if (!res.ok) throw new Error(`请求失败 (${res.status})`)
      const json: BankAccountListResponse = await res.json()
      if (json.code === 0) {
        list.value = json.data
      } else {
        listError.value = json.message || '获取收款账户列表失败'
      }
    } catch {
      listError.value = '网络异常，请稍后重试'
    } finally {
      listLoading.value = false
    }
  }

  async function fetchDefault() {
    try {
      const res = await fetch('/api/bank-account/default')
      if (!res.ok) throw new Error(`请求失败 (${res.status})`)
      const json = await res.json()
      if (json.code === 0) {
        defaultAccount.value = json.data
      }
    } catch {
      // ignore
    }
  }

  async function fetchDetail(id: string) {
    detailLoading.value = true
    detailError.value = null
    try {
      const res = await fetch(`/api/bank-account/${id}`)
      if (!res.ok) throw new Error(`请求失败 (${res.status})`)
      const json: BankAccountResponse = await res.json()
      if (json.code === 0) {
        detail.value = json.data
      } else {
        detailError.value = json.message || '获取收款账户详情失败'
      }
    } catch {
      detailError.value = '网络异常，请稍后重试'
    } finally {
      detailLoading.value = false
    }
  }

  async function create(form: BankAccountForm): Promise<BankAccount | null> {
    submitting.value = true
    submitError.value = null
    try {
      const res = await fetch('/api/bank-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(`请求失败 (${res.status})`)
      const json: BankAccountResponse = await res.json()
      if (json.code === 0) {
        return json.data
      } else {
        submitError.value = json.message || '创建收款账户失败'
        return null
      }
    } catch {
      submitError.value = '网络异常，请稍后重试'
      return null
    } finally {
      submitting.value = false
    }
  }

  async function update(id: string, form: BankAccountForm): Promise<BankAccount | null> {
    submitting.value = true
    submitError.value = null
    try {
      const res = await fetch(`/api/bank-account/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(`请求失败 (${res.status})`)
      const json: BankAccountResponse = await res.json()
      if (json.code === 0) {
        return json.data
      } else {
        submitError.value = json.message || '更新收款账户失败'
        return null
      }
    } catch {
      submitError.value = '网络异常，请稍后重试'
      return null
    } finally {
      submitting.value = false
    }
  }

  async function setDefault(id: string): Promise<boolean> {
    settingDefault.value = true
    try {
      const res = await fetch(`/api/bank-account/${id}/default`, {
        method: 'PUT',
      })
      if (!res.ok) throw new Error(`请求失败 (${res.status})`)
      const json = await res.json()
      return json.code === 0
    } catch {
      return false
    } finally {
      settingDefault.value = false
    }
  }

  async function remove(id: string): Promise<boolean> {
    deleting.value = true
    try {
      const res = await fetch(`/api/bank-account/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error(`请求失败 (${res.status})`)
      const json = await res.json()
      return json.code === 0
    } catch {
      return false
    } finally {
      deleting.value = false
    }
  }

  return {
    list,
    listLoading,
    listError,
    detail,
    detailLoading,
    detailError,
    defaultAccount,
    submitting,
    submitError,
    deleting,
    settingDefault,
    fetchList,
    fetchDefault,
    fetchDetail,
    create,
    update,
    setDefault,
    remove,
  }
}
