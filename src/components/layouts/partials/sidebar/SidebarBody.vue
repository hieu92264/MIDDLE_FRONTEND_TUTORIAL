<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar.store'
import { useTabsStore } from '@/stores/tabs.store'
import { sidebarData, type SidebarItem } from './sidebar-data'
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

// Check if a path is active (exact or prefix for parent)
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
  // Open tab
  if (item.path) {
    tabsStore.openTab({
      key: item.path,
      title: item.title,
      path: item.path,
      affix: item.affix,
    })
  }
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
              <component :is="item.icon" v-if="item.icon" :size="18" />
            </span>
            <Transition name="sidebar-text">
              <span v-if="!isCollapsed" class="sidebar-item-label">
                {{ item.title }}
                <span v-if="item.badge" class="sidebar-badge">{{ item.badge }}</span>
              </span>
            </Transition>
            <Transition name="sidebar-text">
              <ChevronRight
                v-if="!isCollapsed"
                :size="14"
                class="sidebar-chevron"
                :class="{ 'sidebar-chevron--open': isExpanded(item.key) }"
              />
            </Transition>
          </button>

          <!-- Children submenu -->
          <Transition name="submenu">
            <div v-if="isExpanded(item.key) && !isCollapsed" class="sidebar-submenu">
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
                  <span class="sidebar-subitem-dot">
                    <span class="dot" :class="{ 'dot--active': childActive }" />
                  </span>
                  <span class="sidebar-item-label">{{ child.title }}</span>
                </button>
              </router-link>
            </div>
          </Transition>
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
              <component :is="item.icon" v-if="item.icon" :size="18" />
            </span>
            <Transition name="sidebar-text">
              <span v-if="!isCollapsed" class="sidebar-item-label">
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
  height: 8px;
}

/* ─── Menu Item ─── */
.sidebar-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  height: 42px;
  border-radius: 6px;
  margin: 1px 8px;
  width: calc(100% - 16px);
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--sidebar-foreground);
  font-size: 13.5px;
  font-weight: 500;
  text-align: left;
  transition: background 0.15s ease, color 0.15s ease;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-item:hover {
  background: var(--sidebar-accent);
  color: var(--sidebar-accent-foreground);
}

.sidebar-item--active {
  background: color-mix(in srgb, var(--sidebar-primary) 20%, transparent);
  color: var(--sidebar-primary);
}

.sidebar-item--active .sidebar-item-icon {
  color: var(--sidebar-primary);
}

.sidebar-item--collapsed {
  width: 42px;
  margin: 1px auto;
  padding: 0;
  justify-content: center;
}

.sidebar-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: inherit;
}

.sidebar-item-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 8px;
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
  transition: transform 0.25s ease;
}

.sidebar-chevron--open {
  transform: rotate(90deg);
}

/* ─── Submenu ─── */
.sidebar-submenu {
  overflow: hidden;
  padding: 2px 0;
}

.sidebar-subitem {
  width: calc(100% - 16px);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px 0 36px;
  height: 36px;
  border-radius: 6px;
  margin: 1px 8px;
  cursor: pointer;
  border: none;
  background: transparent;
  color: color-mix(in srgb, var(--sidebar-foreground) 70%, transparent);
  font-size: 13px;
  font-weight: 400;
  text-align: left;
  transition: background 0.15s ease, color 0.15s ease;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-subitem:hover {
  background: var(--sidebar-accent);
  color: var(--sidebar-foreground);
}

.sidebar-subitem--active {
  color: var(--sidebar-primary);
}

.sidebar-subitem-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  flex-shrink: 0;
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--sidebar-muted-foreground);
  transition: all 0.15s ease;
}

.dot--active {
  width: 6px;
  height: 6px;
  background: var(--sidebar-primary);
  box-shadow: 0 0 6px color-mix(in srgb, var(--sidebar-primary) 60%, transparent);
}

/* ─── Animations ─── */
.sidebar-text-enter-active,
.sidebar-text-leave-active {
  transition: opacity 0.2s ease;
}
.sidebar-text-enter-from,
.sidebar-text-leave-to {
  opacity: 0;
}

.submenu-enter-active {
  animation: submenu-open 0.22s ease-out;
}
.submenu-leave-active {
  animation: submenu-open 0.18s ease-in reverse;
}

@keyframes submenu-open {
  from {
    opacity: 0;
    transform: translateY(-6px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 500px;
  }
}
</style>
