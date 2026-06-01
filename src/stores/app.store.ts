import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    lang: 'en',
    isPageLoading: false,
  }),

  actions: {
    setLang(lang: string) {
      this.lang = lang
    },
    startPageLoading() {
      this.isPageLoading = true
    },
    finishPageLoading() {
      this.isPageLoading = false
    },
  },
})
