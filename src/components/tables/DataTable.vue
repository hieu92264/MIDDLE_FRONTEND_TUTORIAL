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
const pagination = ref<PaginationState>({
  pageIndex: Math.max((props.pagination?.page ?? 1) - 1, 0),
  pageSize: props.pagination?.pageSize ?? 10,
})

const getColumnDefinitionId = (column: ColumnDef<TData, TValue>) => {
  const columnRecord = column as unknown as Record<string, unknown>
  const id = columnRecord.id

  if (typeof id === 'string') return id

  const accessorKey = columnRecord.accessorKey

  return typeof accessorKey === 'string' ? accessorKey.replace(/\./g, '_') : undefined
}

const getInitialColumnPinning = (): ColumnPinningState => {
  const left = props.selection?.enabled ? ['select'] : []
  const right: string[] = []

  for (const column of props.columns) {
    const columnId = getColumnDefinitionId(column)
    const pin = column.meta?.pin

    if (!columnId || !pin) continue

    if (pin === 'left') {
      left.push(columnId)
    } else {
      right.push(columnId)
    }
  }

  return { left, right }
}

const columnPinning = ref<ColumnPinningState>(getInitialColumnPinning())

const getCheckboxValue = (value: boolean | 'indeterminate') => value === true
const columnResizeMode = computed(() => props.advanced?.columnResizeMode ?? 'onEnd')

const getColumnSizeStyle = (column: Column<TData, unknown>): CSSProperties => ({
  minWidth: `${column.getSize()}px`,
  width: `${column.getSize()}px`,
  maxWidth: `${column.getSize()}px`,
})

const tableStyle = computed<CSSProperties>(() => ({
  width: props.advanced?.columnResizing ? `${table.getTotalSize()}px` : undefined,
  tableLayout: props.advanced?.columnResizing ? 'fixed' : 'auto',
  ...(props.layout?.stickyHeader ? { borderCollapse: 'separate', borderSpacing: 0 } : {}),
}))

const getPinnedColumnStyle = (column: Column<TData, unknown>, zIndex: number): CSSProperties => {
  const pinned = column.getIsPinned()

  if (!pinned) return {}

  const pinnedStyle: CSSProperties = {
    position: 'sticky',
    zIndex,
    backgroundColor: 'var(--background)',
  }

  if (pinned === 'left') {
    pinnedStyle.left = `${column.getStart('left')}px`
    pinnedStyle.boxShadow = '1px 0 0 var(--border)'
  } else {
    pinnedStyle.right = `${column.getAfter('right')}px`
    pinnedStyle.boxShadow = '-1px 0 0 var(--border)'
  }

  return pinnedStyle
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
    size: 40,
    header: ({ table }: HeaderContext<TData, TValue>) =>
      h(Checkbox, {
        modelValue:
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate'),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(getCheckboxValue(value)),
        onClick: (event: MouseEvent) => event.stopPropagation(),
        ariaLabel: 'Select all',
        class: 'translate-y-[2px]',
      }),
    cell: ({ row }: CellContext<TData, TValue>) =>
      h(Checkbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          row.toggleSelected(getCheckboxValue(value)),
        onClick: (event: MouseEvent) => event.stopPropagation(),
        ariaLabel: 'Select row',
        class: 'translate-y-[2px]',
      }),
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
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
    get pagination() {
      return pagination.value
    },
    get columnPinning() {
      return columnPinning.value
    },
  },
  enableColumnResizing: props.advanced?.columnResizing,
  enableColumnPinning: props.advanced?.columnPinning,
  enableRowSelection: (row) => {
    if (!props.selection?.enabled) return false

    return props.selection.selectable?.(row.original) ?? true
  },
  enableMultiRowSelection: props.selection?.mode !== 'single',
  get columnResizeMode() {
    return columnResizeMode.value
  },
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
  onColumnPinningChange: (updaterOrValue) => {
    columnPinning.value =
      typeof updaterOrValue === 'function' ? updaterOrValue(columnPinning.value) : updaterOrValue
  },
  onPaginationChange: (updaterOrValue) => {
    pagination.value =
      typeof updaterOrValue === 'function' ? updaterOrValue(pagination.value) : updaterOrValue
    emit('paginationChange', pagination.value)
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
      class="rounded-md border flex flex-col"
      :class="[
        props.layout?.height ? `h-[${props.layout.height}] overflow-hidden` : '',
        props.layout?.maxHeight ? `max-h-[${props.layout.maxHeight}] overflow-hidden` : '',
      ]"
      :style="{
        height: props.layout?.height,
        maxHeight: props.layout?.maxHeight,
      }"
    >
      <div class="min-h-0 flex-1 overflow-auto">
        <Table
          container-class="overflow-visible min-w-full"
          :class="{ 'w-max': props.layout?.responsive || props.advanced?.columnResizing }"
          :table-style="tableStyle"
        >
          <TableHeader
            :class="{
              'sticky top-0 z-40 bg-background': props.layout?.stickyHeader,
            }"
          >
            <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
              <TableHead
                v-for="header in headerGroup.headers"
                :key="header.id"
                :class="[
                  header.column.columnDef.meta?.headerClass,
                  props.layout?.density === 'compact' ? 'py-1 h-8' : '',
                  props.layout?.density === 'comfortable' ? 'py-4 h-14' : '',
                  props.layout?.stickyHeader
                    ? 'sticky top-0 z-40 border-b bg-background shadow-sm'
                    : '',
                  header.column.getCanResize() ? 'relative select-none' : '',
                  props.layout?.bordered ? 'border-r border-border/70 last:border-r-0' : '',
                ]"
                :style="{
                  ...getColumnSizeStyle(header.column),
                  ...getPinnedColumnStyle(header.column, props.layout?.stickyHeader ? 50 : 20),
                }"
              >
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="{ ...header.getContext() }"
                />
                <div
                  v-if="header.column.getCanResize()"
                  class="absolute top-0 right-0 z-20 h-full w-1 cursor-col-resize touch-none bg-border/80 select-none hover:w-1.5 hover:bg-primary data-[is-resizing=true]:w-1.5 data-[is-resizing=true]:bg-primary"
                  :data-is-resizing="header.column.getIsResizing()"
                  @click.stop
                  @mousedown.stop="header.getResizeHandler()($event)"
                  @touchstart.stop="header.getResizeHandler()($event)"
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
                    props.layout?.bordered ? 'border-r border-border/70 last:border-r-0' : '',
                  ]"
                  :style="{
                    ...getColumnSizeStyle(cell.column),
                    ...getPinnedColumnStyle(cell.column, 10),
                  }"
                >
                  <FlexRender
                    :render="cell.column.columnDef.cell"
                    :props="{ ...cell.getContext() }"
                  />
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
    </div>

    <!-- Pagination Slot -->
    <slot name="pagination" :table="table"></slot>
  </div>
</template>
