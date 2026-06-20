<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import {
  CreditCard, Plus, Search, Edit2, Trash2, X, CheckCircle, XCircle,
  RefreshCw, AlertCircle, Star, Building2, User, Hash, FileText, ChevronLeft, ChevronRight,
} from 'lucide-vue-next'
import { useBankAccount } from '@/composables/useBankAccount'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  bankNameOptions,
  bankTypeOptions,
  bankAccountStatusOptions,
  bankTypeLabelMap,
  bankAccountStatusLabelMap,
} from '@/lib/constants'
import type { BankAccountForm, BankAccount, BankAccountType, BankAccountStatus } from '../../shared/types'

const {
  list,
  listLoading,
  listError,
  submitting,
  submitError,
  deleting,
  settingDefault,
  fetchList,
  create,
  update,
  setDefault,
  remove,
} = useBankAccount()

const query = reactive({
  page: 1,
  pageSize: 10,
  type: '',
  status: '',
  keyword: '',
})

const showModal = ref(false)
const editingAccount = ref<BankAccount | null>(null)
const showDeleteConfirm = ref(false)
const deletingId = ref('')
const deleteSuccess = ref(false)
const setDefaultSuccessId = ref('')

const form = reactive<BankAccountForm>({
  accountName: '',
  bankName: '',
  bankBranch: '',
  accountNo: '',
  type: 'debit',
  isDefault: false,
  status: 'active',
  remark: '',
})

const formErrors = reactive<Record<string, string>>({})

const totalPages = computed(() => {
  if (!list.value) return 0
  return Math.max(1, Math.ceil(list.value.total / list.value.pageSize))
})

const pageNumbers = computed(() => {
  if (!list.value) return []
  const current = list.value.page
  const total = totalPages.value
  const pages: (number | '...')[] = []
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
})

function maskAccountNo(accountNo: string): string {
  if (accountNo.length <= 8) return accountNo
  const head = accountNo.slice(0, 4)
  const tail = accountNo.slice(-4)
  const middle = '*'.repeat(Math.max(4, accountNo.length - 8))
  return `${head} ${middle} ${tail}`
}

function openCreateModal() {
  editingAccount.value = null
  resetForm()
  showModal.value = true
}

function openEditModal(account: BankAccount) {
  editingAccount.value = account
  form.accountName = account.accountName
  form.bankName = account.bankName || ''
  form.bankBranch = account.bankBranch
  form.accountNo = account.accountNo
  form.type = account.type
  form.isDefault = account.isDefault
  form.status = account.status
  form.remark = account.remark || ''
  showModal.value = true
}

function resetForm() {
  form.accountName = ''
  form.bankName = ''
  form.bankBranch = ''
  form.accountNo = ''
  form.type = 'debit'
  form.isDefault = false
  form.status = 'active'
  form.remark = ''
  Object.keys(formErrors).forEach(key => {
    formErrors[key] = ''
  })
}

function validateForm(): boolean {
  let valid = true
  Object.keys(formErrors).forEach(key => {
    formErrors[key] = ''
  })

  if (!form.accountName.trim()) {
    formErrors.accountName = '请输入收款名称'
    valid = false
  }
  if (!form.bankName) {
    formErrors.bankName = '请选择开户银行'
    valid = false
  }
  if (!form.bankBranch.trim()) {
    formErrors.bankBranch = '请输入收款支行'
    valid = false
  }
  if (!form.accountNo.trim()) {
    formErrors.accountNo = '请输入收款账号'
    valid = false
  } else if (!/^\d{8,30}$/.test(form.accountNo.replace(/\s+/g, ''))) {
    formErrors.accountNo = '收款账号须为 8-30 位数字'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validateForm()) return

  let result: BankAccount | null = null

  if (editingAccount.value) {
    result = await update(editingAccount.value.id, form)
  } else {
    result = await create(form)
  }

  if (result) {
    showModal.value = false
    loadList()
  }
}

function openDeleteConfirm(id: string) {
  deletingId.value = id
  deleteSuccess.value = false
  showDeleteConfirm.value = true
}

async function handleDelete() {
  const success = await remove(deletingId.value)
  if (success) {
    deleteSuccess.value = true
    setTimeout(() => {
      showDeleteConfirm.value = false
      loadList()
    }, 800)
  }
}

async function handleSetDefault(account: BankAccount) {
  if (account.isDefault) return
  const success = await setDefault(account.id)
  if (success) {
    setDefaultSuccessId.value = account.id
    setTimeout(() => {
      setDefaultSuccessId.value = ''
    }, 1500)
    loadList()
  }
}

function loadList() {
  fetchList({ ...query })
}

function handleSearch() {
  query.page = 1
  loadList()
}

function handleReset() {
  query.type = ''
  query.status = ''
  query.keyword = ''
  query.page = 1
  loadList()
}

