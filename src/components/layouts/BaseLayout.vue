<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar.store'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useColorMode } from '@vueuse/core'
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  Sun,
  Moon,
  Bell,
  Search,
  Menu,
  ChevronsUpDown,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const router = useRouter()
const sidebarStore = useSidebarStore()
const authStore = useAuthStore()
const mode = useColorMode()

const isCollapsed = computed(() => sidebarStore.isCollapsed)
const isMobileOpen = ref(false)

const menuItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Users', path: '/users', icon: Users },
  { name: 'Settings', path: '/settings', icon: Settings },
]

const currentUser = computed(
  () => authStore.user || { username: 'Guest', email: 'guest@example.com', role: 'user' },
)

const toggleSidebarOrMobile = () => {
  if (window.innerWidth < 768) {
    isMobileOpen.value = !isMobileOpen.value
  } else {
    sidebarStore.toggle()
  }
}

const toggleTheme = () => {
  mode.value = mode.value === 'dark' ? 'light' : 'dark'
}

const handleLogout = async () => {
  try {
    authStore.clearSession()
    toast.success('Logged out successfully')
    router.push({ name: 'login' })
  } catch {
    authStore.clearSession()
    router.push({ name: 'login' })
  }
}
</script>

<template>
  <div
    class="min-h-screen flex bg-background text-foreground transition-colors duration-300 font-sans"
  >
    <!-- Backdrop Overlay on Mobile -->
    <div
      v-if="isMobileOpen"
      @click="isMobileOpen = false"
      class="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 md:hidden transition-opacity duration-300"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-card/60 backdrop-blur-xl border-r border-border transition-all duration-300 ease-in-out',
        isCollapsed ? 'md:w-20' : 'md:w-64',
        'w-64', // Always 64 (256px) wide on mobile when sliding in
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ]"
    >
      <!-- Sidebar Header -->
      <div
        class="h-16 flex items-center px-4 border-b border-border shrink-0 justify-between md:justify-start"
      >
        <div
          :class="[
            'flex items-center gap-3 overflow-hidden w-full',
            isCollapsed ? 'md:justify-center' : '',
          ]"
        >
          <div
            class="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0"
          >
            <span class="font-bold text-lg">A</span>
          </div>
          <span
            v-if="!isCollapsed"
            class="font-semibold text-lg bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent whitespace-nowrap md:block hidden"
          >
            Antigravity
          </span>
          <!-- Mobile Title always shown -->
          <span
            class="font-semibold text-lg bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent whitespace-nowrap md:hidden block"
          >
            Antigravity
          </span>
        </div>

        <!-- Mobile close button -->
        <button
          @click="isMobileOpen = false"
          class="h-8 w-8 rounded-lg hover:bg-accent hover:text-accent-foreground flex items-center justify-center border border-border shrink-0 md:hidden cursor-pointer"
        >
          <ChevronLeft class="h-4 w-4" />
        </button>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          v-slot="{ isActive }"
        >
          <span
            @click="isMobileOpen = false"
            :class="[
              'flex items-center transition-all duration-200 group cursor-pointer relative rounded-xl font-medium text-sm',
              isCollapsed
                ? 'md:h-10 md:w-10 md:justify-center md:mx-auto md:px-0 md:py-0'
                : 'px-3 py-2.5 w-full gap-3',
              'px-3 py-2.5 w-full gap-3', // default classes on mobile
              isActive
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground',
            ]"
          >
            <component
              :is="item.icon"
              :class="['h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105']"
            />
            <span
              :class="[
                'transition-all duration-300 whitespace-nowrap',
                isCollapsed ? 'md:hidden' : 'block',
              ]"
            >
              {{ item.name }}
            </span>
          </span>
        </router-link>
      </nav>

      <!-- Sidebar Footer (Shadcn style user menu) -->
      <div class="p-3 border-t border-border bg-accent/10">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button
              :class="[
                'flex items-center rounded-xl hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer w-full text-left outline-none border border-transparent select-none focus:bg-accent focus:text-accent-foreground',
                isCollapsed ? 'md:justify-center md:p-0 md:h-10 md:w-10 md:mx-auto' : 'p-2 gap-3',
              ]"
            >
              <!-- Avatar Initial badge -->
              <div
                class="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0 shadow-md shadow-primary/10"
              >
                {{ currentUser.username.charAt(0).toUpperCase() }}
              </div>
              <!-- Profile details -->
              <div
                :class="[
                  'flex-1 min-w-0 flex flex-col transition-all duration-300',
                  isCollapsed ? 'md:hidden' : 'block',
                ]"
              >
                <span class="text-xs font-bold text-foreground truncate">{{
                  currentUser.username
                }}</span>
                <span class="text-[10px] text-muted-foreground truncate">{{
                  currentUser.email
                }}</span>
              </div>
              <!-- ChevronUpDown -->
              <ChevronsUpDown
                v-if="!isCollapsed"
                class="h-3.5 w-3.5 text-muted-foreground shrink-0 md:block hidden"
              />
            </button>
          </DropdownMenuTrigger>

          <!-- Menu Content -->
          <DropdownMenuContent align="end" class="w-56 mb-2 z-50">
            <DropdownMenuLabel class="font-normal flex flex-col gap-1 p-2">
              <span class="text-xs font-semibold text-foreground">{{ currentUser.username }}</span>
              <span class="text-[10px] text-muted-foreground truncate">{{
                currentUser.email
              }}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="cursor-pointer text-xs font-medium py-2">
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem class="cursor-pointer text-xs font-medium py-2">
              Billing Info
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              @click="handleLogout"
              class="cursor-pointer text-xs font-medium text-destructive focus:bg-destructive/10 focus:text-destructive py-2"
            >
              <LogOut class="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>

    <!-- Main View Content -->
    <div
      :class="[
        'flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-in-out',
        isCollapsed ? 'md:pl-20' : 'md:pl-64',
        'pl-0', // Default mobile padding is 0 since sidebar is hidden
      ]"
    >
      <!-- Header / Navbar -->
      <header
        class="h-16 border-b border-border bg-card/60 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-20"
      >
        <!-- Search & Toggle Menu -->
        <div class="flex items-center gap-4">
          <button
            @click="toggleSidebarOrMobile"
            class="h-9 w-9 rounded-xl hover:bg-accent hover:text-accent-foreground flex items-center justify-center border border-border cursor-pointer outline-none shrink-0"
          >
            <Menu class="h-5 w-5" />
          </button>

          <div class="relative max-w-xs hidden sm:block">
            <Search class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search anything..."
              class="w-64 pl-9 pr-4 py-2 text-xs rounded-xl bg-accent/30 border border-border focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all bg-card/40"
            />
          </div>
        </div>

        <!-- Header Actions -->
        <div class="flex items-center gap-3">
          <!-- Dark Mode Toggle Button -->
          <button
            @click="toggleTheme"
            class="h-9 w-9 rounded-xl hover:bg-accent hover:text-accent-foreground flex items-center justify-center border border-border transition-colors cursor-pointer relative outline-none"
          >
            <Sun v-if="mode === 'dark'" class="h-4.5 w-4.5 text-amber-500 animate-pulse-slow" />
            <Moon v-else class="h-4.5 w-4.5 text-indigo-500" />
            <span class="sr-only">Toggle theme</span>
          </button>

          <button
            class="h-9 w-9 rounded-xl hover:bg-accent hover:text-accent-foreground flex items-center justify-center border border-border transition-colors cursor-pointer relative"
          >
            <Bell class="h-4 w-4" />
            <span
              class="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background"
            ></span>
          </button>

          <div class="h-px w-4 bg-border rotate-90 hidden sm:block"></div>

          <div class="items-center gap-3 hidden sm:flex">
            <span
              class="text-xs font-semibold text-muted-foreground bg-accent/50 px-2.5 py-1 rounded-full uppercase tracking-wider"
            >
              {{ currentUser.role }}
            </span>
          </div>
        </div>
      </header>

      <!-- View Container -->
      <main class="flex-1 p-4 md:p-8 bg-background/50 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<style>
.animate-spin-slow {
  animation: spin 8s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
