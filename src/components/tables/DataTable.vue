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
import { useVirtualizer } from '@tanstack/vue-virtual'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'

import { useColumnResize } from '@/hooks/useColumnResize'
import DataTableRow from './DataTableRow.vue'
import type { DataTableProps } from './types'

// ─── Props & Emits ────────────────────────────────────────────────────────────
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
  (e: 'resetColumns'): void
}>()

// ─── Helpers (định nghĩa trước khi dùng) ──────────────────────────────────────
const getColumnDefinitionId = (column: ColumnDef<TData, TValue>): string | undefined => {
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
    if (pin === 'left') left.push(columnId)
    else right.push(columnId)
  }
  return { left, right }
}

const getPinnedColumnStyle = (column: Column<TData, unknown>, zIndex: number, isHeader = false): CSSProperties => {
  const pinned = column.getIsPinned()
  if (!pinned) return {}
  const style: CSSProperties = {
    position: 'sticky',
    zIndex,
    backgroundColor: isHeader ? 'var(--muted)' : 'var(--background)',
  }
  if (pinned === 'left') {
    style.left = `${column.getStart('left')}px`
    style.boxShadow = '1px 0 0 var(--border)'
  } else {
    style.right = `${column.getAfter('right')}px`
    style.boxShadow = '-1px 0 0 var(--border)'
  }
  return style
}

const getCheckboxValue = (value: boolean | 'indeterminate') => value === true

const resolveRowId = (row: TData): string => {
  const rowKey = props.rowKey
  if (typeof rowKey === 'function') return rowKey(row)
  if (typeof rowKey === 'string') return String((row as Record<string, unknown>)[rowKey])
  return ''
}

// ─── Reactive State ───────────────────────────────────────────────────────────
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
const columnPinning = ref<ColumnPinningState>(getInitialColumnPinning())

// Ref tới scroll container — dùng cho cả resize composable lẫn virtualizer
const scrollContainerRef = ref<HTMLElement | null>(null)

// ─── Column Resize Mode ────────────────────────────────────────────────────────
// Luôn dùng 'onEnd': visual feedback được xử lý bởi useColumnResize (RAF + CSS vars)
// TanStack sẽ không update reactive state trong khi kéo → không trigger re-render
const columnResizeMode = computed(() => props.advanced?.columnResizeMode ?? 'onEnd')

// ─── Merged Columns (với selection) ───────────────────────────────────────────
const mergedColumns = computed<ColumnDef<TData, TValue>[]>(() => {
  if (!props.selection?.enabled) return props.columns

  const selectionColumn: ColumnDef<TData, TValue> = {
    id: 'select',
    size: 48,
    header: ({ table }: HeaderContext<TData, TValue>) =>
      h('div', { class: 'flex items-center justify-center' }, [
        h(Checkbox, {
          modelValue:
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate'),
          'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
            table.toggleAllPageRowsSelected(getCheckboxValue(value)),
          onClick: (event: MouseEvent) => event.stopPropagation(),
          ariaLabel: 'Select all',
        }),
      ]),
    cell: ({ row }: CellContext<TData, TValue>) =>
      h('div', { class: 'flex items-center justify-center' }, [
        h(Checkbox, {
          modelValue: row.getIsSelected(),
          'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
            row.toggleSelected(getCheckboxValue(value)),
          onClick: (event: MouseEvent) => event.stopPropagation(),
          ariaLabel: 'Select row',
        }),
      ]),
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
  }

  return [selectionColumn, ...props.columns]
})

// ─── TanStack Table Instance ───────────────────────────────────────────────────
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
      typeof updaterOrValue === 'function'
        ? updaterOrValue(columnFilters.value)
        : updaterOrValue
    emit('filterChange', columnFilters.value)
  },
  onColumnVisibilityChange: (updaterOrValue) => {
    columnVisibility.value =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(columnVisibility.value)
        : updaterOrValue
  },
  onRowSelectionChange: (updaterOrValue) => {
    rowSelection.value =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(rowSelection.value)
        : updaterOrValue
    emit('selectionChange', rowSelection.value)
  },
  onColumnPinningChange: (updaterOrValue) => {
    columnPinning.value =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(columnPinning.value)
        : updaterOrValue
  },
  onPaginationChange: (updaterOrValue) => {
    pagination.value =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(pagination.value)
        : updaterOrValue
    emit('paginationChange', pagination.value)
  },
  onGlobalFilterChange: (updaterOrValue) => {
    globalFilter.value =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(globalFilter.value)
        : updaterOrValue
    emit('filterChange', globalFilter.value)
  },
  getRowId: props.rowKey ? resolveRowId : undefined,
  manualPagination: props.manualMode || props.pagination?.manual,
  manualSorting: props.manualMode || props.sorting?.manual,
  manualFiltering: props.manualMode || props.filtering?.manual,
})

