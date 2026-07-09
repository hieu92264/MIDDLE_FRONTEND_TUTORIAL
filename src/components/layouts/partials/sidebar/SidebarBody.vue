<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar.store'
import { useTabsStore } from '@/stores/tabs.store'
import { sidebarData, type SidebarItem, type SidebarGroup } from './sidebar-data'
import { ChevronRight } from 'lucide-vue-next'

const route = useRoute()
const sidebarStore = useSidebarStore()
const tabsStore = useTabsStore()
const isCollapsed = computed(() => sidebarStore.isCollapsed)

// Track which submenus are expanded
const expandedKeys = ref<Set<string>>(new Set())

const toggleExpand = (key: string) => {
  if (expandedKeys.value.has(key)) {
    expandedKeys.value.delete(key)
  } else {
    expandedKeys.value.add(key)
  }
}

const isExpanded = (key: string) => expandedKeys.value.has(key)

// Check if a path is active
const isActive = (path?: string) => {
  if (!path) return false
  return route.path === path
}

const isParentActive = (item: SidebarItem): boolean => {
  if (!item.children) return false
  return item.children.some((child) => isActive(child.path))
}

const handleItemClick = (item: SidebarItem) => {
  if (item.children && item.children.length > 0) {
    if (!isCollapsed.value) {
      toggleExpand(item.key)
    }
    return
  }
  if (item.path) {
    tabsStore.openTab({
      key: item.path,
      title: item.title,
      path: item.path,
      affix: item.affix,
    })
  }
}

// Build flat ordered index for numbering: group-level index + child sub-index
// Returns a map: itemKey → { groupIndex, itemIndex, childIndex? }
const buildNumberMap = () => {
  const map = new Map<string, { g: number; i: number; ci?: number }>()
  let gIdx = 0
  sidebarData.forEach((group) => {
    gIdx++
    group.items.forEach((item, iIdx) => {
      map.set(item.key, { g: gIdx, i: iIdx + 1 })
      item.children?.forEach((child, cIdx) => {
        map.set(child.key, { g: gIdx, i: iIdx + 1, ci: cIdx + 1 })
      })
    })
  })
  return map
}
const numberMap = buildNumberMap()

const getParentNumber = (item: SidebarItem) => {
  const n = numberMap.get(item.key)
  if (!n) return ''
  return `${n.g}.`
}

const getChildNumber = (item: SidebarItem) => {
  const n = numberMap.get(item.key)
  if (!n || n.ci === undefined) return ''
  return `${n.g}.${n.ci}`
}

// Initialize expanded state for active parent menus
const initExpandedState = () => {
  sidebarData.forEach((group) => {
    group.items.forEach((item) => {
      if (item.children && isParentActive(item)) {
        expandedKeys.value.add(item.key)
      }
    })
  })
}
initExpandedState()
</script>

<template>
  <nav class="sidebar-nav">
    <template v-for="group in sidebarData" :key="group.groupKey">
      <!-- Group Label -->
      <div
        v-if="group.groupLabel && !isCollapsed"
        class="sidebar-group-label"
      >
        {{ group.groupLabel }}
      </div>
      <div v-if="group.groupLabel && !isCollapsed" class="sidebar-group-divider" />

      <!-- Menu Items -->
      <template v-for="item in group.items" :key="item.key">
        <!-- Parent with children -->
        <template v-if="item.children && item.children.length">
          <!-- Parent trigger -->
          <button
            class="sidebar-item"
            :class="{
              'sidebar-item--active': isParentActive(item),
              'sidebar-item--collapsed': isCollapsed,
            }"
            @click="handleItemClick(item)"
            :title="isCollapsed ? item.title : undefined"
          >
            <span class="sidebar-item-icon">
              <component :is="item.icon" v-if="item.icon" :size="17" />
            </span>
            <Transition name="sidebar-text">
              <span v-if="!isCollapsed" class="sidebar-item-label">
                <span v-if="!isCollapsed" class="sidebar-item-num">{{ getParentNumber(item) }}</span>
                {{ item.title }}
                <span v-if="item.badge" class="sidebar-badge">{{ item.badge }}</span>
              </span>
            </Transition>
            <Transition name="sidebar-text">
              <ChevronRight
                v-if="!isCollapsed"
                :size="13"
                class="sidebar-chevron"
                :class="{ 'sidebar-chevron--open': isExpanded(item.key) }"
              />
            </Transition>
          </button>

          <!-- ✅ CSS Grid accordion — NO layout reflow, silky smooth -->
          <div
            class="sidebar-submenu-grid"
            :class="{ 'sidebar-submenu-grid--open': isExpanded(item.key) && !isCollapsed }"
          >
            <div class="sidebar-submenu-inner">
              <router-link
                v-for="child in item.children"
                :key="child.key"
                :to="child.path || '/'"
                custom
                v-slot="{ navigate, isActive: childActive }"
              >
                <button
                  class="sidebar-subitem"
                  :class="{ 'sidebar-subitem--active': childActive }"
                  @click="() => { handleItemClick(child); navigate() }"
                >
                  <span class="sidebar-subitem-num">{{ getChildNumber(child) }}</span>
                  <span class="sidebar-item-label">{{ child.title }}</span>
                </button>
              </router-link>
            </div>
          </div>
        </template>

        <!-- Leaf item (no children) -->
        <router-link
          v-else
          :to="item.path || '/'"
          custom
          v-slot="{ navigate, isActive: itemActive }"
        >
          <button
            class="sidebar-item"
            :class="{
              'sidebar-item--active': itemActive,
              'sidebar-item--collapsed': isCollapsed,
            }"
            @click="() => { handleItemClick(item); navigate() }"
            :title="isCollapsed ? item.title : undefined"
          >
            <span class="sidebar-item-icon">
              <component :is="item.icon" v-if="item.icon" :size="17" />
            </span>
            <Transition name="sidebar-text">
              <span v-if="!isCollapsed" class="sidebar-item-label">
                <span class="sidebar-item-num">{{ getParentNumber(item) }}</span>
                {{ item.title }}
                <span v-if="item.badge" class="sidebar-badge">{{ item.badge }}</span>
              </span>
            </Transition>
          </button>
        </router-link>
      </template>

      <!-- Group spacer -->
      <div class="sidebar-group-spacer" />
    </template>
  </nav>
