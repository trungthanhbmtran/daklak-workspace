# Kế hoạch Phân tách API Manager và Workflow

## Bối cảnh và Mục tiêu
Yêu cầu: "xây dựng kế hoạch xây dựng lại toàn diện cho tôi giờ tách riêng quản lý api manager, quy trình hệ thống ra riêng đừng gộp chung mỗi thứ sẽ là trang riêng biệt tuân thủ skill. Tôi chấp nhận đập hết xây lại từ đầu".
Hiện tại, cả hai phân hệ này đang bị gộp chung trong `WORKFLOW_GROUP` dưới đường dẫn `/services/integration` ở ứng dụng `admin_khcn`.
Mục tiêu là tách bạch hoàn toàn:
1. **Quản lý API Manager**: Cấu hình Gateway, API đầu vào. Đường dẫn `/services/api-manager`.
2. **Quy trình hệ thống (Workflow)**: Định nghĩa quy trình, phiên thực thi. Đường dẫn `/services/workflow`.

## Phản biện sau khi lập kế hoạch

| Mức độ | Vấn đề/giả định bị phản biện | Ảnh hưởng | Điều chỉnh trong kế hoạch hoặc lý do giữ nguyên |
|---|---|---|---|
| Major | Việc tách nhóm sẽ ảnh hưởng đến phân quyền hiện tại (PBAC) vì API Manager cần quyền của IT Admin, Workflow cần quyền của Business Admin. Nếu chỉ tách trên UI mà không cấp quyền tương ứng cho nhóm mới `API_MANAGER_GROUP` thì menu sẽ không hiển thị. | Không hiển thị menu API Manager cho người dùng. | Bắt buộc phải bổ sung `API_MANAGER_GROUP` vào database seed, đồng thời gán quyền phù hợp hoặc seed lại DB của `user-service`. Kế hoạch đã bổ sung bước chạy seed DB. |
| Minor | Di chuyển folder `app/services/integration` sang 2 folder mới có thể phá vỡ nhiều thẻ `import` tĩnh (nếu có). | Build lỗi (Type Error). | Thêm bước kiểm tra lint/type (`npm run type-check` hoặc `npm run build` hoặc dùng IDE linter) trong bước 11 để tự sửa các lỗi import. |
| Major | Có khả năng `features/workflow/routes.ts` đang được sử dụng ở nhiều nơi khác ngoài `app/services`. | Gây lỗi điều hướng 404. | Phải search/replace toàn cục tất cả reference đến `/services/integration` và thay bằng đường dẫn tương ứng. |

### Kết luận phản biện
- Các gate cần đạt trước khi triển khai: Seed DB thành công với 2 group mới, Next.js build thành công không lỗi type/import, UI hiển thị đúng 2 mục trên sidebar (Hub/Menu).
- Quyết định còn mở và ai cần chốt: Không có. Kế hoạch an toàn để thực thi.

---

## Kế hoạch Thực thi Chi tiết (Implementation Plan)

### Bước 1: Cập nhật dữ liệu Seed (Backend)
**File**: `apps/user-service/prisma/seeds/09-categories-danh-m-c-d-ng-chung.seed.ts`
- Cập nhật `WORKFLOW_GROUP`:
  - `name`: `Quy trình hệ thống`
  - `route`: `/services/workflow`
  - Các menu con: Dashboard (tuỳ chọn), Định nghĩa quy trình, Quy trình đang chạy. (Loại bỏ các menu của Gateway/API).
- Thêm mới `API_MANAGER_GROUP`:
  - `name`: `Quản lý API Gateway`
  - `route`: `/services/api-manager`
  - `icon`: `Network`
  - Các menu con: Cấu hình Gateway (`/services/api-manager/gateway`), Kết nối API đầu vào (`/services/api-manager/apis`).
- **Hành động**: Chạy lệnh `npx prisma db seed` trong `apps/user-service` sau khi sửa code (hoặc drop DB chạy lại nếu seed không dùng upsert đúng cách).

### Bước 2: Cập nhật cấu hình Menu Sidebar (Frontend)
**File**: `apps/admin_khcn/hooks/useServiceMenus.ts`
- Xóa map `"/services/integration": "WORKFLOW_GROUP"`.
- Thêm map:
  - `"/services/workflow": "WORKFLOW_GROUP"`
  - `"/services/api-manager": "API_MANAGER_GROUP"`

### Bước 3: Cập nhật hằng số Routes (Frontend)
**File**: `apps/admin_khcn/features/workflow/routes.ts`
- Đổi `/services/integration/...` thành `/services/workflow/...`
**File mới**: `apps/admin_khcn/features/gateway/routes.ts`
- Định nghĩa các hằng số route cho API Manager: `hub: "/services/api-manager"`, `gateway: "/services/api-manager/gateway"`, `apis: "/services/api-manager/apis"`.

### Bước 4: Tái cấu trúc thư mục App (Next.js Routing)
1. **Xóa/Đổi tên**: Thư mục `apps/admin_khcn/app/services/integration`.
2. **Tạo phân hệ Workflow**:
   - Chuyển `workflows` và `instances` (và `(editor)` nếu có) sang `apps/admin_khcn/app/services/workflow`.
   - Tạo trang chủ Dashboard cho workflow: `app/services/workflow/page.tsx` (chỉ chứa thẻ điều hướng đến list/instance).
   - Đảm bảo có `layout.tsx` sử dụng `<ServiceLayout>` nếu cần.
3. **Tạo phân hệ API Manager**:
   - Chuyển `gateway` và `apis` sang `apps/admin_khcn/app/services/api-manager`.
   - Tạo trang chủ Dashboard cho API Manager: `app/services/api-manager/page.tsx`.
   - Đảm bảo có `layout.tsx` sử dụng `<ServiceLayout>`.

### Bước 5: Cập nhật Layout Component (Navbar/Breadcrumbs)
**Files**: Quét tất cả file TSX trong thư mục `components` và `app` có dính đến `WORKFLOW_ROUTES.hub` hoặc hardcode `/services/integration` để sửa lại link tương ứng.
- Ví dụ trong `components/workflow/WorkflowList.tsx`, đổi `backHref={WORKFLOW_ROUTES.hub}`.
- Xóa các liên kết chéo (cross-links) không hợp lý giữa API Manager và Workflow trong Dashboard Hub cũ (`app/services/integration/(main)/page.tsx` cũ).

### Bước 6: Kiểm thử và Self-Correction (Test Execution)
- Khởi động backend (`npm run start:dev` cho user-service, gateway...).
- Khởi động frontend (`npm run dev` trong `admin_khcn`).
- Truy cập UI, xác nhận trên trang chủ (Hub) hiện 2 ứng dụng: "Quy trình hệ thống" và "Quản lý API Gateway".
- Bấm vào từng ứng dụng, kiểm tra Sidebar render đúng menu và chuyển trang không lỗi 404.
- Giải quyết bất kỳ lỗi `import` hoặc `Type Error` nào.