// ════════════════════════════════════════════════════════════════════════════════
// PERFORMANCE OPTIMIZATIONS
// ════════════════════════════════════════════════════════════════════════════════

// ─── [OPT-1] Table Layout Style ────────────────────────────────────────────────
const tableStyle = computed<CSSProperties>(() => ({
  width: props.advanced?.columnResizing ? `${table.getTotalSize()}px` : undefined,
  // table-layout: fixed cần thiết để colgroup kiểm soát được width của toàn bộ cột
  tableLayout: props.advanced?.columnResizing ? 'fixed' : 'auto',
  ...(props.layout?.stickyHeader ? { borderCollapse: 'separate', borderSpacing: 0 } : {}),
}))

// ─── [OPT-2] CSS Custom Properties cho Column Widths ──────────────────────────
/**
 * Bind CSS vars lên container một lần thay vì inline style trên từng cell.
 *
 * Lifecycle khi resize:
 * 1. Mount: computed này tính `--col-{id}-size` từ TanStack state
 * 2. Trong lúc drag: useColumnResize ghi thẳng lên containerEl.style → KHÔNG qua Vue
 * 3. Sau mouseup: setColumnSizing() → TanStack state update → computed tái tính → bind lại
 *
 * Kết quả: 0 Vue re-render trong suốt quá trình kéo chuột.
 */
const columnSizeCSSVars = computed<Record<string, string>>(() => {
  if (!props.advanced?.columnResizing) return {}
  const vars: Record<string, string> = {}
  for (const col of table.getAllLeafColumns()) {
    vars[`--col-${col.id}-size`] = `${col.getSize()}px`
  }
  return vars
})

// ─── [OPT-3] Cache Pinned Column Styles ───────────────────────────────────────
/**
 * Tính pinned styles một lần cho tất cả headers (key = header.id).
 * Tránh gọi column.getStart() / column.getAfter() lặp lại trong mỗi header render.
 */
const pinnedHeaderStyles = computed(() => {
  const styles = new Map<string, CSSProperties>()
  const zIndex = props.layout?.stickyHeader ? 50 : 20
  for (const header of table.getFlatHeaders()) {
    styles.set(header.id, getPinnedColumnStyle(header.column, zIndex, true))
  }
  return styles
})

/**
 * Tính pinned styles một lần cho tất cả leaf columns (key = column.id).
 * Toàn bộ cells trong cùng một column dùng chung object này → không re-compute.
 */
const pinnedCellStyles = computed(() => {
  const styles = new Map<string, CSSProperties>()
  for (const col of table.getAllLeafColumns()) {
    styles.set(col.id, getPinnedColumnStyle(col, 10))
  }
  return styles
})

// ─── [OPT-4] Density Class (một lần thay vì mỗi cell) ────────────────────────
const densityClass = computed(() => {
  if (props.layout?.density === 'compact') return 'py-1'
  if (props.layout?.density === 'comfortable') return 'py-4'
  return ''
})

const headerDensityClass = computed(() => {
  if (props.layout?.density === 'compact') return 'py-1 h-8'
  if (props.layout?.density === 'comfortable') return 'py-4 h-14'
  return ''
})

// ─── [OPT-5] Custom Resize Handler (RAF + CSS vars) ───────────────────────────
/**
 * Thay thế TanStack's built-in resize handler.
 * - Dùng requestAnimationFrame để throttle DOM writes về ~60fps
 * - Ghi trực tiếp CSS Custom Property lên container (bypass Vue reactivity)
 * - Chỉ gọi setColumnSizing() một lần khi mouseup
 */
const { startResize, resizingColumnId } = useColumnResize((columnId, newSize) => {
  table.setColumnSizing((old) => ({ ...old, [columnId]: newSize }))
})

// ─── [OPT-6] Row Virtualization (@tanstack/vue-virtual) ───────────────────────
/**
 * Chỉ render các rows đang visible trong viewport + overscan buffer.
 * Kích hoạt khi props.advanced.virtualization = true VÀ bảng có chiều cao cố định.
 *
 * Yêu cầu: scrollContainer phải có chiều cao cố định (props.layout.height hoặc maxHeight).
 */
const allRows = computed(() => table.getRowModel().rows)

