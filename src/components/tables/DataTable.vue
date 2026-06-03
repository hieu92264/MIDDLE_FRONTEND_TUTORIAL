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

const getPinnedColumnStyle = (column: Column<TData, unknown>, zIndex: number): CSSProperties => {
  const pinned = column.getIsPinned()
  if (!pinned) return {}
  const style: CSSProperties = {
    position: 'sticky',
    zIndex,
    backgroundColor: 'var(--background)',
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
    styles.set(header.id, getPinnedColumnStyle(header.column, zIndex))
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
</script>

<template>
  <div class="space-y-4">
    <!-- Toolbar Slot -->
    <slot name="toolbar" :table="table" />

    <div
      class="rounded-md border flex flex-col bg-background text-foreground"
      :style="{
        height: props.layout?.height,
        maxHeight: props.layout?.maxHeight,
        overflow: props.layout?.height || props.layout?.maxHeight ? 'hidden' : undefined,
      }"
    >
      <!--
        [OPT-2] Bind CSS Custom Properties một lần tại đây.
        Tất cả <col> trong colgroup dùng var(--col-{id}-size) → width tự động cập nhật
        khi CSS var thay đổi mà KHÔNG cần Vue re-render.

        ref="scrollContainerRef" → dùng cho useColumnResize và useVirtualizer.
      -->
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
          <!--
            [OPT-1] <colgroup> định nghĩa width cho toàn bộ cột chỉ một lần.
            Với table-layout: fixed, tất cả cells trong cột kế thừa width này.
            → Không cần min-width/width/max-width trên từng <td>.
            → Khi CSS var thay đổi (do drag resize), browser chỉ reflow layout 1 lần.
          -->
          <colgroup v-if="props.advanced?.columnResizing">
            <col
              v-for="header in table.getFlatHeaders()"
              :key="header.id"
              :style="{ width: `var(--col-${header.id}-size)` }"
            />
          </colgroup>

          <!-- ── Header ── -->
          <TableHeader
            :class="[
              props.layout?.stickyHeader ? 'sticky top-0 z-40' : '',
              'bg-muted/50',
            ]"
          >
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
                  props.layout?.stickyHeader
                    ? 'sticky top-0 z-40 border-b bg-muted/50'
                    : '',
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

                <!--
                  [OPT-5] Resize Handle — wide transparent hit zone + narrow visual bar.
                  Outer div: w-4 (16px) transparent, cursor-col-resize trên toàn bộ 16px.
                    - Dịch sang phải -8px để căn giữa trên đường border cột
                    - z-30 để hover zone không bị cắt bởi column bên phải
                  Inner div: w-px (2px) visual indicator, centered trong hit zone.
                    - Transition smooth khi hover/active
                    - Scale lên w-1 (4px) khi hover hoặc đang resize
                -->
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
                  <!-- Visual indicator: thin bar, expands on hover/resize -->
                  <div
                    class="w-px rounded-full bg-border/60 transition-all duration-150
                           group-hover:w-0.5 group-hover:bg-primary/70"
                    :class="{
                      '!w-0.5 !bg-primary': resizingColumnId === header.column.id,
                    }"
                  />
                </div>
              </TableHead>
            </TableRow>
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
