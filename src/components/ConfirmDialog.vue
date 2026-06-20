<script setup lang="ts">
import { ref, watch } from 'vue'
import { CheckCircle, AlertCircle } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  visible: boolean
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  confirmLoading?: boolean
  successState?: boolean
  successTitle?: string
  type?: 'danger' | 'default'
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: '确认',
  cancelText: '取消',
  confirmLoading: false,
  successState: false,
  successTitle: '操作成功',
  type: 'default',
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'confirm': []
  'cancel': []
}>()

const localVisible = ref(props.visible)

watch(() => props.visible, (val) => {
  localVisible.value = val
})

function close() {
  emit('update:visible', false)
}

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
  close()
}
</script>

<template>
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
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="handleCancel"
      >
        <div class="w-full max-w-sm rounded-2xl bg-white shadow-xl">
          <div class="px-6 py-8 text-center">
            <div
              :class="cn(
                'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full',
                successState ? 'bg-emerald-100' : type === 'danger' ? 'bg-red-100' : 'bg-zinc-100',
              )"
            >
              <CheckCircle
                v-if="successState"
                class="h-8 w-8 text-emerald-600"
                :stroke-width="2"
              />
              <AlertCircle
                v-else
                :class="cn('h-8 w-8', type === 'danger' ? 'text-red-600' : 'text-zinc-600')"
                :stroke-width="2"
              />
            </div>
            <h3 class="text-lg font-bold text-zinc-800">
              {{ successState ? successTitle : title }}
            </h3>
            <p
              v-if="!successState && message"
              class="mt-2 text-sm text-zinc-500"
            >
              {{ message }}
            </p>
          </div>
          <div
            v-if="!successState"
            class="flex items-center justify-center gap-3 border-t border-zinc-100 px-6 py-4"
          >
            <button
              type="button"
              class="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm transition hover:bg-zinc-50"
              @click="handleCancel"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              :disabled="confirmLoading"
              :class="cn(
                'flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70',
                type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700',
              )"
              @click="handleConfirm"
            >
              <span
                v-if="confirmLoading"
                class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
