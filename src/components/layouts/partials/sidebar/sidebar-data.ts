import type { Component } from 'vue'
import {
  LayoutDashboard,
  Users,
  Settings,
  FolderKanban,
  Building2,
  ShieldCheck,
  FileText,
  BarChart3,
} from 'lucide-vue-next'

export interface SidebarItem {
  key: string
  title: string
  path?: string
  icon?: Component
  children?: SidebarItem[]
  badge?: string | number
  affix?: boolean // pinned as tab
}

export interface SidebarGroup {
  groupKey: string
  groupLabel?: string // undefined = no label (top-level)
  items: SidebarItem[]
}

export const sidebarData: SidebarGroup[] = [
  {
    groupKey: 'main',
    items: [
      {
        key: 'dashboard',
        title: 'Dashboard',
        path: '/',
        icon: LayoutDashboard,
        affix: true,
      },
    ],
  },
  {
    groupKey: 'management',
    groupLabel: 'Management',
    items: [
      {
        key: 'users',
        title: 'Users',
        path: '/users',
        icon: Users,
      },
      {
        key: 'organizations',
        title: 'Organizations',
        path: '/organizations',
        icon: Building2,
        children: [
          {
            key: 'org-list',
            title: 'List',
            path: '/organizations',
          },
          {
            key: 'org-settings',
            title: 'Settings',
            path: '/organizations/settings',
          },
        ],
      },
    ],
  },
  {
    groupKey: 'system',
    groupLabel: 'System',
    items: [
      {
        key: 'analytics',
        title: 'Analytics',
        path: '/analytics',
        icon: BarChart3,
      },
      {
        key: 'documents',
        title: 'Documents',
        path: '/documents',
        icon: FileText,
      },
      {
        key: 'projects',
        title: 'Projects',
        path: '/projects',
        icon: FolderKanban,
      },
      {
        key: 'settings',
        title: 'Settings',
        path: '/settings',
        icon: Settings,
        children: [
          {
            key: 'settings-general',
            title: 'General',
            path: '/settings/general',
          },
          {
            key: 'settings-security',
            title: 'Security',
            path: '/settings/security',
            icon: ShieldCheck,
          },
        ],
      },
    ],
  },
]
