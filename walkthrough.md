# 📖 Hướng dẫn tạo Page mới

> Tài liệu này hướng dẫn từng bước: tạo page component → đăng ký route → thêm vào sidebar → cấu hình tab bar.

---

## Mục lục

1. [Tạo Page Component](#1-tạo-page-component)
2. [Đăng ký Route](#2-đăng-ký-route)
3. [Tuỳ chọn `meta` của Route](#3-tuỳ-chọn-meta-của-route)
4. [Thêm vào Sidebar](#4-thêm-vào-sidebar)
5. [Cấu hình Tab Bar](#5-cấu-hình-tab-bar)
6. [Global Loading khi gọi API](#6-global-loading-khi-gọi-api)
7. [Ví dụ hoàn chỉnh: Trang "Reports"](#7-ví-dụ-hoàn-chỉnh-trang-reports)

---

## 1. Tạo Page Component

### Cấu trúc thư mục

Tất cả page nằm trong `src/modules/<tên-module>/pages/`.

```
src/
└── modules/
    └── reports/               ← Tên module mới
        ├── pages/
        │   └── ReportsPage.vue   ← Page chính
        ├── components/        ← Components riêng của module (tuỳ chọn)
        ├── stores/            ← Pinia store riêng (tuỳ chọn)
        └── services/          ← API calls (tuỳ chọn)
```

### Template page chuẩn

```vue
<!-- src/modules/reports/pages/ReportsPage.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app.store'

const appStore = useAppStore()
const data = ref([])

onMounted(async () => {
  // Bật loading overlay + progress bar
  appStore.startPageLoading()
  try {
    // await fetchData()
    data.value = []
  } finally {
    appStore.finishPageLoading()
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-page-title">Reports</h1>
      <p class="text-secondary mt-1">Báo cáo thống kê hệ thống.</p>
    </div>

    <!-- Page Content -->
    <div class="rounded-lg border bg-card p-6">
      <!-- nội dung -->
    </div>
  </div>
</template>
```

> **Typography classes** có sẵn:
> | Class | Dùng cho |
> |---|---|
> | `text-page-title` | Tiêu đề trang (h1) |
> | `text-section` | Tiêu đề section |
> | `text-body` | Nội dung chính |
> | `text-secondary` | Mô tả, chú thích phụ |
> | `text-caption` | Metadata nhỏ |
> | `text-overline` | Label uppercase |
> | `text-data` | Số liệu tabular |

---

## 2. Đăng ký Route

Mở file `src/modules/reports/routes.ts` và khai báo route của module:

```ts
// src/modules/reports/routes.ts
export const reportsRoutes: RouteRecordRaw[] = [
  {
    path: '/reports',
    name: 'reports',
    component: () => import('@/modules/reports/pages/ReportsPage.vue'),
    meta: {
      layout: 'base', // LUÔN phải có — dùng layout có sidebar
      title: 'Reports', // Hiển thị trên breadcrumb và tab bar
    },
  },
]
```

Sau đó import `reportsRoutes` vào `src/router/index.ts`.

> **Lưu ý quan trọng:** `layout: 'base'` là bắt buộc để page hiển thị trong layout có sidebar, header, tab bar. Nếu bỏ qua, page sẽ dùng `BlankLayout` (trắng hoàn toàn).

---

## 3. Tuỳ chọn `meta` của Route

Bảng tất cả các `meta` field có thể dùng:

| Field        | Kiểu                | Mặc định  | Mô tả                                                      |
| ------------ | ------------------- | --------- | ---------------------------------------------------------- |
| `layout`     | `'base' \| 'blank'` | `'blank'` | **Bắt buộc.** `'base'` = có sidebar/header/tab             |
| `title`      | `string`            | tên route | Tên hiển thị trên **tab bar** và **breadcrumb**            |
| `affix`      | `boolean`           | `false`   | `true` = tab bị **pin**, không thể đóng (như Dashboard)    |
| `guestOnly`  | `boolean`           | `false`   | `true` = chỉ truy cập khi **chưa đăng nhập** (trang login) |
| `bypassAuth` | `boolean`           | `false`   | `true` = bỏ qua kiểm tra auth (trang public)               |

### Ví dụ các trường hợp:

```ts
// Tab bình thường — có thể đóng
meta: { layout: 'base', title: 'Reports' }

// Tab pinned — không đóng được (dành cho trang chủ, dashboard)
meta: { layout: 'base', title: 'Dashboard', affix: true }

// Trang login — chỉ cho guest, redirect về dashboard nếu đã login
meta: { layout: 'blank', guestOnly: true }

// Trang public (không cần đăng nhập)
meta: { layout: 'blank', bypassAuth: true }
```

---

## 4. Thêm vào Sidebar

Mở file `src/components/layouts/partials/sidebar/sidebar-data.ts`.

### Cấu trúc dữ liệu

```ts
// SidebarItem — một menu item
interface SidebarItem {
  key: string // ID duy nhất
  title: string // Tên hiển thị
  path?: string // Route path (bỏ qua nếu có children)
  icon?: Component // Icon từ lucide-vue-next
  children?: SidebarItem[] // Sub-menu items
  badge?: string | number // Badge số đỏ góc phải
  affix?: boolean // Tab sẽ bị pin khi mở
}

// SidebarGroup — nhóm menu có label
interface SidebarGroup {
  groupKey: string // ID nhóm
  groupLabel?: string // Label nhóm (bỏ qua = không hiện label)
  items: SidebarItem[] // Danh sách items trong nhóm
}
```

### Cách 1: Thêm item đơn giản vào group có sẵn

```ts
import { BarChart3 } from 'lucide-vue-next' // import icon

export const sidebarData: SidebarGroup[] = [
  {
    groupKey: 'system',
    groupLabel: 'System',
    items: [
      // ... items hiện tại ...

      // ✅ Thêm vào đây
      {
        key: 'reports',
        title: 'Reports',
        path: '/reports',
        icon: BarChart3,
      },
    ],
  },
]
```

### Cách 2: Tạo group mới

```ts
export const sidebarData: SidebarGroup[] = [
  // ... groups hiện tại ...

  // ✅ Thêm group mới ở cuối
  {
    groupKey: 'analytics',
    groupLabel: 'Analytics & Reports',
    items: [
      {
        key: 'reports',
        title: 'Reports',
        path: '/reports',
        icon: BarChart3,
      },
      {
        key: 'insights',
        title: 'Insights',
        path: '/insights',
        icon: TrendingUp,
      },
    ],
  },
]
```

### Cách 3: Thêm item có sub-menu (children)

```ts
{
  key: 'reports',
  title: 'Reports',
  icon: BarChart3,
  // Không có path khi có children
  children: [
    {
      key: 'reports-overview',
      title: 'Overview',
      path: '/reports',
    },
    {
      key: 'reports-sales',
      title: 'Sales',
      path: '/reports/sales',
    },
    {
      key: 'reports-traffic',
      title: 'Traffic',
      path: '/reports/traffic',
    },
  ],
},
```

### Cách 4: Thêm badge (số thông báo)

```ts
{
  key: 'reports',
  title: 'Reports',
  path: '/reports',
  icon: BarChart3,
  badge: 5,  // Hiện badge đỏ "5" góc phải
}
```

> **Tìm icon:** Tất cả icon dùng từ [lucide-vue-next](https://lucide.dev/icons/).
> Cách import: `import { TênIcon } from 'lucide-vue-next'`

---

## 5. Cấu hình Tab Bar

Tab Bar hoạt động **tự động** — không cần cấu hình thêm gì nếu đã làm đúng bước 2 và 3.

### Cơ chế hoạt động

```
User click menu item trong Sidebar
    ↓
SidebarBody.vue gọi tabsStore.openTab({ key, title, path, affix })
    ↓
BaseLayout.vue watch route.fullPath → gọi tabsStore.openTab() (backup)
    ↓
Tab hiện ra trong TabBar.vue với animation slide-in
```

### Các hành động người dùng có thể làm với tab

| Hành động                                | Kết quả                           |
| ---------------------------------------- | --------------------------------- |
| Click tab                                | Navigate đến trang đó             |
| Click `×`                                | Đóng tab (navigate sang tab kề)   |
| Right-click tab                          | Mở context menu                   |
| Context menu → "Close tab"               | Đóng tab hiện tại                 |
| Context menu → "Close other tabs"        | Đóng tất cả tab khác, giữ tab này |
| Context menu → "Close tabs to the left"  | Đóng các tab bên trái             |
| Context menu → "Close tabs to the right" | Đóng các tab bên phải             |
| Context menu → "Close all tabs"          | Đóng tất cả (trừ affix tabs)      |

### Làm tab không đóng được (Pin/Affix)

Có **2 cách** để pin tab:

**Cách A — Qua route `meta`** _(khuyên dùng)_:

```ts
// src/modules/dashboard/routes.ts
meta: { layout: 'base', title: 'Dashboard', affix: true }
```

**Cách B — Qua sidebar-data** _(khi muốn pin qua sidebar click)_:

```ts
// sidebar-data.ts
{
  key: 'dashboard',
  title: 'Dashboard',
  path: '/',
  icon: LayoutDashboard,
  affix: true,   // Tab sẽ có icon pin, không đóng được
}
```

### Programmatically mở tab từ code

```ts
import { useTabsStore } from '@/stores/tabs.store'
import { useRouter } from 'vue-router'

const tabsStore = useTabsStore()
const router = useRouter()

// Mở tab và navigate
const openReportsTab = () => {
  tabsStore.openTab({
    key: '/reports',
    title: 'Reports',
    path: '/reports',
    affix: false,
  })
  router.push('/reports')
}
```

### Cập nhật tiêu đề tab dynamically

```ts
// Trong component, sau khi load data
import { useTabsStore } from '@/stores/tabs.store'
import { useRoute } from 'vue-router'

const tabsStore = useTabsStore()
const route = useRoute()

// Ví dụ: tab hiển thị "User: John Doe" thay vì "Users"
tabsStore.updateTabTitle(route.fullPath, `User: ${user.name}`)
```

---

## 6. Global Loading khi gọi API

Dùng `useAppStore` để hiện/tắt loading overlay toàn trang:

```ts
import { useAppStore } from '@/stores/app.store'

const appStore = useAppStore()

// Trong async function
const fetchData = async () => {
  appStore.startPageLoading() // Hiện progress bar + loading card
  try {
    const response = await api.get('/reports')
    data.value = response.data
  } catch (err) {
    // xử lý lỗi
  } finally {
    appStore.finishPageLoading() // Tắt loading
  }
}
```

> **Lưu ý:** `startPageLoading()` kích hoạt **2 thứ cùng lúc**:
>
> 1. Progress bar nhỏ chạy ngang trên đầu header (`App.vue`)
> 2. Loading card (spinner + dots) hiện giữa màn hình

---

## 7. Ví dụ hoàn chỉnh: Trang "Reports"

### Bước 1 — Tạo file page

```
src/modules/reports/pages/ReportsPage.vue
```

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app.store'

const appStore = useAppStore()
const stats = ref({ total: 0, growth: 0 })

onMounted(async () => {
  appStore.startPageLoading()
  try {
    await new Promise((r) => setTimeout(r, 1000)) // Giả lập API
    stats.value = { total: 1240, growth: 12.5 }
  } finally {
    appStore.finishPageLoading()
  }
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-page-title">Reports</h1>
      <p class="text-secondary mt-1">Thống kê và báo cáo hệ thống.</p>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="rounded-lg border bg-card p-6">
        <p class="text-caption">Tổng báo cáo</p>
        <p class="text-data text-2xl font-bold mt-1">{{ stats.total }}</p>
      </div>
      <div class="rounded-lg border bg-card p-6">
        <p class="text-caption">Tăng trưởng</p>
        <p class="text-data text-2xl font-bold mt-1 text-emerald-500">+{{ stats.growth }}%</p>
      </div>
    </div>
  </div>
</template>
```

### Bước 2 — Đăng ký route

```ts
// src/modules/reports/routes.ts
{
  path: '/reports',
  name: 'reports',
  component: () => import('@/modules/reports/pages/ReportsPage.vue'),
  meta: {
    layout: 'base',
    title: 'Reports',
  },
},
```

### Bước 3 — Thêm vào sidebar

```ts
// src/components/layouts/partials/sidebar/sidebar-data.ts
import { BarChart3 } from 'lucide-vue-next' // thêm import

// Trong group 'system', thêm vào items:
{
  key: 'reports',
  title: 'Reports',
  path: '/reports',
  icon: BarChart3,
},
```

### Kết quả

- ✅ Sidebar hiện menu item "Reports" với icon biểu đồ
- ✅ Click → mở tab "Reports" trong tab bar với animation
- ✅ Tab lưu vào localStorage, reload trang vẫn còn
- ✅ Breadcrumb hiện "Reports" trong header
- ✅ Loading spinner hiện khi fetch data

---

## Checklist nhanh

```
☐ 1. Tạo file page tại src/modules/<module>/pages/<Name>Page.vue
☐ 2. Thêm route vào src/modules/<module>/routes.ts và import trong src/router/index.ts
       - path, name, component (lazy import)
       - meta.layout = 'base'
       - meta.title = 'Tên trang'
       - meta.affix = true (nếu muốn pin tab)
☐ 3. Thêm item vào src/components/layouts/partials/sidebar/sidebar-data.ts
       - key (ID duy nhất)
       - title (tên hiển thị)
       - path (phải trùng với route path)
       - icon (từ lucide-vue-next)
       - children (tuỳ chọn, nếu có sub-menu)
       - badge (tuỳ chọn, số thông báo)
☐ 4. Sử dụng appStore.startPageLoading() / finishPageLoading() khi call API
```
