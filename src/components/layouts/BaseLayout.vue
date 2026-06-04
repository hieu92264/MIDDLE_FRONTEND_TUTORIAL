<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar.store'
import { useTabsStore } from '@/stores/tabs.store'
import { useAppStore } from '@/stores/app.store'
import { useColorMode } from '@vueuse/core'
import SidebarSection from './partials/SidebarSection.vue'
import HeaderSection from './partials/HeaderSection.vue'
import TabBar from './partials/TabBar.vue'

const route = useRoute()
const sidebarStore = useSidebarStore()
const tabsStore = useTabsStore()
const appStore = useAppStore()
const mode = useColorMode()

const isCollapsed = computed(() => sidebarStore.isCollapsed)
const isPageLoading = computed(() => appStore.isPageLoading)
const isMobileOpen = ref(false)

const closeMobile = () => { isMobileOpen.value = false }
const openMobile = () => { isMobileOpen.value = true }

// Auto-open tab whenever route changes
watch(
  () => route.fullPath,
  () => {
    const title = (route.meta?.title as string) || (route.name as string) || 'Page'
    const affix = route.meta?.affix as boolean | undefined
    tabsStore.openTab({
      key: route.fullPath,
      title,
      path: route.fullPath,
      name: route.name as string,
      affix,
    })
  },
  { immediate: true },
)
</script>

<template>
  <div class="app-layout" :class="{ dark: mode === 'dark' }">

    <!-- Mobile Backdrop -->
    <Transition name="backdrop">
      <div
        v-if="isMobileOpen"
        class="mobile-backdrop"
        @click="closeMobile"
      />
    </Transition>

    <!-- Sidebar -->
    <div
      class="sidebar-wrapper"
      :class="{
        'sidebar-wrapper--collapsed': isCollapsed,
        'sidebar-wrapper--mobile-open': isMobileOpen,
      }"
    >
      <SidebarSection />
    </div>

    <!-- Main Area -->
    <div
      class="main-area"
      :class="{
        'main-area--collapsed': isCollapsed,
      }"
    >
      <!-- Header -->
      <HeaderSection @open-mobile-sidebar="openMobile" />

      <!-- Tab Bar -->
      <TabBar />

      <!-- Page Content -->
      <main class="page-content">
        <!-- Global Loading Overlay -->
        <Transition name="loading-overlay">
          <div v-if="isPageLoading" class="page-loading-overlay">
            <div class="page-loading-card">
              <!-- Spinner ring -->
              <div class="loading-spinner">
                <div class="loading-ring" />
                <div class="loading-ring loading-ring--delay" />
              </div>
              <!-- Pulsing dots -->
              <div class="loading-dots">
                <span class="loading-dot" />
                <span class="loading-dot loading-dot--d1" />
                <span class="loading-dot loading-dot--d2" />
              </div>
              <span class="loading-label">Loading...</span>
            </div>
          </div>
        </Transition>
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* ─── Root Layout ─── */
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans, 'Inter', sans-serif);
}

/* ─── Sidebar Wrapper ─── */
.sidebar-wrapper {
  width: 220px;
  flex-shrink: 0;
  transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-wrapper--collapsed {
  width: 58px;
}

/* Mobile: sidebar hidden by default */
@media (max-width: 767px) {
  .sidebar-wrapper {
    width: 0;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 50;
    overflow: visible;
  }

  .sidebar-wrapper--mobile-open {
    width: 220px;
  }
}

/* ─── Mobile Backdrop ─── */
.mobile-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  z-index: 45;
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* ─── Main Area ─── */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 100vh;
  transition: none; /* Sidebar handles its own animation */
}

/* ─── Page Content ─── */
.page-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  background: var(--background);
}

@media (min-width: 768px) {
  .page-content {
    padding: 24px;
  }
}

/* ─── Page Transition ─── */
.page-enter-active {
  animation: page-fade-in 0.18s ease-out;
}
.page-leave-active {
  transition: opacity 0.12s ease-in;
}
.page-leave-to {
  opacity: 0;
}

@keyframes page-fade-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ─── Global Loading Overlay ─── */
.page-loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--background) 70%, transparent);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.page-loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 40px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 0 0 1px color-mix(in srgb, var(--primary) 15%, transparent);
}

/* Spinner: two concentric rotating rings */
.loading-spinner {
  position: relative;
  width: 48px;
  height: 48px;
}

.loading-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: var(--primary);
  animation: ring-spin 0.9s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.loading-ring--delay {
  inset: 6px;
  border-top-color: color-mix(in srgb, var(--primary) 50%, transparent);
  animation-duration: 1.3s;
  animation-direction: reverse;
}

@keyframes ring-spin {
  to { transform: rotate(360deg); }
}

/* Pulsing dots */
.loading-dots {
  display: flex;
  gap: 6px;
  align-items: center;
}

.loading-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary);
  animation: dot-pulse 1.2s ease-in-out infinite;
}

.loading-dot--d1 {
  animation-delay: 0.2s;
  background: color-mix(in srgb, var(--primary) 70%, transparent);
}

.loading-dot--d2 {
  animation-delay: 0.4s;
  background: color-mix(in srgb, var(--primary) 40%, transparent);
}

@keyframes dot-pulse {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.5); opacity: 1; }
}

.loading-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--muted-foreground);
  letter-spacing: 0.02em;
}

/* Loading overlay transition */
.loading-overlay-enter-active {
  animation: loading-in 0.2s ease-out;
}
.loading-overlay-leave-active {
  animation: loading-out 0.18s ease-in forwards;
}

@keyframes loading-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes loading-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>
