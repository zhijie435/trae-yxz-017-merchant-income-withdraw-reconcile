import type {
  WithdrawRecord,
  WithdrawRecordStatsData,
  WithdrawRecordListData,
  WithdrawRecordListQuery,
  WithdrawForm,
  WithdrawSubmitResult,
} from '../../shared/types.js'
import {
  mockWithdrawRecords,
  computeWithdrawStats,
  minWithdrawAmount,
  maxWithdrawAmount,
  calculateFee,
} from '../data/mockWithdraw.js'
import XLSX from 'xlsx'

export async function getWithdrawStats(): Promise<WithdrawRecordStatsData> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(computeWithdrawStats()), 200)
  })
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function filterRecords(
  records: WithdrawRecord[],
  query: WithdrawRecordListQuery,
): WithdrawRecord[] {
  return records.filter((r) => {
    if (query.startDate) {
      const d = r.applyTime.slice(0, 10)
      if (d < query.startDate) return false
    }
    if (query.endDate) {
      const d = r.applyTime.slice(0, 10)
      if (d > query.endDate) return false
    }
    if (query.status && r.status !== query.status) return false
    return true
  })
}

export async function getWithdrawList(
  query: WithdrawRecordListQuery,
): Promise<WithdrawRecordListData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const page = query.page ?? 1
      const pageSize = query.pageSize ?? 10

      const filtered = filterRecords(mockWithdrawRecords, query)
      const total = filtered.length
      const start = (page - 1) * pageSize
      const list = filtered.slice(start, start + pageSize)

      resolve({ list, total, page, pageSize })
    }, 200)
  })
}

export async function submitWithdraw(form: WithdrawForm): Promise<WithdrawSubmitResult> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (form.amount < minWithdrawAmount) {
        reject(new Error(`提现金额不能低于 ${minWithdrawAmount / 100} 元`))
        return
      }
      if (form.amount > maxWithdrawAmount) {
        reject(new Error(`提现金额不能高于 ${maxWithdrawAmount / 100} 元`))
        return
      }
      if (!form.bankAccountId) {
        reject(new Error('请选择收款账户'))
        return
      }

      const now = new Date()
      const idxStr = (mockWithdrawRecords.length + 1).toString().padStart(4, '0')
      const id = `WD${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${idxStr}`
      const fee = calculateFee(form.amount)

      const result: WithdrawSubmitResult = {
        id,
        withdrawNo: id,
        amount: form.amount,
        fee,
        actualAmount: form.amount - fee,
        status: 'pending',
      }

      resolve(result)
    }, 500)
  })
}

export async function exportWithdrawExcel(
  query: WithdrawRecordListQuery,
): Promise<Buffer> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = filterRecords(mockWithdrawRecords, query)

      const statusMap: Record<string, string> = {
        pending: '待处理',
        processing: '处理中',
        success: '成功',
        failed: '失败',
        cancelled: '已取消',
      }

      const filterInfo: string[] = ['导出筛选条件：']
      if (query.startDate) filterInfo.push(`开始日期：${query.startDate}`)
      if (query.endDate) filterInfo.push(`结束日期：${query.endDate}`)
      if (query.status) filterInfo.push(`状态：${statusMap[query.status] || query.status}`)
      filterInfo.push(`导出记录数：${filtered.length} 条`)
      filterInfo.push(`导出时间：${new Date().toLocaleString('zh-CN')}`)

      const aoaData: (string | number)[][] = []

      for (const info of filterInfo) {
        aoaData.push([info])
      }

      aoaData.push([])

      aoaData.push([
        '提现单号',
        '申请时间',
        '收款银行',
        '收款支行',
        '收款账号',
        '提现金额（元）',
        '手续费（元）',
        '实际到账（元）',
        '状态',
        '完成时间',
        '备注',
      ])

      for (const r of filtered) {
        aoaData.push([
          r.withdrawNo,
          r.applyTime.slice(0, 19).replace('T', ' '),
          r.bankName,
          r.bankBranch,
          r.accountNo,
          (r.amount / 100).toFixed(2),
          (r.fee / 100).toFixed(2),
          (r.actualAmount / 100).toFixed(2),
          statusMap[r.status] || r.status,
          r.completeTime ? r.completeTime.slice(0, 19).replace('T', ' ') : '',
          r.remark || r.failReason || '',
        ])
      }

      const ws = XLSX.utils.aoa_to_sheet(aoaData)
      ws['!cols'] = [
        { wch: 22 }, { wch: 20 }, { wch: 16 }, { wch: 20 }, { wch: 22 },
        { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 20 }, { wch: 30 },
      ]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '提现记录')

      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      resolve(Buffer.from(buf as unknown as Uint8Array))
    }, 500)
  })
}

export function getWithdrawExportFileName(): string {
  const now = new Date()
  return `提现记录_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}.xlsx`
}
