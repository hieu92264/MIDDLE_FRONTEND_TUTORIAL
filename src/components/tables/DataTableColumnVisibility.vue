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

interface DataTableColumnVisibilityProps {
  table: Table<TData>
}

defineProps<DataTableColumnVisibilityProps>()

const setColumnVisibility = (column: Column<TData, unknown>, value: unknown) => {
  column.toggleVisibility(value === true)
}
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
        v-for="column in table
          .getAllColumns()
          .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())"
        :key="column.id"
        class="capitalize"
        :checked="column.getIsVisible()"
        @update:checked="setColumnVisibility(column, $event)"
      >
        {{ column.id }}
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
