# Tài liệu Tổng quan Kiến trúc & Cấu trúc Dự án Daklak Workspace

Tài liệu này cung cấp bức tranh toàn cảnh về hệ thống **Daklak Workspace**, được thiết kế theo nguyên tắc **Single Source of Truth** để cả Lập trình viên (Human) và AI Agent có thể đọc 1 lần và hiểu ngay lập tức kiến trúc, luồng dữ liệu, các điểm phát triển (endpoints) và giao diện.

---

## 1. Kiến trúc Tổng thể (High-level Architecture)

Daklak Workspace là một hệ thống **Microservices** phân tán, kết nối với nhau qua **gRPC** (cho giao tiếp nội bộ tốc độ cao) và **REST API** (cho external/client).

- **Frontend**: 2 ứng dụng độc lập sử dụng **Next.js 16.1.6 (React 19.2.3)**. Áp dụng triệt để kiến trúc *"Dumb Client"* - mọi logic tính toán, lọc dữ liệu đều được đẩy xuống Backend.
- **Backend**: API Gateway (NestJS) đóng vai trò trung tâm điều hướng request. Các services con (NestJS) đảm nhận nghiệp vụ riêng biệt.
- **Database**: Sử dụng **Prisma ORM** kết nối SQL (MySQL/PostgreSQL), có chuẩn hóa CUID cho khóa chính.
- **Message Broker & Cache**: RabbitMQ (cho Event-driven/Notifications) và Redis (cho Caching tốc độ cao).
- **Storage**: MinIO (Object Storage) quản lý file đính kèm, minh chứng.

---

## 2. Cấu trúc Thư mục Codebase (`/apps`)

Dự án áp dụng mô hình Monorepo (quản lý nhiều app trong 1 repo) với cấu trúc phân chia rõ ràng:

### 2.1. Nhóm Frontend (Giao diện)
| Ứng dụng | Cổng | Mô tả | Công nghệ |
|---|---|---|---|
| `admin_khcn` | `3007` | Trang Quản trị nội bộ dành cho Cán bộ/Nhân viên. Nơi xử lý Tasks, KPI, Luân chuyển văn bản. | Next.js, Shadcn UI, React Query |
| `portal-goverment` | `3000` | Cổng thông tin Công dân (Public Facing). Chuẩn SEO, URL thân thiện, đọc tin tức, tra cứu. | Next.js, Server Components |

### 2.2. Nhóm Backend Microservices
| Ứng dụng | Internal Port | Nhiệm vụ chính (Business Logic) | Công nghệ Lõi |
|---|---|---|---|
| `api-gateway` | `8080` (REST) | Proxy duy nhất giao tiếp với Client. (BFF Pattern). | NestJS, REST, gRPC Client, Redis |
| `user-service` | `3001` | Quản lý Tài khoản, Tổ chức, Phân quyền (PBAC). | NestJS, gRPC, Prisma, MySQL |
| `hrm-service` | `3002` | Quản lý Nhân sự, **Giao việc (Tasks)**, KPI. | NestJS, gRPC, Prisma, MySQL |
| `workflow-service` | `50060`, `3001`| Động cơ xử lý quy trình động (Node/Edge), Triggers. | NestJS, gRPC/REST, Prisma, MySQL |
| `document-service` | `3008` | Số hóa và luân chuyển Văn bản, theo vết bút phê. | NestJS, REST, Prisma, MySQL |
| `media-service` | `3003` | Quản lý Upload/Download file. | NestJS, MinIO, Prisma |
| `notification_service` | `RabbitMQ` | Bắn thông báo realtime (Push/Email). | NestJS, RabbitMQ, WebSocket |
| `chat-service` | `50061` (gRPC) | Hệ thống chat nội bộ. | NestJS, gRPC, Prisma |
| `posts-service` | `3005` | Quản lý Bài viết, Tin tức, Banner. | NestJS, gRPC, Prisma |
| `report-service` | `3011`, `50062` | Xử lý báo cáo thống kê phức tạp. | NestJS, gRPC, Prisma |
| `translate_service` | `3006` | Dịch thuật đa ngôn ngữ. | NestJS, REST |

### 2.3. Nhóm Shared (Dùng chung)
- `/shared/protos`: Nguồn chân lý (Source of Truth) cho các hợp đồng giao tiếp (Contracts) gRPC giữa các services.
- `/shared/core/interceptors`: Chứa `TransformInterceptor` chuẩn hóa Response định dạng `{ success, data, meta, timestamp }`.

