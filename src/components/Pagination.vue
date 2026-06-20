<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  currentPage: number
  pageSize: number
  total: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:page': [page: number]
}>()

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(props.total / props.pageSize))
})

const pageNumbers = computed(() => {
  const current = props.currentPage
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

function goPrev() {
  if (props.currentPage > 1) {
    emit('update:page', props.currentPage - 1)
  }
}

function goNext() {
  if (props.currentPage < totalPages.value) {
    emit('update:page', props.currentPage + 1)
  }
}

function goPage(p: number) {
  emit('update:page', p)
}
</script>

<template>
  <div
    v-if="total > 0"
    class="flex flex-col items-center justify-between gap-3 border-t border-zinc-100 bg-white/60 px-5 py-4 sm:flex-row"
  >
    <div class="text-xs text-zinc-500">
      共 {{ total }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页
    </div>
    <div class="flex items-center gap-1">
      <button
        type="button"
        :disabled="currentPage <= 1"
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
            p === currentPage
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
        :disabled="currentPage >= totalPages"
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
</template>
