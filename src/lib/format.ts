/**
 * 金额格式化工具
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
