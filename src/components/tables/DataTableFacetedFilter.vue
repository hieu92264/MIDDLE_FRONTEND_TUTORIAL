<script setup lang="ts" generic="TData, TValue">
import type { Column } from '@tanstack/vue-table'
import type { Component } from 'vue'
import { PlusCircle, Check } from 'lucide-vue-next'
import { computed } from 'vue'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DataTableFacetedFilterProps {
  column?: Column<TData, TValue>
  title?: string
  options: {
    label: string
    value: string
    icon?: Component
  }[]
}

const props = defineProps<DataTableFacetedFilterProps>()

const facets = computed(() => props.column?.getFacetedUniqueValues())
const selectedValues = computed(() => {
  const filterValue = props.column?.getFilterValue()

  return new Set(Array.isArray(filterValue) ? (filterValue as string[]) : [])
})

const toggleOption = (value: string) => {
  const current = new Set(selectedValues.value)
  if (current.has(value)) {
    current.delete(value)
  } else {
    current.add(value)
  }
  const filterValues = Array.from(current)
  props.column?.setFilterValue(filterValues.length ? filterValues : undefined)
}
</script>

<template>
  <DropdownMenu v-if="column">
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm" class="h-8 border-dashed">
        <PlusCircle class="mr-2 h-4 w-4" />
        {{ title }}
        <template v-if="selectedValues.size > 0">
          <DropdownMenuSeparator class="hidden h-4 lg:block" />
          <div
            class="hidden space-x-1 lg:flex lg:ml-2 text-xs font-normal bg-secondary px-2 rounded"
          >
            {{ selectedValues.size }}
          </div>
        </template>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" class="w-[200px]">
      <DropdownMenuItem
        v-for="option in options"
        :key="option.value"
        @click="toggleOption(option.value)"
        class="flex items-center"
      >
        <div
          class="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary"
          :class="[
            selectedValues.has(option.value)
              ? 'bg-primary text-primary-foreground'
              : 'opacity-50 [&_svg]:invisible',
          ]"
        >
          <Check class="h-4 w-4" />
        </div>
        <component
          :is="option.icon"
          v-if="option.icon"
          class="mr-2 h-4 w-4 text-muted-foreground"
        />
        <span>{{ option.label }}</span>
        <span
          v-if="facets?.get(option.value)"
          class="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs text-muted-foreground"
        >
          {{ facets.get(option.value) }}
        </span>
      </DropdownMenuItem>
      <DropdownMenuSeparator v-if="selectedValues.size > 0" />
      <DropdownMenuItem
        v-if="selectedValues.size > 0"
        @click="column?.setFilterValue(undefined)"
        class="justify-center text-center"
      >
        Clear filters
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
