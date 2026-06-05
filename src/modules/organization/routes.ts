import type { RouteRecordRaw } from 'vue-router'

export const organizationRoutes: RouteRecordRaw[] = [
  {
    path: '/organizations',
    name: 'organizations',
    component: () => import('@/modules/dashboard/pages/DashboardPage.vue'),
    meta: {
      layout: 'base',
      title: 'Organizations',
    },
  },
  {
    path: '/organizations/settings',
    name: 'organization-settings',
    component: () => import('@/modules/dashboard/pages/DashboardPage.vue'),
    meta: {
      layout: 'base',
      title: 'Organization Settings',
    },
  },
]
