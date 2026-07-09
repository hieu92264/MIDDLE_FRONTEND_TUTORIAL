<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar.store'
import { useAppStore } from '@/stores/app.store'
import { useColorMode } from '@vueuse/core'
import {
  PanelLeft,
  RotateCcw,
  Sun,
  Moon,
  Bell,
  Maximize,
  Minimize,
  Search,
} from 'lucide-vue-next'

const route = useRoute()
const sidebarStore = useSidebarStore()
const appStore = useAppStore()
const mode = useColorMode()

const isCollapsed = computed(() => sidebarStore.isCollapsed)
const isFullscreen = ref(false)
const isReloading = ref(false)

// Breadcrumb — build from route matched
const breadcrumbs = computed(() => {
  const crumbs: { title: string; path?: string }[] = []
  const matched = route.matched

  matched.forEach((r) => {
    if (r.meta?.title) {
      crumbs.push({
        title: r.meta.title as string,
        path: r.path,
      })
    }
  })

  // Also add current route title if not already in matched
  if (route.meta?.title && crumbs.length === 0) {
    crumbs.push({ title: route.meta.title as string })
  }

  return crumbs
})

const currentTitle = computed(() => {
  return (route.meta?.title as string) || 'Dashboard'
})

const toggleSidebar = () => sidebarStore.toggle()

const reloadPage = () => {
  if (isReloading.value) return
  isReloading.value = true
  appStore.startPageLoading()
  // Simulate loading progress then finish
  setTimeout(() => {
    appStore.finishPageLoading()
    isReloading.value = false
  }, 800)
}

