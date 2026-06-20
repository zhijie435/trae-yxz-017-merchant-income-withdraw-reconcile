<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  Store,
  Wallet,
  HandCoins,
  Snowflake,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from 'lucide-vue-next'
import { useAccountInfo } from '@/composables/useAccountInfo'
import MoneyStatCard from '@/components/MoneyStatCard.vue'

const { accountInfo, loading, error, fetchAccountInfo } = useAccountInfo()

const showWithdrawTip = ref(false)

function handleWithdraw() {
  showWithdrawTip.value = true
}

onMounted(() => {
  fetchAccountInfo()
})
</script>

<template>
  <div class="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-5xl">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-zinc-800">账户信息</h1>
          <p class="mt-1 text-sm text-zinc-400">实时查看门店账户资金概况</p>
        </div>
        <button
          type="button"
          :disabled="loading"
          class="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          @click="fetchAccountInfo"
        >
          <RefreshCw
            class="h-4 w-4"
            :class="{ 'animate-spin': loading }"
            :stroke-width="2"
          />
          刷新
        </button>
      </div>

      <div
        v-if="error"
        class="mb-6 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4"
      >
        <AlertCircle class="h-5 w-5 shrink-0 text-red-500" :stroke-width="2" />
        <span class="text-sm text-red-600">{{ error }}</span>
        <button
          type="button"
          class="ml-auto text-sm font-medium text-red-600 underline"
          @click="fetchAccountInfo"
        >
          重试
        </button>
      </div>

      <div
        v-if="!error"
        class="mb-6 flex items-center gap-4 rounded-2xl border border-zinc-100 bg-white p-5 shadow-card"
      >
        <div
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"
        >
          <Store class="h-6 w-6" :stroke-width="2" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span v-if="loading" class="block h-5 w-44 animate-pulse rounded bg-zinc-100"></span>
            <h2 v-else class="truncate text-lg font-bold text-zinc-800">
              {{ accountInfo?.storeName }}
            </h2>
          </div>
          <div class="mt-1.5">
            <span
              v-if="loading"
              class="inline-block h-4 w-28 animate-pulse rounded bg-zinc-100"
            ></span>
            <span
              v-else
              class="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-500"
            >
              门店编号 {{ accountInfo?.storeNo }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="i in 4"
          :key="i"
          class="h-36 animate-pulse rounded-2xl bg-white shadow-card"
        ></div>
      </div>

      <div
        v-else-if="accountInfo"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <MoneyStatCard
          label="账户余额"
          :cents="accountInfo.accountBalance"
          :icon="Wallet"
          description="账户当前总余额"
        />
        <MoneyStatCard
          label="可提现金额"
          :cents="accountInfo.availableAmount"
          :icon="HandCoins"
          variant="highlight"
          description="可立即发起提现的金额"
        >
          <button
            type="button"
            class="flex w-full items-center justify-center gap-1.5 rounded-xl bg-white/95 px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-white"
            @click="handleWithdraw"
          >
            立即提现
          </button>
        </MoneyStatCard>
        <MoneyStatCard
          label="冻结金额"
          :cents="accountInfo.frozenAmount"
          :icon="Snowflake"
          :tooltip="accountInfo.frozenReason"
          description="暂不可用的资金"
        />
        <MoneyStatCard
          label="累计营收"
          :cents="accountInfo.totalRevenue"
          :icon="TrendingUp"
          description="历史营收累计总额"
        />
      </div>

      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showWithdrawTip"
          class="mt-4 flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4"
        >
          <span class="text-sm text-brand-700">提现功能即将开放，敬请期待。</span>
          <button
            type="button"
            class="ml-auto text-sm text-brand-600 underline"
            @click="showWithdrawTip = false"
          >
            知道了
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>