---

## 3. Các Quy tắc Lập trình Lõi (Core Development Rules)

Nếu AI hoặc Lập trình viên thay đổi code, bắt buộc tuân thủ:

1. **Frontend KHÔNG chứa Business Logic**: Không viết các hàm `map`, `reduce` hay `filter` phức tạp ở React. Hãy gọi backend để lấy dữ liệu đã chế biến.
2. **SEO & UX cho Portal**: Các đường dẫn trên `portal-goverment` bắt buộc dùng **slug** (VD: `/tin-tuc/chuyen-doi-so`), tuyệt đối không để lộ UUID.
3. **API Contract (gRPC) đi trước**: Trình tự làm việc: *(1) Sửa `.proto` -> (2) Viết logic ở Service -> (3) Viết Controller tại Gateway -> (4) Cập nhật React Query.*
4. **Bảo mật XSS / Zero-Trust**: JWT Token sống trong HTTP-Only Cookie. Tuyệt đối không trả Token qua JSON.
5. **No Invented Code (AI Rule)**: AI không được tự bịa ra endpoint hoặc thư viện không tồn tại. Phải grep trước khi sửa chữa.

---

## 4. Hướng dẫn Dành cho AI Assistant

- **Giao Việc & KPI**: Đọc `apps/api-gateway/src/modules/hrm/tasks.controller.ts` và `apps/hrm-service/src/...`.
- **Kiến trúc Gateway**: Đọc `apps/api-gateway/src/app.module.ts`.
- **UI/UX Frontend**: Đọc `apps/admin_khcn/features/` (Feature-Sliced Design).
- **Hợp đồng gRPC**: Đọc `shared/protos/...`

---

## 5. Ma trận Mapping Chức năng - Trang - API (Dành cho Debug & Rà soát)

Dưới đây là mapping trực tiếp giữa giao diện (Pages) và API. Dùng để tracking lỗi (Trang bị lỗi -> Tìm API tương ứng -> Check log).

### 5.1. Quản trị Hệ thống & Phân quyền
**Backend**: `auth`, `users`, `organizations`, `pbac`, `menus`, `resources`
| Chức năng | Đường dẫn Trang (Pages) | Endpoints (API Gateway) |
|---|---|---|
| **Đăng nhập / Xác thực** | `/login` | `POST /admin/auth/login`, `POST /admin/auth/refresh`, `GET /admin/auth/me`, `POST /admin/auth/logout` |
| **Cán bộ (Tài khoản)** | `/services/admin/users` | `GET /admin/users`, `GET /admin/users/:id`, `POST /admin/users`, `PUT /admin/users/:id`, `POST /admin/users/:id/assign-position`, `POST /admin/users/:id/assign-roles` |
| **Sơ đồ Tổ chức** | `/services/admin/organization` | `GET /admin/organizations/tree`, `POST /admin/organizations`, `GET /admin/organizations/unit-types` |
| **Phân quyền (PBAC)** | `/services/admin/roles` | `GET /admin/roles`, `POST /admin/roles`, `GET /admin/users/:id/policies` |
| **Menu Động** | `/services/admin/menus` | `GET /admin/menus/my-menus`, `GET /admin/menus`, `POST /admin/menus` |

### 5.2. Nhân sự & Quản lý Công việc
**Backend**: `hrm/employee`, `hrm/tasks`, `hrm/kpis`, `hrm/master-plans`
| Chức năng | Đường dẫn Trang (Pages) | Endpoints (API Gateway) |
|---|---|---|
| **Hồ sơ Nhân sự** | `/services/hrm/employees` | `GET /admin/hrm/employees`, `GET /admin/hrm/employees/:id`, `POST /admin/hrm/employees`, `PUT /admin/hrm/employees/:id` |
| **Giao việc (Tasks)** | `/services/hrm/work-plans/tasks` | `GET /admin/hrm/tasks`, `POST /admin/hrm/tasks`, `POST /admin/hrm/tasks/:id/breakdown`, `GET /admin/hrm/tasks/:id/subtasks`, `PUT /admin/hrm/tasks/:id/status`, `PUT /admin/hrm/tasks/:id/assign`, `POST /admin/hrm/tasks/:id/comments`, `GET /admin/hrm/tasks/:id/history` |
| **Đánh giá (KPIs)** | `/services/hrm/work-plans/criteria` | `GET /admin/hrm/kpis/periods`, `GET /admin/hrm/kpis/criteria`, `GET /admin/hrm/kpis/evaluations`, `POST /admin/hrm/kpis/evaluations/calculate-personal`, `POST /admin/hrm/kpis/evaluations/:id/submit`, `POST /admin/hrm/kpis/evaluations/:id/approve` |
| **Lịch Công tác** | `/services/hrm/calendar` | `GET /admin/hrm/master-plans` |

