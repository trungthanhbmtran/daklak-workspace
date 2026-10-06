# Nhật ký Thực thi Tái cấu trúc Quản lý API

Báo cáo tiến độ triển khai dựa trên kế hoạch `docs/plans/api-management-rebuild.md`.

## Giai đoạn P0: Baseline và Containment

### T001: Inventory, baseline và containment (Hoàn thành một phần)
- **Files/Lệnh thực chạy:** 
  - `Get-ChildItem` tìm kiếm `gateway.api.ts`, `integrations.controller.ts`, và xem `integration.proto`.
  - Khảo sát mã nguồn thực tế tại `apps/api-gateway/src/modules/integration/integration.controller.ts` và `shared/protos/users/integration.proto`.
- **Kết quả:**
  - Xác nhận E-01: UI gọi các route `/integration/services`, v.v. nhưng controller Backend thực sự lại cung cấp route `/admin/integration-upstreams` hoặc nằm ở các controller khác. Gây mất đồng bộ.
  - Xác nhận E-07: payload proto hiện tại sử dụng `callerUserId` thay vì nhận danh tính thực từ backend context.
- **Hạn chế (Limitation):** Chưa kiểm kê toàn bộ hệ thống (như cấu hình Nginx, báo cáo, dữ liệu DB trên production) trong một lượt lệnh, cần thực hiện liên tục ở các lượt sau.

### T003: Chặn đường Next test-auth trực tiếp (Đã hoàn thành)
- **Files/Lệnh thực chạy:**
  - Chỉnh sửa file: `apps/admin_khcn/app/api/integration/test-auth/route.ts`
- **Kết quả:**
  - Đã thay thế logic nhận `authUrl` và bypass TLS (`rejectUnauthorized: false`).
  - Route hiện tại trả về `503 Service Unavailable` kèm thông báo tính năng đang được nâng cấp để bảo vệ hệ thống khỏi lỗ hổng SSRF.
- **Hạn chế:** UI cũ vẫn có thể gọi endpoint này và sẽ nhận về lỗi 503 thay vì token, có thể ảnh hưởng nhỏ đến UX cho đến khi UI mới được triển khai.
