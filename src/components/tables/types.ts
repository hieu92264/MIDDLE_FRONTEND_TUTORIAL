import type { ColumnDef } from '@tanstack/vue-table'
import type { Component, HTMLAttributes } from 'vue'

declare module '@tanstack/vue-table' {
  interface ColumnMeta<TData, TValue> {
    headerClass?: HTMLAttributes['class']
    cellClass?: HTMLAttributes['class']
    align?: 'left' | 'center' | 'right'
  }
}

export interface ToolbarOptions {
  enabled?: boolean
  title?: string
  description?: string
  search?: boolean
  filters?: boolean
  columnVisibility?: boolean
  density?: boolean
  refresh?: boolean
  export?: boolean
  createButton?: boolean | string
  customActions?: boolean
}

export interface SortingOptions {
  enabled?: boolean
  defaultSort?: { id: string; desc: boolean }[]
  multiSort?: boolean
  manual?: boolean
}

export interface FilteringOptions {
  enabled?: boolean
  globalSearch?: boolean
  columnFilters?: boolean
  debounce?: number
  manual?: boolean
}

export interface PaginationOptions {
  enabled?: boolean
  manual?: boolean
  page?: number
  pageSize?: number
  pageSizeOptions?: number[]
  total?: number
}

export interface SelectionOptions<TData> {
  enabled?: boolean
  mode?: 'single' | 'multiple'
  selectable?: (row: TData) => boolean
  preserveOnPageChange?: boolean
}

export interface ActionItem<TData> {
  label: string
  icon?: Component
  onClick: (row: TData) => void
  disabled?: boolean | ((row: TData) => boolean)
  danger?: boolean
  shortcut?: string
  hidden?: boolean | ((row: TData) => boolean)
}

export interface RowActionsOptions<TData> {
  enabled?: boolean
  position?: 'first' | 'last'
  actions?: ActionItem<TData>[]
}

export interface LayoutOptions {
  bordered?: boolean
  striped?: boolean
  stickyHeader?: boolean
  stickyFooter?: boolean
  height?: string
  maxHeight?: string
  density?: 'compact' | 'default' | 'comfortable'
  rounded?: boolean
  responsive?: boolean
}

export interface AdvancedOptions {
  columnPinning?: boolean
  columnResizing?: boolean
  columnOrdering?: boolean
  rowExpansion?: boolean
  grouping?: boolean
  virtualization?: boolean
  urlSync?: boolean
  statePersistence?: boolean
}

export interface DataTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  rowKey?: string | ((row: TData) => string)
  loading?: boolean
  error?: string | null
  emptyText?: string
  disabled?: boolean
  manualMode?: boolean

  toolbar?: ToolbarOptions
  sorting?: SortingOptions
  filtering?: FilteringOptions
  pagination?: PaginationOptions
  selection?: SelectionOptions<TData>
  rowActions?: RowActionsOptions<TData>
  layout?: LayoutOptions
  advanced?: AdvancedOptions
}
