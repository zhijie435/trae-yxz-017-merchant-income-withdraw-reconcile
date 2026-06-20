<script setup lang="ts">
import { CalendarRange, RotateCcw, Filter } from 'lucide-vue-next'

export interface RevenueFilterValues {
  startDate: string
  endDate: string
  type: string
  status: string
}

interface Props {
  modelValue: RevenueFilterValues
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: RevenueFilterValues]
  'submit': []
  'reset': []
}>()

const typeOptions = ['全部', '订单收益', '退款', '补贴', '其他']
const statusOptions = [
  { value: '', label: '全部' },
  { value: 'success', label: '成功' },
  { value: 'pending', label: '处理中' },
  { value: 'failed', label: '失败' },
]

function updateField<K extends keyof RevenueFilterValues>(key: K, value: RevenueFilterValues[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function handleReset() {
  emit('reset')
}

function handleSubmit() {
  emit('submit')
}
</script>

<template>
  <div class="flex flex-col gap-4 rounded-2xl border border-zinc-100 bg-white p-5 shadow-card md:flex-row md:items-end md:gap-3">
    <div class="flex items-center gap-2 text-sm font-medium text-zinc-700 md:mr-2">
      <Filter
        class="h-4 w-4 text-brand-600"
        :stroke-width="2"
      />
      筛选条件
    </div>

    <div class="flex flex-1 flex-col gap-4 md:flex-row md:items-center md:flex-wrap">
      <div class="flex flex-col gap-1">
        <label class="text-xs text-zinc-500">开始日期</label>
        <div class="relative">
          <input
            type="date"
            :value="modelValue.startDate"
            :disabled="loading"
            class="w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3 py-2 pr-9 text-sm text-zinc-700 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-zinc-50 md:w-40"
            @input="updateField('startDate', ($event.target as HTMLInputElement).value)"
          >
          <CalendarRange
            class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            :stroke-width="2"
          />
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs text-zinc-500">结束日期</label>
        <div class="relative">
          <input
            type="date"
            :value="modelValue.endDate"
            :disabled="loading"
            class="w-full appearance-none rounded-lg border border-zinc-200 bg-white px-3 py-2 pr-9 text-sm text-zinc-700 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-zinc-50 md:w-40"
            @input="updateField('endDate', ($event.target as HTMLInputElement).value)"
          >
          <CalendarRange
            class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            :stroke-width="2"
          />
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs text-zinc-500">收益类型</label>
        <select
          :value="modelValue.type"
          :disabled="loading"
          class="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-zinc-50 md:w-32"
          @change="updateField('type', ($event.target as HTMLSelectElement).value)"
        >
          <option
            v-for="t in typeOptions"
            :key="t"
            :value="t === '全部' ? '' : t"
          >
            {{ t }}
          </option>
        </select>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs text-zinc-500">状态</label>
        <select
          :value="modelValue.status"
          :disabled="loading"
          class="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-zinc-50 md:w-32"
          @change="updateField('status', ($event.target as HTMLSelectElement).value)"
        >
          <option
            v-for="s in statusOptions"
            :key="s.value"
            :value="s.value"
          >
            {{ s.label }}
          </option>
        </select>
      </div>
    </div>

    <div class="flex gap-2 md:ml-auto">
      <button
        type="button"
        :disabled="loading"
        class="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        @click="handleReset"
      >
        <RotateCcw
          class="h-4 w-4"
          :stroke-width="2"
        />
        重置
      </button>
      <button
        type="button"
        :disabled="loading"
        class="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        @click="handleSubmit"
      >
        <Filter
          class="h-4 w-4"
          :stroke-width="2"
        />
        筛选
      </button>
    </div>
  </div>
</template>
