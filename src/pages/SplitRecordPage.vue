<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import {
  SplitSquareVertical, RefreshCw, AlertCircle, Search, Calendar, ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle, Percent, Wallet } from 'lucide-vue-next'
import { useSplitRecord } from '@/composables/useSplitRecord'
import { useCityPartner } from '@/composables/useCityPartner'
import { formatCurrencyInteger, formatCurrencyDecimal, formatDateTime, statusLabelMap } from '@/lib/format'
import { cn } from '@/lib/utils'
import { splitStatusOptions } from '@/lib/constants'
import type { SplitRecordListQuery } from '../../shared/types'

const {
  stats,
  statsLoading,
  statsError,
  list,
  listLoading,
  listError,
  fetchStats,
  fetchList,
} = useSplitRecord()

const { activePartners, activePartnersLoading, fetchActivePartners } = useCityPartner()

const query = reactive<SplitRecordListQuery>({
  page: 1,
  pageSize: 10,
  startDate: '',
  endDate: '',
  partnerId: '',
  status: '',
})

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

const statusIconClassMap: Record<string, string> = {
  success: 'text-emerald-500',
  pending: 'text-amber-500',
  failed: 'text-red-500',
}

const statusBadgeClassMap: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  failed: 'bg-red-50 text-red-700 ring-red-600/20',
}

function statusIcon(status: string) {
  if (status === 'success') return CheckCircle
  if (status === 'pending') return Clock
  return XCircle
}

function loadData() {
  fetchStats()
  fetchList({ ...query })
}

function handleSearch() {
  query.page = 1
  loadData()
}

function handleReset() {
  query.startDate = ''
  query.endDate = ''
  query.partnerId = ''
  query.status = ''
  query.page = 1
  loadData()
}

function goPage(p: number) {
  query.page = p
  fetchList({ ...query })
}

function goPrev() {
  if (list.value && list.value.page > 1) {
    query.page = list.value.page - 1
    fetchList({ ...query })
  }
}

function goNext() {
  if (list.value && list.value.page < totalPages.value) {
    query.page = list.value.page + 1
    fetchList({ ...query })
  }
}

onMounted(() => {
  fetchActivePartners()
  loadData()
})
</script>

