<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import {
  Users, Plus, Search, Edit2, Trash2, X, CheckCircle, XCircle, RefreshCw, AlertCircle, MapPin, Percent, Phone, FileText, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useCityPartner } from '@/composables/useCityPartner'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { cityOptions, partnerStatusOptions } from '@/lib/constants'
import type { CityPartnerForm, CityPartner } from '../../shared/types'

const {
  list,
  listLoading,
  listError,
  submitting,
  submitError,
  deleting,
  fetchList,
  create,
  update,
  remove,
} = useCityPartner()

const query = reactive({
  page: 1,
  pageSize: 10,
  city: '',
  status: '',
  keyword: '',
})

const showModal = ref(false)
const editingPartner = ref<CityPartner | null>(null)
const showDeleteConfirm = ref(false)
const deletingId = ref('')
const deleteSuccess = ref(false)

const form = reactive<CityPartnerForm>({
  name: '',
  phone: '',
  city: '',
  splitRatio: 20,
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

function openCreateModal() {
  editingPartner.value = null
  resetForm()
  showModal.value = true
}

function openEditModal(partner: CityPartner) {
  editingPartner.value = partner
  form.name = partner.name
  form.phone = partner.phone
  form.city = partner.city
  form.splitRatio = partner.splitRatio
  form.status = partner.status
  form.remark = partner.remark || ''
  showModal.value = true
}

function resetForm() {
  form.name = ''
  form.phone = ''
  form.city = ''
  form.splitRatio = 20
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

  if (!form.name.trim()) {
    formErrors.name = '请输入姓名'
    valid = false
  }
  if (!form.phone.trim()) {
    formErrors.phone = '请输入手机号'
    valid = false
  } else if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    formErrors.phone = '请输入正确的手机号'
    valid = false
  }
  if (!form.city) {
    formErrors.city = '请选择城市'
    valid = false
  }
  if (form.splitRatio < 0 || form.splitRatio > 100) {
    formErrors.splitRatio = '分账比例必须在 0-100 之间'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validateForm()) return

  let result: CityPartner | null = null

  if (editingPartner.value) {
    result = await update(editingPartner.value.id, form)
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

function loadList() {
  fetchList({ ...query })
}

function handleSearch() {
  query.page = 1
  loadList()
}

function handleReset() {
  query.city = ''
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

const statusLabelMap: Record<string, string> = {
  active: '已启用',
  inactive: '已停用',
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
            <h1 class="text-xl font-bold text-zinc-800">
              城市合伙人管理
            </h1>
            <p class="mt-1 text-sm text-zinc-400">
              管理城市合伙人信息及分账比例设置
            </p>
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
              <Plus
                class="h-4 w-4"
                :stroke-width="2"
              />
              新增合伙人
            </button>
          </div>
        </div>

        <div
          v-if="listError"
          class="mb-6 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4"
        >
          <AlertCircle
            class="h-5 w-5 shrink-0 text-red-500"
            :stroke-width="2"
          />
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
            <div class="flex-1 min-w-[200px]">
              <label class="mb-1.5 block text-sm font-medium text-zinc-600">关键词搜索</label>
              <div class="relative">
                <Search
                  class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                  :stroke-width="2"
                />
                <input
                  v-model="query.keyword"
                  type="text"
                  placeholder="搜索姓名、手机号、城市"
                  class="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-800 placeholder-zinc-400 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  @keyup.enter="handleSearch"
                >
              </div>
            </div>
            <div class="min-w-[140px]">
              <label class="mb-1.5 block text-sm font-medium text-zinc-600">城市</label>
              <select
                v-model="query.city"
                class="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">
                  全部城市
                </option>
                <option
                  v-for="opt in cityOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
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
                <option value="">
                  全部状态
                </option>
                <option
                  v-for="opt in partnerStatusOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
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
                  <th class="px-5 py-3 text-left font-medium text-zinc-500">
                    合伙人编号
                  </th>
                  <th class="px-5 py-3 text-left font-medium text-zinc-500">
                    姓名
                  </th>
                  <th class="px-5 py-3 text-left font-medium text-zinc-500">
                    手机号
                  </th>
                  <th class="px-5 py-3 text-left font-medium text-zinc-500">
                    城市
                  </th>
                  <th class="px-5 py-3 text-left font-medium text-zinc-500">
                    分账比例
                  </th>
                  <th class="px-5 py-3 text-left font-medium text-zinc-500">
                    状态
                  </th>
                  <th class="px-5 py-3 text-left font-medium text-zinc-500">
                    创建时间
                  </th>
                  <th class="px-5 py-3 text-left font-medium text-zinc-500">
                    备注
                  </th>
                  <th class="px-5 py-3 text-center font-medium text-zinc-500">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody
                v-if="!listLoading && list"
                class="divide-y divide-zinc-50"
              >
                <tr
                  v-for="row in list.list"
                  :key="row.id"
                  class="transition hover:bg-zinc-50/70"
                >
                  <td class="px-5 py-4 font-mono text-xs text-zinc-600">
                    {{ row.id }}
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-2">
                      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                        <Users
                          class="h-4 w-4"
                          :stroke-width="2"
                        />
                      </div>
                      <span class="font-medium text-zinc-800">{{ row.name }}</span>
                    </div>
                  </td>
                  <td class="px-5 py-4 font-mono text-zinc-600">
                    {{ row.phone }}
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-1.5 text-zinc-700">
                      <MapPin
                        class="h-4 w-4 text-zinc-400"
                        :stroke-width="2"
                      />
                      {{ row.city }}
                    </div>
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-1.5 text-zinc-700">
                      <Percent
                        class="h-4 w-4 text-brand-500"
                        :stroke-width="2"
                      />
                      <span class="font-semibold text-brand-700">{{ row.splitRatio }}%</span>
                    </div>
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
                      {{ statusLabelMap[row.status] }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-zinc-600">
                    {{ formatDate(row.createdAt) }}
                  </td>
                  <td class="px-5 py-4 text-zinc-600">
                    {{ row.remark || '-' }}
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-brand-600"
                        @click="openEditModal(row)"
                      >
                        <Edit2
                          class="h-4 w-4"
                          :stroke-width="2"
                        />
                      </button>
                      <button
                        type="button"
                        class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-50 hover:text-red-600"
                        @click="openDeleteConfirm(row.id)"
                      >
                        <Trash2
                          class="h-4 w-4"
                          :stroke-width="2"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="list.list.length === 0">
                  <td
                    colspan="9"
                    class="px-5 py-16 text-center text-sm text-zinc-400"
                  >
                    暂无城市合伙人
                  </td>
                </tr>
              </tbody>
              <tbody v-else-if="listLoading">
                <tr>
                  <td
                    colspan="9"
                    class="px-5 py-16"
                  >
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
                <ChevronLeft
                  class="h-4 w-4"
                  :stroke-width="2"
                />
              </button>
              <template
                v-for="(p, i) in pageNumbers"
                :key="`${p}-${i}`"
              >
                <span
                  v-if="p === '...'"
                  class="px-2 text-sm text-zinc-400"
                >...</span>
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
                <ChevronRight
                  class="h-4 w-4"
                  :stroke-width="2"
                />
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
          <div
            class="w-full max-w-lg rounded-2xl bg-white shadow-xl"
          >
            <div class="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
              <h3 class="text-lg font-bold text-zinc-800">
                {{ editingPartner ? '编辑城市合伙人' : '新增城市合伙人' }}
              </h3>
              <button
                type="button"
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
                @click="showModal = false"
              >
                <X
                  class="h-5 w-5"
                  :stroke-width="2"
                />
              </button>
            </div>

            <div class="px-6 py-5 space-y-5">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-zinc-700">
                  姓名 <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="请输入姓名"
                  :class="cn(
                    'w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-800 placeholder-zinc-400 shadow-sm transition focus:outline-none focus:ring-2',
                    formErrors.name
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-zinc-200 focus:border-brand-500 focus:ring-brand-500/20',
                  )"
                >
                <p
                  v-if="formErrors.name"
                  class="mt-1 text-xs text-red-500"
                >
                  {{ formErrors.name }}
                </p>
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium text-zinc-700">
                  手机号 <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <Phone
                    class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                    :stroke-width="2"
                  />
                  <input
                    v-model="form.phone"
                    type="tel"
                    placeholder="请输入手机号"
                    :class="cn(
                      'w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm text-zinc-800 placeholder-zinc-400 shadow-sm transition focus:outline-none focus:ring-2',
                      formErrors.phone
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-zinc-200 focus:border-brand-500 focus:ring-brand-500/20',
                    )"
                  >
                </div>
                <p
                  v-if="formErrors.phone"
                  class="mt-1 text-xs text-red-500"
                >
                  {{ formErrors.phone }}
                </p>
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium text-zinc-700">
                  城市 <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <MapPin
                    class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                    :stroke-width="2"
                  />
                  <select
                    v-model="form.city"
                    :class="cn(
                      'w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm text-zinc-800 shadow-sm transition focus:outline-none focus:ring-2',
                      formErrors.city
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-zinc-200 focus:border-brand-500 focus:ring-brand-500/20',
                    )"
                  >
                    <option value="">
                      请选择城市
                    </option>
                    <option
                      v-for="opt in cityOptions"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
                <p
                  v-if="formErrors.city"
                  class="mt-1 text-xs text-red-500"
                >
                  {{ formErrors.city }}
                </p>
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium text-zinc-700">
                  分账比例 <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <Percent
                    class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                    :stroke-width="2"
                  />
                  <input
                    v-model.number="form.splitRatio"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="请输入分账比例"
                    :class="cn(
                      'w-full rounded-lg border bg-white py-2 pl-9 pr-10 text-sm text-zinc-800 placeholder-zinc-400 shadow-sm transition focus:outline-none focus:ring-2',
                      formErrors.splitRatio
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-zinc-200 focus:border-brand-500 focus:ring-brand-500/20',
                    )"
                  >
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">%</span>
                </div>
                <p
                  v-if="formErrors.splitRatio"
                  class="mt-1 text-xs text-red-500"
                >
                  {{ formErrors.splitRatio }}
                </p>
                <p class="mt-1 text-xs text-zinc-400">
                  取值范围 0-100，表示每笔收益分给该合伙人的比例
                </p>
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium text-zinc-700">状态</label>
                <select
                  v-model="form.status"
                  class="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option
                    v-for="opt in partnerStatusOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium text-zinc-700">备注</label>
                <div class="relative">
                  <FileText
                    class="absolute left-3 top-3 h-4 w-4 text-zinc-400"
                    :stroke-width="2"
                  />
                  <textarea
                    v-model="form.remark"
                    rows="3"
                    placeholder="请输入备注信息（选填）"
                    class="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-800 placeholder-zinc-400 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
                  />
                </div>
              </div>

              <div
                v-if="submitError"
                class="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3"
              >
                <AlertCircle
                  class="h-4 w-4 shrink-0 text-red-500"
                  :stroke-width="2"
                />
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
                <span
                  v-if="submitting"
                  class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                />
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
                <CheckCircle
                  v-if="deleteSuccess"
                  class="h-8 w-8 text-emerald-600"
                  :stroke-width="2"
                />
                <AlertCircle
                  v-else
                  class="h-8 w-8 text-red-600"
                  :stroke-width="2"
                />
              </div>
              <h3 class="text-lg font-bold text-zinc-800">
                {{ deleteSuccess ? '删除成功' : '确认删除' }}
              </h3>
              <p
                v-if="!deleteSuccess"
                class="mt-2 text-sm text-zinc-500"
              >
                删除后无法恢复，确定要删除该城市合伙人吗？
              </p>
            </div>
            <div
              v-if="!deleteSuccess"
              class="flex items-center justify-center gap-3 border-t border-zinc-100 px-6 py-4"
            >
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
                <span
                  v-if="deleting"
                  class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                />
                {{ deleting ? '删除中...' : '确认删除' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
