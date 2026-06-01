<script setup lang="ts">
import { useColorMode } from '@vueuse/core'
import { Sun, Moon, Compass, ArrowLeft, Home, Search } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

const router = useRouter()
const mode = useColorMode()
const searchQuery = ref('')

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

const handleSearch = (e: Event) => {
  e.preventDefault()
  if (searchQuery.value.trim()) {
    router.push(`/?search=${encodeURIComponent(searchQuery.value)}`)
  }
}
</script>

<template>
  <div
    class="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground transition-colors duration-300 relative overflow-hidden font-sans p-6"
  >
    <!-- Grid pattern backdrop -->
    <div
      class="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"
    >
      <div
        class="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 animate-scan"
      />
    </div>

    <!-- Nebula ambient glow (indigo/violet for lost space theme) -->
    <div
      class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 dark:bg-primary/15 rounded-full blur-[80px] pointer-events-none animate-pulse-slow"
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
      class="w-full max-w-md bg-card border border-border/80 rounded-2xl p-8 md:p-10 shadow-lg flex flex-col items-center text-center relative z-10 space-y-6 transition-all duration-300 hover:shadow-xl"
    >
      <!-- Big Floating 404 Text -->
      <div class="relative flex items-center justify-center">
        <h1
          class="text-7xl md:text-8xl font-black tracking-tighter bg-gradient-to-b from-foreground via-muted-foreground/80 to-transparent bg-clip-text text-transparent select-none animate-float drop-shadow-sm"
        >
          404
        </h1>
        <div
          class="absolute -top-3 right-8 h-9 w-9 rounded-full bg-primary border border-primary/20 text-primary-foreground flex items-center justify-center shadow-lg animate-spin-slow"
        >
          <Compass class="h-4.5 w-4.5" />
        </div>
      </div>

      <!-- Text Header -->
      <div class="space-y-2">
        <div
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-primary/10 text-primary border border-primary/20"
        >
          Lost In Space
        </div>
        <h2 class="text-xl font-extrabold tracking-tight">Page Not Found</h2>
        <p class="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
          The page you are looking for does not exist or has been moved to a new address.
        </p>
      </div>

      <!-- Helper Search Bar -->
      <form @submit="handleSearch" class="relative w-full max-w-sm mx-auto">
        <Search class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search components or pages..."
          class="w-full h-10 pl-9 pr-20 text-xs rounded-xl bg-accent/40 border border-border focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all backdrop-blur-md"
        />
        <button
          type="submit"
          class="absolute right-1.5 top-1.5 h-7 px-3 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold cursor-pointer hover:opacity-90 transition-all select-none"
        >
          Search
        </button>
      </form>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-2">
        <Button
          variant="outline"
          class="w-full sm:w-auto h-10 px-5 rounded-xl font-medium text-xs flex items-center justify-center gap-2 border border-border bg-card/60 text-foreground hover:bg-accent transition-all cursor-pointer shadow-xs active:scale-98"
          @click="goBack"
        >
          <ArrowLeft class="h-4 w-4" />
          Go Back
        </Button>
        <Button
          class="w-full sm:w-auto h-10 px-5 rounded-xl font-medium text-xs flex items-center justify-center gap-2 bg-primary text-primary-foreground transition-all hover:opacity-90 cursor-pointer shadow-sm active:scale-98"
          @click="goHome"
        >
          <Home class="h-4 w-4" />
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
.animate-scan {
  animation: scan 6s linear infinite;
}
.animate-float {
  animation: float 4s ease-in-out infinite;
}
.animate-spin-slow {
  animation: spin 18s linear infinite;
}
.animate-pulse-slow {
  animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes scan {
  0% {
    top: -10%;
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    top: 110%;
    opacity: 0;
  }
}
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
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
