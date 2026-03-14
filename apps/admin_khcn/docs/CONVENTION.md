# Chuẩn cấu trúc dự án – Admin KHCN (Doanh nghiệp)

Tài liệu mô tả cấu trúc thư mục, quy ước đặt tên và cách tổ chức code cho dự án admin_khcn.

---

## 1. Cấu trúc thư mục tổng quan

```
admin_khcn/
├── app/                    # Next.js App Router – chỉ routes & layout, không business logic
├── features/               # Theo domain/feature, self-contained (public API qua index)
├── components/             # UI dùng chung: layouts, ui (shadcn)
├── shared/                 # Code dùng chung nhiều feature (utils, constants, types)
├── lib/                    # Hạ tầng: HTTP client, adapter
├── config/                 # Cấu hình ứng dụng (constants, env)
├── hooks/                  # Hooks toàn cục (không gắn feature cụ thể)
├── providers/              # React context providers toàn cục
└── public/
```

---

## 2. App (`app/`)

- **Chỉ** chứa: route (page.tsx), layout (layout.tsx), loading/error nếu có.
- Mỗi page **import** component/feature từ `@/features/...` và render, không viết logic nghiệp vụ trong app.
- Ví dụ:

```tsx
// app/services/admin/organization/page.tsx
import { OrganizationClient } from "@/features/system-admin/organization";

export const metadata = { title: "Cơ cấu tổ chức | Quản trị Hệ thống" };

export default function OrganizationPage() {
  return (
    <div className="...">
      <h2>Cơ cấu tổ chức</h2>
      <OrganizationClient />
    </div>
  );
}
```

---

## 3. Features (`features/`)

Mỗi feature nằm trong một thư mục, **public API** chỉ qua file **index** (index.tsx hoặc index.ts). Cấu trúc chuẩn:

```
features/
└── system-admin/
    └── <feature-name>/          # VD: organization, menus, roles, categories, resources
        ├── index.tsx            # Public API: export component chính + type (bắt buộc)
        ├── api.ts               # Client gọi backend (dùng lib/axios hoặc fetch)
        ├── types.ts             # TypeScript types / interfaces
        ├── schemas.ts           # Zod schemas (nếu có form)
        ├── components/         # Component chỉ dùng trong feature này
        ├── context/            # (tùy chọn) React Context cho feature
        └── hooks/               # Hooks dùng trong feature
```

### Quy ước feature

| Thành phần   | Nội dung |
|-------------|----------|
| **index**   | Export 1 component “client” (trang chính) + có thể export thêm compound component (VD: Organization.Provider, .Sidebar, .Form). Export type dùng ngoài feature. |
| **api.ts**  | Các hàm gọi API (get, create, update, delete). Dùng `apiClient` từ `@/lib/axiosInstance`. |
| **types.ts**| Interface/type dùng trong feature và có thể export. |
| **schemas.ts** | Zod schema cho form (nếu có). |
| **components/** | Chỉ component nội bộ feature. Đặt tên PascalCase. |
| **context/** | Context + Provider khi state/actions cần chia sẻ giữa nhiều component trong feature. |
| **hooks/**  | useXxx: data (useXxxApi), form logic, sidebar logic… Không export hook ra ngoài feature trừ khi có lý do. |

### Đặt tên file

- Component: `PascalCase.tsx` (VD: OrganizationForm.tsx).
- Hook: `useXxx.ts` (camelCase với prefix use).
- API/types/schemas: `lowercase.ts` (api.ts, types.ts, schemas.ts).

---

## 4. Components (`components/`)

- **layouts/** – Layout dùng cho nhiều trang (ServiceLayout, sidebar, header).
- **ui/** – Thư viện UI (shadcn): Button, Card, Form, Table, Dialog…
- Component trong `components/` **không** import từ `features/` (tránh phụ thuộc ngược). Feature import từ `components/` và `lib/`.

---

## 5. Shared (`shared/`)

- **utils/** – Hàm tiện ích dùng nhiều feature (format date, string, v.v.).
- **constants/** – Hằng dùng chung (nhóm danh mục, mã trạng thái…).
- **types/** – Type/interface dùng ở nhiều feature (nếu không muốn đặt trong từng feature).

Có thể bắt đầu với ít file, mở rộng khi có nhu cầu.

---

## 6. Lib (`lib/`)

- **axiosInstance.ts** – Cấu hình axios (baseURL, interceptors, withCredentials).
- **utils.ts** – Util rất chung (cn, format…) có thể để đây hoặc dần chuyển sang shared/utils.

Chỉ chứa hạ tầng, không chứa logic nghiệp vụ.

---

## 7. Config (`config/`)

- **constants.ts** – Base URL API, timeout, key prefix…
- Có thể thêm **env.ts** (hoặc env schema) để validate `process.env`.

App và lib nên đọc config từ đây thay vì hardcode.

---

## 8. Hooks & Providers (root)

- **hooks/** – Hook toàn cục (VD: use-mobile, useTheme) không gắn một feature.
- **providers/** – Provider toàn cục (QueryClient, Theme, Auth…).

Feature không import provider nội bộ của feature khác; chỉ dùng provider toàn cục.

---

## 9. Import path

- Dùng alias `@/` trỏ đến root dự án (cấu hình trong tsconfig).
- Ví dụ: `@/features/system-admin/organization`, `@/components/ui/button`, `@/lib/axiosInstance`, `@/config/constants`.

---

## 10. Checklist khi thêm feature mới

1. Tạo thư mục `features/system-admin/<feature-name>/`.
2. Thêm `index.tsx` (hoặc index.ts) export component chính.
3. Thêm `api.ts`, `types.ts`; nếu có form thì thêm `schemas.ts`.
4. Thêm `components/`, `hooks/` (và `context/` nếu cần).
5. Trong `app/`, tạo route và page chỉ import từ `@/features/system-admin/<feature-name>`.
6. Cập nhật menu/sidebar (layouts) để trỏ tới route mới.

---

## 11. Tóm tắt nguyên tắc

- **App**: Chỉ routing + layout, không business logic.
- **Feature**: Self-contained, public API qua index; api / types / schemas / components / context / hooks rõ ràng.
- **Components**: Chỉ UI chung; không phụ thuộc features.
- **Lib**: Chỉ hạ tầng (HTTP, utils cơ bản).
- **Config**: Cấu hình tập trung.
- **Shared**: Code dùng chung nhiều feature khi cần.

Áp dụng chuẩn này giúp dự án dễ mở rộng, onboard thành viên mới và tái sử dụng code giữa các module.