<template>
  <div class="min-h-screen bg-zinc-50">
    <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section>
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold text-zinc-800">
              分账记录
            </h1>
            <p class="mt-1 text-sm text-zinc-400">
              查看城市合伙人分账明细及统计数据
            </p>
          </div>
          <button
            type="button"
            :disabled="statsLoading || listLoading"
            class="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            @click="loadData"
          >
            <RefreshCw
              class="h-4 w-4"
              :class="{ 'animate-spin': statsLoading || listLoading }"
              :stroke-width="2"
            />
            刷新
          </button>
        </div>

        <div
          v-if="statsError"
          class="mb-6 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4"
        >
          <AlertCircle
            class="h-5 w-5 shrink-0 text-red-500"
            :stroke-width="2"
          />
          <span class="text-sm text-red-600">{{ statsError }}</span>
          <button
            type="button"
            class="ml-auto text-sm font-medium text-red-600 underline"
            @click="loadData"
          >
            重试
          </button>
        </div>

        <div
          v-if="statsLoading"
          class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div
            v-for="i in 4"
            :key="i"
            class="h-32 animate-pulse rounded-2xl bg-white shadow-card"
          />
        </div>

        <div
          v-else-if="stats"
          class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div class="rounded-2xl border border-zinc-100 bg-white p-5 shadow-card">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <SplitSquareVertical
                  class="h-5 w-5"
                  :stroke-width="2"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm text-zinc-500">
                  分账笔数
                </p>
                <p class="mt-1 text-2xl font-bold text-zinc-800">
                  {{ stats.recordCount.toLocaleString() }}
                </p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-zinc-100 bg-white p-5 shadow-card">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Calendar
                  class="h-5 w-5"
                  :stroke-width="2"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm text-zinc-500">
                  今日分账
                </p>
                <p class="mt-1 flex items-baseline gap-0.5">
                  <span class="text-xs text-emerald-600">¥</span>
                  <span class="text-2xl font-bold text-emerald-600 tabular-nums">
                    {{ formatCurrencyInteger(stats.todaySplitAmount) }}
                  </span>
                  <span class="text-xs text-zinc-400">.{{ formatCurrencyDecimal(stats.todaySplitAmount) }}</span>
                </p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-zinc-100 bg-white p-5 shadow-card">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Wallet
                  class="h-5 w-5"
                  :stroke-width="2"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm text-zinc-500">
                  本月分账
                </p>
                <p class="mt-1 flex items-baseline gap-0.5">
                  <span class="text-xs text-amber-600">¥</span>
                  <span class="text-2xl font-bold text-amber-600 tabular-nums">
                    {{ formatCurrencyInteger(stats.monthSplitAmount) }}
                  </span>
                  <span class="text-xs text-zinc-400">.{{ formatCurrencyDecimal(stats.monthSplitAmount) }}</span>
                </p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-zinc-100 bg-white p-5 shadow-card">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Percent
                  class="h-5 w-5"
                  :stroke-width="2"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm text-zinc-500">
                  累计分账
                </p>
                <p class="mt-1 flex items-baseline gap-0.5">
                  <span class="text-xs text-purple-600">¥</span>
                  <span class="text-2xl font-bold text-purple-600 tabular-nums">
                    {{ formatCurrencyInteger(stats.totalSplitAmount) }}
                  </span>
                  <span class="text-xs text-zinc-400">.{{ formatCurrencyDecimal(stats.totalSplitAmount) }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-6 rounded-2xl border border-zinc-100 bg-white p-5 shadow-card">
          <div class="flex flex-wrap items-end gap-4">
            <div class="min-w-[160px]">
              <label class="mb-1.5 block text-sm font-medium text-zinc-600">开始日期</label>
              <input
                v-model="query.startDate"
                type="date"
                class="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
            </div>
            <div class="min-w-[160px]">
              <label class="mb-1.5 block text-sm font-medium text-zinc-600">结束日期</label>
              <input
                v-model="query.endDate"
                type="date"
                class="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
            </div>
            <div class="min-w-[180px]">
              <label class="mb-1.5 block text-sm font-medium text-zinc-600">合伙人</label>
              <select
                v-model="query.partnerId"
                class="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">
                  全部合伙人
                </option>
                <option
                  v-for="partner in activePartners"
                  :key="partner.id"
                  :value="partner.id"
                >
                  {{ partner.name }}（{{ partner.city }}）
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
                  v-for="opt in splitStatusOptions"
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
            @click="loadData"
          >
            重试
          </button>
        </div>

        <div class="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-card">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-zinc-100 text-sm">
              <thead class="bg-zinc-50">
                <tr>
                  <th class="px-5 py-3 text-left font-medium text-zinc-500">
                    分账单号
                  </th>
                  <th class="px-5 py-3 text-left font-medium text-zinc-500">
                    关联订单
                  </th>
                  <th class="px-5 py-3 text-left font-medium text-zinc-500">
                    合伙人
                  </th>
                  <th class="px-5 py-3 text-left font-medium text-zinc-500">
                    交易时间
                  </th>
                  <th class="px-5 py-3 text-right font-medium text-zinc-500">
                    订单金额
                  </th>
                  <th class="px-5 py-3 text-center font-medium text-zinc-500">
                    分账比例
                  </th>
                  <th class="px-5 py-3 text-right font-medium text-zinc-500">
                    分账金额
                  </th>
                  <th class="px-5 py-3 text-left font-medium text-zinc-500">
                    状态
                  </th>
                  <th class="px-5 py-3 text-left font-medium text-zinc-500">
                    备注
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
                  <td class="px-5 py-4 font-mono text-xs text-zinc-600">
                    {{ row.orderNo }}
                  </td>
                  <td class="px-5 py-4">
                    <div class="text-zinc-800">
                      <p class="font-medium">
                        {{ row.partnerName }}
                      </p>
                      <p class="text-xs text-zinc-400">
                        {{ row.partnerId }}
                      </p>
                    </div>
                  </td>
                  <td class="px-5 py-4 text-zinc-700">
                    {{ formatDateTime(row.tradeTime) }}
                  </td>
                  <td class="px-5 py-4 text-right font-mono tabular-nums text-zinc-700">
                    <span class="text-xs text-zinc-400">¥</span>
                    {{ formatCurrencyInteger(row.totalAmount) }}
                    <span class="text-xs text-zinc-400">.{{ formatCurrencyDecimal(row.totalAmount) }}</span>
                  </td>
                  <td class="px-5 py-4 text-center">
                    <span class="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                      <Percent
                        class="h-3 w-3"
                        :stroke-width="2"
                      />
                      {{ row.splitRatio }}%
                    </span>
                  </td>
                  <td class="px-5 py-4 text-right font-mono font-semibold tabular-nums text-emerald-600">
                    <span class="text-xs">+¥</span>
                    {{ formatCurrencyInteger(row.splitAmount) }}
                    <span class="text-xs text-zinc-400">.{{ formatCurrencyDecimal(row.splitAmount) }}</span>
                  </td>
                  <td class="px-5 py-4">
                    <span
                      :class="cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                        statusBadgeClassMap[row.status],
                      )"
                    >
                      <component
                        :is="statusIcon(row.status)"
                        :class="cn('h-3 w-3', statusIconClassMap[row.status])"
                        :stroke-width="2"
                      />
                      {{ statusLabelMap[row.status] }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-zinc-600">
                    {{ row.remark }}
                  </td>
                </tr>
                <tr v-if="list.list.length === 0">
                  <td
                    colspan="9"
                    class="px-5 py-16 text-center text-sm text-zinc-400"
                  >
                    暂无分账记录
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
  </div>
</template>
