<script setup lang="ts">
import { computed } from 'vue'
import { useSidebarStore } from '@/stores/sidebar.store'

const sidebarStore = useSidebarStore()
const isCollapsed = computed(() => sidebarStore.isCollapsed)
</script>

<template>
  <!-- Logo Area -->
  <div
    class="sidebar-head"
    :class="{ 'sidebar-head--collapsed': isCollapsed }"
  >
    <!-- Logo Icon -->
    <div class="sidebar-logo-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
      </svg>
    </div>

    <!-- App Name -->
    <Transition name="sidebar-text">
      <span v-if="!isCollapsed" class="sidebar-logo-text">
        Antigravity
      </span>
    </Transition>
  </div>
</template>

<style scoped>
.sidebar-head {
  height: 48px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  border-bottom: 1px solid var(--sidebar-border);
  overflow: hidden;
  white-space: nowrap;
  cursor: default;
  transition: padding 0.3s ease;
  flex-shrink: 0;
}

.sidebar-head--collapsed {
  padding: 0;
  justify-content: center;
}

.sidebar-logo-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--sidebar-primary) 0%, color-mix(in srgb, var(--sidebar-primary) 70%, #fff) 100%);
  color: var(--sidebar-primary-foreground);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--sidebar-primary) 40%, transparent);
}

.sidebar-logo-text {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.3px;
  background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.75) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Transition for text show/hide */
.sidebar-text-enter-active,
.sidebar-text-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.sidebar-text-enter-from,
.sidebar-text-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
