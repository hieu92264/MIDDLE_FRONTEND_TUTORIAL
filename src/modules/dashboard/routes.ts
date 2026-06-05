import type { RouteRecordRaw } from 'vue-router'

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/modules/dashboard/pages/DashboardPage.vue'),
    meta: {
      layout: 'base',
      title: 'Dashboard',
      affix: true, // Pinned tab — cannot be closed
    },
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: () => import('@/modules/dashboard/pages/DashboardPage.vue'), // placeholder
    meta: {
      layout: 'base',
      title: 'Analytics',
    },
  },
  {
    path: '/projects',
    name: 'projects',
    component: () => import('@/modules/dashboard/pages/DashboardPage.vue'), // placeholder
    meta: {
      layout: 'base',
      title: 'Projects',
    },
  },
  {
    path: '/documents',
    name: 'documents',
    component: () => import('@/modules/dashboard/pages/DashboardPage.vue'), // placeholder
    meta: {
      layout: 'base',
      title: 'Documents',
    },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/modules/dashboard/pages/DashboardPage.vue'), // placeholder
    meta: {
      layout: 'base',
      title: 'Settings',
    },
  },
  {
    path: '/settings/general',
    name: 'settings-general',
    component: () => import('@/modules/dashboard/pages/DashboardPage.vue'), // placeholder
    meta: {
      layout: 'base',
      title: 'General Settings',
    },
  },
  {
    path: '/settings/security',
    name: 'settings-security',
    component: () => import('@/modules/dashboard/pages/DashboardPage.vue'), // placeholder
    meta: {
      layout: 'base',
      title: 'Security Settings',
    },
  },
]
