# vue-template

Frontend template dùng Vue 3, Vite, TypeScript, Pinia, Vue Router, TanStack Vue Query,
Tailwind CSS v4 và bộ UI theo phong cách shadcn-vue/Reka UI.

Tài liệu này dành cho thành viên mới join project để có thể chạy app, hiểu cấu trúc repo
và nắm các quy ước chính trước khi bắt đầu code.

## Yêu cầu môi trường

- Node.js: `^20.19.0` hoặc `>=22.12.0`
- Bun: dùng để cài package và chạy script
- IDE khuyến nghị: VS Code + extension `Vue (Official)`

Kiểm tra nhanh:

```sh
node -v
bun -v
```

## Cài đặt và chạy project

1. Cài dependencies:

```sh
bun install
```

2. Đảm bảo có file `.env` ở root project:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

3. Chạy môi trường development:

```sh
bun dev
```

Vite sẽ in ra URL local, thường là `http://localhost:5173`.

Nếu backend chưa chạy, màn login có nút `Quick Login (Demo Mode)` để vào giao diện demo
mà không cần gọi API thật.

## Scripts thường dùng

| Lệnh | Mục đích |
| --- | --- |
| `bun dev` | Chạy Vite dev server |
| `bun run make:module <name>` | Tạo cấu trúc thư mục cơ bản cho module mới |
| `bun run build` | Type-check và build production |
| `bun run build-only` | Chỉ build bằng Vite |
| `bun run type-check` | Kiểm tra TypeScript bằng `vue-tsc` |
| `bun lint` | Chạy oxlint và ESLint, có auto-fix |
| `bun run format` | Format code trong `src/` bằng Prettier |
| `bun run preview` | Preview bản build |

Trước khi tạo PR, nên chạy:

```sh
bun lint
bun run build
```

## Cấu trúc thư mục

```txt
src/
  App.vue                 # Chọn layout theo route meta, hiển thị loading bar và toaster
  main.ts                 # Khởi tạo Vue app, Pinia, router, Axios interceptors, Vue Query
  style.css               # Tailwind v4, theme tokens, dark mode
  assets/                 # CSS/assets dùng chung
  components/
    common/               # Component dùng chung nhưng không thuộc design system
    layouts/              # BaseLayout, BlankLayout và partials
    ui/                   # Component UI theo shadcn-vue/Reka UI
  configs/                # Cấu hình Axios, Vue Query
  constants/              # Constant dùng chung
  lib/                    # Utility chung, ví dụ cn/class merge
  modules/
    auth/                 # Page, form, schema, query, store, type cho auth
    dashboard/            # Module dashboard
  pages/errors/           # Các trang lỗi dùng chung
  router/                 # Route theo nhóm chức năng
  services/               # Service gọi API
  stores/                 # Pinia store global
  types/                  # Type dùng chung và global declaration
```

Alias `@` trỏ tới `src`, nên ưu tiên import dạng:

```ts
import { httpService } from '@/services/http.service'
```

## Luồng khởi động app

File `src/main.ts` là entry point:

- Tạo Vue app từ `App.vue`
- Tạo Pinia và bật `pinia-plugin-persistedstate`
- Cài Axios interceptors bằng `setupAxiosInterceptors(pinia)`
- Cài Vue Router
- Cài TanStack Vue Query bằng `setupVueQuery(app)`
- Mount app vào `#app`

`App.vue` đọc `route.meta.layout` để chọn layout:

- `layout: 'base'`: dùng layout chính có sidebar/header
- `layout: 'blank'`: dùng layout trống cho login/register/error page

## Routing và auth guard

Routes được tách theo file trong `src/router/`:

- `auth.route.ts`: login/register
- `dashboard.route.ts`: dashboard
- `error.route.ts`: trang lỗi và 404
- `index.ts`: gom routes và khai báo guard

Guard trong `src/router/index.ts` đang dùng các meta sau:

| Meta | Ý nghĩa |
| --- | --- |
| `guestOnly: true` | Chỉ cho user chưa đăng nhập vào, ví dụ login/register |
| `bypassAuth: true` | Bỏ qua kiểm tra đăng nhập, ví dụ error page |
| `layout: 'base' \| 'blank'` | Chọn layout render page |

Quy tắc hiện tại:

- Đã đăng nhập mà vào route `guestOnly` thì redirect về `dashboard`
- Chưa đăng nhập mà vào route private thì redirect về `login`
- Route có `bypassAuth` không cần đăng nhập
- Mỗi lần chuyển trang sẽ bật `appStore.startPageLoading()` và tắt sau `afterEach`

Khi thêm page mới, tạo route theo mẫu:

```ts
{
  path: '/users',
  name: 'users',
  component: () => import('@/modules/users/pages/UserListPage.vue'),
  meta: {
    layout: 'base',
  },
}
```

## Gọi API

API client nằm ở:

- `src/configs/axios.config.ts`
- `src/services/http.service.ts`

`apiClient` dùng `VITE_API_BASE_URL` làm `baseURL`, timeout `15s` và tự set header:

