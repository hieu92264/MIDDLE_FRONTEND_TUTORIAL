import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import type { App } from 'vue'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * khoang thoi gian du lieu duoc coi la fresh (du lieu moi)
       * sau khi duoc truy cap lan dau tien, du lieu se duoc luu trong cache
       * trong khoang thoi gian staleTime, neu truy cap lai thi se khong goi api
       * ma se lay du lieu tu cache
       */
      staleTime: 1000 * 60,
      /**
       * khoang thoi gian du lieu duoc luu trong cache sau khi het han staleTime
       * sau khi het han staleTime, du lieu se duoc xem la stale (du lieu cu)
       * neu truy cap lai sau khi het han staleTime, du lieu se duoc lay tu cache
       * va goi api de lay du lieu moi
       */
      gcTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export function setupVueQuery(app: App) {
  app.use(VueQueryPlugin, {
    queryClient,
    enableDevtoolsV6Plugin: import.meta.env.DEV,
  })
}
