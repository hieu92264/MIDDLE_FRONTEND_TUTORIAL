<script setup lang="ts" generic="TData">
import type { Table } from '@tanstack/vue-table'
import { Plus, RefreshCcw, Download } from 'lucide-vue-next'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { ToolbarOptions } from './types'

interface DataTableToolbarProps {
  table: Table<TData>
  options?: ToolbarOptions
}

defineProps<DataTableToolbarProps>()

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'create'): void
  (e: 'export'): void
}>()
</script>

<template>
  <div v-if="options?.enabled !== false" class="flex items-center justify-between">
    <div class="flex flex-1 items-center space-x-2">
      <!-- Global Search -->
      <Input
        v-if="options?.search !== false"
        placeholder="Search all columns..."
        :model-value="(table.getState().globalFilter as string) ?? ''"
        class="h-8 w-[150px] lg:w-[250px]"
        @update:model-value="table.setGlobalFilter($event)"
      />
      <!-- Slot for custom filters (e.g. faceted filters) -->
      <slot name="filters"></slot>
    </div>

    <div class="flex items-center space-x-2">
      <!-- Slot for custom actions -->
      <slot name="actions"></slot>

      <Button
        v-if="options?.refresh"
        variant="outline"
        size="sm"
        class="h-8 px-2 lg:px-3"
        @click="emit('refresh')"
      >
        <RefreshCcw class="h-4 w-4" />
        <span class="hidden lg:ml-2 lg:inline-block">Refresh</span>
      </Button>

      <Button
        v-if="options?.export"
        variant="outline"
        size="sm"
        class="h-8 px-2 lg:px-3"
        @click="emit('export')"
      >
        <Download class="h-4 w-4" />
        <span class="hidden lg:ml-2 lg:inline-block">Export</span>
      </Button>

      <Button
        v-if="options?.createButton"
        size="sm"
        class="h-8 px-2 lg:px-3"
        @click="emit('create')"
      >
        <Plus class="h-4 w-4" />
        <span class="hidden lg:ml-2 lg:inline-block">
          {{ typeof options.createButton === 'string' ? options.createButton : 'Create' }}
        </span>
      </Button>

      <!-- Slot for view options (e.g. column visibility dropdown) -->
      <slot name="view-options"></slot>
    </div>
  </div>
</template>
