<script setup lang="ts">
import { useColorMode } from '@vueuse/core'
import { Sun, Moon, ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'

const router = useRouter()
const mode = useColorMode()

const toggleTheme = () => {
  mode.value = mode.value === 'dark' ? 'light' : 'dark'
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div
    class="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground transition-colors duration-300 relative overflow-hidden font-sans p-6"
  >
    <!-- Shadcn grid pattern backdrop -->
    <div
      class="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"
    />

    <!-- Ambient glowing backgrounds for extra depth -->
    <div
      class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-destructive/10 dark:bg-destructive/15 rounded-full blur-[80px] pointer-events-none animate-pulse-slow"
    />

    <!-- Theme Toggle Floating Button -->
    <div class="absolute top-6 right-6 z-50">
      <Button
        variant="outline"
        size="icon"
        class="rounded-xl border-border bg-card/60 backdrop-blur-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition-all duration-300"
        @click="toggleTheme"
      >
        <Sun v-if="mode === 'dark'" class="h-4.5 w-4.5 text-amber-500 animate-pulse" />
        <Moon v-else class="h-4.5 w-4.5 text-indigo-500" />
      </Button>
    </div>

    <!-- Error Content Card (Shadcn style) -->
    <div
      class="w-full max-w-md bg-card border border-border/80 rounded-2xl p-8 md:p-10 shadow-lg flex flex-col items-center text-center relative z-10 space-y-6 transition-all duration-300 hover:shadow-xl"
    >
      <!-- Shield / Lock Badge -->
      <div class="relative flex items-center justify-center">
        <div
          class="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20 relative"
        >
          <ShieldAlert class="h-10 w-10 text-destructive" />
          <div
            class="absolute -bottom-1 -right-1 h-7 w-7 rounded-lg bg-background border border-border text-foreground flex items-center justify-center shadow-md animate-bounce-slow"
          >
            <Lock class="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      <!-- Text Header -->
      <div class="space-y-2">
        <div
          class="text-[11px] font-bold tracking-widest uppercase text-destructive bg-destructive/10 px-2.5 py-1 rounded-full border border-destructive/20 inline-block"
        >
          Error 403
        </div>
        <h1 class="text-2xl font-extrabold tracking-tight">Access Denied</h1>
        <p class="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
          You don't have permission to access this page. Please make sure you have the correct
          privileges or contact the system admin.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-2">
        <Button
          variant="outline"
          class="w-full sm:w-auto h-10 px-5 rounded-xl font-medium gap-2 cursor-pointer shadow-xs hover:bg-accent transition-all active:scale-98 text-xs"
          @click="goBack"
        >
          <ArrowLeft class="h-4 w-4" />
          Go Back
        </Button>
        <Button
          class="w-full sm:w-auto h-10 px-5 rounded-xl font-medium gap-2 cursor-pointer shadow-sm transition-all hover:opacity-90 active:scale-98 text-xs"
          @click="goHome"
        >
          <Home class="h-4 w-4" />
          Back to Dashboard
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
.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
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
@keyframes bounce-slow {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
</style>
