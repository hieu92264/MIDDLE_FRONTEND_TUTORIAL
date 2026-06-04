<script setup lang="ts" generic="TData">
import type { Table } from '@tanstack/vue-table'

import { Button } from '@/components/ui/button'
import type { ActionItem } from './types'

interface DataTableBulkActionsProps {
  table: Table<TData>
  actions: ActionItem<TData[]>[]
}

defineProps<DataTableBulkActionsProps>()
</script>

<template>
  <div
    v-if="table.getFilteredSelectedRowModel().rows.length > 0"
    class="flex items-center space-x-2"
  >
    <span class="text-sm text-muted-foreground mr-2">
      {{ table.getFilteredSelectedRowModel().rows.length }} selected
    </span>
    <template v-for="(action, index) in actions" :key="index">
      <Button
        v-if="
          !(typeof action.hidden === 'function'
            ? action.hidden(table.getFilteredSelectedRowModel().rows.map((r) => r.original))
            : action.hidden)
        "
        :variant="action.danger ? 'destructive' : 'secondary'"
        size="sm"
        class="h-8"
        :disabled="
          typeof action.disabled === 'function'
            ? action.disabled(table.getFilteredSelectedRowModel().rows.map((r) => r.original))
            : action.disabled
        "
        @click="action.onClick(table.getFilteredSelectedRowModel().rows.map((r) => r.original))"
      >
        <component :is="action.icon" v-if="action.icon" class="mr-2 h-4 w-4" />
        {{ action.label }}
      </Button>
    </template>
  </div>
</template>
