# 🚀 Antigravity Vue Template (Vben + Shadcn UI)

Chào mừng bạn đến với Frontend Template dành cho các dự án Vue 3! 
Template này kết hợp sự mạnh mẽ của **Vue 3, Vite, TypeScript** cùng với vẻ đẹp hiện đại của bộ UI **Shadcn-vue** và cấu trúc layout/typography lấy cảm hứng từ **Vben Admin**.

Tài liệu này là cẩm nang toàn diện dành cho người mới, hướng dẫn từ cách cài đặt, tìm hiểu cấu trúc dự án cho đến cách tạo một trang mới hoàn chỉnh từ A-Z.

---

## 📑 Mục lục

1. [Yêu cầu & Cài đặt](#1-yêu-cầu--cài-đặt)
2. [Cấu trúc thư mục](#2-cấu-trúc-thư-mục)
3. [Luồng hoạt động chính](#3-luồng-hoạt-động-chính)
4. [🛠 Hướng dẫn chi tiết: Tạo một Page mới](#4--hướng-dẫn-chi-tiết-tạo-một-page-mới)
    - [Bước 1: Tạo Page Component](#bước-1-tạo-page-component)
    - [Bước 2: Đăng ký Route & Cấu hình Meta](#bước-2-đăng-ký-route--cấu-hình-meta)
    - [Bước 3: Thêm vào Sidebar](#bước-3-thêm-vào-sidebar)
    - [Bước 4: Tab Bar & Loading State](#bước-4-tab-bar--loading-state)
5. [Gọi API & Quản lý State](#5-gọi-api--quản-lý-state)
6. [UI, Styling & Typography](#6-ui-styling--typography)
7. [Các lệnh thường dùng (Scripts)](#7-các-lệnh-thường-dùng-scripts)

---

## 1. Yêu cầu & Cài đặt

### Yêu cầu môi trường
- **Node.js**: `^20.19.0` hoặc `>=22.12.0`
- **Bun**: Dùng để quản lý package siêu tốc (`npm install -g bun`).
- **IDE**: VS Code + Extension `Vue (Official)`.

### Cài đặt và chạy dự án

1. **Cài dependencies:**
   ```sh
   bun install
   ```

2. **Cấu hình môi trường:**
   Tạo file `.env` ở thư mục gốc:
   ```env
   VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
   ```

3. **Chạy dev server:**
   ```sh
   bun dev
   ```
   *Mở trình duyệt ở `http://localhost:5174/` (hoặc port Vite hiển thị).*
   *(Mẹo: Màn login có nút "Quick Login" để vào thẳng dashboard test UI).*

---

## 2. Cấu trúc thư mục

Dự án tổ chức theo dạng **Module-based** (chia theo tính năng) thay vì chia theo loại file (pages/components riêng biệt).

```txt
src/
├── assets/           # Ảnh, font, CSS chung
├── components/       
│   ├── common/       # Component chung (không phải UI base)
│   ├── layouts/      # BaseLayout (Sidebar+Header), BlankLayout
│   └── ui/           # Các component UI cơ bản (Button, Table, Form...) - Shadcn style
├── configs/          # Cấu hình Axios, Vue Query
├── constants/        # Hằng số (Query keys, Role...)
├── lib/              # Tiện ích (utils, class merge)
├── modules/          # 📦 CÁC TÍNH NĂNG CHÍNH (auth, dashboard, users...)
├── router/           # Định tuyến ứng dụng
├── services/         # API HTTP Client chung
├── stores/           # Pinia Stores global (App, Auth, Tabs, Sidebar)
├── types/            # TypeScript interfaces/types chung
├── App.vue           # Root component (quản lý layout, transition, loading)
├── main.ts           # Điểm khởi chạy Vue
└── style.css         # CSS toàn cục, Typography, Theme Variables
```

---

## 3. Luồng hoạt động chính

- **Layouts:** `App.vue` đọc `route.meta.layout` để bọc page. 
  - `layout: 'base'` → Dùng layout có Sidebar, Header, Tab Bar.
  - `layout: 'blank'` → Trang trống (Login, 404).
- **Auth Guard:** Kiểm tra quyền trong `src/router/index.ts`. Dùng `guestOnly` (cho login), `bypassAuth` (cho trang public).
- **Tab Bar:** Tự động bắt sự kiện chuyển route và thêm vào Tab Bar. State lưu tại `tabs.store.ts` và được persist (lưu) vào localStorage.

---

## 4. 🛠 Hướng dẫn chi tiết: Tạo một Page mới

Sau đây là quy trình 4 bước chuẩn để tạo một trang hoàn toàn mới, ví dụ: trang **Reports**.

### Bước 1: Tạo Page Component

Bạn nên gom code liên quan đến một chức năng vào một thư mục trong `modules/`. 

```vue
<!-- src/modules/reports/pages/ReportsPage.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app.store'

const appStore = useAppStore()

onMounted(async () => {
  // Bật global loading (sẽ hiện spinner và progress bar)
  appStore.startPageLoading()
  try {
    // await callApi()
  } finally {
    appStore.finishPageLoading()
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Tiêu đề trang dùng typography chuẩn -->
    <div>
      <h1 class="text-page-title">Reports</h1>
      <p class="text-secondary mt-1">Báo cáo thống kê hệ thống.</p>
    </div>

    <div class="rounded-lg border bg-card p-6">
      <p class="text-body">Nội dung trang báo cáo...</p>
    </div>
  </div>
</template>
```

### Bước 2: Đăng ký Route & Cấu hình Meta

Mở `src/modules/reports/routes.ts` và khai báo route của module:

```ts
import type { RouteRecordRaw } from 'vue-router'

export const reportsRoutes: RouteRecordRaw[] = [
  {
    path: '/reports',
    name: 'reports',
    component: () => import('@/modules/reports/pages/ReportsPage.vue'),
    meta: {
      layout: 'base',    // 🔴 Bắt buộc để hiện Sidebar/Tab Bar
      title: 'Reports',  // 🔴 Tên hiển thị trên Breadcrumb & Tab Bar
      affix: false,      // (Tuỳ chọn) true = Ghim tab, không cho phép tắt
    },
  },
]
```

Sau đó import `reportsRoutes` vào `src/router/index.ts`.

### Bước 3: Thêm vào Sidebar

Mở `src/components/layouts/partials/sidebar/sidebar-data.ts`.

```ts
import { BarChart3 } from 'lucide-vue-next' // 1. Import icon từ lucide

export const sidebarData: SidebarGroup[] = [
  {
    groupKey: 'system',
    groupLabel: 'System',
    items: [
      // 2. Thêm item vào nhóm mong muốn
      {
        key: 'reports',          // ID duy nhất
        title: 'Reports',        // Label trên sidebar
        path: '/reports',        // Đường dẫn tương ứng route
        icon: BarChart3,         // Icon
        badge: 3,                // (Tuỳ chọn) Hiện chấm đỏ báo hiệu
      },
    ]
  }
]
```

*Nếu muốn làm menu cha chứa các sub-menu:*
```ts
{
  key: 'reports',
  title: 'Reports',
  icon: BarChart3,
  children: [
    { key: 'reports-sales', title: 'Sales', path: '/reports/sales' },
    { key: 'reports-ads', title: 'Ads', path: '/reports/ads' },
  ]
}
```

### Bước 4: Tab Bar & Loading State

- **Tab Bar:** Bạn **không cần** làm gì thêm! Tab bar sẽ tự động mở tab mới, tự lưu lịch sử và hỗ trợ chuột phải (Đóng tab khác, Đóng tất cả...) dựa vào Route `meta.title` và `path`.
- **Loading:** Như đã làm ở Bước 1, luôn bọc logic `callApi` bằng `appStore.startPageLoading()` và `appStore.finishPageLoading()` ở khối `finally`. Hệ thống sẽ tự hiển thị hiệu ứng Loading mượt mà.

---

## 5. Gọi API & Quản lý State

### HTTP Service (Axios)
Cấu hình tại `src/configs/axios.config.ts`. Đã tự động xử lý truyền `Authorization Bearer`, intercept refresh token (401).

Nên đặt API riêng trong từng module:
```ts
// src/modules/reports/api/report.api.ts
import { httpService } from '@/services/http.service'

export class ReportApi {
  static async getSales() {
    return httpService.get('/reports/sales') // Tự unwrap response.data.metadata
  }
}
```

### Vue Query (Server State)
Không lưu dữ liệu API vào Pinia! Hãy dùng **TanStack Vue Query** (đã cấu hình sẵn). Đặt file ở thư mục `queries/` của module.

```ts
import { useQuery } from '@tanstack/vue-query'
import { ReportApi } from '../api/report.api'

export const useSalesQuery = () => {
  return useQuery({
    queryKey: ['REPORTS_SALES'],
    queryFn: () => ReportApi.getSales(),
  })
}
```

### Pinia (Client State)
Chỉ dùng cho state cục bộ toàn app (UI state, Session, Settings).
- `useAppStore`: Quản lý loading, language.
- `useAuthStore`: Quản lý Token, User (Được lưu tự động vào LocalStorage).
- `useTabsStore`: Quản lý Tab Bar.
- `useSidebarStore`: Quản lý ẩn/hiện Sidebar.

---

## 6. UI, Styling & Typography

### CSS & Tailwind
Project dùng **Tailwind CSS v4** (`src/style.css`). Dark mode được cấu hình sẵn với hệ màu `teal/navy` (Vben style).

### Typography Classes
Hệ thống chữ được chuẩn hoá. Hãy dùng các class sau thay vì tự style font:

| Class | Ứng dụng | CSS Tương đương |
|-------|----------|------------------|
| `.text-page-title` | Tiêu đề trang chính (h1) | Cỡ lớn, in đậm, tracking hẹp |
| `.text-section` | Tiêu đề phân mục, thẻ Card | Cỡ vừa, in đậm |
| `.text-body` | Văn bản chính, đoạn văn | Cỡ 14px chuẩn, line-height dễ đọc |
| `.text-secondary` | Mô tả phụ, subtext | Nhỏ hơn, màu xám (`muted-foreground`) |
| `.text-caption` | Nhãn nhỏ, metadata | Rất nhỏ, màu xám |
| `.text-overline` | Status, tag (ACTIVE...) | Chữ in hoa nhỏ, khoảng cách chữ rộng |
| `.text-data` | Hiển thị Số liệu, ID | Căn lề số thẳng hàng (`tabular-nums`) |

### Shadcn/Reka UI
Các components tái sử dụng nằm ở `src/components/ui/` (Button, Input, Table...). 
Nên dùng chúng để đảm bảo tính đồng nhất.

Ví dụ Button:
```vue
<Button variant="default" size="sm">Lưu lại</Button>
<Button variant="outline">Huỷ</Button>
<Button variant="destructive">Xoá</Button>
```

---

## 7. Các lệnh thường dùng (Scripts)

| Lệnh | Mục đích |
| --- | --- |
| `bun dev` | Chạy dev server |
| `bun run make:module <name>` | Tự động tạo cấu trúc module mới (api, pages, queries, routes...) |
| `bun run build` | Build ứng dụng ra thư mục `dist` (đã bao gồm type-check) |
| `bun lint` | Chạy bộ linter kiểm tra lỗi code và auto-fix |
| `bun run format` | Chạy Prettier format lại toàn bộ code |

> **Lưu ý trước khi commit/PR:** Hãy luôn chạy `bun lint` và `bun run build` để đảm bảo code không có lỗi TypeScript hay ESLint.

---

🎉 **Chúc bạn code vui vẻ!** Hãy luôn tham khảo code mẫu trong các modules có sẵn như `auth` hoặc `dashboard` nếu cần thêm gợi ý.
