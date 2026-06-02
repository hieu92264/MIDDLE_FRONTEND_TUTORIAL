# DataTable

`src/components/tables` cung cấp bộ component bảng dùng chung cho các trang quản trị dữ liệu.

Bộ `DataTable` được xây dựng dựa trên:

- `@tanstack/vue-table`
- Các UI primitives trong `src/components/ui`

Trang demo hiện tại:

```txt
src/modules/users/pages/UsersPage.vue
```

---

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Danh sách component](#danh-sách-component)
- [Cách sử dụng nhanh](#cách-sử-dụng-nhanh)
- [DataTable Props](#datatable-props)
- [Selection](#selection)
- [Sorting](#sorting)
- [Filtering](#filtering)
- [Pagination](#pagination)
- [Layout](#layout)
- [Advanced Options](#advanced-options)
- [Column Definition](#column-definition)
- [Sticky Column / Pin Column](#sticky-column--pin-column)
- [Slots](#slots)
- [Events](#events)
- [Toolbar](#toolbar)
- [Row Actions](#row-actions)
- [Bulk Actions](#bulk-actions)
- [Column Visibility](#column-visibility)
- [Resize Column](#resize-column)
- [Sticky Header](#sticky-header)
- [Server-side Mode](#server-side-mode)
- [Mẫu page đầy đủ](#mẫu-page-đầy-đủ)
- [Checklist khi tạo table mới](#checklist-khi-tạo-table-mới)
- [Lưu ý hiện tại](#lưu-ý-hiện-tại)

---

## Giới thiệu

`DataTable` là bộ component bảng dùng chung cho các màn hình quản trị dữ liệu.

Có thể dùng cho các page như:

- Danh sách người dùng
- Danh sách sản phẩm
- Danh sách đơn hàng
- Danh sách vai trò
- Danh sách phân quyền
- Danh sách log
- Các màn CRUD trong hệ thống admin

Bộ này hỗ trợ sẵn nhiều chức năng thường dùng:

- Hiển thị dữ liệu dạng bảng
- Sort cột
- Search toàn bảng
- Filter theo cột
- Chọn một hoặc nhiều dòng
- Bulk actions
- Row actions
- Ẩn/hiện cột
- Pin cột trái/phải
- Resize cột
- Sticky header
- Pagination
- Server-side pagination/sorting/filtering

---

## Danh sách component

Import từ:

```ts
import {
  DataTable,
  DataTableToolbar,
  DataTablePagination,
  DataTableColumnHeader,
  DataTableColumnVisibility,
  DataTableFacetedFilter,
  DataTableRowActions,
  DataTableBulkActions,
  type ActionItem,
  type DataTableProps,
} from '@/components/tables'
```

| Component | Mục đích |
|---|---|
| `DataTable` | Component bảng chính. Nhận `data`, `columns`, options và render table |
| `DataTableToolbar` | Thanh công cụ gồm search, refresh, export, create button, filters, actions |
| `DataTablePagination` | Phân trang, chọn page size, jump page, first/prev/next/last page |
| `DataTableColumnHeader` | Header có sort, hide column, pin left/right/unpin |
| `DataTableColumnVisibility` | Dropdown ẩn/hiện cột |
| `DataTableFacetedFilter` | Dropdown filter multi-select cho một column |
| `DataTableRowActions` | Dropdown actions trên từng row |
| `DataTableBulkActions` | Actions cho các row đang được chọn |

---

## Cách sử dụng nhanh

Ví dụ đơn giản với bảng `User`.

```vue
<script setup lang="ts">
import { h, ref } from 'vue'
import type { ColumnDef, HeaderContext } from '@tanstack/vue-table'
import {
  DataTable,
  DataTableColumnHeader,
  DataTableColumnVisibility,
  DataTablePagination,
  DataTableToolbar,
} from '@/components/tables'

interface User {
  id: string
  name: string
  email: string
}

const data = ref<User[]>([
  { id: '1', name: 'Admin', email: 'admin@example.com' },
  { id: '2', name: 'User', email: 'user@example.com' },
])

const renderHeader =
  (title: string) =>
  ({ column }: HeaderContext<User, unknown>) =>
    h(DataTableColumnHeader, { column, title })

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: renderHeader('Tên'),
    size: 220,
  },
  {
    accessorKey: 'email',
    header: renderHeader('Email'),
    size: 280,
  },
]
</script>

<template>
  <DataTable
    :data="data"
    :columns="columns"
    row-key="id"
    :selection="{ enabled: true }"
    :layout="{
      bordered: true,
      stickyHeader: true,
      height: '460px',
      responsive: true
    }"
    :pagination="{
      pageSize: 20,
      pageSizeOptions: [10, 20, 50]
    }"
    :advanced="{
      columnPinning: true,
      columnResizing: true,
      columnResizeMode: 'onEnd'
    }"
  >
    <template #toolbar="{ table }">
      <DataTableToolbar
        :table="table"
        :options="{
          createButton: 'Thêm người dùng',
          export: true
        }"
      >
        <template #view-options>
          <DataTableColumnVisibility :table="table" />
        </template>
      </DataTableToolbar>
    </template>

    <template #pagination="{ table }">
      <DataTablePagination :table="table" />
    </template>
  </DataTable>
</template>
```

---

## DataTable Props

Type gốc nằm trong `types.ts`.

```ts
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
```

| Prop | Bắt buộc | Mô tả |
|---|---|---|
| `data` | Có | Mảng record cần hiển thị |
| `columns` | Có | Mảng `ColumnDef<TData>[]` của TanStack Table |
| `rowKey` | Nên có | ID duy nhất cho row. Rất nên truyền khi dùng selection/delete/update |
| `loading` | Không | Khi table rỗng, hiển thị `Loading...` thay vì `emptyText` |
| `error` | Không | Chưa render UI riêng cho error, đang để sẵn cho mở rộng |
| `emptyText` | Không | Text khi không có row. Mặc định là `No results.` |
| `disabled` | Không | Chưa có UI disabled riêng, đang để sẵn cho mở rộng |
| `manualMode` | Không | Bật server-side pagination/sorting/filtering cùng lúc |
| `toolbar` | Không | Cấu hình toolbar, hiện tại thường render qua slot |
| `sorting` | Không | Cấu hình sort |
| `filtering` | Không | Cấu hình filter |
| `pagination` | Không | Cấu hình phân trang |
| `selection` | Không | Cấu hình chọn row |
| `rowActions` | Không | Để sẵn cho mở rộng, hiện tại row actions thường render bằng column custom |
| `layout` | Không | Cấu hình giao diện bảng |
| `advanced` | Không | Cấu hình nâng cao như pin column, resize column |

---

## Selection

Dùng khi cần chọn một hoặc nhiều dòng trong bảng.

```ts
selection: {
  enabled?: boolean
  mode?: 'single' | 'multiple'
  selectable?: (row: TData) => boolean
  preserveOnPageChange?: boolean
}
```

### Ví dụ bật selection

```vue
<DataTable
  :data="users"
  :columns="columns"
  row-key="id"
  :selection="{ enabled: true }"
/>
```

### Chọn nhiều dòng

```vue
<DataTable
  :data="users"
  :columns="columns"
  row-key="id"
  :selection="{
    enabled: true,
    mode: 'multiple'
  }"
/>
```

### Chỉ chọn một dòng

```vue
<DataTable
  :data="users"
  :columns="columns"
  row-key="id"
  :selection="{
    enabled: true,
    mode: 'single'
  }"
/>
```

### Không cho chọn một số dòng

```vue
<DataTable
  :data="users"
  :columns="columns"
  row-key="id"
  :selection="{
    enabled: true,
    mode: 'multiple',
    selectable: (row) => row.status !== 'banned'
  }"
/>
```

### Ghi chú

- Khi `selection.enabled = true`, table tự thêm cột checkbox bên trái.
- `mode: 'single'` chỉ cho chọn một row.
- Nên luôn truyền `row-key`.
- Nếu không truyền `row-key`, selection có thể bị sai khi sort/filter/delete.

---

## Sorting

Dùng để sắp xếp dữ liệu theo cột.

```ts
sorting: {
  enabled?: boolean
  defaultSort?: { id: string; desc: boolean }[]
  multiSort?: boolean
  manual?: boolean
}
```

### Bật sort cho một cột

```ts
{
  accessorKey: 'createdAt',
  header: renderHeader('Ngày tạo'),
  enableSorting: true,
}
```

### Sort mặc định

```vue
<DataTable
  :data="users"
  :columns="columns"
  :sorting="{
    defaultSort: [{ id: 'createdAt', desc: true }]
  }"
/>
```

Ví dụ trên sẽ sort mặc định theo `createdAt` giảm dần.

### Lưu ý

Muốn header có menu sort, nên dùng `DataTableColumnHeader`.

```ts
const renderHeader =
  (title: string) =>
  ({ column }: HeaderContext<User, unknown>) =>
    h(DataTableColumnHeader, { column, title })
```

---

## Filtering

Dùng để tìm kiếm hoặc lọc dữ liệu.

```ts
filtering: {
  enabled?: boolean
  globalSearch?: boolean
  columnFilters?: boolean
  debounce?: number
  manual?: boolean
}
```

Có 2 kiểu filter phổ biến:

- Global search
- Faceted filter theo từng column

---

### Global Search

Global search nằm trong `DataTableToolbar`.

```vue
<DataTableToolbar
  :table="table"
  :options="{ search: true }"
/>
```

Ví dụ đầy đủ:

```vue
<template #toolbar="{ table }">
  <DataTableToolbar
    :table="table"
    :options="{
      search: true,
      refresh: true,
      createButton: 'Thêm mới'
    }"
  />
</template>
```

---

### Faceted Filter

Dùng để lọc một cột theo danh sách lựa chọn.

Ví dụ lọc theo `status`.

```ts
import type { FilterFn } from '@tanstack/vue-table'

const arrayIncludesFilter: FilterFn<User> = (row, id, value) => {
  return Array.isArray(value) && value.includes(String(row.getValue(id)))
}
```

Khai báo column:

```ts
const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'status',
    header: renderHeader('Trạng thái'),
    filterFn: arrayIncludesFilter,
  },
]
```

Render filter trong toolbar:

```vue
<template #toolbar="{ table }">
  <DataTableToolbar :table="table">
    <template #filters>
      <DataTableFacetedFilter
        v-if="table.getColumn('status')"
        :column="table.getColumn('status')"
        title="Trạng thái"
        :options="[
          { label: 'Hoạt động', value: 'active' },
          { label: 'Không hoạt động', value: 'inactive' },
          { label: 'Bị khóa', value: 'banned' },
        ]"
      />
    </template>
  </DataTableToolbar>
</template>
```

---

## Pagination

Dùng để phân trang dữ liệu.

```ts
pagination: {
  enabled?: boolean
  manual?: boolean
  page?: number
  pageSize?: number
  pageSizeOptions?: number[]
  total?: number
}
```

### Cấu hình page size

```vue
<DataTable
  :data="users"
  :columns="columns"
  :pagination="{
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100]
  }"
/>
```

### Render pagination

```vue
<template #pagination="{ table }">
  <DataTablePagination :table="table" />
</template>
```

Hoặc:

```vue
<template #pagination="{ table }">
  <DataTablePagination
    :table="table"
    :page-size-options="[10, 20, 50]"
  />
</template>
```

### Chức năng hiện có

- Hiển thị số row đang select
- Hiển thị tổng row sau filter
- Chọn rows per page
- Nhập `Go to` để nhảy đến page bất kỳ
- First page
- Previous page
- Next page
- Last page

---

## Layout

Dùng để cấu hình giao diện bảng.

```ts
layout: {
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
```

### Ví dụ

```vue
<DataTable
  :data="users"
  :columns="columns"
  :layout="{
    bordered: true,
    stickyHeader: true,
    height: '460px',
    density: 'default',
    responsive: true
  }"
/>
```

| Option | Tác dụng |
|---|---|
| `bordered` | Thêm viền dọc giữa các cột và border table |
| `stickyHeader` | Header dính trên cùng khi scroll trong table |
| `height` | Set chiều cao cố định cho table container, ví dụ `460px` |
| `maxHeight` | Set chiều cao tối đa cho table container |
| `density` | Điều chỉnh độ cao/padding của cell |
| `responsive` | Cho phép scroll ngang khi table rộng hơn container |
| `striped` | Để sẵn nhưng chưa có UI rõ ràng |
| `stickyFooter` | Để sẵn nhưng chưa có UI rõ ràng |
| `rounded` | Để sẵn nhưng chưa có UI rõ ràng |

### Density

```ts
density: 'compact'
density: 'default'
density: 'comfortable'
```

Gợi ý sử dụng:

| Giá trị | Khi nào nên dùng |
|---|---|
| `compact` | Bảng nhiều dữ liệu, muốn tiết kiệm chiều cao |
| `default` | Trường hợp thông thường |
| `comfortable` | Bảng ít dữ liệu, muốn giao diện thoáng hơn |

---

## Advanced Options

Dùng cho các tính năng nâng cao.

```ts
advanced: {
  columnPinning?: boolean
  columnResizing?: boolean
  columnResizeMode?: 'onChange' | 'onEnd'
  columnOrdering?: boolean
  rowExpansion?: boolean
  grouping?: boolean
  virtualization?: boolean
  urlSync?: boolean
  statePersistence?: boolean
}
```

### Ví dụ

```vue
<DataTable
  :data="users"
  :columns="columns"
  :advanced="{
    columnPinning: true,
    columnResizing: true,
    columnResizeMode: 'onEnd'
  }"
/>
```

| Option | Tác dụng |
|---|---|
| `columnPinning` | Cho phép pin cột trái/phải |
| `columnResizing` | Cho phép resize cột bằng cách kéo mép phải của header |
| `columnResizeMode` | Chế độ resize cột |

### columnResizeMode

Có 2 giá trị:

```ts
'onEnd'
'onChange'
```

Nên dùng:

```ts
columnResizeMode: 'onEnd'
```

Vì ít lag hơn, chỉ cập nhật kích thước khi thả chuột.

Chỉ dùng:

```ts
columnResizeMode: 'onChange'
```

khi cần resize realtime và bảng không quá lớn.

### Options đã khai báo nhưng chưa implement đầy đủ

- `columnOrdering`
- `rowExpansion`
- `grouping`
- `virtualization`
- `urlSync`
- `statePersistence`

---

## Column Definition

`DataTable` dùng `ColumnDef` của `@tanstack/vue-table`.

```ts
const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: renderHeader('Tên'),
    size: 220,
    minSize: 160,
    maxSize: 320,
    enableHiding: true,
    enableSorting: true,
    enableResizing: true,
    meta: {
      cellClass: 'font-medium',
      headerClass: 'text-left',
      pin: 'left',
    },
  },
]
```

| Thuộc tính | Mục đích |
|---|---|
| `accessorKey` | Tên field trong object data |
| `id` | ID riêng của column, thường dùng cho column custom |
| `header` | Nội dung header |
| `cell` | Nội dung cell custom |
| `size` | Chiều rộng mặc định |
| `minSize` | Chiều rộng nhỏ nhất |
| `maxSize` | Chiều rộng lớn nhất |
| `enableHiding` | Cho phép ẩn/hiện cột |
| `enableSorting` | Cho phép sort cột |
| `enableResizing` | Cho phép resize cột |
| `meta` | Thông tin mở rộng cho UI |

---

## Column Meta

`types.ts` có mở rộng `ColumnMeta`.

```ts
meta?: {
  headerClass?: HTMLAttributes['class']
  cellClass?: HTMLAttributes['class']
  align?: 'left' | 'center' | 'right'
  pin?: 'left' | 'right'
}
```

| Meta | Tác dụng |
|---|---|
| `headerClass` | Class thêm vào `<th>` |
| `cellClass` | Class thêm vào `<td>` |
| `align` | Để sẵn cho mở rộng |
| `pin` | Pin cột mặc định sang `left` hoặc `right` |

Ví dụ:

```ts
{
  accessorKey: 'price',
  header: renderHeader('Giá'),
  meta: {
    cellClass: 'text-right font-medium',
    headerClass: 'text-right',
  },
}
```

---

## Sticky Column / Pin Column

Dùng khi muốn cố định một cột ở bên trái hoặc bên phải.

Ví dụ thường dùng:

- Cột checkbox nằm bên trái
- Cột tên nằm bên trái
- Cột actions nằm bên phải

### Bật pinning

```vue
<DataTable
  :data="users"
  :columns="columns"
  :advanced="{ columnPinning: true }"
/>
```

### Pin mặc định bằng `meta.pin`

```ts
{
  accessorKey: 'name',
  header: renderHeader('Tên'),
  meta: {
    pin: 'left',
  },
}
```

### Pin cột actions bên phải

```ts
{
  id: 'actions',
  size: 70,
  enableHiding: false,
  enableSorting: false,
  enableResizing: false,
  meta: {
    pin: 'right',
    cellClass: 'text-right',
  },
  cell: ({ row }) =>
    h(DataTableRowActions, {
      row,
      actions: rowActions,
    }),
}
```

### Pin bằng UI

Để pin bằng UI:

- Cần bật `advanced.columnPinning = true`
- Cần dùng `DataTableColumnHeader` trong `header`

Menu header sẽ có:

- `Pin left`
- `Pin right`
- `Unpin`

---

## Slots

`DataTable` hiện có 2 slot chính.

| Slot | Props | Mục đích |
|---|---|---|
| `toolbar` | `{ table }` | Render toolbar, filters, actions, column visibility |
| `pagination` | `{ table }` | Render pagination |

### Ví dụ

```vue
<DataTable :data="data" :columns="columns">
  <template #toolbar="{ table }">
    <DataTableToolbar :table="table">
      <template #filters>
        <DataTableFacetedFilter
          :column="table.getColumn('status')"
          title="Trạng thái"
          :options="statusOptions"
        />
      </template>

      <template #actions>
        <DataTableBulkActions
          :table="table"
          :actions="bulkActions"
        />
      </template>

      <template #view-options>
        <DataTableColumnVisibility :table="table" />
      </template>
    </DataTableToolbar>
  </template>

  <template #pagination="{ table }">
    <DataTablePagination :table="table" />
  </template>
</DataTable>
```

---

## Events

`DataTable` emit các events sau.

| Event | Payload | Mục đích |
|---|---|---|
| `rowClick` | `TData` | Khi click vào row |
| `rowDoubleClick` | `TData` | Khi double click vào row |
| `selectionChange` | `RowSelectionState` | Khi selection thay đổi |
| `sortingChange` | `SortingState` | Khi sorting thay đổi |
| `filterChange` | `ColumnFiltersState \| string` | Khi filter thay đổi |
| `paginationChange` | `PaginationState` | Khi pagination thay đổi |
| `refresh` | none | Khi bấm refresh |
| `create` | none | Khi bấm create |
| `export` | none | Khi bấm export |

### Ví dụ

```vue
<DataTable
  :data="users"
  :columns="columns"
  row-key="id"
  @row-click="handleRowClick"
  @row-double-click="handleRowDoubleClick"
  @selection-change="handleSelectionChange"
/>
```

```ts
const handleRowClick = (row: User) => {
  console.log('Click row:', row)
}

const handleRowDoubleClick = (row: User) => {
  console.log('Double click row:', row)
}

const handleSelectionChange = (selection: RowSelectionState) => {
  console.log('Selection:', selection)
}
```

---

## Toolbar

`DataTableToolbar` dùng để render thanh công cụ phía trên bảng.

```vue
<DataTableToolbar
  :table="table"
  :options="{
    enabled: true,
    search: true,
    refresh: true,
    export: true,
    createButton: 'Thêm người dùng'
  }"
  @refresh="fetchData"
  @export="exportData"
  @create="openCreateModal"
>
  <template #filters>
    <!-- Filter đặt ở đây -->
  </template>

  <template #actions>
    <!-- Bulk actions hoặc custom actions đặt ở đây -->
  </template>

  <template #view-options>
    <DataTableColumnVisibility :table="table" />
  </template>
</DataTableToolbar>
```

| Option | Tác dụng |
|---|---|
| `enabled` | `false` để ẩn toolbar |
| `search` | `false` để ẩn global search. Mặc định hiển thị |
| `refresh` | Hiện nút Refresh |
| `export` | Hiện nút Export |
| `createButton` | `true` hiện label `Create`, string để đổi label |
| `filters` | Để sẵn cho mở rộng. Nên dùng slot `filters` |
| `columnVisibility` | Để sẵn cho mở rộng. Nên dùng slot `view-options` |
| `density` | Để sẵn cho mở rộng |
| `customActions` | Để sẵn cho mở rộng. Nên dùng slot `actions` |

---

## Row Actions

Dùng để render menu action cho từng dòng.

Ví dụ:

- Xem chi tiết
- Sửa
- Xóa
- Khóa tài khoản
- Khôi phục

### Khai báo actions

```ts
import { Edit, Trash2, Eye } from 'lucide-vue-next'
import type { ActionItem } from '@/components/tables'

const rowActions: ActionItem<User>[] = [
  {
    label: 'Xem chi tiết',
    icon: Eye,
    onClick: (row) => {
      console.log('Xem chi tiết:', row)
    },
  },
  {
    label: 'Sửa',
    icon: Edit,
    onClick: (row) => {
      openEditModal(row)
    },
  },
  {
    label: 'Xóa',
    icon: Trash2,
    danger: true,
    disabled: (row) => row.role === 'admin',
    onClick: (row) => {
      deleteUser(row.id)
    },
  },
]
```

### Thêm cột actions

```ts
{
  id: 'actions',
  size: 70,
  enableHiding: false,
  enableSorting: false,
  enableResizing: false,
  meta: {
    pin: 'right',
    cellClass: 'text-right',
  },
  cell: ({ row }) =>
    h(DataTableRowActions, {
      row,
      actions: rowActions,
    }),
}
```

### ActionItem

```ts
interface ActionItem<TData> {
  label: string
  icon?: Component
  onClick: (row: TData) => void
  disabled?: boolean | ((row: TData) => boolean)
  danger?: boolean
  shortcut?: string
  hidden?: boolean | ((row: TData) => boolean)
}
```

| Thuộc tính | Ý nghĩa |
|---|---|
| `label` | Text hiển thị |
| `icon` | Icon hiển thị bên trái |
| `onClick` | Hàm chạy khi click |
| `disabled` | Vô hiệu hóa action |
| `danger` | Đánh dấu action nguy hiểm, thường dùng cho xóa |
| `shortcut` | Phím tắt |
| `hidden` | Ẩn action theo điều kiện |

### Ví dụ ẩn action theo điều kiện

```ts
{
  label: 'Khôi phục',
  hidden: (row) => row.status !== 'deleted',
  onClick: (row) => restoreUser(row.id),
}
```

---

## Bulk Actions

Dùng khi cần thao tác trên nhiều dòng đang được chọn.

Ví dụ:

- Xóa các dòng đã chọn
- Export các dòng đã chọn
- Cập nhật trạng thái hàng loạt
- Gán quyền hàng loạt

### Khai báo bulk actions

```ts
const bulkActions: ActionItem<User[]>[] = [
  {
    label: 'Xóa đã chọn',
    icon: Trash2,
    danger: true,
    onClick: (rows) => {
      deleteUsers(rows.map((row) => row.id))
    },
  },
]
```

### Render bulk actions

```vue
<template #actions>
  <DataTableBulkActions
    :table="table"
    :actions="bulkActions"
  />
</template>
```

### Ví dụ đầy đủ

```vue
<DataTable
  :data="users"
  :columns="columns"
  row-key="id"
  :selection="{ enabled: true }"
>
  <template #toolbar="{ table }">
    <DataTableToolbar :table="table">
      <template #actions>
        <DataTableBulkActions
          :table="table"
          :actions="bulkActions"
        />
      </template>
    </DataTableToolbar>
  </template>
</DataTable>
```

### Lưu ý

- Bulk actions chỉ hiện khi có ít nhất 1 row đang được chọn.
- Muốn dùng bulk actions thì cần bật `selection.enabled = true`.

---

## Column Visibility

Dùng để ẩn/hiện cột.

```vue
<template #view-options>
  <DataTableColumnVisibility :table="table" />
</template>
```

Ví dụ:

```vue
<template #toolbar="{ table }">
  <DataTableToolbar :table="table">
    <template #view-options>
      <DataTableColumnVisibility :table="table" />
    </template>
  </DataTableToolbar>
</template>
```

Ẩn/hiện cột dựa trên:

```ts
column.getCanHide()
```

### Không cho ẩn cột

```ts
{
  accessorKey: 'id',
  enableHiding: false,
}
```

Thường không nên cho ẩn các cột:

- Checkbox selection
- Actions
- ID quan trọng

---

## Resize Column

Dùng để kéo giãn độ rộng cột.

### Bật resize

```vue
<DataTable
  :data="users"
  :columns="columns"
  :advanced="{
    columnResizing: true,
    columnResizeMode: 'onEnd'
  }"
/>
```

### Set kích thước cột

```ts
{
  accessorKey: 'email',
  header: renderHeader('Email'),
  size: 280,
  minSize: 200,
  maxSize: 420,
}
```

### Không cho resize một cột

```ts
{
  id: 'actions',
  enableResizing: false,
}
```

### Khuyến nghị

- Dùng `columnResizeMode: 'onEnd'` cho table nhiều row/cell để ít lag.
- Dùng `onChange` chỉ khi cần resize realtime và table nhỏ.

---

## Sticky Header

Dùng để cố định header khi scroll bảng.

```vue
<DataTable
  :data="users"
  :columns="columns"
  :layout="{
    stickyHeader: true,
    height: '460px'
  }"
/>
```

### Lưu ý

- `stickyHeader` nên dùng kèm `height` hoặc `maxHeight`.
- Scroll phải nằm trong table container thì sticky mới hoạt động đúng.

---

## Server-side Mode

Dùng khi API xử lý:

- Pagination
- Sorting
- Filtering
- Search

Ví dụ:

```vue
<DataTable
  :data="users"
  :columns="columns"
  row-key="id"
  :manual-mode="true"
  :pagination="{
    manual: true,
    pageSize: query.pageSize,
    total: totalUsers
  }"
  :sorting="{ manual: true }"
  :filtering="{ manual: true }"
  @sorting-change="setSorting"
  @filter-change="setFilters"
  @pagination-change="setPagination"
/>
```

Khi dùng server-side mode, page cần tự quản lý:

- Query params gửi lên API
- Data trả về từ API
- Tổng record
- Loading state
- Error state
- Mapping pagination/sorting/filtering sang request API

### Ví dụ query state

```ts
const users = ref<User[]>([])
const totalUsers = ref(0)
const loading = ref(false)

const query = reactive({
  page: 1,
  pageSize: 20,
  search: '',
  sortBy: '',
  sortDirection: '',
})
```

### Ví dụ gọi API

```ts
const fetchUsers = async () => {
  loading.value = true

  try {
    const response = await axios.get('/api/users', {
      params: query,
    })

    users.value = response.data.data
    totalUsers.value = response.data.total
  } finally {
    loading.value = false
  }
}
```

### Bắt sự kiện pagination

```ts
const setPagination = (pagination: PaginationState) => {
  query.page = pagination.pageIndex + 1
  query.pageSize = pagination.pageSize
  fetchUsers()
}
```

### Bắt sự kiện sorting

```ts
const setSorting = (sorting: SortingState) => {
  const firstSort = sorting[0]

  query.sortBy = firstSort?.id ?? ''
  query.sortDirection = firstSort?.desc ? 'desc' : 'asc'

  fetchUsers()
}
```

### Bắt sự kiện filter

```ts
const setFilters = (filters: ColumnFiltersState | string) => {
  console.log('Filters:', filters)
  fetchUsers()
}
```

---

## Mẫu page đầy đủ

Ví dụ một page quản lý user có:

- Gọi API
- Loading
- Pagination server-side
- Sorting server-side
- Selection
- Row actions
- Bulk actions
- Toolbar
- Column visibility
- Sticky header
- Pin action column
- Resize column

```vue
<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import type {
  ColumnDef,
  HeaderContext,
  PaginationState,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/vue-table'
import { Edit, Trash2, Eye } from 'lucide-vue-next'
import {
  DataTable,
  DataTableToolbar,
  DataTablePagination,
  DataTableColumnHeader,
  DataTableColumnVisibility,
  DataTableRowActions,
  DataTableBulkActions,
  type ActionItem,
} from '@/components/tables'
import axios from 'axios'

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
}

const users = ref<User[]>([])
const totalUsers = ref(0)
const loading = ref(false)

const query = reactive({
  page: 1,
  pageSize: 20,
  search: '',
  sortBy: '',
  sortDirection: '',
})

const renderHeader =
  (title: string) =>
  ({ column }: HeaderContext<User, unknown>) =>
    h(DataTableColumnHeader, { column, title })

const fetchUsers = async () => {
  loading.value = true

  try {
    const response = await axios.get('/api/users', {
      params: query,
    })

    users.value = response.data.data
    totalUsers.value = response.data.total
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  console.log('Mở modal thêm user')
}

const openDetailModal = (user: User) => {
  console.log('Xem chi tiết user:', user)
}

const openEditModal = (user: User) => {
  console.log('Sửa user:', user)
}

const deleteUser = async (id: string) => {
  await axios.delete(`/api/users/${id}`)
  await fetchUsers()
}

const deleteUsers = async (ids: string[]) => {
  await axios.post('/api/users/bulk-delete', { ids })
  await fetchUsers()
}

const exportData = () => {
  console.log('Export data')
}

const rowActions: ActionItem<User>[] = [
  {
    label: 'Xem chi tiết',
    icon: Eye,
    onClick: (row) => openDetailModal(row),
  },
  {
    label: 'Sửa',
    icon: Edit,
    onClick: (row) => openEditModal(row),
  },
  {
    label: 'Xóa',
    icon: Trash2,
    danger: true,
    disabled: (row) => row.role === 'admin',
    onClick: (row) => deleteUser(row.id),
  },
]

const bulkActions: ActionItem<User[]>[] = [
  {
    label: 'Xóa đã chọn',
    icon: Trash2,
    danger: true,
    onClick: (rows) => {
      deleteUsers(rows.map((row) => row.id))
    },
  },
]

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: renderHeader('Tên'),
    size: 220,
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
    meta: {
      cellClass: 'font-medium',
    },
  },
  {
    accessorKey: 'email',
    header: renderHeader('Email'),
    size: 280,
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'role',
    header: renderHeader('Vai trò'),
    size: 160,
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
  },
  {
    accessorKey: 'status',
    header: renderHeader('Trạng thái'),
    size: 160,
    enableSorting: true,
    enableHiding: true,
    enableResizing: true,
  },
  {
    id: 'actions',
    size: 70,
    enableHiding: false,
    enableSorting: false,
    enableResizing: false,
    meta: {
      pin: 'right',
      cellClass: 'text-right',
    },
    cell: ({ row }) =>
      h(DataTableRowActions, {
        row,
        actions: rowActions,
      }),
  },
]

const setPagination = (pagination: PaginationState) => {
  query.page = pagination.pageIndex + 1
  query.pageSize = pagination.pageSize
  fetchUsers()
}

const setSorting = (sorting: SortingState) => {
  const firstSort = sorting[0]

  query.sortBy = firstSort?.id ?? ''
  query.sortDirection = firstSort?.desc ? 'desc' : 'asc'

  fetchUsers()
}

const setFilters = (filters: ColumnFiltersState | string) => {
  console.log('Filters:', filters)
  fetchUsers()
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <DataTable
    :data="users"
    :columns="columns"
    row-key="id"
    :loading="loading"
    :manual-mode="true"
    :selection="{
      enabled: true,
      mode: 'multiple'
    }"
    :pagination="{
      manual: true,
      pageSize: query.pageSize,
      total: totalUsers,
      pageSizeOptions: [10, 20, 50, 100]
    }"
    :sorting="{ manual: true }"
    :filtering="{ manual: true }"
    :layout="{
      bordered: true,
      stickyHeader: true,
      height: '520px',
      responsive: true,
      density: 'default'
    }"
    :advanced="{
      columnPinning: true,
      columnResizing: true,
      columnResizeMode: 'onEnd'
    }"
    @pagination-change="setPagination"
    @sorting-change="setSorting"
    @filter-change="setFilters"
  >
    <template #toolbar="{ table }">
      <DataTableToolbar
        :table="table"
        :options="{
          search: true,
          refresh: true,
          export: true,
          createButton: 'Thêm người dùng'
        }"
        @refresh="fetchUsers"
        @export="exportData"
        @create="openCreateModal"
      >
        <template #actions>
          <DataTableBulkActions
            :table="table"
            :actions="bulkActions"
          />
        </template>

        <template #view-options>
          <DataTableColumnVisibility :table="table" />
        </template>
      </DataTableToolbar>
    </template>

    <template #pagination="{ table }">
      <DataTablePagination :table="table" />
    </template>
  </DataTable>
</template>
```

---

## Checklist khi tạo table mới

Khi tạo một table mới, nên làm theo thứ tự sau:

1. Tạo type/interface cho record.

```ts
interface User {
  id: string
  name: string
  email: string
}
```

2. Tạo biến data.

```ts
const users = ref<User[]>([])
```

3. Tạo `columns`.

```ts
const columns: ColumnDef<User>[] = []
```

4. Dùng `DataTableColumnHeader` cho header nếu cần sort/hide/pin.

```ts
const renderHeader =
  (title: string) =>
  ({ column }: HeaderContext<User, unknown>) =>
    h(DataTableColumnHeader, { column, title })
```

5. Truyền `data` và `columns` vào `DataTable`.

```vue
<DataTable
  :data="users"
  :columns="columns"
/>
```

6. Truyền `row-key`.

```vue
row-key="id"
```

7. Bật selection nếu cần chọn row.

```vue
:selection="{ enabled: true }"
```

8. Bật layout để bảng đẹp và dễ dùng hơn.

```vue
:layout="{
  bordered: true,
  stickyHeader: true,
  height: '460px',
  responsive: true
}"
```

9. Bật pagination nếu cần phân trang.

```vue
:pagination="{
  pageSize: 20,
  pageSizeOptions: [10, 20, 50]
}"
```

10. Bật advanced nếu cần pin/resize column.

```vue
:advanced="{
  columnPinning: true,
  columnResizing: true,
  columnResizeMode: 'onEnd'
}"
```

11. Thêm toolbar slot nếu cần search/filter/actions/view options.

```vue
<template #toolbar="{ table }">
  <DataTableToolbar :table="table" />
</template>
```

12. Thêm pagination slot nếu cần phân trang.

```vue
<template #pagination="{ table }">
  <DataTablePagination :table="table" />
</template>
```

13. Nếu có row actions, thêm column custom `actions`.

14. Nếu có bulk actions, nhớ bật:

```vue
:selection="{ enabled: true }"
```

15. Chạy type check.

```bash
bunx vue-tsc --noEmit --project tsconfig.app.json --pretty false
```

---

## Lưu ý hiện tại

Một số options đã được khai báo trong type nhưng chưa có UI hoặc logic đầy đủ.

Các option đang để sẵn cho roadmap:

- `error`
- `disabled`
- `striped`
- `stickyFooter`
- `rounded`
- `columnOrdering`
- `rowExpansion`
- `grouping`
- `virtualization`
- `urlSync`
- `statePersistence`

Hiện tại nên ưu tiên dùng các phần đã ổn định:

- `DataTable`
- `DataTableToolbar`
- `DataTablePagination`
- `DataTableColumnHeader`
- `DataTableColumnVisibility`
- `DataTableFacetedFilter`
- `DataTableRowActions`
- `DataTableBulkActions`
- `selection`
- `sorting`
- `filtering`
- `pagination`
- `layout.bordered`
- `layout.stickyHeader`
- `layout.height`
- `layout.responsive`
- `advanced.columnPinning`
- `advanced.columnResizing`

---

## Gợi ý cách học nhanh

Nên học theo thứ tự sau:

1. Mở file demo:

```txt
src/modules/users/pages/UsersPage.vue
```

2. Xem interface của record, ví dụ `User`.

3. Xem cách khai báo `columns`.

4. Xem cách truyền props vào `DataTable`.

5. Xem cách dùng slot `toolbar`.

6. Xem cách dùng slot `pagination`.

7. Xem cách khai báo `rowActions`.

8. Xem cách khai báo `bulkActions`.

9. Tạo một page mới thật đơn giản.

10. Sau khi chạy ổn mới thêm dần:

- Search
- Filter
- Selection
- Row actions
- Bulk actions
- Server-side mode

---

## Thứ tự triển khai khuyến nghị

Không nên làm full tất cả chức năng ngay từ đầu.

Nên đi theo từng cấp độ:

### Cấp 1: Hiển thị data cơ bản

```vue
<DataTable
  :data="users"
  :columns="columns"
  row-key="id"
/>
```

### Cấp 2: Thêm layout

```vue
<DataTable
  :data="users"
  :columns="columns"
  row-key="id"
  :layout="{
    bordered: true,
    responsive: true
  }"
/>
```

### Cấp 3: Thêm pagination

```vue
<DataTable
  :data="users"
  :columns="columns"
  row-key="id"
  :pagination="{
    pageSize: 20,
    pageSizeOptions: [10, 20, 50]
  }"
>
  <template #pagination="{ table }">
    <DataTablePagination :table="table" />
  </template>
</DataTable>
```

### Cấp 4: Thêm toolbar

```vue
<DataTable
  :data="users"
  :columns="columns"
  row-key="id"
>
  <template #toolbar="{ table }">
    <DataTableToolbar
      :table="table"
      :options="{
        search: true,
        refresh: true,
        createButton: 'Thêm mới'
      }"
    />
  </template>
</DataTable>
```

### Cấp 5: Thêm selection

```vue
<DataTable
  :data="users"
  :columns="columns"
  row-key="id"
  :selection="{ enabled: true }"
/>
```

### Cấp 6: Thêm row actions

```ts
const rowActions: ActionItem<User>[] = [
  {
    label: 'Sửa',
    icon: Edit,
    onClick: (row) => openEditModal(row),
  },
  {
    label: 'Xóa',
    icon: Trash2,
    danger: true,
    onClick: (row) => deleteUser(row.id),
  },
]
```

```ts
{
  id: 'actions',
  enableHiding: false,
  enableSorting: false,
  enableResizing: false,
  meta: {
    pin: 'right',
    cellClass: 'text-right',
  },
  cell: ({ row }) =>
    h(DataTableRowActions, {
      row,
      actions: rowActions,
    }),
}
```

### Cấp 7: Thêm bulk actions

```vue
<DataTable
  :data="users"
  :columns="columns"
  row-key="id"
  :selection="{ enabled: true }"
>
  <template #toolbar="{ table }">
    <DataTableToolbar :table="table">
      <template #actions>
        <DataTableBulkActions
          :table="table"
          :actions="bulkActions"
        />
      </template>
    </DataTableToolbar>
  </template>
</DataTable>
```

### Cấp 8: Thêm server-side mode

```vue
<DataTable
  :data="users"
  :columns="columns"
  row-key="id"
  :manual-mode="true"
  :pagination="{
    manual: true,
    pageSize: query.pageSize,
    total: totalUsers
  }"
  :sorting="{ manual: true }"
  :filtering="{ manual: true }"
  @pagination-change="setPagination"
  @sorting-change="setSorting"
  @filter-change="setFilters"
/>
```

---

## Mẫu tối giản nhất

Dùng mẫu này để test trước khi thêm các chức năng nâng cao.

```vue
<script setup lang="ts">
import { h, ref } from 'vue'
import type { ColumnDef, HeaderContext } from '@tanstack/vue-table'
import {
  DataTable,
  DataTableColumnHeader,
} from '@/components/tables'

interface User {
  id: string
  name: string
  email: string
}

const users = ref<User[]>([
  {
    id: '1',
    name: 'Nguyễn Văn A',
    email: 'a@example.com',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    email: 'b@example.com',
  },
])

const renderHeader =
  (title: string) =>
  ({ column }: HeaderContext<User, unknown>) =>
    h(DataTableColumnHeader, { column, title })

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: renderHeader('Tên'),
  },
  {
    accessorKey: 'email',
    header: renderHeader('Email'),
  },
]
</script>

<template>
  <DataTable
    :data="users"
    :columns="columns"
    row-key="id"
    :layout="{
      bordered: true,
      responsive: true
    }"
  />
</template>
```
