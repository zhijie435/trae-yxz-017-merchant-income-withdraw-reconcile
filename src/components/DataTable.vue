<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'
import Pagination from '@/components/Pagination.vue'
import type { ListDataWithTotal } from '../../shared/types'

interface Column<T> {
  key: string
  title: string
  align?: 'left' | 'center' | 'right'
  width?: string
  render?: (row: T, index: number) => any
  className?: string
}

interface Props<T> {
  columns: Column<T>[]
  data: ListDataWithTotal<T> | null
  loading?: boolean
  error?: string | null
  emptyText?: string
  showPagination?: boolean
  onRetry?: () => void
}

type GenericRow = any

const props = withDefaults(defineProps<Props<GenericRow>>(), {
  loading: false,
  error: null,
  emptyText: '暂无数据',
  showPagination: true,
})

const emit = defineEmits<{
  'update:page': [page: number]
  'retry': []
}>()

function handlePageChange(page: number) {
  emit('update:page', page)
}

function handleRetry() {
  emit('retry')
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-card">
    <div
      v-if="error"
      class="flex items-center gap-3 border-b border-zinc-100 bg-red-50 p-4"
    >
      <AlertCircle
        class="h-5 w-5 shrink-0 text-red-500"
        :stroke-width="2"
      />
      <span class="text-sm text-red-600">{{ error }}</span>
      <button
        v-if="onRetry || $attrs.onRetry"
        type="button"
        class="ml-auto text-sm font-medium text-red-600 underline"
        @click="handleRetry"
      >
        重试
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-zinc-100 text-sm">
        <thead class="bg-zinc-50">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="[
                'px-5 py-3 font-medium text-zinc-500',
                col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                col.width ? `w-[${col.width}]` : '',
              ]"
            >
              {{ col.title }}
            </th>
          </tr>
        </thead>

        <tbody
          v-if="!loading && data"
          class="divide-y divide-zinc-50"
        >
          <tr
            v-for="(row, idx) in data.list"
            :key="row.id || idx"
            class="transition hover:bg-zinc-50/70"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              :class="[
                'px-5 py-4',
                col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                col.className || '',
              ]"
            >
              <slot
                v-if="$slots[`col-${col.key}`]"
                :name="`col-${col.key}`"
                :row="row"
                :index="idx"
              />
              <template v-else>
                <component :is="col.render ? col.render(row, idx) : row[col.key]" />
              </template>
            </td>
          </tr>
          <tr v-if="data.list.length === 0">
            <td
              :colspan="columns.length"
              class="px-5 py-16 text-center text-sm text-zinc-400"
            >
              {{ emptyText }}
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="loading">
          <tr>
            <td
              :colspan="columns.length"
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

    <Pagination
      v-if="showPagination && data"
      :current-page="data.page"
      :page-size="data.pageSize"
      :total="data.total"
      @update:page="handlePageChange"
    />
  </div>
</template>
