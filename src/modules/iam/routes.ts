import type { RouteRecordRaw } from 'vue-router'

export const iamRoutes: RouteRecordRaw[] = [
  {
    path: '/users',
    name: 'users',
    component: () => import('@/modules/iam/users/pages/UserListPage.vue'),
    meta: {
      layout: 'base',
      title: 'Users',
    },
  },
  {
    path: '/user',
    name: 'user',
    component: () => import('@/modules/iam/users/pages/UserPage.vue'),
    meta: {
      layout: 'base',
      title: 'User',
    },
  },
]
