<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import {
  Receipt,
  Sun,
  Calendar,
  Sparkles,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Loader,
} from 'lucide-vue-next'
import type { RevenueStatsData, RevenueListQuery } from '../../shared/types'
import { useRevenue } from '@/composables/useRevenue'
import MoneyStatCard from '@/components/MoneyStatCard.vue'
import RevenueFilter from '@/components/RevenueFilter.vue'
import type { RevenueFilterValues } from '@/components/RevenueFilter.vue'
import RevenueTable from '@/components/RevenueTable.vue'
import { formatCurrencyInteger, formatCurrencyDecimal } from '@/lib/format'
interface StatConfig {
  label: string
  key: keyof RevenueStatsData
  icon: any
  isMoney: boolean
  isHighlight?: boolean
  description?: string
}

const statConfigs: StatConfig[] = [
  {
    label: '收益笔数',
    key: 'recordCount',
    icon: Receipt,
    isMoney: false,
    description: '累计产生的收益记录数量',
  },
  {
    label: '今日收益',
    key: 'todayRevenue',
    icon: Sun,
    isMoney: true,
    description: '今日已结算的收益金额',
  },
  {
    label: '本月收益',
    key: 'monthRevenue',
    icon: Calendar,
    isMoney: true,
    description: '本月已结算的收益金额',
  },
  {
    label: '总收益',
    key: 'totalRevenue',
    icon: Sparkles,
    isMoney: true,
    isHighlight: true,
    description: '历史累计收益总额',
  },
]

function formatCount(n: number): string {
  return n.toLocaleString('zh-CN')
}

const {
  stats,
  statsLoading,
  statsError,
  list,
  listLoading,
  listError,
  exporting,
  fetchStats,
  fetchList,
  exportExcel,
} = useRevenue()

const filter = ref<RevenueFilterValues>({
  startDate: '',
  endDate: '',
  type: '',
  status: '',
})

const currentPage = ref(1)
const pageSize = ref(10)

function buildListQuery(): RevenueListQuery {
  return {
    page: currentPage.value,
    pageSize: pageSize.value,
    startDate: filter.value.startDate || undefined,
    endDate: filter.value.endDate || undefined,
    type: filter.value.type || undefined,
    status: filter.value.status || undefined,
  }
}

function buildExportQuery(): RevenueListQuery {
  return {
    startDate: filter.value.startDate || undefined,
    endDate: filter.value.endDate || undefined,
    type: filter.value.type || undefined,
    status: filter.value.status || undefined,
  }
}

function refreshList() {
  fetchList(buildListQuery())
}

function handleFilter() {
  currentPage.value = 1
  refreshList()
}

function handleReset() {
  filter.value = {
    startDate: '',
    endDate: '',
    type: '',
    status: '',
  }
  currentPage.value = 1
  refreshList()
}

function handlePageChange(page: number) {
  currentPage.value = page
  refreshList()
}

function handleExport() {
  exportExcel(buildExportQuery())
}

watch(currentPage, () => {
  refreshList()
})

onMounted(() => {
  fetchStats()
  refreshList()
})
</script>

<template>
  <section class="mt-10">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-bold text-zinc-800">收益记录</h2>
        <p class="mt-1 text-sm text-zinc-400">查看与筛选门店收益明细，支持一键导出对账</p>
      </div>
      <button
        type="button"
        :disabled="exporting"
        class="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        @click="handleExport"
      >
        <FileSpreadsheet v-if="!exporting" class="h-4 w-4" :stroke-width="2" />
        <Loader v-else class="h-4 w-4 animate-spin" :stroke-width="2" />
        <Download class="h-4 w-4" :stroke-width="2" />
        {{ exporting ? '导出中...' : '导出 Excel' }}
      </button>
    </div>

    <div
      v-if="statsError"
      class="mb-4 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4"
    >
      <AlertCircle class="h-5 w-5 shrink-0 text-red-500" :stroke-width="2" />
      <span class="text-sm text-red-600">{{ statsError }}</span>
    </div>

    <div v-if="statsLoading" class="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="i in 4"
        :key="i"
        class="h-32 animate-pulse rounded-2xl bg-white shadow-card"
      ></div>
    </div>
    <div v-else-if="stats" class="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="(cfg, idx) in statConfigs"
        :key="cfg.key"
        class="animate-fade-up"
        :style="{ animationDelay: `${idx * 60}ms` }"
      >
        <MoneyStatCard
          v-if="cfg.isMoney"
          :label="cfg.label"
          :cents="stats[cfg.key] as number"
          :icon="cfg.icon"
          :variant="cfg.isHighlight ? 'highlight' : 'default'"
          :description="cfg.description"
        />
        <div
          v-else
          :class="[
            'flex flex-col overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cardHover',
            'bg-white text-zinc-800 shadow-card',
          ]"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-zinc-500">{{ cfg.label }}</span>
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-transform duration-300 group-hover:scale-110">
              <component :is="cfg.icon" class="h-5 w-5" :stroke-width="2" />
            </span>
          </div>
          <div class="mt-4 flex items-baseline font-mono">
            <span class="text-3xl font-bold tracking-tight tabular-nums">
              {{ formatCount(stats[cfg.key] as number) }}
            </span>
            <span class="ml-1 text-base font-medium text-zinc-400">笔</span>
          </div>
          <p v-if="cfg.description" class="mt-3 text-xs text-zinc-400">
            {{ cfg.description }}
          </p>
        </div>
      </div>
    </div>

    <div class="mb-4">
      <RevenueFilter
        v-model="filter"
        :loading="listLoading"
        @submit="handleFilter"
        @reset="handleReset"
      />
    </div>

    <div
      v-if="listError"
      class="mb-4 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4"
    >
      <AlertCircle class="h-5 w-5 shrink-0 text-red-500" :stroke-width="2" />
      <span class="text-sm text-red-600">{{ listError }}</span>
      <button
        type="button"
        class="ml-auto text-sm font-medium text-red-600 underline"
        @click="refreshList"
      >
        重试
      </button>
    </div>

    <RevenueTable
      :data="list"
      :loading="listLoading"
      @update:page="handlePageChange"
    />
  </section>
</template>
