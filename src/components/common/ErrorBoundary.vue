<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { computed, onErrorCaptured, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const error = ref<unknown>(null)
const isDev = import.meta.env.DEV

const errorMessage = computed(() => {
  if (!error.value) return ''

  if (error.value instanceof Error) {
    return error.value.message
  }

  return String(error.value)
})

const errorStack = computed(() => {
  if (!(error.value instanceof Error)) return ''

  return error.value.stack
})

const errorName = computed(() => {
  if (error.value instanceof Error) {
    return error.value.name
  }

  return 'Error'
})

onErrorCaptured((capturedError) => {
  error.value = capturedError
  console.error(capturedError)

  return false
})

watch(
  () => route.fullPath,
  () => {
    error.value = null
  },
)

function reloadPage() {
  window.location.reload()
}
</script>

<template>
  <slot />

  <main
    v-if="error"
    class="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/30 p-4 backdrop-blur-[2px] sm:p-8"
  >
    <section
      class="mt-8 w-full max-w-5xl overflow-hidden rounded-lg border border-red-200 bg-white text-left shadow-2xl"
    >
      <header class="border-b border-red-200 bg-red-50 px-5 py-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-red-700">
          Unhandled Runtime Error
        </p>
        <h1 class="mt-2 break-words text-xl font-semibold text-red-950">
          {{ errorName }}: {{ errorMessage }}
        </h1>
      </header>

      <div class="grid gap-4 p-5">
        <p class="text-sm text-zinc-600">
          The page could not be rendered. The previous UI remains visible behind this overlay.
        </p>

        <div v-if="isDev" class="overflow-hidden rounded-md border border-zinc-200 bg-zinc-950">
          <div class="border-b border-zinc-800 px-4 py-2">
            <p class="text-xs font-medium text-zinc-300">Stack trace</p>
          </div>

          <pre
            class="max-h-[28rem] overflow-auto whitespace-pre-wrap p-4 font-mono text-xs leading-6 text-zinc-100"
            >{{ errorStack || errorMessage }}</pre
          >
        </div>

        <div v-else class="rounded-md border border-zinc-200 bg-zinc-50 p-4">
          <p class="text-sm text-zinc-700">Please reload and try again.</p>
        </div>

        <div class="flex justify-end">
          <Button type="button" @click="reloadPage"> Reload </Button>
        </div>
      </div>
    </section>
  </main>
</template>
