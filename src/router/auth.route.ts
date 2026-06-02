import type { RouteRecordRaw } from 'vue-router'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/auth/pages/LoginPage.vue'),
    meta: {
      guestOnly: true,
      layout: 'blank',
    },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/modules/auth/pages/RegisterPage.vue'),
    meta: {
      guestOnly: true,
      layout: 'blank',
    },
  },
  {
    path: '/user',
    name: 'user',
    component: () => import('@/modules/auth/pages/UserPage.vue'),
    meta: {
      layout: 'base',
    },
  },
]
