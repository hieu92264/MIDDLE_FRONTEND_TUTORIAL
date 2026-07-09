<script setup lang="ts" generic="TData">
import type { Table } from '@tanstack/vue-table'
import {
  RefreshCcw,
  Download,
  Plus,
  Filter,
  X,
  Settings2,
  Search,
  Columns3,
} from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ToolbarOptions } from './types'

interface DataTableToolbarProps {
  table: Table<TData>
  options?: ToolbarOptions
  resetColumnSizes?: () => void
}

const props = defineProps<DataTableToolbarProps>()

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'create'): void
  (e: 'export'): void
}>()

const isRefreshing = ref(false)

const handleRefresh = () => {
  isRefreshing.value = true
  emit('refresh')
  setTimeout(() => { isRefreshing.value = false }, 700)
}

// Column visibility helpers
const hideableColumns = computed(() =>
  props.table
    .getAllColumns()
    .filter((col) => col.getCanHide())
    .map((col) => ({ col, id: col.id, isVisible: col.getIsVisible() })),
)

const visibleCount = computed(() => hideableColumns.value.filter((c) => c.isVisible).length)

// Global filter shortcut
const globalSearch = computed({
  get: () => (props.table.getState().globalFilter as string) ?? '',
  set: (v) => props.table.setGlobalFilter(v),
})

const clearSearch = () => props.table.setGlobalFilter('')

const selectedCount = computed(
  () => props.table.getFilteredSelectedRowModel().rows.length,
)

const createLabel = computed(() =>
  typeof props.options?.createButton === 'string'
    ? props.options.createButton
    : 'Thêm mới',
)
</script>

<template>
  <div v-if="options?.enabled !== false" class="dt-toolbar">

    <!-- ── Left: Search + selected badge ── -->
    <div class="dt-toolbar__left">

      <!-- Global search box -->
      <div v-if="options?.search !== false" class="dt-search">
        <Search :size="13" class="dt-search__icon" />
        <input
          v-model="globalSearch"
          type="text"
          placeholder="Tìm kiếm..."
          class="dt-search__input"
        />
        <button v-if="globalSearch" class="dt-search__clear" @click="clearSearch">
          <X :size="11" />
        </button>
      </div>

      <!-- Selected rows badge -->
      <span v-if="selectedCount > 0" class="dt-selected-badge">
        Đã chọn {{ selectedCount }} dòng
      </span>

      <!-- Custom filter slot -->
      <slot name="filters" />
    </div>

    <!-- ── Right: Action buttons ── -->
    <div class="dt-toolbar__right">
      <!-- Custom actions slot -->
      <slot name="actions" />

      <!-- Refresh -->
      <button
        v-if="options?.refresh"
        class="dt-btn dt-btn--icon"
        :class="{ 'dt-btn--spinning': isRefreshing }"
        @click="handleRefresh"
        title="Làm mới"
      >
        <RefreshCcw :size="14" :class="{ 'dt-spin': isRefreshing }" />
      </button>

      <!-- Export -->
      <button
        v-if="options?.export"
        class="dt-btn dt-btn--icon"
        @click="emit('export')"
        title="Xuất dữ liệu"
      >
        <Download :size="14" />
      </button>

      <!-- Column Visibility Dropdown -->
      <DropdownMenu v-if="options?.columnVisibility !== false">
        <DropdownMenuTrigger as-child>
          <button class="dt-btn dt-btn--icon" title="Hiển thị cột">
            <Settings2 :size="14" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-44">
          <DropdownMenuLabel class="text-xs text-muted-foreground font-medium py-1.5">
            Ẩn/hiện cột ({{ visibleCount }}/{{ hideableColumns.length }})
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            v-for="item in hideableColumns"
            :key="item.id"
            class="capitalize text-xs"
            :model-value="item.isVisible"
            @update:model-value="item.col.toggleVisibility($event === true)"
          >
            {{ item.id }}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <!-- Reset column sizes -->
      <button
        v-if="resetColumnSizes && options?.resetColumns !== false"
        class="dt-btn dt-btn--icon"
        @click="resetColumnSizes"
        title="Đặt lại kích thước cột"
      >
        <Columns3 :size="14" />
      </button>

      <!-- Filter dropdown slot -->
      <slot name="view-options" />

      <!-- Divider before primary CTA -->
      <div v-if="options?.createButton" class="dt-toolbar__divider" />

      <!-- Create / Add new -->
      <button
        v-if="options?.createButton"
        class="dt-btn dt-btn--primary"
        @click="emit('create')"
      >
        <Plus :size="14" />
        <span>{{ createLabel }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* ── Toolbar container ── */
.dt-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 0 4px;
  flex-wrap: wrap;
}

/* ── Left side ── */
.dt-toolbar__left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

/* ── Right side ── */
.dt-toolbar__right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.dt-toolbar__divider {
  width: 1px;
  height: 20px;
  background: var(--border);
  margin: 0 2px;
}

/* ── Search box ── */
.dt-search {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--muted);
  min-width: 180px;
  max-width: 260px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.dt-search:focus-within {
  border-color: var(--ring);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ring) 15%, transparent);
  background: var(--background);
}

.dt-search__icon {
  color: var(--muted-foreground);
  flex-shrink: 0;
}

.dt-search__input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 12.5px;
  color: var(--foreground);
  min-width: 0;
}

.dt-search__input::placeholder {
  color: var(--muted-foreground);
}

.dt-search__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: var(--muted-foreground);
  color: var(--background);
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
  opacity: 0.6;
  transition: opacity 0.15s;
}

.dt-search__clear:hover {
  opacity: 1;
}

/* ── Selected badge ── */
.dt-selected-badge {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  background: color-mix(in srgb, var(--primary) 12%, transparent);
  color: var(--primary);
  border: 1px solid color-mix(in srgb, var(--primary) 25%, transparent);
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
}

/* ── Icon buttons ── */
.dt-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 30px;
  padding: 0 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--background);
  color: var(--foreground);
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  white-space: nowrap;
}

.dt-btn:hover {
  background: var(--accent);
  border-color: color-mix(in srgb, var(--border) 70%, var(--foreground));
}

.dt-btn--icon {
  width: 30px;
  padding: 0;
}

.dt-btn--primary {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--primary-foreground);
  padding: 0 12px;
  font-weight: 600;
}

.dt-btn--primary:hover {
  opacity: 0.9;
  background: var(--primary);
}

/* Spinning refresh button */
@keyframes dt-spin {
  to { transform: rotate(-360deg); }
}
.dt-spin {
  animation: dt-spin 0.7s linear infinite;
}
</style>
