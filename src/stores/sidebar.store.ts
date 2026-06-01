import { defineStore } from 'pinia'

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    isCollapsed: false,
  }),

  actions: {
    toggle() {
      this.isCollapsed = !this.isCollapsed
    },
    setCollapsed(collapsed: boolean) {
      this.isCollapsed = collapsed
    },
  },

  persist: true,
})
