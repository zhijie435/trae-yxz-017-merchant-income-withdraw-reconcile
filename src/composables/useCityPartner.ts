import { ref } from 'vue'
import type {
  CityPartner,
  CityPartnerForm,
  CityPartnerListData,
  CityPartnerListQuery,
  CityPartnerListResponse,
  CityPartnerResponse,
} from '../../shared/types'

export function useCityPartner() {
  const list = ref<CityPartnerListData | null>(null)
  const listLoading = ref(false)
  const listError = ref<string | null>(null)

  const detail = ref<CityPartner | null>(null)
  const detailLoading = ref(false)
  const detailError = ref<string | null>(null)

  const activePartners = ref<CityPartner[]>([])
  const activePartnersLoading = ref(false)

  const submitting = ref(false)
  const submitError = ref<string | null>(null)

  const deleting = ref(false)

  async function fetchList(query: CityPartnerListQuery) {
    listLoading.value = true
    listError.value = null
    try {
      const params = new URLSearchParams()
      if (query.page) params.set('page', String(query.page))
      if (query.pageSize) params.set('pageSize', String(query.pageSize))
      if (query.city) params.set('city', query.city)
      if (query.status) params.set('status', query.status)
      if (query.keyword) params.set('keyword', query.keyword)

      const res = await fetch(`/api/partner/partners?${params.toString()}`)
      if (!res.ok) throw new Error(`请求失败 (${res.status})`)
      const json: CityPartnerListResponse = await res.json()
      if (json.code === 0) {
        list.value = json.data
      } else {
        listError.value = json.message || '获取城市合伙人列表失败'
      }
    } catch {
      listError.value = '网络异常，请稍后重试'
    } finally {
      listLoading.value = false
    }
  }

  async function fetchActivePartners() {
    activePartnersLoading.value = true
    try {
      const res = await fetch('/api/partner/partners/active')
      if (!res.ok) throw new Error(`请求失败 (${res.status})`)
      const json = await res.json()
      if (json.code === 0) {
        activePartners.value = json.data
      }
    } catch {
      // ignore
    } finally {
      activePartnersLoading.value = false
    }
  }

  async function fetchDetail(id: string) {
    detailLoading.value = true
    detailError.value = null
    try {
      const res = await fetch(`/api/partner/partners/${id}`)
      if (!res.ok) throw new Error(`请求失败 (${res.status})`)
      const json: CityPartnerResponse = await res.json()
      if (json.code === 0) {
        detail.value = json.data
      } else {
        detailError.value = json.message || '获取合伙人详情失败'
      }
    } catch {
      detailError.value = '网络异常，请稍后重试'
    } finally {
      detailLoading.value = false
    }
  }

  async function create(form: CityPartnerForm): Promise<CityPartner | null> {
    submitting.value = true
    submitError.value = null
    try {
      const res = await fetch('/api/partner/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(`请求失败 (${res.status})`)
      const json: CityPartnerResponse = await res.json()
      if (json.code === 0) {
        return json.data
      } else {
        submitError.value = json.message || '创建合伙人失败'
        return null
      }
    } catch {
      submitError.value = '网络异常，请稍后重试'
      return null
    } finally {
      submitting.value = false
    }
  }

  async function update(id: string, form: CityPartnerForm): Promise<CityPartner | null> {
    submitting.value = true
    submitError.value = null
    try {
      const res = await fetch(`/api/partner/partners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(`请求失败 (${res.status})`)
      const json: CityPartnerResponse = await res.json()
      if (json.code === 0) {
        return json.data
      } else {
        submitError.value = json.message || '更新合伙人失败'
        return null
      }
    } catch {
      submitError.value = '网络异常，请稍后重试'
      return null
    } finally {
      submitting.value = false
    }
  }

  async function remove(id: string): Promise<boolean> {
    deleting.value = true
    try {
      const res = await fetch(`/api/partner/partners/${id}`, {
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
    activePartners,
    activePartnersLoading,
    submitting,
    submitError,
    deleting,
    fetchList,
    fetchActivePartners,
    fetchDetail,
    create,
    update,
    remove,
  }
}
