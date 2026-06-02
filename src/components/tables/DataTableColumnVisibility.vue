<script setup lang="ts" generic="TData">
import type { Column, Table } from '@tanstack/vue-table'
import { Settings2 } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { computed } from 'vue'

interface DataTableColumnVisibilityProps {
  table: Table<TData>
}

const props = defineProps<DataTableColumnVisibilityProps>()

const setColumnVisibility = (column: Column<TData, unknown>, value: unknown) => {
  column.toggleVisibility(value === true)
}

const hideableColumns = computed(() => {
  const visibility = props.table.getState().columnVisibility

  return props.table
    .getAllColumns()
    .filter((column) => column.getCanHide())
    .map((column) => ({
      column,
      id: column.id,
      isVisible: column.getIsVisible(),
      visibilityValue: visibility[column.id],
    }))
})
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm" class="ml-auto hidden h-8 lg:flex">
        <Settings2 class="mr-2 h-4 w-4" />
        View
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-[150px]">
      <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuCheckboxItem
        v-for="item in hideableColumns"
        :key="item.id"
        class="capitalize"
        :model-value="item.isVisible"
        @update:model-value="setColumnVisibility(item.column, $event)"
      >
        {{ item.id }}
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
