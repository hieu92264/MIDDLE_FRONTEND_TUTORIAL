import type { RouteRecordRaw } from 'vue-router'

export const errorRoutes: RouteRecordRaw[] = [
  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import('@/pages/errors/ForbiddenPage.vue'),
    meta: {
      layout: 'blank',
      bypassAuth: true,
    },
  },
  {
    path: '/maintenance',
    name: 'maintenance',
    component: () => import('@/pages/errors/MaintenancePage.vue'),
    meta: {
      layout: 'blank',
      bypassAuth: true,
    },
  },
  {
    path: '/server-error',
    name: 'server-error',
    component: () => import('@/pages/errors/ServerErrorPage.vue'),
    meta: {
      layout: 'blank',
      bypassAuth: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/errors/NotFoundPage.vue'),
    meta: {
      layout: 'blank',
      bypassAuth: true,
    },
  },
]
