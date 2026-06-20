import type {
  RevenueStatsData,
  RevenueRecord,
  RevenueListData,
  RevenueListQuery,
} from '../../shared/types.js'
import {
  mockRevenueRecords,
  computeStats,
} from '../data/mockRevenue.js'
import XLSX from 'xlsx'

/**
 * 获取收益统计
 */
export async function getRevenueStats(): Promise<RevenueStatsData> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(computeStats()), 200)
  })
}

/**
 * 根据筛选条件过滤记录
 */
function filterRecords(
  records: RevenueRecord[],
  query: RevenueListQuery,
): RevenueRecord[] {
  return records.filter((r) => {
    if (query.startDate) {
      const date = new Date(r.tradeTime)
      const d = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
      if (d < query.startDate) return false
    }
    if (query.endDate) {
      const date = new Date(r.tradeTime)
      const d = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
      if (d > query.endDate) return false
    }
    if (query.type && r.type !== query.type) return false
    if (query.status && r.status !== query.status) return false
    return true
  })
}

/**
 * 获取收益明细列表（支持分页与筛选）
 */
export async function getRevenueList(
  query: RevenueListQuery,
): Promise<RevenueListData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const page = query.page ?? 1
      const pageSize = query.pageSize ?? 10

      const filtered = filterRecords(mockRevenueRecords, query)
      const total = filtered.length
      const start = (page - 1) * pageSize
      const list = filtered.slice(start, start + pageSize)

      resolve({ list, total, page, pageSize })
    }, 200)
  })
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

/**
 * 导出收益明细 Excel
 */
export async function exportRevenueExcel(
  query: RevenueListQuery,
): Promise<Buffer> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = filterRecords(mockRevenueRecords, query)

      const statusMap: Record<string, string> = {
        success: '成功',
        pending: '处理中',
        failed: '失败',
      }

      const filterInfo: string[] = ['导出筛选条件：']
      if (query.startDate) filterInfo.push(`开始日期：${query.startDate}`)
      if (query.endDate) filterInfo.push(`结束日期：${query.endDate}`)
      if (query.type) filterInfo.push(`收益类型：${query.type}`)
      if (query.status) filterInfo.push(`状态：${statusMap[query.status] || query.status}`)
      filterInfo.push(`导出记录数：${filtered.length} 条`)
      filterInfo.push(`导出时间：${new Date().toLocaleString('zh-CN')}`)

      const aoaData: (string | number)[][] = []

      for (const info of filterInfo) {
        aoaData.push([info])
      }

      aoaData.push([])

      aoaData.push([
        '收益单号',
        '关联订单',
        '交易时间',
        '收益类型',
        '金额（元）',
        '状态',
        '备注',
      ])

      for (const r of filtered) {
        const date = new Date(r.tradeTime)
        const formattedTime = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
        aoaData.push([
          r.id,
          r.orderNo,
          formattedTime,
          r.type,
          (r.amount / 100).toFixed(2),
          statusMap[r.status] || r.status,
          r.remark,
        ])
      }

      const ws = XLSX.utils.aoa_to_sheet(aoaData)
      ws['!cols'] = [
        { wch: 20 },
        { wch: 20 },
        { wch: 22 },
        { wch: 12 },
        { wch: 14 },
        { wch: 10 },
        { wch: 30 },
      ]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '收益明细')

      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      resolve(Buffer.from(buf as unknown as Uint8Array))
    }, 500)
  })
}

export function getExportFileName(): string {
  const now = new Date()
  return `收益明细_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}.xlsx`
}
