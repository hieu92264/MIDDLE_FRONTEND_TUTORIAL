import { defineStore } from 'pinia'

export interface TabItem {
  key: string // unique key = route.fullPath
  title: string
  path: string
  name?: string
  icon?: string
  affix?: boolean // pinned tab, cannot be closed
  closable?: boolean
}

export const useTabsStore = defineStore('tabs', {
  state: () => ({
    tabs: [] as TabItem[],
    activeKey: '' as string,
  }),

  getters: {
    currentTab: (state) => state.tabs.find((t) => t.key === state.activeKey),
  },

  actions: {
    openTab(tab: Omit<TabItem, 'closable'>) {
      const exists = this.tabs.find((t) => t.key === tab.key)
      if (!exists) {
        this.tabs.push({
          ...tab,
          closable: !tab.affix,
        })
      }
      this.activeKey = tab.key
    },

    closeTab(key: string) {
      const idx = this.tabs.findIndex((t) => t.key === key)
      if (idx === -1) return
      const tab = this.tabs[idx]
      if (tab.affix) return // can't close pinned tabs

      // If closing active tab, activate neighbor
      if (this.activeKey === key) {
        const next = this.tabs[idx + 1] || this.tabs[idx - 1]
        if (next) {
          this.activeKey = next.key
        }
      }
      this.tabs.splice(idx, 1)
    },

    closeOtherTabs(key: string) {
      this.tabs = this.tabs.filter((t) => t.key === key || t.affix)
      if (!this.tabs.find((t) => t.key === key)) {
        this.activeKey = this.tabs[0]?.key ?? ''
      } else {
        this.activeKey = key
      }
    },

    closeLeftTabs(key: string) {
      const idx = this.tabs.findIndex((t) => t.key === key)
      if (idx <= 0) return
      this.tabs = this.tabs.filter((t, i) => t.affix || i >= idx)
      this.activeKey = key
    },

    closeRightTabs(key: string) {
      const idx = this.tabs.findIndex((t) => t.key === key)
      if (idx === -1) return
      this.tabs = this.tabs.filter((t, i) => t.affix || i <= idx)
      this.activeKey = key
    },

    closeAllTabs() {
      const affixed = this.tabs.filter((t) => t.affix)
      this.tabs = affixed
      this.activeKey = affixed[0]?.key ?? ''
    },

    setActiveTab(key: string) {
      this.activeKey = key
    },

    updateTabTitle(key: string, title: string) {
      const tab = this.tabs.find((t) => t.key === key)
      if (tab) tab.title = title
    },
  },

  persist: true,
})
