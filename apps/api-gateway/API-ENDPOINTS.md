# API Gateway – Danh sách endpoint (user-service tích hợp đầy đủ)

Base URL: **`/api/v1`**. Swagger UI: **`/api/docs`**.

---

## Auth – Đăng nhập tài khoản hoặc SSO

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/admin/auth/login` | **Tài khoản:** body `{ "username" hoặc "email", "password" }` → gọi user-service Login (JWT). **SSO:** body khác (không có password) → gọi auth.proto (OAuth). |
| POST | `/admin/auth/logout` | Đăng xuất (Bearer token) |
| GET | `/admin/auth/me` | Thông tin user đăng nhập (Bearer token) |

**JWT:** Gateway verify token bằng `ACCESS_TOKEN_SECRET`; user-service ký token bằng `JWT_SECRET`. Đặt **cùng giá trị** (ví dụ `ACCESS_TOKEN_SECRET=...` và `JWT_SECRET=...` giống nhau) để đăng nhập tài khoản hoạt động.

---

## Users (user.proto – UserService)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/admin/users` | Danh sách user — **406** (chưa hỗ trợ, dùng GET /:id) |
| GET | `/admin/users/:id` | Chi tiết user (id, email) |
| POST | `/admin/users` | Tạo user — body: `{ "email": "..." }` |
| POST | `/admin/users/:id/assign-position` | Bổ nhiệm chức vụ — body: `{ "unit_id", "job_title_id", "is_primary?" }` |
| PUT | `/admin/users/:id` | Cập nhật user — **406** (chưa hỗ trợ) |
| DELETE | `/admin/users/:id` | Xóa user — **406** (chưa hỗ trợ) |

---

## PBAC – Chính sách phân quyền (pbac.proto – PbacService)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/admin/roles` | Danh sách vai trò (kèm số user, số quyền) |
| GET | `/admin/roles/permissions/matrix` | Ma trận quyền (Resource → Permissions) cho UI cấp quyền |
| GET | `/admin/roles/:id` | Chi tiết vai trò (kèm danh sách permission) |
| POST | `/admin/roles` | Tạo vai trò — body: `{ "code", "name", "description?", "permissionIds?" }` |
| PUT | `/admin/roles/:id` | Cập nhật vai trò — body: `{ "name?", "description?", "permissionIds?" }` |
| DELETE | `/admin/roles/:id` | Xóa vai trò (lỗi nếu còn user đang gán) |

---

## Danh mục hệ thống (categories.proto – CategoryService)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/admin/categories?group=...` | Danh mục theo nhóm (UNIT_TYPE, GENDER, DOC_TYPE...) |
| POST | `/admin/categories` | Tạo danh mục — body: `{ "group", "code", "name", "description?", "order?" }` |

---

## Menu (menus.proto – MenuService)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/admin/menus/me?app=ADMIN_PORTAL` | Menu sidebar theo user đăng nhập và ứng dụng (ADMIN_PORTAL \| CITIZEN_PORTAL) |

---

## Đơn vị tổ chức (organization.proto – OrganizationService)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/admin/organizations` | Tạo đơn vị — body: `{ "code", "name", "type_id", "parent_id?" }` |
| GET | `/admin/organizations/tree` | Cây tổ chức toàn bộ |
| GET | `/admin/organizations/:id/subtree` | Cây con của đơn vị |
| POST | `/admin/organizations/staffing` | Thiết lập định biên — body: `{ "unit_id", "job_title_id", "quantity" }` |
| GET | `/admin/organizations/:id/staffing-report` | Báo cáo định biên (thừa/thiếu nhân sự) |

---

## Các service khác (HRM, Documents, Posts, Storage)

- **HRM:** `/admin/departments`, `/admin/employees`, `/admin/positions`, `/admin/jobtitles` (project_stc/hrm-service).
- **Documents:** `/admin/documents/categories` (document_service).
- **Posts:** `/admin/posts`, `/admin/posts/categories`, `/admin/banners` (posts_service).
- **Storage:** upload/file (storage_service).

---

## Bảo mật

- Hầu hết endpoint `admin/*` yêu cầu **Bearer JWT** (trừ `POST /admin/auth/login`).
- Trong Swagger: bấm **Authorize**, nhập `Bearer <token>`.

## Proto đã xóa / thay thế

- `users/role.proto` → thay bằng **users/pbac.proto** (PBAC)
- `users/permission.proto` → gộp vào **pbac**
- `users/resource.proto` → gộp vào **pbac** (ma trận quyền)
- `users/menu.proto` (cũ) → thay bằng **users/menus.proto**
- `users/rbac.proto` → thay bằng **users/pbac.proto** (PBAC)

**Giữ lại:** `users/auth.proto` (Auth service).

---

## Lưu ý quan trọng – User-service và gRPC

**Hiện trạng:** User-service (NestJS, `project_stc/user-service/`) **chỉ expose một package gRPC** là **user** (file `user.proto`) với các RPC: CreateUser, FindOne, AssignPosition. Các endpoint **Users** trên gateway đã gọi đúng service này.

**Các nhóm endpoint PBAC, Danh mục, Menu, Đơn vị tổ chức** trên gateway gọi user-service qua gRPC. User-service đã implement:

- **PBAC** (roles, permissions/matrix) → **PbacService** (proto `pbac.proto`).
- **Danh mục hệ thống** → **CategoryService** (proto `categories.proto`).
- **Menu** → **MenuService** (proto `menus.proto`).
- **Đơn vị tổ chức** → **OrganizationService** (proto `organization.proto`).

**User-service:** Đăng ký multi-package gRPC trong `main.ts` (user, pbac, category, menu, organization). Các controller gRPC dùng `@GrpcMethod('PbacService', 'CreateRole')`, … Đảm bảo cùng URL/port (ví dụ `localhost:50051`) với USER_SERVICE_ADDR.
