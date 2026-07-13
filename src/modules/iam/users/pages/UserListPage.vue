<script setup lang="ts">
import { h, ref } from 'vue'
import type { Component } from 'vue'
import type { CellContext, ColumnDef, FilterFn, HeaderContext } from '@tanstack/vue-table'
import { CheckCircle, Copy, Edit, ShieldAlert, Trash2 } from 'lucide-vue-next'

import {
  DataTable,
  DataTableBulkActions,
  DataTableColumnHeader,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableRowActions,
  DataTableToolbar,
  type ActionItem,
  type DataTableProps,
} from '@/components/tables'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'editor'
  status: 'active' | 'inactive' | 'banned'
  team: string
  location: string
  lastActive: string
  createdAt: string
}

const roles: User['role'][] = ['admin', 'user', 'editor']
const statuses: User['status'][] = ['active', 'inactive', 'banned']
const teams = ['Platform', 'Design', 'Sales', 'Support', 'Finance']
const locations = ['Ho Chi Minh City', 'Ha Noi', 'Da Nang', 'Singapore', 'Remote']
const DataTableColumnHeaderComponent = DataTableColumnHeader as Component
const DataTableRowActionsComponent = DataTableRowActions as Component

const toDateString = (daysAgo: number) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)

  return date.toISOString().slice(0, 10)
}

const mockUsers: User[] = Array.from({ length: 120 }, (_, index) => ({
  id: `USR-${String(1000 + index)}`,
  name: `User Name ${index + 1}`,
  email: `user${index + 1}@example.com`,
  role: roles[index % roles.length] ?? 'user',
  status: statuses[index % statuses.length] ?? 'inactive',
  team: teams[index % teams.length] ?? 'Platform',
  location: locations[index % locations.length] ?? 'Remote',
  lastActive: toDateString(index % 45),
  createdAt: toDateString(120 + index),
}))

const data = ref<User[]>(mockUsers)

const roleOptions = [
  { label: 'Admin', value: 'admin', icon: ShieldAlert },
  { label: 'User', value: 'user' },
  { label: 'Editor', value: 'editor' },
]

const statusOptions = [
  { label: 'Active', value: 'active', icon: CheckCircle },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Banned', value: 'banned', icon: ShieldAlert },
]

const arrayIncludesFilter: FilterFn<User> = (row, id, value) => {
  return Array.isArray(value) && value.includes(String(row.getValue(id)))
}

const renderHeader =
  (title: string) =>
  ({ column }: HeaderContext<User, unknown>) =>
    h(DataTableColumnHeaderComponent, { column, title })

const renderBadge = (label: string, className: string) =>
  h(
    'span',
    {
      class: `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`,
    },
    label,
  )

const roleBadgeClass: Record<User['role'], string> = {
  admin: 'border-destructive/30 bg-destructive text-destructive-foreground',
  editor: 'border-primary/30 bg-primary text-primary-foreground',
  user: 'border-border bg-secondary text-secondary-foreground',
}

const statusBadgeClass: Record<User['status'], string> = {
  active: 'border-primary/30 bg-primary text-primary-foreground',
  inactive: 'border-border bg-secondary text-secondary-foreground',
  banned: 'border-destructive/30 bg-destructive text-destructive-foreground',
}

