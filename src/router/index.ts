import { authRoutes } from '@/modules/auth/routes'
import { dashboardRoutes } from '@/modules/dashboard/routes'
import { iamRoutes } from '@/modules/iam/routes'
import { organizationRoutes } from '@/modules/organization/routes'
import { errorRoutes } from '@/router/error.route'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useAppStore } from '@/stores/app.store'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  ...authRoutes,
  ...dashboardRoutes,
  ...iamRoutes,
  ...organizationRoutes,
  ...errorRoutes,
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const appStore = useAppStore()
  const authStore = useAuthStore()
  const isAuthenticated = !!authStore.accessToken

  if (to.fullPath !== from.fullPath) {
    appStore.startPageLoading()
  }

  if (to.meta.guestOnly && isAuthenticated) {
    // If logged in and trying to access guestOnly pages (login, register), redirect to dashboard
    return next({ name: 'dashboard' })
  }

  if (!to.meta.guestOnly && !to.meta.bypassAuth && !isAuthenticated) {
    // If not logged in and try
    //
    // ing to access private pages (dashboard), redirect to login
    return next({ name: 'login' })
  }

  next()
})

router.afterEach(() => {
  const appStore = useAppStore()
  window.setTimeout(() => {
    appStore.finishPageLoading()
  }, 250)
})

router.onError(() => {
  const appStore = useAppStore()
  appStore.finishPageLoading()
})

export default router
