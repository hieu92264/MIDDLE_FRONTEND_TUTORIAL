import type { Component } from 'vue'
import {
  LayoutDashboard,
  Users,
  Settings,
  ClipboardList,
  CalendarRange,
  Star,
  Link,
  Keyboard,
  ShieldCheck,
  Activity,
  FileBarChart2,
  ListChecks,
  UserCog,
} from 'lucide-vue-next'

export interface SidebarItem {
  key: string
  title: string
  path?: string
  icon?: Component
  children?: SidebarItem[]
  badge?: string | number
  affix?: boolean
}

export interface SidebarGroup {
  groupKey: string
  groupLabel?: string
  items: SidebarItem[]
}

export const sidebarData: SidebarGroup[] = [
  {
    groupKey: 'main',
    groupLabel: 'Menu chính',
    items: [
      {
        key: 'dashboard',
        title: 'Màn hình chính',
        path: '/',
        icon: LayoutDashboard,
        affix: true,
      },
    ],
  },
  {
    groupKey: 'assessment-catalog',
    groupLabel: 'Danh mục',
    items: [
      {
        key: 'criteria',
        title: 'Danh mục đánh giá',
        icon: ClipboardList,
        children: [
          {
            key: 'criteria-department',
            title: 'Phòng ban',
            path: '/criteria/departments',
          },
          {
            key: 'criteria-items',
            title: 'Tiêu chí đánh giá',
            path: '/criteria/items',
          },
        ],
      },
      {
        key: 'personnel',
        title: 'Nhân sự đánh giá',
        icon: Users,
        children: [
          {
            key: 'personnel-employee',
            title: 'Danh sách nhân viên',
            path: '/personnel/employees',
          },
          {
            key: 'personnel-manager',
            title: 'Quản lý đánh giá',
            path: '/personnel/managers',
          },
        ],
      },
    ],
  },
  {
    groupKey: 'assessment-config',
    groupLabel: 'Cấu hình kỳ đánh giá',
    items: [
      {
        key: 'periods',
        title: 'Kỳ đánh giá',
        path: '/periods',
        icon: CalendarRange,
      },
      {
        key: 'period-create',
        title: 'Tạo cấu hình đánh giá',
        path: '/periods/create',
        icon: ListChecks,
      },
    ],
  },
  {
    groupKey: 'assessment-scoring',
    groupLabel: 'Đánh giá',
    items: [
      {
        key: 'scoring',
        title: 'Trang đánh giá',
        icon: Star,
        children: [
          {
            key: 'scoring-manager',
            title: 'Góc nhìn quản lý',
            path: '/scoring/manager',
          },
          {
            key: 'scoring-employee',
            title: 'Góc nhìn nhân viên',
            path: '/scoring/employee',
          },
        ],
      },
      {
        key: 'results',
        title: 'Kết quả đánh giá',
        path: '/results',
        icon: FileBarChart2,
      },
    ],
  },
  {
    groupKey: 'system-links',
    groupLabel: 'Liên kết hệ thống',
    items: [
      {
        key: 'system-link',
        title: 'Hệ thống i-MES',
        path: '/system-link',
        icon: Link,
      },
    ],
  },
  {
    groupKey: 'admin',
    groupLabel: 'Quản trị',
    items: [
      {
        key: 'users',
        title: 'Quản lý người dùng',
        path: '/users',
        icon: Users,
      },
      {
        key: 'monitor',
        title: 'Giám sát hệ thống',
        path: '/monitor',
        icon: Activity,
      },
    ],
  },
  {
    groupKey: 'customize',
    groupLabel: 'Tùy chỉnh',
    items: [
      {
        key: 'shortcuts',
        title: 'Phím tắt',
        path: '/shortcuts',
        icon: Keyboard,
      },
      {
        key: 'settings',
        title: 'Cài đặt',
        path: '/settings',
        icon: Settings,
      },
    ],
  },
]
