<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle } from 'lucide-vue-next'
import type { RevenueRecord, RevenueListData } from '../../shared/types'
import { formatCurrencyInteger, formatCurrencyDecimal, formatDateTime, statusLabelMap } from '@/lib/format'
import { cn } from '@/lib/utils'

interface Props {
  data: RevenueListData | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  'update:page': [page: number]
}>()

const totalPages = computed(() => {
  if (!props.data) return 0
  return Math.max(1, Math.ceil(props.data.total / props.data.pageSize))
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

function statusIcon(status: RevenueRecord['status']) {
  if (status === 'success') return CheckCircle
  if (status === 'pending') return Clock
  return XCircle
}

function goPrev() {
  if (!props.data || props.data.page <= 1) return
  emit('update:page', props.data.page - 1)
}

function goNext() {
  if (!props.data || props.data.page >= totalPages.value) return
  emit('update:page', props.data.page + 1)
}

function goPage(p: number) {
  emit('update:page', p)
}

const pageNumbers = computed(() => {
  if (!props.data) return []
  const current = props.data.page
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
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-card">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-zinc-100 text-sm">
        <thead class="bg-zinc-50">
          <tr>
            <th class="px-5 py-3 text-left font-medium text-zinc-500">收益单号</th>
            <th class="px-5 py-3 text-left font-medium text-zinc-500">关联订单</th>
            <th class="px-5 py-3 text-left font-medium text-zinc-500">交易时间</th>
            <th class="px-5 py-3 text-left font-medium text-zinc-500">类型</th>
            <th class="px-5 py-3 text-right font-medium text-zinc-500">金额</th>
            <th class="px-5 py-3 text-left font-medium text-zinc-500">状态</th>
            <th class="px-5 py-3 text-left font-medium text-zinc-500">备注</th>
          </tr>
        </thead>
        <tbody v-if="!loading && data" class="divide-y divide-zinc-50">
          <tr v-for="row in data.list" :key="row.id" class="transition hover:bg-zinc-50/70">
            <td class="px-5 py-4 font-mono text-xs text-zinc-600">{{ row.id }}</td>
            <td class="px-5 py-4 font-mono text-xs text-zinc-600">{{ row.orderNo }}</td>
            <td class="px-5 py-4 text-zinc-700">{{ formatDateTime(row.tradeTime) }}</td>
            <td class="px-5 py-4">
              <span class="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
                {{ row.type }}
              </span>
            </td>
            <td
              :class="cn(
                'px-5 py-4 text-right font-mono font-semibold tabular-nums',
                row.amount >= 0 ? 'text-emerald-600' : 'text-red-500',
              )"
            >
              <span class="text-xs">{{ row.amount >= 0 ? '+' : '-' }}¥</span>
              {{ formatCurrencyInteger(Math.abs(row.amount)) }}
              <span class="text-xs text-zinc-400">.{{ formatCurrencyDecimal(Math.abs(row.amount)) }}</span>
            </td>
            <td class="px-5 py-4">
              <span
                :class="cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                  statusBadgeClassMap[row.status],
                )"
              >
                <component :is="statusIcon(row.status)" class="h-3 w-3" :stroke-width="2" />
                {{ statusLabelMap[row.status] }}
              </span>
            </td>
            <td class="px-5 py-4 text-zinc-600">{{ row.remark }}</td>
          </tr>
          <tr v-if="data.list.length === 0">
            <td colspan="7" class="px-5 py-16 text-center text-sm text-zinc-400">
              暂无收益记录
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="loading">
          <tr>
            <td colspan="7" class="px-5 py-16">
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
      v-if="data && data.total > 0"
      class="flex flex-col items-center justify-between gap-3 border-t border-zinc-100 bg-white/60 px-5 py-4 sm:flex-row"
    >
      <div class="text-xs text-zinc-500">
        共 {{ data.total }} 条记录，第 {{ data.page }} / {{ totalPages }} 页
      </div>
      <div class="flex items-center gap-1">
        <button
          type="button"
          :disabled="data.page <= 1"
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
              p === data.page
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
          :disabled="data.page >= totalPages"
          class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          @click="goNext"
        >
          <ChevronRight class="h-4 w-4" :stroke-width="2" />
        </button>
      </div>
    </div>
  </div>
</template>
