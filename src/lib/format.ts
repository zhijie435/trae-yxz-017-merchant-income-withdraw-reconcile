/**
 * 通用格式化工具
 * 后端金额单位为「分」，前端展示换算为「元」
 */

/**
 * 将分转换为元的整数部分（带千分位）
 * @param cents 金额（分）
 * @returns 整数部分字符串，如 "12,867"
 */
export function formatCurrencyInteger(cents: number): string {
  const yuan = Math.floor(Math.abs(cents) / 100)
  return yuan.toLocaleString('zh-CN')
}

/**
 * 将分转换为元的小数部分（固定两位）
 * @param cents 金额（分）
 * @returns 小数部分字符串，如 "50"
 */
export function formatCurrencyDecimal(cents: number): string {
  return (Math.abs(cents) % 100).toString().padStart(2, '0')
}

/**
 * 将分转换为完整元金额字符串（带千分位与两位小数）
 * @param cents 金额（分）
 * @returns 格式化金额，如 "12,867.50"
 */
export function formatCurrency(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  return `${sign}${formatCurrencyInteger(cents)}.${formatCurrencyDecimal(cents)}`
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

/**
 * 格式化 ISO 时间字符串为 yyyy-MM-dd HH:mm:ss
 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/**
 * 格式化 ISO 时间字符串为 yyyy-MM-dd
 */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * 状态中文映射
 */
export const statusLabelMap: Record<string, string> = {
  success: '成功',
  pending: '处理中',
  failed: '失败',
}

export const withdrawStatusLabelMap: Record<string, string> = {
  pending: '待处理',
  processing: '处理中',
  success: '成功',
  failed: '失败',
  cancelled: '已取消',
}

export function calculateWithdrawFee(cents: number): number {
  return Math.floor(cents * 0.001)
}

export function maskBankAccount(accountNo: string): string {
  if (accountNo.length <= 8) return accountNo
  const head = accountNo.slice(0, 4)
  const tail = accountNo.slice(-4)
  const middle = '*'.repeat(Math.max(4, accountNo.length - 8))
  return `${head} ${middle} ${tail}`
}

