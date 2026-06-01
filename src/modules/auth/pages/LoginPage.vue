<script setup lang="ts">
import LoginForm from '../components/LoginForm.vue'
</script>

<template>
  <div
    class="min-h-screen w-full relative flex items-center justify-center bg-background/95 transition-colors duration-500 overflow-hidden px-4 font-sans"
  >
    <!-- Premium Ambient Glow Spheres in Background -->
    <div
      class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px] pointer-events-none animate-pulse-slow"
    ></div>
    <div
      class="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent-foreground/5 blur-[120px] pointer-events-none animate-pulse-slow-reverse"
    ></div>

    <!-- Fine grid pattern overlay -->
    <div
      class="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"
    ></div>

    <!-- Login Card Container -->
    <div class="w-full max-w-md relative z-10">
      <!-- Top Branding Indicator -->
      <div class="text-center mb-8">
        <div
          class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 mb-4 animate-bounce-slow"
        >
          <span class="font-bold text-2xl">A</span>
        </div>
        <h1
          class="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent"
        >
          Welcome back
        </h1>
        <p class="text-xs text-muted-foreground mt-2">
          Enter your details below to sign in to your dashboard
        </p>
      </div>

      <!-- Glassmorphic Form Card -->
      <div
        class="bg-card/45 backdrop-blur-xl border border-border/80 rounded-2xl p-6 md:p-8 shadow-2xl shadow-black/5 dark:shadow-white/5 relative overflow-hidden"
      >
        <!-- Subtle linear line highlight on top of card -->
        <div
          class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        ></div>

        <LoginForm />
      </div>

      <!-- Bottom Helper Actions -->
      <div class="text-center mt-6">
        <p class="text-xs text-muted-foreground">
          Don't have an account?
          <router-link
            to="/register"
            class="font-semibold text-primary hover:underline transition-colors ml-1"
          >
            Sign up
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse-slow {
  animation: pulse-slow 8s ease-in-out infinite;
}
.animate-pulse-slow-reverse {
  animation: pulse-slow-reverse 10s ease-in-out infinite;
}
.animate-bounce-slow {
  animation: bounce-slow 4s ease-in-out infinite;
}

@keyframes pulse-slow {
  0%,
  100% {
    transform: scale(1) translate(0, 0);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1) translate(20px, -20px);
    opacity: 0.9;
  }
}
@keyframes pulse-slow-reverse {
  0%,
  100% {
    transform: scale(1) translate(0, 0);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.08) translate(-15px, 15px);
    opacity: 0.8;
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