const toggleTheme = (event: MouseEvent) => {
  const isDark = mode.value === 'dark'
  const newMode = isDark ? 'light' : 'dark'

  // View Transition API — circular ripple from click position
  if (!document.startViewTransition) {
    mode.value = newMode
    return
  }

  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  )

  // Set BEFORE startViewTransition để CSS z-index được áp dụng ngay
  document.documentElement.dataset.themeTransition = newMode
  // Tắt CSS color transitions (tránh conflict với snapshot)
  document.documentElement.classList.add('theme-transitioning')

  // Sync callback (không async/rAF) — tránh lag.
  // Toggle .dark trực tiếp lên html NGAY BÊN TRONG callback để browser
  // compute CSS custom properties đúng trước khi chụp snapshot "after".
  const transition = document.startViewTransition(() => {
    document.documentElement.classList.toggle('dark', newMode === 'dark')
    mode.value = newMode
  })


  transition.ready.then(() => {
    if (newMode === 'dark') {
      // Light → Dark: layer cũ (sáng) thu nhỏ lại — màn đêm nuốt chướng 🌙
      // fill: 'forwards' giữ clip-path=0 đến cuối, tránh reset về full-screen trước khi pseudo-element bị xóa
      document.documentElement.animate(
        {
          clipPath: [
            `circle(${endRadius}px at ${x}px ${y}px)`,
            `circle(0px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: 'ease-in',
          fill: 'forwards',
          pseudoElement: '::view-transition-old(root)',
        },
      )
    } else {
      // Dark → Light: layer mới (sáng) mở rộng ra — bình minh ló dạng ☀️
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 450,
          easing: 'ease-out',
          fill: 'forwards',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    }
  })

  transition.finished.then(() => {
    document.documentElement.classList.remove('theme-transitioning')
    delete document.documentElement.dataset.themeTransition
  })
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}
</script>

<template>
  <header class="app-header">
    <!-- Left: Sidebar Toggle + Reload + Breadcrumb -->
    <div class="header-left">
      <!-- Sidebar Toggle -->
      <button
        class="header-icon-btn"
        @click="toggleSidebar"
        title="Toggle Sidebar"
      >
        <PanelLeft :size="17" />
      </button>

      <!-- Reload -->
      <button
        class="header-icon-btn"
        :class="{ 'header-icon-btn--reloading': isReloading }"
        @click="reloadPage"
        title="Reload page"
      >
        <RotateCcw :size="15" :class="{ 'icon-spin': isReloading }" />
      </button>

      <!-- Divider -->
      <div class="header-divider" />

      <!-- Breadcrumb -->
      <nav class="header-breadcrumb" aria-label="Breadcrumb">
        <template v-for="(crumb, idx) in breadcrumbs" :key="idx">
          <span v-if="idx > 0" class="breadcrumb-separator">/</span>
          <span
            class="breadcrumb-item"
            :class="{ 'breadcrumb-item--active': idx === breadcrumbs.length - 1 }"
          >
            {{ crumb.title }}
          </span>
        </template>

        <!-- Fallback: current page title -->
        <span v-if="breadcrumbs.length === 0" class="breadcrumb-item breadcrumb-item--active">
          {{ currentTitle }}
        </span>
      </nav>
    </div>

    <!-- Right: Actions -->
    <div class="header-right">
      <!-- Search -->
      <div class="header-search">
        <Search :size="14" class="header-search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm ..."
          class="header-search-input"
        />
        <span class="header-search-kbd">ctrl K</span>
      </div>

      <!-- Theme Toggle -->
      <button
        class="header-icon-btn theme-toggle-btn"
        @click="toggleTheme($event)"
        :title="mode === 'dark' ? 'Switch to light' : 'Switch to dark'"
      >
        <Transition name="theme-icon" mode="out-in">
          <Sun v-if="mode === 'dark'" :size="16" class="text-amber-400" key="sun" />
          <Moon v-else :size="16" class="text-indigo-400" key="moon" />
        </Transition>
      </button>

      <!-- Fullscreen -->
      <button class="header-icon-btn" @click="toggleFullscreen" title="Fullscreen">
        <Maximize v-if="!isFullscreen" :size="16" />
        <Minimize v-else :size="16" />
      </button>

      <!-- Notifications -->
      <button class="header-icon-btn header-notif-btn" title="Notifications">
        <Bell :size="16" />
        <span class="notif-dot" />
      </button>

      <!-- Divider -->
      <div class="header-divider" />

      <!-- User Avatar -->
      <div class="header-avatar">A</div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--card);
  border-bottom: 1px solid var(--border);
  gap: 12px;
  flex-shrink: 0;
}

/* ─── Left ─── */
.header-left {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.header-divider {
  width: 1px;
  height: 16px;
  background: var(--border);
  margin: 0 4px;
  flex-shrink: 0;
}

/* ─── Icon Button ─── */
.header-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--muted-foreground);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease, color 0.15s ease;
}

.header-icon-btn:hover {
  background: var(--accent);
  color: var(--foreground);
}

/* ─── Breadcrumb ─── */
.header-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  min-width: 0;
  overflow: hidden;
}

.breadcrumb-separator {
  color: var(--muted-foreground);
  opacity: 0.5;
  font-size: 12px;
}

.breadcrumb-item {
  color: var(--muted-foreground);
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
}

.breadcrumb-item--active {
  color: var(--foreground);
  font-weight: 500;
}

/* ─── Right ─── */
.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

/* ─── Search ─── */
.header-search {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--muted);
  cursor: text;
  min-width: 160px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.header-search:focus-within {
  border-color: var(--ring);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ring) 20%, transparent);
}

.header-search-icon {
  color: var(--muted-foreground);
  flex-shrink: 0;
}

.header-search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 12.5px;
  color: var(--foreground);
  flex: 1;
  width: 100%;
}

.header-search-input::placeholder {
  color: var(--muted-foreground);
}

.header-search-kbd {
  font-size: 10px;
  color: var(--muted-foreground);
  background: var(--border);
  border-radius: 3px;
  padding: 1px 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ─── Notifications ─── */
.header-notif-btn {
  position: relative;
}

.notif-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--destructive);
  border: 1.5px solid var(--card);
}

/* ─── User Avatar ─── */
.header-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 60%, #8b5cf6));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  margin-left: 4px;
}

/* ─── Responsive ─── */
@media (max-width: 640px) {
  .header-search {
    display: none;
  }
  .header-breadcrumb {
    display: none;
  }
}

/* ─── Reload spin animation ─── */
.icon-spin {
  animation: icon-spin 0.7s linear infinite;
}

@keyframes icon-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

.header-icon-btn--reloading {
  color: var(--primary);
  background: color-mix(in srgb, var(--primary) 10%, transparent);
}

/* ─── Theme toggle icon transition ─── */
.theme-icon-enter-active,
.theme-icon-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.theme-icon-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.5);
}
.theme-icon-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}
</style>
