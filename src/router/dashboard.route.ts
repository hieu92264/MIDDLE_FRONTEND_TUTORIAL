import type { RouteRecordRaw } from 'vue-router'

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/modules/dashboard/pages/DashboardPage.vue'),
    meta: {
      layout: 'base',
    },
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@/modules/users/pages/UsersPage.vue'),
    meta: {
      layout: 'base',
    },
  },
]
