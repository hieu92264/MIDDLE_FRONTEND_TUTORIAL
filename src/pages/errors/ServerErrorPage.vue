<script setup lang="ts">
import { ref } from 'vue'
import { useColorMode } from '@vueuse/core'
import {
  Sun,
  Moon,
  AlertOctagon,
  RefreshCw,
  Home,
  ChevronRight,
  ChevronDown,
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'

const router = useRouter()
const mode = useColorMode()
const showDetails = ref(false)

const toggleTheme = () => {
  mode.value = mode.value === 'dark' ? 'light' : 'dark'
}

const retry = () => {
  window.location.reload()
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div
    class="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground transition-colors duration-300 relative overflow-hidden font-sans p-6"
  >
    <!-- Circuit Board Grid Background -->
    <div
      class="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"
    />

    <!-- Crimson alarm ambient glow -->
    <div
      class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-500/10 dark:bg-red-500/15 rounded-full blur-[80px] pointer-events-none animate-pulse-slow"
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
      <!-- Blinking Alarm Icon -->
      <div class="relative flex items-center justify-center">
        <div
          class="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20"
        >
          <AlertOctagon class="h-10 w-10 text-red-500 animate-pulse-slow" />
        </div>
      </div>

      <!-- Text Header -->
      <div class="space-y-2">
        <div
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
        >
          Error 500
        </div>
        <h1 class="text-2xl font-extrabold tracking-tight">Internal Server Error</h1>
        <p class="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          The server encountered an internal error or misconfiguration and was unable to complete
          your request.
        </p>
      </div>

      <!-- Expandable Debug Stack Trace -->
      <div class="w-full text-left space-y-2">
        <button
          @click="showDetails = !showDetails"
          class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors cursor-pointer select-none"
        >
          <component :is="showDetails ? ChevronDown : ChevronRight" class="h-4 w-4" />
          {{ showDetails ? 'Hide diagnostic logs' : 'Show diagnostic logs' }}
        </button>

        <Transition name="expand">
          <div
            v-if="showDetails"
            class="overflow-hidden rounded-xl border border-red-500/20 bg-zinc-950 p-4 font-mono text-[10px] leading-relaxed text-red-400 max-h-52 overflow-y-auto shadow-inner"
          >
            <div
              class="border-b border-zinc-800 pb-1.5 mb-2 text-zinc-500 flex justify-between items-center font-semibold"
            >
              <span>Stack trace dump</span>
              <span
                class="text-[9px] uppercase tracking-wider bg-red-500/20 px-1.5 py-0.5 rounded text-red-400"
                >UnhandledException</span
              >
            </div>
            <p class="text-zinc-300 font-bold mb-1">
              500 InternalServerError: QueryTimeoutException at cluster-0.db
            </p>
            <p class="text-zinc-500">at DatabasePool.getConnection (db_pool.ts:145:20)</p>
            <p class="text-zinc-500">at async QueryRunner.run (query_runner.ts:89:12)</p>
            <p class="text-zinc-500">
              at async RouteHandler.dashboardStats (stats.controller.ts:42:35)
            </p>
            <p class="text-zinc-500">at async executeRoute (router.ts:210:9)</p>
          </div>
        </Transition>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-2">
        <Button
          variant="outline"
          class="w-full sm:w-auto h-10 px-5 rounded-xl font-medium text-xs flex items-center justify-center gap-2 border border-border bg-card/60 text-foreground hover:bg-accent transition-all cursor-pointer shadow-xs"
          @click="retry"
        >
          <RefreshCw class="h-3.5 w-3.5" />
          Retry Request
        </Button>
        <Button
          class="w-full sm:w-auto h-10 px-5 rounded-xl font-medium text-xs flex items-center justify-center gap-2 bg-primary text-primary-foreground transition-all hover:opacity-90 cursor-pointer shadow-sm"
          @click="goHome"
        >
          <Home class="h-3.5 w-3.5" />
          Return Home
        </Button>
      </div>
    </div>

    <!-- Micro-details footer -->
    <div class="absolute bottom-6 text-[10px] text-muted-foreground select-none relative z-10 mt-6">
      © {{ new Date().getFullYear() }} Antigravity Platform. All rights reserved.
    </div>
  </div>
</template>

<style scoped>
.animate-pulse-slow {
  animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-slow {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease-out;
  max-height: 200px;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