function goPage(p: number) {
  query.page = p
  loadList()
}

function goPrev() {
  if (list.value && list.value.page > 1) {
    query.page = list.value.page - 1
    loadList()
  }
}

function goNext() {
  if (list.value && list.value.page < totalPages.value) {
    query.page = list.value.page + 1
    loadList()
  }
}

const statusBadgeClassMap: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  inactive: 'bg-zinc-100 text-zinc-600 ring-zinc-500/20',
}

const typeBadgeClassMap: Record<string, string> = {
  debit: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  credit: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  public: 'bg-amber-50 text-amber-700 ring-amber-600/20',
}

onMounted(() => {
  loadList()
})
</script>

<template>
  <div class="min-h-screen bg-zinc-50">
    <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section>
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold text-zinc-800">收款账户管理</h1>
            <p class="mt-1 text-sm text-zinc-400">管理银行卡/收款账户信息，用于提现到账</p>
          </div>
          <div class="flex items-center gap-3">
            <button
              type="button"
              :disabled="listLoading"
              class="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              @click="loadList"
            >
              <RefreshCw
                class="h-4 w-4"
                :class="{ 'animate-spin': listLoading }"
                :stroke-width="2"
              />
              刷新
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
              @click="openCreateModal"
            >
              <Plus class="h-4 w-4" :stroke-width="2" />
              新增账户
            </button>
          </div>
        </div>

        <div
          v-if="listError"
          class="mb-6 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4"
        >
          <AlertCircle class="h-5 w-5 shrink-0 text-red-500" :stroke-width="2" />
          <span class="text-sm text-red-600">{{ listError }}</span>
          <button
            type="button"
            class="ml-auto text-sm font-medium text-red-600 underline"
            @click="loadList"
          >
            重试
          </button>
        </div>

        <div class="mb-6 rounded-2xl border border-zinc-100 bg-white p-5 shadow-card">
          <div class="flex flex-wrap items-end gap-4">
            <div class="flex-1 min-w-[220px]">
              <label class="mb-1.5 block text-sm font-medium text-zinc-600">关键词搜索</label>
              <div class="relative">
                <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" :stroke-width="2" />
                <input
                  v-model="query.keyword"
                  type="text"
                  placeholder="搜索收款名称、账号、银行、支行"
                  class="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-800 placeholder-zinc-400 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  @keyup.enter="handleSearch"
                />
              </div>
            </div>
            <div class="min-w-[140px]">
              <label class="mb-1.5 block text-sm font-medium text-zinc-600">账户类型</label>
              <select
                v-model="query.type"
                class="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">全部类型</option>
                <option v-for="opt in bankTypeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div class="min-w-[140px]">
              <label class="mb-1.5 block text-sm font-medium text-zinc-600">状态</label>
              <select
                v-model="query.status"
                class="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">全部状态</option>
                <option v-for="opt in bankAccountStatusOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                @click="handleSearch"
              >
                查询
              </button>
              <button
                type="button"
                class="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm transition hover:bg-zinc-50"
                @click="handleReset"
              >
                重置
              </button>
            </div>
          </div>
        </div>

        <div class="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-card">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-zinc-100 text-sm">
              <thead class="bg-zinc-50">
                <tr>
                  <th class="px-5 py-3 text-left font-medium text-zinc-500">账户编号</th>
                  <th class="px-5 py-3 text-left font-medium text-zinc-500">收款名称</th>
                  <th class="px-5 py-3 text-left font-medium text-zinc-500">开户银行</th>
                  <th class="px-5 py-3 text-left font-medium text-zinc-500">收款支行</th>
                  <th class="px-5 py-3 text-left font-medium text-zinc-500">收款账号</th>
                  <th class="px-5 py-3 text-left font-medium text-zinc-500">类型</th>
                  <th class="px-5 py-3 text-left font-medium text-zinc-500">默认</th>
                  <th class="px-5 py-3 text-left font-medium text-zinc-500">状态</th>
                  <th class="px-5 py-3 text-left font-medium text-zinc-500">创建时间</th>
                  <th class="px-5 py-3 text-center font-medium text-zinc-500">操作</th>
                </tr>
              </thead>
              <tbody v-if="!listLoading && list" class="divide-y divide-zinc-50">
                <tr v-for="row in list.list" :key="row.id" class="transition hover:bg-zinc-50/70">
                  <td class="px-5 py-4 font-mono text-xs text-zinc-600">{{ row.id }}</td>
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-2">
                      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                        <CreditCard class="h-4 w-4" :stroke-width="2" />
                      </div>
                      <span class="font-medium text-zinc-800">{{ row.accountName }}</span>
                    </div>
                  </td>
                  <td class="px-5 py-4 text-zinc-700">{{ row.bankName || '-' }}</td>
                  <td class="px-5 py-4 text-zinc-700">{{ row.bankBranch }}</td>
                  <td class="px-5 py-4 font-mono text-zinc-600">{{ maskAccountNo(row.accountNo) }}</td>
                  <td class="px-5 py-4">
                    <span
                      :class="cn(
                        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
                        typeBadgeClassMap[row.type],
                      )"
                    >
                      {{ bankTypeLabelMap[row.type] }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <button
                      v-if="!row.isDefault"
                      type="button"
                      :disabled="settingDefault"
                      :title="row.status === 'active' ? '设为默认' : '启用后可设为默认'"
                      :class="cn(
                        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition',
                        row.status === 'active'
                          ? 'bg-zinc-100 text-zinc-500 hover:bg-amber-50 hover:text-amber-700'
                          : 'bg-zinc-50 text-zinc-300 cursor-not-allowed',
                      )"
                      @click="row.status === 'active' && handleSetDefault(row)"
                    >
                      <Star class="h-3 w-3" :stroke-width="2" />
                      设为默认
                    </button>
                    <span
                      v-else
                      class="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20"
                    >
                      <Star class="h-3 w-3 fill-amber-500 text-amber-500" :stroke-width="2" />
                      默认账户
                    </span>
                    <span
                      v-if="setDefaultSuccessId === row.id"
                      class="ml-2 text-xs text-emerald-600"
                    >
                      已设置
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <span
                      :class="cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                        statusBadgeClassMap[row.status],
                      )"
                    >
                      <component
                        :is="row.status === 'active' ? CheckCircle : XCircle"
                        class="h-3 w-3"
                        :stroke-width="2"
                      />
                      {{ bankAccountStatusLabelMap[row.status] }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-zinc-600">{{ formatDate(row.createdAt) }}</td>
                  <td class="px-5 py-4">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-brand-600"
                        @click="openEditModal(row)"
                      >
                        <Edit2 class="h-4 w-4" :stroke-width="2" />
                      </button>
                      <button
                        type="button"
                        class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-50 hover:text-red-600"
                        @click="openDeleteConfirm(row.id)"
                      >
                        <Trash2 class="h-4 w-4" :stroke-width="2" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="list.list.length === 0">
                  <td colspan="10" class="px-5 py-16 text-center text-sm text-zinc-400">
                    暂无收款账户
                  </td>
                </tr>
              </tbody>
              <tbody v-else-if="listLoading">
                <tr>
                  <td colspan="10" class="px-5 py-16">
                    <div class="flex flex-col items-center justify-center gap-3 text-zinc-400">
                      <div class="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-brand-600" />
                      <span class="text-sm">加载中...</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-if="list && list.total > 0"
            class="flex flex-col items-center justify-between gap-3 border-t border-zinc-100 bg-white/60 px-5 py-4 sm:flex-row"
          >
            <div class="text-xs text-zinc-500">
              共 {{ list.total }} 条记录，第 {{ list.page }} / {{ totalPages }} 页
            </div>
            <div class="flex items-center gap-1">
              <button
                type="button"
                :disabled="list.page <= 1"
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                @click="goPrev"
              >
                <ChevronLeft class="h-4 w-4" :stroke-width="2" />
              </button>
              <template v-for="(p, i) in pageNumbers" :key="`${p}-${i}`">
                <span v-if="p === '...'" class="px-2 text-sm text-zinc-400">...</span>
                <button
                  v-else
                  type="button"
                  :class="cn(
                    'inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm transition',
                    p === list.page
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50',
                  )"
                  @click="goPage(p as number)"
                >
                  {{ p }}
                </button>
              </template>
              <button
                type="button"
                :disabled="list.page >= totalPages"
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                @click="goNext"
              >
                <ChevronRight class="h-4 w-4" :stroke-width="2" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          @click.self="showModal = false"
        >
          <div class="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div class="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
              <h3 class="text-lg font-bold text-zinc-800">
                {{ editingAccount ? '编辑收款账户' : '新增收款账户' }}
              </h3>
              <button
                type="button"
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
                @click="showModal = false"
              >
                <X class="h-5 w-5" :stroke-width="2" />
              </button>
            </div>

            <div class="px-6 py-5 space-y-5">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-zinc-700">
                  收款名称 <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <User class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" :stroke-width="2" />
                  <input
                    v-model="form.accountName"
                    type="text"
                    placeholder="请输入收款名称（户名）"
                    :class="cn(
                      'w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm text-zinc-800 placeholder-zinc-400 shadow-sm transition focus:outline-none focus:ring-2',
                      formErrors.accountName
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-zinc-200 focus:border-brand-500 focus:ring-brand-500/20',
                    )"
                  />
                </div>
                <p v-if="formErrors.accountName" class="mt-1 text-xs text-red-500">
                  {{ formErrors.accountName }}
                </p>
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium text-zinc-700">
                  开户银行 <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <Building2 class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" :stroke-width="2" />
                  <select
                    v-model="form.bankName"
                    :class="cn(
                      'w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm text-zinc-800 shadow-sm transition focus:outline-none focus:ring-2',
                      formErrors.bankName
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-zinc-200 focus:border-brand-500 focus:ring-brand-500/20',
                    )"
                  >
                    <option value="">请选择开户银行</option>
                    <option v-for="opt in bankNameOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
                <p v-if="formErrors.bankName" class="mt-1 text-xs text-red-500">
                  {{ formErrors.bankName }}
                </p>
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium text-zinc-700">
                  收款支行 <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <Building2 class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" :stroke-width="2" />
                  <input
                    v-model="form.bankBranch"
                    type="text"
                    placeholder="请输入收款支行（如：南京新街口支行）"
                    :class="cn(
                      'w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm text-zinc-800 placeholder-zinc-400 shadow-sm transition focus:outline-none focus:ring-2',
                      formErrors.bankBranch
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-zinc-200 focus:border-brand-500 focus:ring-brand-500/20',
                    )"
                  />
                </div>
                <p v-if="formErrors.bankBranch" class="mt-1 text-xs text-red-500">
                  {{ formErrors.bankBranch }}
                </p>
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium text-zinc-700">
                  收款账号 <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <Hash class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" :stroke-width="2" />
                  <input
                    v-model="form.accountNo"
                    type="text"
                    inputmode="numeric"
                    placeholder="请输入收款账号（8-30位数字）"
                    :class="cn(
                      'w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm text-zinc-800 placeholder-zinc-400 shadow-sm transition focus:outline-none focus:ring-2',
                      formErrors.accountNo
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-zinc-200 focus:border-brand-500 focus:ring-brand-500/20',
                    )"
                  />
                </div>
                <p v-if="formErrors.accountNo" class="mt-1 text-xs text-red-500">
                  {{ formErrors.accountNo }}
                </p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-zinc-700">账户类型</label>
                  <select
                    v-model="form.type"
                    class="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option v-for="opt in bankTypeOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-zinc-700">状态</label>
                  <select
                    v-model="form.status"
                    class="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option v-for="opt in bankAccountStatusOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="flex items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="form.isDefault"
                    type="checkbox"
                    class="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span class="text-sm text-zinc-700">设为默认收款账户</span>
                </label>
                <span class="text-xs text-zinc-400">（提现时优先使用该账户）</span>
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium text-zinc-700">备注</label>
                <div class="relative">
                  <FileText class="absolute left-3 top-3 h-4 w-4 text-zinc-400" :stroke-width="2" />
                  <textarea
                    v-model="form.remark"
                    rows="3"
                    placeholder="请输入备注信息（选填）"
                    class="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-800 placeholder-zinc-400 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
                  />
                </div>
              </div>

              <div v-if="submitError" class="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3">
                <AlertCircle class="h-4 w-4 shrink-0 text-red-500" :stroke-width="2" />
                <span class="text-sm text-red-600">{{ submitError }}</span>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 border-t border-zinc-100 px-6 py-4">
              <button
                type="button"
                class="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm transition hover:bg-zinc-50"
                @click="showModal = false"
              >
                取消
              </button>
              <button
                type="button"
                :disabled="submitting"
                class="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
                @click="handleSubmit"
              >
                <span v-if="submitting" class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {{ submitting ? '提交中...' : '确认提交' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showDeleteConfirm"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          @click.self="showDeleteConfirm = false"
        >
          <div class="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div class="px-6 py-8 text-center">
              <div
                :class="cn(
                  'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full',
                  deleteSuccess ? 'bg-emerald-100' : 'bg-red-100',
                )"
              >
                <CheckCircle v-if="deleteSuccess" class="h-8 w-8 text-emerald-600" :stroke-width="2" />
                <AlertCircle v-else class="h-8 w-8 text-red-600" :stroke-width="2" />
              </div>
              <h3 class="text-lg font-bold text-zinc-800">
                {{ deleteSuccess ? '删除成功' : '确认删除' }}
              </h3>
              <p v-if="!deleteSuccess" class="mt-2 text-sm text-zinc-500">
                删除后无法恢复，确定要删除该收款账户吗？
              </p>
            </div>
            <div v-if="!deleteSuccess" class="flex items-center justify-center gap-3 border-t border-zinc-100 px-6 py-4">
              <button
                type="button"
                class="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm transition hover:bg-zinc-50"
                @click="showDeleteConfirm = false"
              >
                取消
              </button>
              <button
                type="button"
                :disabled="deleting"
                class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                @click="handleDelete"
              >
                <span v-if="deleting" class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {{ deleting ? '删除中...' : '确认删除' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
