<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useSidebarStore } from '@/stores/sidebar.store'
import { LogOut, Settings, User, ChevronsUpDown } from 'lucide-vue-next'
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
const authStore = useAuthStore()
const sidebarStore = useSidebarStore()

const isCollapsed = computed(() => sidebarStore.isCollapsed)
const currentUser = computed(
  () => authStore.user || { username: 'Admin', email: 'admin@example.com', role: 'admin' },
)

const avatarInitial = computed(() =>
  currentUser.value.username.charAt(0).toUpperCase(),
)

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
  <div class="sidebar-footer">
    <div class="sidebar-footer-divider" />

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <button
          class="sidebar-user-trigger"
          :class="{ 'sidebar-user-trigger--collapsed': isCollapsed }"
        >
          <!-- Avatar -->
          <div class="sidebar-avatar">
            {{ avatarInitial }}
          </div>

          <!-- Info -->
          <Transition name="sidebar-text">
            <div v-if="!isCollapsed" class="sidebar-user-info">
              <span class="sidebar-user-name">{{ currentUser.username }}</span>
              <span class="sidebar-user-email">{{ currentUser.email }}</span>
            </div>
          </Transition>

          <Transition name="sidebar-text">
            <ChevronsUpDown v-if="!isCollapsed" :size="14" class="sidebar-user-chevron" />
          </Transition>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start" class="w-52 mb-1">
        <DropdownMenuLabel class="font-normal px-2 py-2">
          <div class="flex flex-col gap-0.5">
            <span class="text-xs font-semibold text-foreground">{{ currentUser.username }}</span>
            <span class="text-[11px] text-muted-foreground truncate">{{ currentUser.email }}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem class="cursor-pointer text-xs gap-2">
          <User :size="14" />
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuItem class="cursor-pointer text-xs gap-2">
          <Settings :size="14" />
          Preferences
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          @click="handleLogout"
          class="cursor-pointer text-xs text-destructive focus:bg-destructive/10 focus:text-destructive gap-2"
        >
          <LogOut :size="14" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<style scoped>
.sidebar-footer {
  flex-shrink: 0;
  padding: 8px;
}

.sidebar-footer-divider {
  height: 1px;
  background: var(--sidebar-border);
  margin: 0 0 8px;
}

.sidebar-user-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--sidebar-foreground);
  text-align: left;
  transition: background 0.15s ease;
}

.sidebar-user-trigger:hover {
  background: var(--sidebar-accent);
  color: var(--sidebar-accent-foreground);
}

.sidebar-user-trigger--collapsed {
  justify-content: center;
  padding: 8px;
  width: 42px;
  margin: 0 auto;
}

.sidebar-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--sidebar-primary), color-mix(in srgb, var(--sidebar-primary) 60%, #8b5cf6));
  color: var(--sidebar-primary-foreground);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}

.sidebar-user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.sidebar-user-name {
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-user-email {
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-user-chevron {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.3);
}

/* Text transition */
.sidebar-text-enter-active,
.sidebar-text-leave-active {
  transition: opacity 0.2s ease;
}
.sidebar-text-enter-from,
.sidebar-text-leave-to {
  opacity: 0;
}
</style>
