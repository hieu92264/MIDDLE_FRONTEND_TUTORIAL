<script setup lang="ts">
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import BaseLayout from '@/components/layouts/BaseLayout.vue'
import BlankLayout from '@/components/layouts/BlankLayout.vue'
import { Toaster } from '@/components/ui/sonner'
import { useAppStore } from '@/stores/app.store'
import { RouterView } from 'vue-router'

const appStore = useAppStore()

const layouts = {
  base: BaseLayout,
  blank: BlankLayout,
}
</script>

<template>
  <ErrorBoundary>
    <Transition name="page-progress">
      <div
        v-if="appStore.isPageLoading"
        class="fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden"
      >
        <div class="h-full w-full origin-left bg-primary page-progress-bar" />
      </div>
    </Transition>

    <RouterView v-slot="{ Component, route }">
      <component :is="layouts[route.meta.layout ?? 'blank']">
        <component :is="Component" />
      </component>
    </RouterView>
    <Toaster theme="system" position="top-right" close-button rich-colors />
  </ErrorBoundary>
</template>

<style scoped>
.page-progress-enter-active,
.page-progress-leave-active {
  transition: opacity 180ms ease;
}

.page-progress-enter-from,
.page-progress-leave-to {
  opacity: 0;
}

.page-progress-bar {
  animation: page-progress 1.1s ease-in-out infinite;
}

@keyframes page-progress {
  0% {
    transform: translateX(-100%) scaleX(0.35);
  }
  55% {
    transform: translateX(15%) scaleX(0.65);
  }
  100% {
    transform: translateX(100%) scaleX(0.35);
  }
}
</style>
