import type {
  WithdrawRecord,
  WithdrawRecordStatsData,
  WithdrawStatus,
} from '../../shared/types.js'

const STATUSES: WithdrawStatus[] = [
  'success', 'success', 'success', 'success', 'success',
  'processing', 'pending', 'failed', 'cancelled',
]

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.000Z`
}

const BANK_OPTIONS = [
  { name: '中国工商银行', branch: '南京新街口支行', accountNo: '6222021234567890', accountName: '南京新街口旗舰店' },
  { name: '中国建设银行', branch: '南京珠江路支行', accountNo: '6227001234567891', accountName: '南京新街口旗舰店' },
  { name: '招商银行', branch: '南京鼓楼支行', accountNo: '6225881234567892', accountName: '南京新街口旗舰店' },
]

function generateRecord(index: number, date: Date): WithdrawRecord {
  const status = STATUSES[index % STATUSES.length]
  const bank = BANK_OPTIONS[index % BANK_OPTIONS.length]
  const amount = (Math.floor(Math.random() * 500) + 100) * 100
  const fee = Math.floor(amount * 0.001)
  const actualAmount = amount - fee

  const idxStr = (index + 1).toString().padStart(4, '0')
  const id = `WD${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${idxStr}`

  let processTime: string | undefined
  let completeTime: string | undefined
  let failReason: string | undefined

  if (status === 'processing' || status === 'success' || status === 'failed') {
    const pt = new Date(date)
    pt.setMinutes(pt.getMinutes() + 30)
    processTime = formatDate(pt)
  }
  if (status === 'success' || status === 'failed') {
    const ct = new Date(date)
    ct.setHours(ct.getHours() + 2)
    completeTime = formatDate(ct)
  }
  if (status === 'failed') {
    failReason = '银行账户信息有误，请核对后重新提现'
  }

  return {
    id,
    withdrawNo: id,
    amount,
    fee,
    actualAmount,
    bankAccountId: `BA${(index % 3 + 1).toString().padStart(6, '0')}`,
    bankAccountName: bank.accountName,
    bankName: bank.name,
    bankBranch: bank.branch,
    accountNo: bank.accountNo,
    status,
    applyTime: formatDate(date),
    processTime,
    completeTime,
    remark: status === 'cancelled' ? '用户主动取消' : undefined,
    failReason,
  }
}

function generateRecords(): WithdrawRecord[] {
  const records: WithdrawRecord[] = []
  const today = new Date(Date.UTC(2026, 5, 20))

  for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
    const date = new Date(today)
    date.setUTCDate(today.getUTCDate() - dayOffset)
    const count = Math.floor(Math.random() * 3) + 1

    for (let i = 0; i < count; i++) {
      const hour = Math.floor(Math.random() * 10) + 9
      const minute = Math.floor(Math.random() * 60)
      date.setUTCHours(hour, minute, 0, 0)
      records.push(generateRecord(records.length, date))
    }
  }

  records.sort((a, b) => b.applyTime.localeCompare(a.applyTime))
  return records
}

export const mockWithdrawRecords: WithdrawRecord[] = generateRecords()

export function computeWithdrawStats(): WithdrawRecordStatsData {
  const today = new Date(Date.UTC(2026, 5, 20))
  const todayStr = `${today.getUTCFullYear()}-${pad(today.getUTCMonth() + 1)}-${pad(today.getUTCDate())}`
  const monthStartStr = `${today.getUTCFullYear()}-${pad(today.getUTCMonth() + 1)}-01`

  let todayWithdrawAmount = 0
  let monthWithdrawAmount = 0
  let totalWithdrawAmount = 0
  let recordCount = 0
  let processingCount = 0

  for (const r of mockWithdrawRecords) {
    if (r.status === 'failed' || r.status === 'cancelled') continue
    const d = r.applyTime.slice(0, 10)
    if (d === todayStr) todayWithdrawAmount += r.amount
    if (d >= monthStartStr) monthWithdrawAmount += r.amount
    totalWithdrawAmount += r.amount
    recordCount++
    if (r.status === 'pending' || r.status === 'processing') processingCount++
  }

  return {
    recordCount,
    todayWithdrawAmount,
    monthWithdrawAmount,
    totalWithdrawAmount,
    processingCount,
  }
}

export const mockWithdrawStats: WithdrawRecordStatsData = computeWithdrawStats()

export const withdrawFeeRate = 0.001
export const minWithdrawAmount = 100
export const maxWithdrawAmount = 5000000

export function maskAccountNo(accountNo: string): string {
  if (accountNo.length <= 8) return accountNo
  const head = accountNo.slice(0, 4)
  const tail = accountNo.slice(-4)
  const middle = '*'.repeat(Math.max(4, accountNo.length - 8))
  return `${head} ${middle} ${tail}`
}

export function calculateFee(amount: number): number {
  return Math.floor(amount * withdrawFeeRate)
}
