<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  containerClass?: HTMLAttributes['class']
  tableStyle?: CSSProperties
}>()
</script>

<template>
  <div
    data-slot="table-container"
    :class="cn('relative w-full overflow-auto', props.containerClass)"
  >
    <table
      data-slot="table"
      :class="cn('w-full caption-bottom text-sm', props.class)"
      :style="props.tableStyle"
    >
      <slot />
    </table>
  </div>
</template>
