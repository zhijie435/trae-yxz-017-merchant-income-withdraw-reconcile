import type {
  RevenueStatsData,
  RevenueRecord,
  RevenueRecordStatus,
} from '../../shared/types.js'

const TYPES = ['订单收益', '订单收益', '订单收益', '订单收益', '退款', '补贴', '其他']
const STATUSES: RevenueRecordStatus[] = ['success', 'success', 'success', 'success', 'pending', 'failed']
const REMARKS: Record<string, string[]> = {
  '订单收益': ['用户订单支付完成', '到店消费结算', '小程序订单完成', '外卖订单结算', '会员订单支付'],
  '退款': ['用户申请退款', '售后退款处理', '取消订单退款', '部分退款'],
  '补贴': ['平台活动补贴', '新用户首单补贴', '节日营销补贴', '渠道返佣'],
  '其他': ['手续费调整', '对账调整', '服务费结算', '异常订单补款'],
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.000Z`
}

function generateRecord(index: number, date: Date): RevenueRecord {
  const type = TYPES[index % TYPES.length]
  const status = STATUSES[index % STATUSES.length]
  const remarks = REMARKS[type] || ['常规收益']
  const remark = remarks[index % remarks.length]

  let amount: number
  if (type === '退款') {
    amount = -(Math.floor(Math.random() * 20000) + 1000)
  } else if (type === '补贴') {
    amount = Math.floor(Math.random() * 5000) + 500
  } else {
    amount = Math.floor(Math.random() * 80000) + 2000
  }

  const idxStr = (index + 1).toString().padStart(4, '0')
  return {
    id: `RV${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${idxStr}`,
    orderNo: `DD${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${Math.floor(Math.random() * 90000 + 10000)}`,
    tradeTime: formatDate(date),
    type,
    amount,
    status,
    remark,
  }
}

function generateRecords(): RevenueRecord[] {
  const records: RevenueRecord[] = []
  const today = new Date(Date.UTC(2026, 5, 20))

  for (let dayOffset = 0; dayOffset < 90; dayOffset++) {
    const date = new Date(today)
    date.setUTCDate(today.getUTCDate() - dayOffset)
    const count = Math.floor(Math.random() * 10) + 8

    for (let i = 0; i < count; i++) {
      const hour = Math.floor(Math.random() * 14) + 8
      const minute = Math.floor(Math.random() * 60)
      date.setUTCHours(hour, minute, 0, 0)
      records.push(generateRecord(records.length, date))
    }
  }

  records.sort((a, b) => b.tradeTime.localeCompare(a.tradeTime))
  return records
}

export const mockRevenueRecords: RevenueRecord[] = generateRecords()

export function computeStats(): RevenueStatsData {
  const today = new Date(Date.UTC(2026, 5, 20))
  const todayStr = `${today.getUTCFullYear()}-${pad(today.getUTCMonth() + 1)}-${pad(today.getUTCDate())}`
  const monthStartStr = `${today.getUTCFullYear()}-${pad(today.getUTCMonth() + 1)}-01`

  let todayRevenue = 0
  let monthRevenue = 0
  let totalRevenue = 0
  let recordCount = 0

  for (const r of mockRevenueRecords) {
    if (r.status !== 'success') continue
    const d = r.tradeTime.slice(0, 10)
    if (d === todayStr) todayRevenue += r.amount
    if (d >= monthStartStr) monthRevenue += r.amount
    totalRevenue += r.amount
    recordCount++
  }

  return {
    recordCount,
    todayRevenue,
    monthRevenue,
    totalRevenue,
  }
}

export const mockRevenueStats: RevenueStatsData = computeStats()

export const revenueTypeOptions = ['订单收益', '退款', '补贴', '其他']
export const revenueStatusOptions = [
  { value: 'success', label: '成功' },
  { value: 'pending', label: '处理中' },
  { value: 'failed', label: '失败' },
]
