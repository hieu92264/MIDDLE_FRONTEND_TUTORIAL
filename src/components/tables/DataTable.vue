<script setup lang="ts" generic="TData, TValue">
import { ref, computed, h } from 'vue'
import type { CSSProperties } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/vue-table'
import type {
  CellContext,
  Column,
  ColumnDef,
  ColumnFiltersState,
  ColumnPinningState,
  HeaderContext,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/vue-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'

import type { DataTableProps } from './types'

const props = withDefaults(defineProps<DataTableProps<TData, TValue>>(), {
  loading: false,
  error: null,
  emptyText: 'No results.',
  disabled: false,
  manualMode: false,
})

const emit = defineEmits<{
  (e: 'rowClick', row: TData): void
  (e: 'rowDoubleClick', row: TData): void
  (e: 'selectionChange', selection: RowSelectionState): void
  (e: 'sortingChange', sorting: SortingState): void
  (e: 'filterChange', filters: ColumnFiltersState | string): void
  (e: 'paginationChange', pagination: PaginationState): void
  (e: 'refresh'): void
  (e: 'create'): void
  (e: 'export'): void
}>()

const sorting = ref<SortingState>(
  props.sorting?.defaultSort?.map((s) => ({ id: s.id, desc: s.desc })) || [],
)
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref<RowSelectionState>({})
const globalFilter = ref('')
const columnPinning = ref<ColumnPinningState>({
  left: props.selection?.enabled ? ['select'] : [],
})

const getCheckboxValue = (value: boolean | 'indeterminate') => value === true

const getColumnSizeStyle = (column: Column<TData, unknown>): CSSProperties => ({
  width: column.getSize() !== 150 ? `${column.getSize()}px` : undefined,
})

const getPinnedColumnStyle = (column: Column<TData, unknown>, zIndex: number): CSSProperties => {
  const pinned = column.getIsPinned()

  if (!pinned) return {}

  return {
    position: 'sticky',
    [pinned]: `${column.getStart(pinned)}px`,
    zIndex,
    backgroundColor: 'var(--background)',
  }
}

const resolveRowId = (row: TData): string => {
  const rowKey = props.rowKey

  if (typeof rowKey === 'function') {
    return rowKey(row)
  }

  if (typeof rowKey === 'string') {
    return String((row as Record<string, unknown>)[rowKey])
  }

  return ''
}

const mergedColumns = computed<ColumnDef<TData, TValue>[]>(() => {
  if (!props.selection?.enabled) return props.columns

  const selectionColumn: ColumnDef<TData, TValue> = {
    id: 'select',
    header: ({ table }: HeaderContext<TData, TValue>) =>
      h(Checkbox, {
        checked:
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate'),
        'onUpdate:checked': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(getCheckboxValue(value)),
        ariaLabel: 'Select all',
        class: 'translate-y-[2px]',
      }),
    cell: ({ row }: CellContext<TData, TValue>) =>
      h(Checkbox, {
        checked: row.getIsSelected(),
        'onUpdate:checked': (value: boolean | 'indeterminate') =>
          row.toggleSelected(getCheckboxValue(value)),
        ariaLabel: 'Select row',
        class: 'translate-y-[2px]',
      }),
    enableSorting: false,
    enableHiding: false,
  }

  return [selectionColumn, ...props.columns]
})

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return mergedColumns.value
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  state: {
    get sorting() {
      return sorting.value
    },
    get columnFilters() {
      return columnFilters.value
    },
    get columnVisibility() {
      return columnVisibility.value
    },
    get rowSelection() {
      return rowSelection.value
    },
    get globalFilter() {
      return globalFilter.value
    },
    get columnPinning() {
      return columnPinning.value
    },
  },
  enableColumnResizing: props.advanced?.columnResizing,
  enableRowSelection: (row) => props.selection?.selectable?.(row.original) ?? true,
  columnResizeMode: 'onChange',
  onSortingChange: (updaterOrValue) => {
    sorting.value =
      typeof updaterOrValue === 'function' ? updaterOrValue(sorting.value) : updaterOrValue
    emit('sortingChange', sorting.value)
  },
  onColumnFiltersChange: (updaterOrValue) => {
    columnFilters.value =
      typeof updaterOrValue === 'function' ? updaterOrValue(columnFilters.value) : updaterOrValue
    emit('filterChange', columnFilters.value)
  },
  onColumnVisibilityChange: (updaterOrValue) => {
    columnVisibility.value =
      typeof updaterOrValue === 'function' ? updaterOrValue(columnVisibility.value) : updaterOrValue
  },
  onRowSelectionChange: (updaterOrValue) => {
    rowSelection.value =
      typeof updaterOrValue === 'function' ? updaterOrValue(rowSelection.value) : updaterOrValue
    emit('selectionChange', rowSelection.value)
  },
  onGlobalFilterChange: (updaterOrValue) => {
    globalFilter.value =
      typeof updaterOrValue === 'function' ? updaterOrValue(globalFilter.value) : updaterOrValue
    emit('filterChange', globalFilter.value)
  },
  getRowId: props.rowKey ? resolveRowId : undefined,
  manualPagination: props.manualMode || props.pagination?.manual,
  manualSorting: props.manualMode || props.sorting?.manual,
  manualFiltering: props.manualMode || props.filtering?.manual,
})
</script>

<template>
  <div class="space-y-4">
    <!-- Toolbar Slot -->
    <slot name="toolbar" :table="table"></slot>

    <div
      class="rounded-md border"
      :class="[
        props.layout?.height ? `h-[${props.layout.height}] overflow-auto` : '',
        props.layout?.maxHeight ? `max-h-[${props.layout.maxHeight}] overflow-auto` : '',
      ]"
      :style="{
        height: props.layout?.height,
        maxHeight: props.layout?.maxHeight,
      }"
    >
      <Table :class="{ 'w-max': props.layout?.responsive || props.advanced?.columnResizing }">
        <TableHeader :class="{ 'sticky top-0 bg-background z-10': props.layout?.stickyHeader }">
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              :class="[
                header.column.columnDef.meta?.headerClass,
                props.layout?.density === 'compact' ? 'py-1 h-8' : '',
                props.layout?.density === 'comfortable' ? 'py-4 h-14' : '',
              ]"
              :style="{
                ...getColumnSizeStyle(header.column),
                ...getPinnedColumnStyle(header.column, 20),
              }"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
              <div
                v-if="header.column.getCanResize()"
                @mousedown="header.getResizeHandler()($event)"
                @touchstart="header.getResizeHandler()($event)"
                class="absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none bg-border opacity-0 hover:opacity-100 data-[is-resizing=true]:opacity-100"
                :data-is-resizing="header.column.getIsResizing()"
              ></div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() ? 'selected' : undefined"
              class="cursor-pointer"
              @click="emit('rowClick', row.original)"
              @dblclick="emit('rowDoubleClick', row.original)"
            >
              <TableCell
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                :class="[
                  cell.column.columnDef.meta?.cellClass,
                  props.layout?.density === 'compact' ? 'py-1' : '',
                  props.layout?.density === 'comfortable' ? 'py-4' : '',
                ]"
                :style="{
                  ...getColumnSizeStyle(cell.column),
                  ...getPinnedColumnStyle(cell.column, 10),
                }"
              >
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow>
              <TableCell :colSpan="columns.length" class="h-24 text-center">
                {{ loading ? 'Loading...' : emptyText }}
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination Slot -->
    <slot name="pagination" :table="table"></slot>
  </div>
</template>