- `Accept: application/json`
- `X-Locale` theo `appStore.lang`
- `Authorization: Bearer <accessToken>` nếu đã đăng nhập
- `Content-Type: application/json` khi request có body

Khi API trả `401`, interceptor sẽ gọi `/auth/refresh`, cập nhật session nếu refresh thành công,
sau đó retry request ban đầu. Nếu refresh thất bại, session sẽ bị clear.

Nên tạo service riêng cho từng domain/module:

```ts
import { httpService } from '@/services/http.service'

export const USER_URL = {
  LIST: '/users',
}

export class UserService {
  static async list() {
    return httpService.get<User[]>(USER_URL.LIST)
  }
}
```

`httpService.get/post/put/patch/delete` mặc định unwrap `response.data.metadata`.
Nếu cần toàn bộ response gồm `message`, `status_code`, `path`, dùng các hàm
`getApiResponse/postApiResponse/...`.

## Server state với Vue Query

Vue Query được cấu hình tại `src/configs/vue-query.config.ts`:

- `staleTime`: 1 phút
- `gcTime`: 5 phút
- `retry`: 1 lần
- `refetchOnWindowFocus`: `false`

Quy ước:

- Query/mutation của module đặt trong `src/modules/<module>/queries/`
- Query key dùng constant trong `src/constants/query-keys.ts` nếu key được dùng lại
- Gọi API thông qua service, không gọi `apiClient` trực tiếp trong component

Ví dụ mutation hiện có:

```ts
export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (values: LoginSchema) => AuthService.login(values),
  })
}
```

## State management với Pinia

Store global nằm trong `src/stores/`, store theo module nằm trong module tương ứng.

Hiện có:

- `useAppStore`: ngôn ngữ hiện tại và loading khi chuyển trang
- `useAuthStore`: access token và user, có `persist: true`
- `useSidebarStore`, `useNotificationStore`: state UI dùng chung

Quy ước:

- State đăng nhập dùng `useAuthStore`
- State gọi API nên để Vue Query quản lý, không đưa toàn bộ server response vào Pinia
- Pinia phù hợp cho state UI, session, filter/global setting cần chia sẻ nhiều nơi

## Form và validation

Form auth hiện dùng:

- `vee-validate`
- `zod`
- `@vee-validate/zod`

Schema đặt trong `src/modules/<module>/schemas/`.
Type của form nên infer từ schema:

```ts
import z from 'zod'

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password is required'),
})

export type LoginSchema = z.infer<typeof loginSchema>
```

## UI và styling

- Tailwind CSS v4 được import trong `src/style.css`
- Theme token dùng CSS variables trong `:root` và `.dark`
- Component UI dùng chung đặt trong `src/components/ui/`
- Component layout đặt trong `src/components/layouts/`
- Icon đang dùng `lucide-vue-next`
- Toast dùng `vue-sonner`

Khi thêm component:

- Component dùng riêng cho một module đặt trong `src/modules/<module>/components/`
- Component dùng lại toàn app đặt trong `src/components/common/`
- Component design system/base UI đặt trong `src/components/ui/`

## Quy ước code

- Dùng TypeScript trong `<script setup lang="ts">`
- Ưu tiên import bằng alias `@/...`
- Tên component Vue dùng `PascalCase.vue`
- Store đặt tên dạng `*.store.ts`
- Route đặt tên dạng `*.route.ts`
- Service đặt tên dạng `*.service.ts`
- Schema đặt tên dạng `*.schema.ts`
- Không gọi API trực tiếp trong page/component nếu có thể đưa qua service và query
- Không lưu secret thật vào `.env` trong repo

Prettier hiện cấu hình:

- Không dùng semicolon
- Dùng single quote
- `printWidth: 100`

## Checklist khi thêm một module mới

Tạo cấu trúc module bằng lệnh:

```sh
bun run make:module users
```

Lệnh trên sẽ tạo:

```txt
src/modules/users/
  components/
  pages/
  queries/
  schemas/
  stores/
  types/
```

Có thể chạy thử mà không tạo file bằng:

```sh
bun run make:module users --dry-run
```

Các bước thường làm:

1. Chạy `bun run make:module users`
2. Tạo page trong `src/modules/users/pages/`
3. Tạo service nếu cần gọi API
4. Tạo query/mutation trong `src/modules/users/queries/`
5. Tạo schema nếu có form
6. Tạo route file hoặc thêm route vào nhóm phù hợp trong `src/router/`
7. Chọn `meta.layout` và auth meta đúng
8. Chạy `bun lint` và `bun run build`

## Một số lỗi thường gặp

- Không gọi được API: kiểm tra `VITE_API_BASE_URL` trong `.env` và backend đã chạy chưa
- Bị redirect về login: kiểm tra `useAuthStore.accessToken` hoặc route có cần `bypassAuth` không
- Page không có layout đúng: kiểm tra `route.meta.layout`
- Import `@/...` không resolve: kiểm tra file nằm trong `src` và alias trong `vite.config.ts`
- Type của `.vue` bị lỗi trong IDE: dùng extension `Vue (Official)` và tắt Vetur nếu có
