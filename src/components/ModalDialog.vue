<script setup lang="ts">
import { X } from 'lucide-vue-next'

interface Props {
  visible: boolean
  title: string
  maxWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: 'max-w-lg',
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'close': []
}>()

function close() {
  emit('update:visible', false)
  emit('close')
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
        @click.self="close"
      >
        <div
          :class="['w-full rounded-2xl bg-white shadow-xl', maxWidth]"
        >
          <div class="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
            <h3 class="text-lg font-bold text-zinc-800">
              {{ title }}
            </h3>
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
              @click="close"
            >
              <X
                class="h-5 w-5"
                :stroke-width="2"
              />
            </button>
          </div>
          <div class="px-6 py-5">
            <slot />
          </div>
          <div
            v-if="$slots.footer"
            class="flex items-center justify-end gap-3 border-t border-zinc-100 px-6 py-4"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
