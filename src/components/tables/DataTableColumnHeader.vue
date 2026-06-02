<script setup lang="ts" generic="TData, TValue">
import type { Column } from '@tanstack/vue-table'
import { computed } from 'vue'
import { ArrowDown, ArrowUp, ArrowUpDown, EyeOff } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DataTableColumnHeaderProps {
  column: Column<TData, TValue>
  title: string
}

const props = defineProps<DataTableColumnHeaderProps>()

const isSortedAsc = computed(() => props.column.getIsSorted() === 'asc')
const isSortedDesc = computed(() => props.column.getIsSorted() === 'desc')
</script>

<template>
  <div v-if="column.getCanSort()" class="flex items-center space-x-2">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" class="-ml-3 h-8 data-[state=open]:bg-accent">
          <span>{{ title }}</span>
          <ArrowDown v-if="isSortedDesc" class="ml-2 h-4 w-4" />
          <ArrowUp v-else-if="isSortedAsc" class="ml-2 h-4 w-4" />
          <ArrowUpDown v-else class="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem @click="column.toggleSorting(false)">
          <ArrowUp class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Asc
        </DropdownMenuItem>
        <DropdownMenuItem @click="column.toggleSorting(true)">
          <ArrowDown class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Desc
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem v-if="column.getCanHide()" @click="column.toggleVisibility(false)">
          <EyeOff class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Hide
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
  <div v-else class="text-sm font-medium">{{ title }}</div>
</template>
