import { useAuthStore } from '@/modules/auth/stores/auth.store'
import type { AuthPayload } from '@/modules/auth/types/auth.type'
import { AuthService } from '@/services/auth.service'
import { useAppStore } from '@/stores/app.store'
import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'
import type { Pinia } from 'pinia'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
  },
})

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

let installed = false
let refreshTokenPromise: Promise<AuthPayload | undefined> | null = null

export const setupAxiosInterceptors = (pinia: Pinia) => {
  if (installed) return
  installed = true

  apiClient.interceptors.request.use((config) => {
    const authStore = useAuthStore(pinia)
    const appStore = useAppStore(pinia)

    const headers = AxiosHeaders.from(config.headers)

    headers.set('Accept', 'application/json')
    headers.set('X-Locale', appStore.lang)

    if (config.data) {
      headers.set('Content-Type', 'application/json')
    }

    if (authStore.accessToken) {
      headers.set('Authorization', `Bearer ${authStore.accessToken}`)
    } else {
      headers.delete('Authorization')
    }

    config.headers = headers

    return config
  })

  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiResponse>) => {
      const authStore = useAuthStore(pinia)

      const originalRequest = error.config as RetryableRequestConfig | undefined

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._retry ||
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        return Promise.reject(error)
      }

      originalRequest._retry = true

      refreshTokenPromise ??= AuthService.refreshToken()
        .then((payload) => {
          if (payload) {
            authStore.setSession(payload)
          }

          return payload
        })
        .catch(() => {
          authStore.clearSession()
          return undefined
        })
        .finally(() => {
          refreshTokenPromise = null
        })

      const payload = await refreshTokenPromise

      if (!payload?.access_token) {
        return Promise.reject(error)
      }

      const headers = AxiosHeaders.from(originalRequest.headers)
      headers.set('Authorization', `Bearer ${payload.access_token}`)
      originalRequest.headers = headers

      return apiClient(originalRequest)
    },
  )
}
