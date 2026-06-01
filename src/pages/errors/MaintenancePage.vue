<script setup lang="ts">
import { ref } from 'vue'
import { useColorMode } from '@vueuse/core'
import { Sun, Moon, Cog, RefreshCw, Server, CheckCircle2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'

const mode = useColorMode()
const isChecking = ref(false)
const progress = ref(85)

const toggleTheme = () => {
  mode.value = mode.value === 'dark' ? 'light' : 'dark'
}

const checkSystemStatus = () => {
  if (isChecking.value) return
  isChecking.value = true

  toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
    loading: 'Contacting server status nodes...',
    success: () => {
      isChecking.value = false
      progress.value = 92
      return 'System health ok. Service recovery is currently at 92%. Finalizing migration.'
    },
    error: 'Unable to resolve cluster nodes. Please retry.',
  })
}
</script>

<template>
  <div
    class="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground transition-colors duration-300 relative overflow-hidden font-sans p-6"
  >
    <!-- Background grid lines -->
    <div
      class="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"
    />

    <!-- Ambient glowing backgrounds (amber/yellow glow for maintenance) -->
    <div
      class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-[80px] pointer-events-none animate-pulse-slow"
    />

    <!-- Theme Toggle Floating Button -->
    <div class="absolute top-6 right-6 z-50">
      <Button
        variant="outline"
        size="icon"
        class="rounded-xl border-border bg-card/60 backdrop-blur-md cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-all duration-300"
        @click="toggleTheme"
      >
        <Sun v-if="mode === 'dark'" class="h-4.5 w-4.5 text-amber-500 animate-pulse" />
        <Moon v-else class="h-4.5 w-4.5 text-indigo-500" />
      </Button>
    </div>

    <!-- Error Content Card (Shadcn Style) -->
    <div
      class="w-full max-w-xl bg-card border border-border/80 rounded-2xl p-8 md:p-10 shadow-lg flex flex-col items-center text-center relative z-10 space-y-6 transition-all duration-300 hover:shadow-xl"
    >
      <!-- Dual animated Gears -->
      <div class="relative h-20 w-20 flex items-center justify-center select-none">
        <Cog class="h-16 w-16 text-amber-500 animate-spin-slow shrink-0" />
        <Cog
          class="h-8 w-8 text-amber-500/70 animate-spin-reverse absolute -bottom-1 -right-1 shrink-0"
        />
      </div>

      <!-- Text Header -->
      <div class="space-y-2">
        <div
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
        >
          Scheduled Maintenance
        </div>
        <h1 class="text-2xl font-extrabold tracking-tight">System Under Maintenance</h1>
        <p class="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          We are currently upgrading our hardware nodes to serve you better. We will be back online
          shortly. Thanks for your patience!
        </p>
      </div>

      <!-- Upgrade Status Widget -->
      <div class="w-full bg-accent/20 border border-border/60 rounded-xl p-4 text-left space-y-3.5">
        <div class="flex items-center justify-between text-xs font-semibold">
          <span class="flex items-center gap-2 text-foreground">
            <Server class="h-4 w-4 text-amber-500 animate-pulse" />
            Migrating DB Nodes
          </span>
          <span class="text-amber-600 dark:text-amber-400 font-bold">{{ progress }}%</span>
        </div>

        <!-- Progress Bar -->
        <div class="h-2 w-full bg-accent/40 rounded-full overflow-hidden relative">
          <div
            class="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-out shadow-sm"
            :style="{ width: `${progress}%` }"
          />
        </div>

        <div class="flex flex-col gap-1.5 text-[11px] text-muted-foreground">
          <div class="flex items-center gap-2">
            <CheckCircle2 class="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Server architecture upgrade completed</span>
          </div>
          <div class="flex items-center gap-2">
            <CheckCircle2 class="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Asset optimizations completed</span>
          </div>
          <div class="flex items-center gap-2">
            <RefreshCw
              class="h-3.5 w-3.5 text-amber-500 animate-spin shrink-0"
              style="animation-duration: 4s"
            />
            <span class="animate-pulse">Syncing core user databases (Current stage)</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-center w-full pt-2">
        <Button
          variant="outline"
          class="h-10 px-5 rounded-xl font-medium text-xs flex items-center justify-center gap-2 border border-border bg-card/60 text-foreground hover:bg-accent transition-all cursor-pointer shadow-xs active:scale-98 disabled:opacity-50"
          :disabled="isChecking"
          @click="checkSystemStatus"
        >
          <RefreshCw :class="['h-3.5 w-3.5', isChecking ? 'animate-spin' : '']" />
          {{ isChecking ? 'Checking Status...' : 'Check Recovery Status' }}
        </Button>
      </div>
    </div>

    <!-- Micro-details footer -->
    <div class="absolute bottom-6 text-[10px] text-muted-foreground select-none relative z-10 mt-6">
      © {{ new Date().getFullYear() }} Antigravity Platform. All rights reserved.
    </div>
  </div>
</template>

<template></template>

<style scoped>
.animate-spin-slow {
  animation: spin 12s linear infinite;
}
.animate-spin-reverse {
  animation: spin-reverse 8s linear infinite;
}
.animate-pulse-slow {
  animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes spin-reverse {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}
@keyframes pulse-slow {
  0%,
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.05);
  }
}
</style>