</template>

<style scoped>
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 0;
}

.sidebar-group-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--sidebar-muted-foreground);
  padding: 12px 16px 4px;
  user-select: none;
}

.sidebar-group-divider {
  height: 1px;
  background: var(--sidebar-border);
  margin: 0 12px 4px;
}

.sidebar-group-spacer {
  height: 4px;
}

/* ─── Menu Item ─── */
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  height: 38px;
  border-radius: 6px;
  margin: 1px 8px;
  width: calc(100% - 16px);
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--sidebar-foreground);
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  /* Only transition bg/color — NOT height — avoids reflow */
  transition: background 0.15s ease, color 0.15s ease;
  white-space: nowrap;
  overflow: hidden;
  flex-shrink: 0;
}

.sidebar-item:hover {
  background: var(--sidebar-accent);
  color: var(--sidebar-accent-foreground);
}

.sidebar-item--active {
  background: color-mix(in srgb, var(--sidebar-primary) 15%, transparent);
  color: var(--sidebar-primary);
  font-weight: 600;
}

.sidebar-item--active .sidebar-item-icon {
  color: var(--sidebar-primary);
}

.sidebar-item--collapsed {
  width: 38px;
  margin: 1px auto;
  padding: 0;
  justify-content: center;
}

.sidebar-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  color: inherit;
}

.sidebar-item-num {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--sidebar-muted-foreground);
  flex-shrink: 0;
  min-width: 16px;
}

.sidebar-item-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 6px;
}

.sidebar-badge {
  font-size: 10px;
  font-weight: 600;
  background: var(--sidebar-primary);
  color: var(--sidebar-primary-foreground);
  border-radius: 10px;
  padding: 1px 6px;
  margin-left: auto;
}

/* ─── Chevron ─── */
.sidebar-chevron {
  flex-shrink: 0;
  color: var(--sidebar-muted-foreground);
  /* Only rotate, no layout effect */
  transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.sidebar-chevron--open {
  transform: rotate(90deg);
}

/* ─────────────────────────────────────────────────────
   ✅ CSS Grid Accordion — smooth, zero layout reflow
   Uses grid-template-rows: 0fr ↔ 1fr
   This avoids height recalculation on every frame
   ───────────────────────────────────────────────────── */
.sidebar-submenu-grid {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  /* Use opacity for fade since grid handles the height */
  overflow: hidden;
}

.sidebar-submenu-grid--open {
  grid-template-rows: 1fr;
}

/* Inner wrapper must have overflow:hidden for the grid trick to work */
.sidebar-submenu-inner {
  overflow: hidden;
  /* Subtle fade: items fade in when grid opens */
  transition: opacity 0.18s ease;
  opacity: 0;
}

.sidebar-submenu-grid--open .sidebar-submenu-inner {
  opacity: 1;
}

/* ─── Subitem ─── */
.sidebar-subitem {
  width: calc(100% - 16px);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px 0 32px;
  height: 34px;
  border-radius: 6px;
  margin: 1px 8px;
  cursor: pointer;
  border: none;
  background: transparent;
  color: color-mix(in srgb, var(--sidebar-foreground) 65%, transparent);
  font-size: 12.5px;
  font-weight: 400;
  text-align: left;
  transition: background 0.15s ease, color 0.15s ease;
  white-space: nowrap;
  overflow: hidden;
  flex-shrink: 0;
}

.sidebar-subitem:hover {
  background: var(--sidebar-accent);
  color: var(--sidebar-foreground);
}

.sidebar-subitem--active {
  color: var(--sidebar-primary);
  font-weight: 500;
  background: color-mix(in srgb, var(--sidebar-primary) 8%, transparent);
}

.sidebar-subitem-num {
  font-size: 11px;
  font-weight: 600;
  color: var(--sidebar-muted-foreground);
  flex-shrink: 0;
  min-width: 22px;
}

.sidebar-subitem--active .sidebar-subitem-num {
  color: var(--sidebar-primary);
}

/* ─── Sidebar text transitions (collapse/expand sidebar itself) ─── */
.sidebar-text-enter-active,
.sidebar-text-leave-active {
  transition: opacity 0.18s ease;
}
.sidebar-text-enter-from,
.sidebar-text-leave-to {
  opacity: 0;
}
</style>
