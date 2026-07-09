<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTabsStore, type TabItem } from '@/stores/tabs.store'
import { X, Pin } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const tabsStore = useTabsStore()

// ─── Context Menu ───
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  targetKey: '',
})

const showContextMenu = (e: MouseEvent, tab: TabItem) => {
  e.preventDefault()
  contextMenu.value = {
    visible: true,
    x: e.clientX,
    y: e.clientY,
    targetKey: tab.key,
  }
}

const hideContextMenu = () => {
  contextMenu.value.visible = false
}

const closeTab = (key: string) => {
  const tab = tabsStore.tabs.find((t) => t.key === key)
  tabsStore.closeTab(key)
  // Navigate to active tab after closing
  const activeTab = tabsStore.tabs.find((t) => t.key === tabsStore.activeKey)
  if (activeTab && route.path !== activeTab.path) {
    router.push(activeTab.path)
  }
}

const closeOthers = (key: string) => {
  tabsStore.closeOtherTabs(key)
  const tab = tabsStore.tabs.find((t) => t.key === key)
  if (tab) router.push(tab.path)
  hideContextMenu()
}

const closeLeft = (key: string) => {
  tabsStore.closeLeftTabs(key)
  hideContextMenu()
}

const closeRight = (key: string) => {
  tabsStore.closeRightTabs(key)
  hideContextMenu()
}

const closeAll = () => {
  tabsStore.closeAllTabs()
  const first = tabsStore.tabs[0]
  if (first) router.push(first.path)
  hideContextMenu()
}

// ─── Navigate to tab ───
const navigateToTab = (tab: TabItem) => {
  tabsStore.setActiveTab(tab.key)
  router.push(tab.path)
}

// ─── Tab bar drag-to-scroll ───
const tabBar = ref<HTMLElement | null>(null)
let isDown = false
let startX = 0
let scrollLeft = 0

const onMouseDown = (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('.tab-item')) return
  isDown = true
  startX = e.pageX - (tabBar.value?.offsetLeft ?? 0)
  scrollLeft = tabBar.value?.scrollLeft ?? 0
}

const onMouseMove = (e: MouseEvent) => {
  if (!isDown || !tabBar.value) return
  e.preventDefault()
  const x = e.pageX - tabBar.value.offsetLeft
  const walk = (x - startX) * 1.5
  tabBar.value.scrollLeft = scrollLeft - walk
}

const onMouseUp = () => { isDown = false }

// ─── Scroll active tab into view ───
watch(() => tabsStore.activeKey, async () => {
  await nextTick()
  const activeEl = tabBar.value?.querySelector('.tab-item--active')
  if (activeEl) {
    activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }
})
</script>

<template>
  <!-- Tab Bar -->
  <div class="tab-bar-wrapper">
    <div
      class="tab-bar"
      ref="tabBar"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
    >
      <TransitionGroup name="tab-slide" tag="div" class="tab-list">
        <template v-for="(tab, index) in tabsStore.tabs" :key="tab.key">
          <!-- Divider giữa các tab -->
          <div
            v-if="index > 0"
            class="tab-separator"
            :class="{
              'tab-separator--hidden':
                tab.key === tabsStore.activeKey ||
                tabsStore.tabs[index - 1]?.key === tabsStore.activeKey,
            }"
          />

          <div
            class="tab-item"
            :class="{
              'tab-item--active': tab.key === tabsStore.activeKey,
              'tab-item--affix': tab.affix,
            }"
            @click="navigateToTab(tab)"
            @contextmenu="showContextMenu($event, tab)"
          >
            <!-- Active indicator dot -->
            <span v-if="tab.key === tabsStore.activeKey" class="tab-dot" />

            <!-- Tab title -->
            <span class="tab-title">{{ tab.title }}</span>

            <!-- Affix pin icon -->
            <Pin v-if="tab.affix" :size="10" class="tab-pin-icon" />

            <!-- Close button -->
            <button
              v-if="!tab.affix"
              class="tab-close"
              @click.stop="closeTab(tab.key)"
              :title="`Close ${tab.title}`"
            >
              <X :size="11" />
            </button>
          </div>
        </template>
      </TransitionGroup>
    </div>
  </div>

  <!-- Right-click Context Menu -->
  <Teleport to="body">
    <div
      v-if="contextMenu.visible"
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      @click.stop
    >
      <button
        class="context-item"
        @click="closeTab(contextMenu.targetKey); hideContextMenu()"
        :disabled="tabsStore.tabs.find(t => t.key === contextMenu.targetKey)?.affix"
      >
        Close tab
      </button>
      <button class="context-item" @click="closeOthers(contextMenu.targetKey)">
        Close other tabs
      </button>
      <button class="context-item" @click="closeLeft(contextMenu.targetKey)">
        Close tabs to the left
      </button>
      <button class="context-item" @click="closeRight(contextMenu.targetKey)">
        Close tabs to the right
      </button>
      <div class="context-separator" />
      <button class="context-item context-item--danger" @click="closeAll">
        Close all tabs
      </button>
    </div>

    <!-- Backdrop to close context menu -->
    <div
      v-if="contextMenu.visible"
      class="context-backdrop"
      @click="hideContextMenu"
      @contextmenu.prevent="hideContextMenu"
    />
  </Teleport>