### 5.3. Văn bản & Hồ sơ
**Backend**: `documents`, `document-category`, `minutes`, `consultations`
| Chức năng | Đường dẫn Trang (Pages) | Endpoints (API Gateway) |
|---|---|---|
| **Văn bản Đến / Đi** | `/services/documents/incoming` | `GET /admin/documents`, `POST /admin/documents`, `GET /admin/documents/:id`, `GET /admin/documents/:id/logs`, `POST /admin/documents/sync` |
| **Hồ sơ Công việc** | `/services/documents/dossiers` | `GET /admin/documents/dossiers/list`, `POST /admin/documents/dossiers`, `GET /admin/documents/dossiers/:id/components` |
| **Lấy ý kiến Dự thảo** | `/services/documents/consultations` | `GET /admin/documents/consultations`, `POST /admin/documents/consultations`, `GET /admin/documents/consultations/:id/public-comments`, `PUT /admin/documents/consultations/public-comments/:id/moderate` |
| **Danh mục Văn bản** | Settings | `GET /admin/documents/categories`, `POST /admin/documents/categories` |

### 5.4. Quy trình Động (Workflow Engine)
**Backend**: `workflow`, `integration`
| Chức năng | Đường dẫn Trang (Pages) | Endpoints (API Gateway) |
|---|---|---|
| **Định nghĩa Quy trình** | `/services/integration/workflows` | `GET /admin/workflow`, `POST /admin/workflow`, `POST /admin/workflow/:id/publish`, `GET /admin/workflow/triggers` |
| **Tiến trình (Instances)** | N/A | `GET /admin/workflow/instances`, `GET /admin/workflow/instances/:instanceId/logs`, `POST /admin/workflow/:id/start` |
| **API Keys & Webhooks** | `/services/integration/apikeys` | `GET /admin/integration/apikeys`, `GET /admin/integration/routes`, `POST /admin/integration/routes` |

### 5.5. Cổng Thông tin & Tương tác Đại chúng
**Backend**: `posts`, `categories`, `media`
| Chức năng | Đường dẫn Trang (Pages) | Endpoints (API Gateway) |
|---|---|---|
| **Bài viết & Tin tức** | `/services/posts` | `GET /admin/posts`, `POST /admin/posts`, `GET /admin/posts/:id`, `GET /admin/categories`, `POST /admin/categories` |
| **Banner & Giao diện** | `/services/posts/banners` | `GET /admin/posts/banners`, `PUT /admin/user-configs` |
| **Hỏi đáp, Góp ý** | `/services/posts/interactions/questions`| `GET /admin/posts/interactions`, `POST /admin/posts/interactions/reply` |
| **Media & Upload File** | N/A | `POST /admin/media/request-upload`, `GET /admin/media/download/:id` |

### 5.6. API Public dành cho Frontend Cổng thông tin (`portal-goverment`)
**Backend**: Tiền tố `public-`
| Chức năng | Đường dẫn Portal | Endpoints Public (API Gateway) |
|---|---|---|
| **Tin tức / Bài viết** | `/` (Trang chủ), `/[lang]/posts/[slug]` | `GET /public/posts`, `GET /public/posts/:slug`, `GET /public/categories` |
| **Văn bản & Thủ tục** | `/[lang]/documents` | `GET /public/documents`, `GET /public/documents/:id`, `GET /public/documents/procedures` |
| **Danh bạ Công chức** | `/[lang]/danh-ba` | `GET /public/hrm/employees` |
| **Góp ý kiến Dự thảo** | `/[lang]/consultations` | `POST /public/documents/consultations/:id/comments` |

---
*Ghi chú cho Debugger: Lỗi 403 trên UI -> Bật Network tab đối chiếu Endpoint -> Thường do cấu hình quyền trong module PBAC.*
