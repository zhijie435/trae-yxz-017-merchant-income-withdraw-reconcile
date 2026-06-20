import type {
  BankAccount,
  BankAccountForm,
  BankAccountListData,
  BankAccountListQuery,
} from '../../shared/types.js'
import { mockBankAccounts } from '../data/mockBankAccount.js'

let bankAccounts = [...mockBankAccounts]

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function generateAccountId(): string {
  const now = new Date()
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const random = Math.floor(Math.random() * 9000 + 1000)
  return `BA${timestamp}${random}`
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.000Z`
}

function filterAccounts(
  accounts: BankAccount[],
  query: BankAccountListQuery,
): BankAccount[] {
  return accounts.filter((a) => {
    if (query.type && a.type !== query.type) return false
    if (query.status && a.status !== query.status) return false
    if (query.keyword) {
      const kw = query.keyword.toLowerCase()
      if (
        !a.accountName.toLowerCase().includes(kw) &&
        !a.accountNo.includes(kw) &&
        !(a.bankName || '').toLowerCase().includes(kw) &&
        !a.bankBranch.toLowerCase().includes(kw)
      ) {
        return false
      }
    }
    return true
  })
}

function clearOtherDefaults(exceptId?: string): void {
  for (const acc of bankAccounts) {
    if (acc.id !== exceptId && acc.isDefault) {
      acc.isDefault = false
    }
  }
}

export async function getBankAccountList(
  query: BankAccountListQuery,
): Promise<BankAccountListData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const page = query.page ?? 1
      const pageSize = query.pageSize ?? 10

      const filtered = filterAccounts(bankAccounts, query)
      const total = filtered.length
      const start = (page - 1) * pageSize
      const list = filtered.slice(start, start + pageSize)

      resolve({ list, total, page, pageSize })
    }, 200)
  })
}

export async function getBankAccount(id: string): Promise<BankAccount | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const account = bankAccounts.find((a) => a.id === id) || null
      resolve(account)
    }, 100)
  })
}

export async function getDefaultBankAccount(): Promise<BankAccount | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const account =
        bankAccounts.find((a) => a.isDefault && a.status === 'active') ||
        bankAccounts.find((a) => a.status === 'active') ||
        null
      resolve(account)
    }, 100)
  })
}

export async function createBankAccount(
  form: BankAccountForm,
): Promise<BankAccount> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (form.isDefault) {
        clearOtherDefaults()
      }
      const newAccount: BankAccount = {
        id: generateAccountId(),
        accountName: form.accountName,
        bankBranch: form.bankBranch,
        accountNo: form.accountNo,
        bankName: form.bankName,
        type: form.type,
        isDefault: form.isDefault,
        status: form.status,
        createdAt: formatDate(new Date()),
        remark: form.remark,
      }
      bankAccounts.unshift(newAccount)
      resolve(newAccount)
    }, 200)
  })
}

export async function updateBankAccount(
  id: string,
  form: BankAccountForm,
): Promise<BankAccount | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = bankAccounts.findIndex((a) => a.id === id)
      if (index === -1) {
        resolve(null)
        return
      }
      if (form.isDefault) {
        clearOtherDefaults(id)
      }
      const updated: BankAccount = {
        ...bankAccounts[index],
        accountName: form.accountName,
        bankBranch: form.bankBranch,
        accountNo: form.accountNo,
        bankName: form.bankName,
        type: form.type,
        isDefault: form.isDefault,
        status: form.status,
        remark: form.remark,
      }
      bankAccounts[index] = updated
      resolve(updated)
    }, 200)
  })
}

export async function setDefaultBankAccount(id: string): Promise<BankAccount | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = bankAccounts.findIndex((a) => a.id === id)
      if (index === -1) {
        resolve(null)
        return
      }
      clearOtherDefaults(id)
      bankAccounts[index] = { ...bankAccounts[index], isDefault: true }
      resolve(bankAccounts[index])
    }, 200)
  })
}

export async function deleteBankAccount(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = bankAccounts.findIndex((a) => a.id === id)
      if (index === -1) {
        resolve(false)
        return
      }
      const wasDefault = bankAccounts[index].isDefault
      bankAccounts.splice(index, 1)
      if (wasDefault) {
        const firstActive = bankAccounts.find((a) => a.status === 'active')
        if (firstActive) firstActive.isDefault = true
      }
      resolve(true)
    }, 200)
  })
}