const rowVirtualizer = computed(() =>
  useVirtualizer({
    count: allRows.value.length,
    getScrollElement: () => scrollContainerRef.value,
    estimateSize: () => {
      // Ước tính chiều cao mỗi row theo density setting
      if (props.layout?.density === 'compact') return 33
      if (props.layout?.density === 'comfortable') return 57
      return 41
    },
    // Render thêm 10 rows ngoài viewport để scroll mượt không bị trắng
    overscan: 10,
    enabled: props.advanced?.virtualization ?? false,
  }),
)

const virtualRows = computed(() =>
  props.advanced?.virtualization ? rowVirtualizer.value.getVirtualItems() : null,
)

const totalVirtualHeight = computed(() =>
  props.advanced?.virtualization ? rowVirtualizer.value.getTotalSize() : 0,
)

// Rows thực sự được render (virtual items → actual rows, hoặc toàn bộ nếu không virtual)
const renderedRows = computed(() => {
  if (!props.advanced?.virtualization || !virtualRows.value) return allRows.value
  return virtualRows.value.map((vRow) => allRows.value[vRow.index])
})

// Padding top/bottom để tạo chiều cao ảo cho scroll
const paddingTop = computed(() => {
  if (!props.advanced?.virtualization || !virtualRows.value?.length) return 0
  return virtualRows.value[0]?.start ?? 0
})

const paddingBottom = computed(() => {
  if (!props.advanced?.virtualization || !virtualRows.value?.length) return 0
  const lastVRow = virtualRows.value[virtualRows.value.length - 1]
  return totalVirtualHeight.value - (lastVRow?.end ?? 0)
})
// ─── [OPT-7] Per-column filter helpers ───────────────────────────────────────
/**
 * Lấy giá trị filter hiện tại của một column (string).
 */
const getColumnFilterValue = (columnId: string): string => {
  const val = columnFilters.value.find((f) => f.id === columnId)?.value
  return typeof val === 'string' ? val : ''
}

/**
 * Set filter cho một column cụ thể.
 */
const setColumnFilterValue = (columnId: string, value: string) => {
  const col = table.getColumn(columnId)
  if (col) col.setFilterValue(value || undefined)
}

/**
 * Reset toàn bộ column sizing về size mặc định (từ columnDef.size).
 * Gọi table.resetColumnSizing() để xóa mọi override.
 */
const resetColumnSizes = () => {
  table.resetColumnSizing()
  emit('resetColumns')
}

// Expose resetColumnSizes để toolbar có thể gọi qua slot
defineExpose({ resetColumnSizes })
</script>

