<script setup lang="ts" generic="TData">
import type { Row } from '@tanstack/vue-table'
import type { CSSProperties } from 'vue'
import { FlexRender } from '@tanstack/vue-table'

import { TableCell, TableRow } from '@/components/ui/table'

interface Props {
  row: Row<TData>
  /** Cache Map của pinned styles, key = column.id. Tất cả cells cùng column dùng chung. */
  pinnedStyles: Map<string, CSSProperties>
  /** Tailwind class cho density (compact/default/comfortable) */
  densityClass: string
  /** Hiển thị border phải giữa các cells */
  bordered: boolean
  /** Trạng thái selected — primitive để v-memo hoạt động đúng */
  isSelected: boolean
  /**
   * ID của column đang được resize (hoặc null).
   * Dùng làm dependency cho v-memo:
   * - Khi drag bắt đầu: resizingColumnId đổi → rows re-render 1 lần (cập nhật visual handle)
   * - Trong suốt drag: resizingColumnId không đổi → rows KHÔNG re-render (CSS vars xử lý DOM)
   * - Khi drag kết thúc: resizingColumnId về null → rows re-render 1 lần (xác nhận kích thước cuối)
   */
  resizingColumnId: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  rowClick: [row: TData]
  rowDoubleClick: [row: TData]
}>()
</script>

<template>
  <!--
    v-memo: chỉ re-render row khi isSelected HOẶC resizingColumnId thay đổi.
    Tất cả dependency phải là primitive (string, boolean, null) để shallow compare hoạt động.
    Không truyền objects/arrays vào đây vì chúng luôn tạo reference mới → v-memo mất tác dụng.
  -->
  <TableRow
    v-memo="[isSelected, resizingColumnId]"
    :data-state="isSelected ? 'selected' : undefined"
    class="cursor-pointer"
    @click="emit('rowClick', row.original)"
    @dblclick="emit('rowDoubleClick', row.original)"
  >
    <TableCell
      v-for="cell in row.getVisibleCells()"
      :key="cell.id"
      :class="[
        cell.column.columnDef.meta?.cellClass,
        densityClass,
        bordered ? 'border-r border-border/70 last:border-r-0' : '',
      ]"
      :style="pinnedStyles.get(cell.column.id)"
    >
      <FlexRender :render="cell.column.columnDef.cell" :props="{ ...cell.getContext() }" />
    </TableCell>
  </TableRow>
</template>
