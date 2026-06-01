import type { AuthPayload, UserInterface } from '@/modules/auth/types/auth.type'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
    user: null as UserInterface | null,
  }),

  actions: {
    setSession(payload: AuthPayload) {
      this.accessToken = payload.access_token
      this.user = payload.user
    },

    clearSession() {
      this.accessToken = null
      this.user = null
    },
  },

  persist: true,
})