<template>
  <div class="space-y-4">
    <!-- Toolbar Slot -->
    <slot name="toolbar" :table="table" :reset-column-sizes="resetColumnSizes" />

    <div
      class="rounded-md border flex flex-col bg-background text-foreground"
      :style="{
        height: props.layout?.height,
        maxHeight: props.layout?.maxHeight,
        overflow: props.layout?.height || props.layout?.maxHeight ? 'hidden' : undefined,
      }"
    >
      <div
        ref="scrollContainerRef"
        class="min-h-0 flex-1 overflow-auto"
        :style="columnSizeCSSVars"
      >
        <Table
          container-class="overflow-visible min-w-full"
          :class="{ 'w-max': props.layout?.responsive || props.advanced?.columnResizing }"
          :table-style="tableStyle"
        >
          <colgroup v-if="props.advanced?.columnResizing">
            <col
              v-for="header in table.getFlatHeaders()"
              :key="header.id"
              :style="{ width: `var(--col-${header.id}-size)` }"
            />
          </colgroup>

          <!-- ── Header: 1 thead chứa cả row tên cột + row filter ── -->
          <TableHeader
            :class="[
              props.layout?.stickyHeader ? 'sticky top-0 z-40' : '',
              'bg-muted',
            ]"
          >
            <!-- Row 1: Tên cột -->
            <TableRow
              v-for="headerGroup in table.getHeaderGroups()"
              :key="headerGroup.id"
              class="border-b border-border/60 hover:bg-transparent"
            >
              <TableHead
                v-for="header in headerGroup.headers"
                :key="header.id"
                v-memo="[
                  header.column.getSize(),
                  header.column.getIsPinned(),
                  resizingColumnId === header.column.id,
                ]"
                :class="[
                  header.column.columnDef.meta?.headerClass,
                  headerDensityClass,
                  'bg-muted',
                  header.column.getCanResize() ? 'relative select-none overflow-visible' : '',
                  props.layout?.bordered ? 'border-r border-border/60 last:border-r-0' : '',
                ]"
                :style="pinnedHeaderStyles.get(header.id)"
              >
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="{ ...header.getContext() }"
                />
                <!-- [OPT-5] Resize Handle -->
                <div
                  v-if="header.column.getCanResize() && props.advanced?.columnResizing"
                  class="group absolute inset-y-0 right-0 z-30 flex w-4 translate-x-1/2
                         cursor-col-resize touch-none select-none items-stretch justify-center"
                  @click.stop
                  @mousedown.stop="
                    scrollContainerRef &&
                      startResize(
                        $event,
                        header.column.id,
                        header.column.getSize(),
                        scrollContainerRef,
                        header.column.columnDef.minSize ?? 40,
                      )
                  "
                >
                  <div
                    class="w-px rounded-full bg-border/60 transition-all duration-150
                           group-hover:w-0.5 group-hover:bg-primary/70"
                    :class="{ '!w-0.5 !bg-primary': resizingColumnId === header.column.id }"
                  />
                </div>
              </TableHead>
            </TableRow>

            <!-- Row 2: Filter inputs — trong cùng thead → dính liền với row tên cột khi sticky -->
            <template v-if="props.filtering?.columnFilters">
              <TableRow
                v-for="headerGroup in table.getHeaderGroups()"
                :key="'f-' + headerGroup.id"
                class="border-b border-border/40 hover:bg-transparent"
              >
                <TableHead
                  v-for="header in headerGroup.headers"
                  :key="'fi-' + header.id"
                  class="p-1 h-8 bg-muted"
                  :style="pinnedHeaderStyles.get(header.id)"
                  :class="props.layout?.bordered ? 'border-r border-border/60 last:border-r-0' : ''"
                >
                  <!-- select / actions: không có filter -->
                  <template v-if="header.id === 'select' || header.id === 'actions'" />
                  <!-- cột có thể filter -->
                  <template v-else-if="header.column.getCanFilter()">
                    <div class="col-filter-wrap">
                      <input
                        :value="getColumnFilterValue(header.column.id)"
                        type="text"
                        placeholder="Tìm trong cột..."
                        class="col-filter-input"
                        @input="setColumnFilterValue(header.column.id, ($event.target as HTMLInputElement).value)"
                      />
                      <button
                        v-if="getColumnFilterValue(header.column.id)"
                        class="col-filter-clear"
                        @click="setColumnFilterValue(header.column.id, '')"
                        title="Xóa bộ lọc"
                      >✕</button>
                    </div>
                  </template>
                  <!-- cột không filter được: để trống -->
                  <template v-else><div class="h-6" /></template>
                </TableHead>
              </TableRow>
            </template>
          </TableHeader>

          <!-- ── Body ── -->
          <TableBody>
            <template v-if="allRows.length">
              <!-- Virtualization top spacer -->
              <tr v-if="paddingTop > 0" aria-hidden="true" :style="{ height: `${paddingTop}px` }">
                <td :colspan="mergedColumns.length" class="p-0 border-0" />
              </tr>

              <DataTableRow
                v-for="row in renderedRows"
                :key="row.id"
                :row="row"
                :pinned-styles="pinnedCellStyles"
                :density-class="densityClass"
                :bordered="props.layout?.bordered ?? false"
                :is-selected="row.getIsSelected()"
                :resizing-column-id="resizingColumnId"
                @row-click="emit('rowClick', $event)"
                @row-double-click="emit('rowDoubleClick', $event)"
              />

              <!-- Virtualization bottom spacer -->
              <tr
                v-if="paddingBottom > 0"
                aria-hidden="true"
                :style="{ height: `${paddingBottom}px` }"
              >
                <td :colspan="mergedColumns.length" class="p-0 border-0" />
              </tr>
            </template>

            <!-- Empty / Loading state -->
            <template v-else>
              <TableRow>
                <TableCell :col-span="mergedColumns.length" class="h-24 text-center text-muted-foreground">
                  {{ loading ? 'Loading...' : emptyText }}
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>
    </div>

    <!-- Pagination Slot -->
    <slot name="pagination" :table="table" />
  </div>
</template>

<style scoped>
/* ─── Per-column filter inputs ─── */
.col-filter-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.col-filter-input {
  width: 100%;
  height: 24px;
  padding: 0 24px 0 6px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--background);
  color: var(--foreground);
  font-size: 11.5px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.col-filter-input::placeholder {
  color: var(--muted-foreground);
  opacity: 0.7;
}

.col-filter-input:focus {
  border-color: var(--ring);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ring) 15%, transparent);
}

.col-filter-clear {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border: none;
  background: var(--muted-foreground);
  color: var(--background);
  border-radius: 50%;
  font-size: 8px;
  line-height: 1;
  cursor: pointer;
  opacity: 0.6;
  padding: 0;
  transition: opacity 0.15s;
}

.col-filter-clear:hover {
  opacity: 1;
}
</style>
