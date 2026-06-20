import type {
  CityPartner,
  CityPartnerForm,
  CityPartnerListData,
  CityPartnerListQuery,
  SplitRecordStatsData,
  SplitRecordListData,
  SplitRecordListQuery,
} from '../../shared/types.js'
import {
  mockCityPartners,
  mockSplitRecords,
  computeSplitStats,
} from '../data/mockPartner.js'

let cityPartners = [...mockCityPartners]
let splitRecords = [...mockSplitRecords]

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function generatePartnerId(): string {
  const now = new Date()
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const random = Math.floor(Math.random() * 9000 + 1000)
  return `CP${timestamp}${random}`
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.000Z`
}

function filterPartners(
  partners: CityPartner[],
  query: CityPartnerListQuery,
): CityPartner[] {
  return partners.filter((p) => {
    if (query.city && p.city !== query.city) return false
    if (query.status && p.status !== query.status) return false
    if (query.keyword) {
      const kw = query.keyword.toLowerCase()
      if (
        !p.name.toLowerCase().includes(kw) &&
        !p.phone.includes(kw) &&
        !p.city.toLowerCase().includes(kw)
      ) {
        return false
      }
    }
    return true
  })
}

export async function getCityPartnerList(
  query: CityPartnerListQuery,
): Promise<CityPartnerListData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const page = query.page ?? 1
      const pageSize = query.pageSize ?? 10

      const filtered = filterPartners(cityPartners, query)
      const total = filtered.length
      const start = (page - 1) * pageSize
      const list = filtered.slice(start, start + pageSize)

      resolve({ list, total, page, pageSize })
    }, 200)
  })
}

export async function getCityPartner(id: string): Promise<CityPartner | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const partner = cityPartners.find((p) => p.id === id) || null
      resolve(partner)
    }, 100)
  })
}

export async function createCityPartner(
  form: CityPartnerForm,
): Promise<CityPartner> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newPartner: CityPartner = {
        id: generatePartnerId(),
        name: form.name,
        phone: form.phone,
        city: form.city,
        splitRatio: form.splitRatio,
        status: form.status,
        createdAt: formatDate(new Date()),
        remark: form.remark,
      }
      cityPartners.unshift(newPartner)
      resolve(newPartner)
    }, 200)
  })
}

export async function updateCityPartner(
  id: string,
  form: CityPartnerForm,
): Promise<CityPartner | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = cityPartners.findIndex((p) => p.id === id)
      if (index === -1) {
        resolve(null)
        return
      }
      const oldRatio = cityPartners[index].splitRatio
      const updated: CityPartner = {
        ...cityPartners[index],
        name: form.name,
        phone: form.phone,
        city: form.city,
        splitRatio: form.splitRatio,
        status: form.status,
        remark: form.remark,
      }
      cityPartners[index] = updated

      if (oldRatio !== form.splitRatio) {
        for (let i = 0; i < splitRecords.length; i++) {
          if (splitRecords[i].partnerId === id) {
            const newSplitAmount = Math.floor(splitRecords[i].totalAmount * form.splitRatio / 100)
            splitRecords[i] = {
              ...splitRecords[i],
              splitRatio: form.splitRatio,
              splitAmount: newSplitAmount,
            }
          }
        }
      }

      resolve(updated)
    }, 200)
  })
}

export async function deleteCityPartner(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = cityPartners.findIndex((p) => p.id === id)
      if (index === -1) {
        resolve(false)
        return
      }
      cityPartners.splice(index, 1)
      resolve(true)
    }, 200)
  })
}

export async function getAllActivePartners(): Promise<CityPartner[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const active = cityPartners.filter((p) => p.status === 'active')
      resolve(active)
    }, 100)
  })
}

function filterSplitRecords(
  records: typeof splitRecords,
  query: SplitRecordListQuery,
): typeof splitRecords {
  return records.filter((r) => {
    if (query.startDate) {
      const d = r.tradeTime.slice(0, 10)
      if (d < query.startDate) return false
    }
    if (query.endDate) {
      const d = r.tradeTime.slice(0, 10)
      if (d > query.endDate) return false
    }
    if (query.partnerId && r.partnerId !== query.partnerId) return false
    if (query.status && r.status !== query.status) return false
    return true
  })
}

export async function getSplitRecordStats(): Promise<SplitRecordStatsData> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(computeSplitStats(splitRecords)), 200)
  })
}

export async function getSplitRecordList(
  query: SplitRecordListQuery,
): Promise<SplitRecordListData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const page = query.page ?? 1
      const pageSize = query.pageSize ?? 10

      const filtered = filterSplitRecords(splitRecords, query)
      const total = filtered.length
      const start = (page - 1) * pageSize
      const list = filtered.slice(start, start + pageSize)

      resolve({ list, total, page, pageSize })
    }, 200)
  })
}
