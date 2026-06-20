import type {
  CityPartner,
  SplitRecord,
  SplitRecordStatus,
  SplitRecordStatsData,
} from '../../shared/types.js'

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.000Z`
}

const CITIES = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安', '重庆']
const NAMES = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二']
const RATIOS = [10, 15, 20, 25, 30, 12, 18, 22, 28, 8]

function generatePartner(index: number): CityPartner {
  const date = new Date(Date.UTC(2025, 0, 1))
  date.setUTCDate(date.getUTCDate() + index * 15)

  return {
    id: `CP${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${(index + 1).toString().padStart(4, '0')}`,
    name: NAMES[index % NAMES.length],
    phone: `138${Math.floor(Math.random() * 90000000 + 10000000)}`,
    city: CITIES[index % CITIES.length],
    splitRatio: RATIOS[index % RATIOS.length],
    status: index % 5 === 4 ? 'inactive' : 'active',
    createdAt: formatDate(date),
    remark: index % 3 === 0 ? '核心合作伙伴' : undefined,
  }
}

function generatePartners(): CityPartner[] {
  const partners: CityPartner[] = []
  for (let i = 0; i < 15; i++) {
    partners.push(generatePartner(i))
  }
  partners.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return partners
}

export const mockCityPartners: CityPartner[] = generatePartners()

const STATUSES: SplitRecordStatus[] = ['success', 'success', 'success', 'success', 'pending', 'failed']
const REMARKS = ['订单分账结算', '月度分账', '季度分红', '活动收益分账', '补充分账']

function generateSplitRecord(index: number, date: Date, partner: CityPartner): SplitRecord {
  const status = STATUSES[index % STATUSES.length]
  const remark = REMARKS[index % REMARKS.length]
  const totalAmount = Math.floor(Math.random() * 100000) + 5000
  const splitAmount = Math.floor(totalAmount * partner.splitRatio / 100)

  const idxStr = (index + 1).toString().padStart(4, '0')
  return {
    id: `SP${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${idxStr}`,
    orderNo: `DD${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${Math.floor(Math.random() * 90000 + 10000)}`,
    partnerId: partner.id,
    partnerName: partner.name,
    tradeTime: formatDate(date),
    totalAmount,
    splitRatio: partner.splitRatio,
    splitAmount,
    status,
    remark,
  }
}

function generateSplitRecords(): SplitRecord[] {
  const records: SplitRecord[] = []
  const today = new Date(Date.UTC(2026, 5, 20))
  const activePartners = mockCityPartners.filter(p => p.status === 'active')

  for (let dayOffset = 0; dayOffset < 90; dayOffset++) {
    const date = new Date(today)
    date.setUTCDate(today.getUTCDate() - dayOffset)

    for (let i = 0; i < activePartners.length; i++) {
      if (Math.random() > 0.3) {
        const hour = Math.floor(Math.random() * 14) + 8
        const minute = Math.floor(Math.random() * 60)
        date.setUTCHours(hour, minute, 0, 0)
        records.push(generateSplitRecord(records.length, date, activePartners[i]))
      }
    }
  }

  records.sort((a, b) => b.tradeTime.localeCompare(a.tradeTime))
  return records
}

export const mockSplitRecords: SplitRecord[] = generateSplitRecords()

export function computeSplitStats(records: SplitRecord[]): SplitRecordStatsData {
  const today = new Date(Date.UTC(2026, 5, 20))
  const todayStr = `${today.getUTCFullYear()}-${pad(today.getUTCMonth() + 1)}-${pad(today.getUTCDate())}`
  const monthStartStr = `${today.getUTCFullYear()}-${pad(today.getUTCMonth() + 1)}-01`

  let todaySplitAmount = 0
  let monthSplitAmount = 0
  let totalSplitAmount = 0
  let recordCount = 0

  for (const r of records) {
    if (r.status !== 'success') continue
    const d = r.tradeTime.slice(0, 10)
    if (d === todayStr) todaySplitAmount += r.splitAmount
    if (d >= monthStartStr) monthSplitAmount += r.splitAmount
    totalSplitAmount += r.splitAmount
    recordCount++
  }

  return {
    recordCount,
    todaySplitAmount,
    monthSplitAmount,
    totalSplitAmount,
  }
}

export const mockSplitStats: SplitRecordStatsData = computeSplitStats(mockSplitRecords)

export const cityOptions = [...new Set(CITIES)].map(city => ({ value: city, label: city }))
export const partnerStatusOptions = [
  { value: 'active', label: '已启用' },
  { value: 'inactive', label: '已停用' },
]
export const splitStatusOptions = [
  { value: 'success', label: '成功' },
  { value: 'pending', label: '处理中' },
  { value: 'failed', label: '失败' },
]
