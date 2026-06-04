<script setup lang="ts">
import { computed } from 'vue'
import { useSidebarStore } from '@/stores/sidebar.store'
import SidebarHead from './sidebar/SidebarHead.vue'
import SidebarBody from './sidebar/SidebarBody.vue'
import SidebarFooter from './sidebar/SidebarFooter.vue'

const sidebarStore = useSidebarStore()
const isCollapsed = computed(() => sidebarStore.isCollapsed)
</script>

<template>
  <aside
    class="sidebar"
    :class="{ 'sidebar--collapsed': isCollapsed }"
  >
    <SidebarHead />
    <SidebarBody />
    <SidebarFooter />
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 40;
  display: flex;
  flex-direction: column;
  background: var(--sidebar);
  width: 220px;
  transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border-right: 1px solid var(--sidebar-border);
}

.sidebar--collapsed {
  width: 58px;
}
</style>
