<script setup lang="ts" generic="TData">
import { MoreHorizontal } from 'lucide-vue-next'
import type { Row } from '@tanstack/vue-table'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ActionItem } from './types'

interface DataTableRowActionsProps {
  row: Row<TData>
  actions: ActionItem<TData>[]
}

defineProps<DataTableRowActionsProps>()

const isHidden = (action: ActionItem<TData>, row: TData) => {
  if (typeof action.hidden === 'function') {
    return action.hidden(row)
  }
  return action.hidden
}

const isDisabled = (action: ActionItem<TData>, row: TData) => {
  if (typeof action.disabled === 'function') {
    return action.disabled(row)
  }
  return action.disabled
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" class="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
        <MoreHorizontal class="h-4 w-4" />
        <span class="sr-only">Open menu</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-[160px]">
      <template v-for="(action, index) in actions" :key="index">
        <DropdownMenuItem
          v-if="!isHidden(action, row.original)"
          :disabled="isDisabled(action, row.original)"
          :class="{ 'text-destructive focus:text-destructive': action.danger }"
          @click="action.onClick(row.original)"
        >
          <component :is="action.icon" v-if="action.icon" class="mr-2 h-4 w-4" />
          {{ action.label }}
          <DropdownMenuShortcut v-if="action.shortcut">
            {{ action.shortcut }}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