</template>

<style scoped>
/* ─── Tab Bar Wrapper ─── */
.tab-bar-wrapper {
  background: var(--tab-bar, var(--card));
  border-bottom: 1px solid var(--tab-bar-border, var(--border));
  height: 38px;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
}

.tab-bar {
  display: flex;
  align-items: stretch;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  cursor: default;
  user-select: none;
}

.tab-bar::-webkit-scrollbar {
  display: none;
}

.tab-list {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 8px;
  gap: 0;
}

/* ─── Separator dọc giữa các tab ─── */
.tab-separator {
  width: 1px;
  height: 14px;
  background: var(--tab-bar-border, var(--border));
  flex-shrink: 0;
  transition: opacity 0.15s ease;
  opacity: 1;
  margin: 0 2px;
}

/* Ẩn separator khi tab kề bên đang active (tránh line đứt gãy trông lạ) */
.tab-separator--hidden {
  opacity: 0;
}

/* ─── Tab Item ─── */
.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  height: 26px;
  border-radius: 5px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--tab-text, var(--muted-foreground));
  background: transparent;
  border: 1px solid transparent;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  position: relative;
  margin: 5px 0;
}

.tab-item:hover {
  background: var(--tab-hover-bg, var(--accent));
  color: var(--foreground);
  border-color: var(--border);
}

.tab-item--active {
  background: var(--tab-active-bg);
  color: var(--tab-active-color);
  border-color: var(--tab-active-border);
  box-shadow: 0 1px 3px color-mix(in srgb, var(--foreground) 8%, transparent);
}

/* ─── Active dot indicator ─── */
.tab-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--tab-active-color, var(--primary));
  flex-shrink: 0;
}

/* ─── Tab Title ─── */
.tab-title {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ─── Pin icon ─── */
.tab-pin-icon {
  color: var(--tab-active-color, var(--primary));
  flex-shrink: 0;
  opacity: 0.7;
}

/* ─── Close button ─── */
.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.12s ease, background 0.12s ease;
  flex-shrink: 0;
}

.tab-item:hover .tab-close,
.tab-item--active .tab-close {
  opacity: 0.6;
}

.tab-close:hover {
  opacity: 1 !important;
  background: color-mix(in srgb, var(--destructive) 15%, transparent);
  color: var(--destructive);
}

/* ─── Tab Transition (slide in from left) ─── */
.tab-slide-enter-active {
  animation: tab-in 0.2s ease-out;
}
.tab-slide-leave-active {
  animation: tab-out 0.15s ease-in forwards;
}
.tab-slide-move {
  transition: transform 0.2s ease;
}

@keyframes tab-in {
  from {
    opacity: 0;
    transform: translateX(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes tab-out {
  from {
    opacity: 1;
    transform: scale(1);
    max-width: 200px;
    padding-left: 10px;
    padding-right: 10px;
  }
  to {
    opacity: 0;
    transform: scale(0.9);
    max-width: 0;
    padding-left: 0;
    padding-right: 0;
  }
}
</style>

<style>
/* ─── Context Menu (global, teleported) ─── */
.context-menu {
  position: fixed;
  z-index: 9999;
  background: var(--popover);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  padding: 4px;
  min-width: 180px;
  animation: context-menu-in 0.12s ease-out;
}

@keyframes context-menu-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.context-item {
  display: block;
  width: 100%;
  padding: 7px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-size: 12.5px;
  color: var(--popover-foreground);
  border-radius: 5px;
  transition: background 0.12s ease;
}

.context-item:hover:not(:disabled) {
  background: var(--accent);
  color: var(--accent-foreground);
}

.context-item:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.context-item--danger {
  color: var(--destructive);
}

.context-item--danger:hover {
  background: color-mix(in srgb, var(--destructive) 12%, transparent) !important;
}

.context-separator {
  height: 1px;
  background: var(--border);
  margin: 4px 0;
}

.context-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9998;
}
</style>
