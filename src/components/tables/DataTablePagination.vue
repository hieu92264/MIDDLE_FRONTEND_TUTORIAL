<script setup lang="ts" generic="TData">
import type { Table } from '@tanstack/vue-table'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'
import { ref, watch } from 'vue'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DataTablePaginationProps {
  table: Table<TData>
  pageSizeOptions?: number[]
}

const props = withDefaults(defineProps<DataTablePaginationProps>(), {
  pageSizeOptions: () => [10, 20, 30, 40, 50],
})

const pageInput = ref('1')

watch(
  () => props.table.getState().pagination.pageIndex,
  (pageIndex) => {
    pageInput.value = String(pageIndex + 1)
  },
  { immediate: true },
)

const setPageSize = (value: unknown) => {
  if (value === null || value === undefined) return

  props.table.setPageSize(Number(value))
}

const jumpToPage = () => {
  const pageCount = props.table.getPageCount()
  const parsedPage = Number.parseInt(pageInput.value, 10)
  const targetPage = Number.isNaN(parsedPage) ? 1 : parsedPage
  const clampedPage = Math.min(Math.max(targetPage, 1), Math.max(pageCount, 1))

  props.table.setPageIndex(clampedPage - 1)
  pageInput.value = String(clampedPage)
}
</script>

<template>
  <div class="flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex-1 text-sm text-muted-foreground">
      <span>
        {{ table.getFilteredSelectedRowModel().rows.length }} of
        {{ table.getFilteredRowModel().rows.length }} row(s) selected.
      </span>
    </div>
    <div class="flex flex-wrap items-center gap-3 lg:gap-6">
      <div class="flex items-center space-x-2">
        <p class="text-sm font-medium">Rows per page</p>
        <Select
          :model-value="`${table.getState().pagination.pageSize}`"
          @update:model-value="setPageSize"
        >
          <SelectTrigger class="h-8 w-[70px]">
            <SelectValue :placeholder="`${table.getState().pagination.pageSize}`" />
          </SelectTrigger>
          <SelectContent side="top">
            <SelectItem v-for="pageSize in pageSizeOptions" :key="pageSize" :value="`${pageSize}`">
              {{ pageSize }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex items-center space-x-2">
        <p class="text-sm font-medium">Go to</p>
        <Input
          v-model="pageInput"
          type="number"
          min="1"
          :max="table.getPageCount()"
          class="h-8 w-16"
          @keyup.enter="jumpToPage"
          @blur="jumpToPage"
        />
        <Button variant="outline" class="h-8 px-3" @click="jumpToPage">Go</Button>
      </div>
      <div class="flex w-[100px] items-center justify-center text-sm font-medium">
        Page {{ table.getState().pagination.pageIndex + 1 }} of
        {{ table.getPageCount() }}
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          class="hidden h-8 w-8 p-0 lg:flex"
          :disabled="!table.getCanPreviousPage()"
          @click="table.setPageIndex(0)"
        >
          <span class="sr-only">Go to first page</span>
          <ChevronsLeft class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          class="h-8 w-8 p-0"
          :disabled="!table.getCanPreviousPage()"
          @click="table.previousPage()"
        >
          <span class="sr-only">Go to previous page</span>
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          class="h-8 w-8 p-0"
          :disabled="!table.getCanNextPage()"
          @click="table.nextPage()"
        >
          <span class="sr-only">Go to next page</span>
          <ChevronRight class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          class="hidden h-8 w-8 p-0 lg:flex"
          :disabled="!table.getCanNextPage()"
          @click="table.setPageIndex(table.getPageCount() - 1)"
        >
          <span class="sr-only">Go to last page</span>
          <ChevronsRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
