import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import CityPartnerPage from '@/pages/CityPartnerPage.vue'
import SplitRecordPage from '@/pages/SplitRecordPage.vue'
import BankAccountPage from '@/pages/BankAccountPage.vue'

// 定义路由配置
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: { title: '账户信息' },
  },
  {
    path: '/partners',
    name: 'partners',
    component: CityPartnerPage,
    meta: { title: '城市合伙人' },
  },
  {
    path: '/splits',
    name: 'splits',
    component: SplitRecordPage,
    meta: { title: '分账记录' },
  },
  {
    path: '/bank-accounts',
    name: 'bank-accounts',
    component: BankAccountPage,
    meta: { title: '收款账户' },
  },
  {
    path: '/about',
    name: 'about',
    component: {
      template: '<div class="text-center text-xl p-8">About Page - Coming Soon</div>',
    },
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
