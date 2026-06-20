<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Wallet, Users, SplitSquareVertical, CreditCard, Menu, X, Store } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const route = useRoute()
const router = useRouter()
const mobileMenuOpen = ref(false)

const navItems = [
  { name: '账户信息', path: '/', icon: Wallet },
  { name: '城市合伙人', path: '/partners', icon: Users },
  { name: '分账记录', path: '/splits', icon: SplitSquareVertical },
  { name: '收款账户', path: '/bank-accounts', icon: CreditCard },
]

function navigate(path: string) {
  router.push(path)
  mobileMenuOpen.value = false
}

function isActive(path: string) {
  return route.path === path
}
</script>

<template>
  <nav class="sticky top-0 z-40 border-b border-zinc-100 bg-white/80 backdrop-blur-md">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Store
              class="h-5 w-5"
              :stroke-width="2"
            />
          </div>
          <div>
            <h1 class="text-base font-bold text-zinc-800">
              门店对账系统
            </h1>
            <p class="text-xs text-zinc-400">
              收益提现 · 分账管理
            </p>
          </div>
        </div>

        <div class="hidden md:flex md:items-center md:gap-1">
          <button
            v-for="item in navItems"
            :key="item.path"
            type="button"
            :class="cn(
              'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
              isActive(item.path)
                ? 'bg-brand-50 text-brand-700'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
            )"
            @click="navigate(item.path)"
          >
            <component
              :is="item.icon"
              class="h-4 w-4"
              :stroke-width="2"
            />
            {{ item.name }}
          </button>
        </div>

        <button
          type="button"
          class="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <Menu
            v-if="!mobileMenuOpen"
            class="h-5 w-5"
            :stroke-width="2"
          />
          <X
            v-else
            class="h-5 w-5"
            :stroke-width="2"
          />
        </button>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="mobileMenuOpen"
        class="md:hidden border-t border-zinc-100 bg-white"
      >
        <div class="space-y-1 px-4 py-3">
          <button
            v-for="item in navItems"
            :key="item.path"
            type="button"
            :class="cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
              isActive(item.path)
                ? 'bg-brand-50 text-brand-700'
                : 'text-zinc-600 hover:bg-zinc-50',
            )"
            @click="navigate(item.path)"
          >
            <component
              :is="item.icon"
              class="h-5 w-5"
              :stroke-width="2"
            />
            {{ item.name }}
          </button>
        </div>
      </div>
    </Transition>
  </nav>
</template>
