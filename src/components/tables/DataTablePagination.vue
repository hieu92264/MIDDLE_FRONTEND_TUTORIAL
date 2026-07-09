<script setup lang="ts" generic="TData">
import type { Table } from '@tanstack/vue-table'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-vue-next'
import { ref, watch, computed } from 'vue'

interface DataTablePaginationProps {
  table: Table<TData>
  pageSizeOptions?: number[]
}

const props = withDefaults(defineProps<DataTablePaginationProps>(), {
  pageSizeOptions: () => [10, 20, 30, 50, 100],
})

const pageInput = ref('1')

watch(
  () => props.table.getState().pagination.pageIndex,
  (pageIndex) => {
    pageInput.value = String(pageIndex + 1)
  },
  { immediate: true },
)

const setPageSize = (e: Event) => {
  const val = Number((e.target as HTMLSelectElement).value)
  if (val) props.table.setPageSize(val)
}

const jumpToPage = () => {
  const pageCount = props.table.getPageCount()
  const parsed = parseInt(pageInput.value, 10)
  const target = isNaN(parsed) ? 1 : parsed
  const clamped = Math.min(Math.max(target, 1), Math.max(pageCount, 1))
  props.table.setPageIndex(clamped - 1)
  pageInput.value = String(clamped)
}

const selectedRows = computed(() => props.table.getFilteredSelectedRowModel().rows.length)
const totalRows = computed(() => props.table.getFilteredRowModel().rows.length)
const currentPage = computed(() => props.table.getState().pagination.pageIndex + 1)
const pageCount = computed(() => props.table.getPageCount())
const pageSize = computed(() => props.table.getState().pagination.pageSize)

// Page buttons: show up to 5 pages around current
const pageButtons = computed(() => {
  const total = pageCount.value
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const cur = currentPage.value
  const pages: (number | '...')[] = []
  pages.push(1)
  if (cur > 3) pages.push('...')
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) {
    pages.push(p)
  }
  if (cur < total - 2) pages.push('...')
  pages.push(total)
  return pages
})
</script>

<template>
  <div class="dt-pagination">
    <!-- Left: selection info -->
    <div class="dt-pagination__info">
      <span v-if="selectedRows > 0" class="dt-pagination__selected">
        Đã chọn {{ selectedRows }}/{{ totalRows }} dòng
      </span>
      <span v-else class="dt-pagination__total">
        Tổng <strong>{{ totalRows }}</strong> dòng
      </span>
    </div>

    <!-- Right: controls -->
    <div class="dt-pagination__controls">

      <!-- Rows per page -->
      <div class="dt-pagination__size">
        <span class="dt-pagination__size-label">Số hàng mỗi trang</span>
        <select
          class="dt-pagination__size-select"
          :value="pageSize"
          @change="setPageSize"
        >
          <option
            v-for="size in pageSizeOptions"
            :key="size"
            :value="size"
          >
            {{ size }}
          </option>
        </select>
      </div>

      <!-- Page indicator -->
      <span class="dt-pagination__page-label">
        Trang {{ currentPage }}/{{ pageCount }}
      </span>

      <!-- Page buttons -->
      <div class="dt-pagination__pages">
        <!-- First -->
        <button
          class="dt-page-btn"
          :disabled="!table.getCanPreviousPage()"
          @click="table.setPageIndex(0)"
          title="Trang đầu"
        >
          <ChevronsLeft :size="14" />
        </button>

        <!-- Prev -->
        <button
          class="dt-page-btn"
          :disabled="!table.getCanPreviousPage()"
          @click="table.previousPage()"
          title="Trang trước"
        >
          <ChevronLeft :size="14" />
        </button>

        <!-- Page number buttons -->
        <template v-for="(page, idx) in pageButtons" :key="idx">
          <span v-if="page === '...'" class="dt-page-ellipsis">…</span>
          <button
            v-else
            class="dt-page-btn dt-page-btn--num"
            :class="{ 'dt-page-btn--active': page === currentPage }"
            @click="table.setPageIndex((page as number) - 1)"
          >
            {{ page }}
          </button>
        </template>

        <!-- Next -->
        <button
          class="dt-page-btn"
          :disabled="!table.getCanNextPage()"
          @click="table.nextPage()"
          title="Trang sau"
        >
          <ChevronRight :size="14" />
        </button>

        <!-- Last -->
        <button
          class="dt-page-btn"
          :disabled="!table.getCanNextPage()"
          @click="table.setPageIndex(table.getPageCount() - 1)"
          title="Trang cuối"
        >
          <ChevronsRight :size="14" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dt-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 2px 4px;
  flex-wrap: wrap;
}

/* ── Info text ── */
.dt-pagination__info {
  font-size: 12.5px;
  color: var(--muted-foreground);
  white-space: nowrap;
}

.dt-pagination__selected {
  color: var(--primary);
  font-weight: 600;
}

.dt-pagination__total strong {
  color: var(--foreground);
  font-weight: 600;
}

/* ── Right controls ── */
.dt-pagination__controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* ── Page size selector ── */
.dt-pagination__size {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dt-pagination__size-label {
  font-size: 12px;
  color: var(--muted-foreground);
  white-space: nowrap;
}

.dt-pagination__size-select {
  height: 28px;
  padding: 0 22px 0 8px;
  border: 1px solid var(--border);
  border-radius: 5px;
  background: var(--background);
  color: var(--foreground);
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%238c8c8c' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 6px center;
  transition: border-color 0.15s;
}

.dt-pagination__size-select:hover {
  border-color: var(--ring);
}

/* ── Page label ── */
.dt-pagination__page-label {
  font-size: 12px;
  color: var(--muted-foreground);
  white-space: nowrap;
}

/* ── Page button group ── */
.dt-pagination__pages {
  display: flex;
  align-items: center;
  gap: 3px;
}

/* ── Individual page button ── */
.dt-page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 5px;
  border: 1px solid var(--border);
  border-radius: 5px;
  background: var(--background);
  color: var(--foreground);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  white-space: nowrap;
}

.dt-page-btn:hover:not(:disabled) {
  background: var(--accent);
  border-color: color-mix(in srgb, var(--border) 60%, var(--foreground));
}

.dt-page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.dt-page-btn--active {
  background: var(--primary) !important;
  border-color: var(--primary) !important;
  color: var(--primary-foreground) !important;
  font-weight: 700;
}

.dt-page-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  font-size: 12px;
  color: var(--muted-foreground);
}
</style>