const createRowActions = (): ActionItem<User>[] => [
  {
    label: 'Edit',
    icon: Edit,
    onClick: (row) => console.log('Edit', row),
  },
  {
    label: 'Copy ID',
    icon: Copy,
    onClick: (row) => void navigator.clipboard?.writeText(row.id),
  },
  {
    label: 'Delete',
    icon: Trash2,
    danger: true,
    onClick: (row) => {
      if (confirm(`Delete ${row.name}?`)) {
        data.value = data.value.filter((user) => user.id !== row.id)
      }
    },
  },
]

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: renderHeader('ID'),
    size: 120,
    minSize: 90,
    maxSize: 180,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: renderHeader('Name'),
    size: 220,
    minSize: 160,
    maxSize: 320,
    meta: {
      cellClass: 'font-medium',
    },
  },
  {
    accessorKey: 'email',
    header: renderHeader('Email'),
    size: 280,
    minSize: 200,
    maxSize: 420,
  },
  {
    accessorKey: 'role',
    header: renderHeader('Role'),
    size: 140,
    cell: ({ row }: CellContext<User, unknown>) => {
      const role = row.getValue<User['role']>('role')

      return renderBadge(role.toUpperCase(), roleBadgeClass[role])
    },
    filterFn: arrayIncludesFilter,
  },
  {
    accessorKey: 'status',
    header: renderHeader('Status'),
    size: 150,
    cell: ({ row }: CellContext<User, unknown>) => {
      const status = row.getValue<User['status']>('status')

      return renderBadge(status.toUpperCase(), statusBadgeClass[status])
    },
    filterFn: arrayIncludesFilter,
  },
  {
    accessorKey: 'team',
    header: renderHeader('Team'),
    size: 170,
  },
  {
    accessorKey: 'location',
    header: renderHeader('Location'),
    size: 210,
  },
  {
    accessorKey: 'lastActive',
    header: renderHeader('Last Active'),
    size: 160,
  },
  {
    accessorKey: 'createdAt',
    header: renderHeader('Joined Date'),
    size: 160,
  },
  {
    id: 'actions',
    size: 70,
    enableHiding: false,
    enableSorting: false,
    enableResizing: false,
    meta: {
      pin: 'right',
      headerClass: 'text-right',
      cellClass: 'text-right',
    },
    cell: ({ row }: CellContext<User, unknown>) =>
      h(DataTableRowActionsComponent, {
        row,
        actions: createRowActions(),
      }),
  },
]

const bulkActions: ActionItem<User[]>[] = [
  {
    label: 'Delete Selected',
    icon: Trash2,
    danger: true,
    onClick: (rows) => {
      if (confirm(`Delete ${rows.length} users?`)) {
        const ids = rows.map((row) => row.id)
        data.value = data.value.filter((user) => !ids.includes(user.id))
      }
    },
  },
]

const tableOptions = {
  rowKey: 'id',
  selection: {
    enabled: true,
    mode: 'multiple',
  },
  filtering: {
    columnFilters: true, // ✔ Bật hàng filter trong từng cột
  },
  layout: {
    bordered: true,
    density: 'default',
    height: '460px',
    stickyHeader: true,
    responsive: true,
  },
  pagination: {
    pageSize: 20,
    pageSizeOptions: [10, 20, 30, 50],
  },
  advanced: {
    columnPinning: true,
    columnResizing: true,
    columnResizeMode: 'onEnd',
  },
} satisfies Omit<DataTableProps<User, unknown>, 'data' | 'columns'>
</script>

<template>
  <div class="flex h-full flex-1 flex-col space-y-6 p-8">
    <div class="flex items-center justify-between space-y-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Quản lý người dùng</h2>
        <p class="text-muted-foreground">
          Danh sách 120 người dùng theo vai trò, nhóm, địa điểm và trạng thái tài khoản.
        </p>
      </div>
    </div>

    <DataTable :data="data" :columns="columns" v-bind="tableOptions">
      <template #toolbar="{ table, resetColumnSizes }">
        <DataTableToolbar
          :table="table"
          :reset-column-sizes="resetColumnSizes"
          :options="{
            search: true,
            refresh: true,
            export: true,
            columnVisibility: true,
            resetColumns: true,
            createButton: 'Thêm người dùng',
          }"
          @refresh="console.log('Refresh')"
          @create="console.log('Create new user')"
          @export="console.log('Export data')"
        >
          <template #filters>
            <DataTableFacetedFilter
              v-if="table.getColumn('role')"
              :column="table.getColumn('role')"
              title="Vai trò"
              :options="roleOptions"
            />
            <DataTableFacetedFilter
              v-if="table.getColumn('status')"
              :column="table.getColumn('status')"
              title="Trạng thái"
              :options="statusOptions"
            />
          </template>
          <template #actions>
            <DataTableBulkActions :table="table" :actions="bulkActions" />
          </template>
        </DataTableToolbar>
      </template>

      <template #pagination="{ table }">
        <DataTablePagination
          :table="table"
          :page-size-options="tableOptions.pagination.pageSizeOptions"
        />
      </template>
    </DataTable>
  </div>
</template>
