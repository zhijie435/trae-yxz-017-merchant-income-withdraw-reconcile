import type {
  BankAccount,
  BankAccountType,
  BankAccountStatus,
} from '../../shared/types.js'

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.000Z`
}

const ACCOUNT_NAMES = [
  '南京新街口旗舰店',
  '张三',
  '李四商贸有限公司',
  '王五个体经营部',
  '上海分公司',
]
const BANK_NAMES = [
  '中国工商银行',
  '中国农业银行',
  '中国银行',
  '中国建设银行',
  '招商银行',
  '交通银行',
  '中国邮政储蓄银行',
]
const BANK_BRANCHES = [
  '南京新街口支行',
  '上海浦东分行',
  '北京朝阳支行',
  '杭州西湖支行',
  '深圳福田支行',
  '成都春熙路支行',
  '广州天河支行',
]
const TYPES: BankAccountType[] = ['debit', 'credit', 'public']
const STATUSES: BankAccountStatus[] = ['active', 'inactive']

function generateAccountNo(index: number): string {
  const prefix = BANK_NAMES[index % BANK_NAMES.length] === '中国工商银行' ? '6222' : '6228'
  const random = Math.floor(Math.random() * 90000000 + 10000000)
  return `${prefix}${random}${(index + 1).toString().padStart(4, '0')}`
}

function generateAccount(index: number): BankAccount {
  const date = new Date(Date.UTC(2025, 0, 1))
  date.setUTCDate(date.getUTCDate() + index * 20)

  const type = TYPES[index % TYPES.length]
  const status = index % 6 === 5 ? 'inactive' : 'active'

  return {
    id: `BA${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${(index + 1).toString().padStart(4, '0')}`,
    accountName: ACCOUNT_NAMES[index % ACCOUNT_NAMES.length],
    bankName: BANK_NAMES[index % BANK_NAMES.length],
    bankBranch: BANK_BRANCHES[index % BANK_BRANCHES.length],
    accountNo: generateAccountNo(index),
    type,
    isDefault: index === 0,
    status,
    createdAt: formatDate(date),
    remark: index % 3 === 0 ? '主用账户' : undefined,
  }
}

function generateAccounts(): BankAccount[] {
  const accounts: BankAccount[] = []
  for (let i = 0; i < 12; i++) {
    accounts.push(generateAccount(i))
  }
  accounts.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return accounts
}

export const mockBankAccounts: BankAccount[] = generateAccounts()

export const bankTypeOptions = [
  { value: 'debit', label: '储蓄卡' },
  { value: 'credit', label: '信用卡' },
  { value: 'public', label: '对公账户' },
]

export const bankAccountStatusOptions = [
  { value: 'active', label: '已启用' },
  { value: 'inactive', label: '已停用' },
]

export const bankNameOptions = [...BANK_NAMES].map(name => ({ value: name, label: name }))

export const bankTypeLabelMap: Record<string, string> = {
  debit: '储蓄卡',
  credit: '信用卡',
  public: '对公账户',
}
