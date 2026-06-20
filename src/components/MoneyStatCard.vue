<script setup lang="ts">
import type { Component } from 'vue'
import { HelpCircle } from 'lucide-vue-next'
import { formatCurrencyInteger, formatCurrencyDecimal } from '@/lib/format'
import { cn } from '@/lib/utils'

interface Props {
  label: string
  cents: number
  icon: Component
  variant?: 'default' | 'highlight' | 'warning'
  description?: string
  tooltip?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  description: '',
  tooltip: '',
})

const isHighlight = props.variant === 'highlight'
const isWarning = props.variant === 'warning'
</script>

<template>
  <div
    :class="cn(
      'group relative flex flex-col overflow-hidden rounded-2xl p-5 transition-all duration-300 animate-fade-up',
      isHighlight
        ? 'bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white shadow-cardHover hover:-translate-y-1'
        : isWarning
        ? 'bg-gradient-to-br from-amber-50 via-amber-50 to-orange-50 text-amber-900 shadow-card hover:-translate-y-0.5 hover:shadow-cardHover border border-amber-100'
        : 'bg-white text-zinc-800 shadow-card hover:-translate-y-0.5 hover:shadow-cardHover',
    )"
  >
    <div
      v-if="isHighlight"
      class="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-xl"
    />
    <div
      v-if="isWarning"
      class="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-200/30 blur-xl"
    />

    <div class="relative flex items-center justify-between">
      <div class="flex items-center gap-1.5">
        <span
          :class="cn('text-sm font-medium', isHighlight ? 'text-white/85' : isWarning ? 'text-amber-700' : 'text-zinc-500')"
        >
          {{ label }}
        </span>
        <div v-if="tooltip" class="group/tip relative flex">
          <HelpCircle
            :class="cn('h-3.5 w-3.5', isHighlight ? 'text-white/60' : isWarning ? 'text-amber-400' : 'text-zinc-300')"
            :stroke-width="2"
          />
          <span
            class="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 w-44 -translate-x-1/2 rounded-lg bg-zinc-800 px-3 py-2 text-xs leading-relaxed text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover/tip:opacity-100"
          >
            {{ tooltip }}
          </span>
        </div>
      </div>
      <span
        :class="cn(
          'flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
          isHighlight ? 'bg-white/15 text-white' : isWarning ? 'bg-amber-100 text-amber-600' : 'bg-brand-50 text-brand-700',
        )"
      >
        <component :is="icon" class="h-5 w-5" :stroke-width="2" />
      </span>
    </div>

    <div class="relative mt-4 flex items-baseline font-mono">
      <span
        :class="cn('mr-0.5 text-base font-medium', isHighlight ? 'text-white/90' : isWarning ? 'text-amber-600' : 'text-zinc-400')"
      >
        ¥
      </span>
      <span class="text-3xl font-bold tracking-tight tabular-nums">
        {{ formatCurrencyInteger(cents) }}
      </span>
      <span
        :class="cn('text-lg font-medium', isHighlight ? 'text-white/80' : isWarning ? 'text-amber-500' : 'text-zinc-400')"
      >
        .{{ formatCurrencyDecimal(cents) }}
      </span>
    </div>

    <p
      v-if="description"
      :class="cn('relative mt-3 text-xs', isHighlight ? 'text-white/70' : isWarning ? 'text-amber-600/70' : 'text-zinc-400')"
    >
      {{ description }}
    </p>

    <div v-if="$slots.default" class="relative mt-auto pt-4">
      <slot />
    </div>
  </div>
</template>
