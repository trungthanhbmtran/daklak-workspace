# Roadmap Dự Án Daklak-Workspace

Tài liệu này lưu vết tiến độ và các tác vụ phát sinh (hotfixes, tính năng mới) trong quá trình vận hành của Antigravity Agent, theo như yêu cầu trong AGENTS.md.

## Unplanned Tasks / Hotfixes

- [x] **Hoàn thiện Workflow Binding Modal cho Auto-Binding (07/10/2026)**
  - **Tác vụ**: Thêm component WorkflowBindingModal.tsx và gắn vào WorkflowBindingList.tsx.
  - **Chi tiết**: Form cho phép chọn Process Type (Đối tượng nghiệp vụ), Trigger (Sự kiện), và Quy trình thực thi. Dữ liệu được gọi từ API /admin/workflow/catalog/process-types và /admin/workflow để kết nối linh hoạt các trigger sự kiện với định nghĩa workflow mà không cần code.

- [x] **Rà soát và lên phương án tái cấu trúc giao diện và hệ thống quy trình nghiệp vụ (Workflow)**
  - Tác vụ: Tổng hợp tài liệu thiết kế và tình trạng trực tiếp từ /admin/services/workflow/workflows để lên phương án tái cấu trúc giao diện (No-Code, Offline-Tolerant) và backend (PBAC, Idempotency, Transactional Outbox) ra một artifact được lập.
- [x] **Thực thi phương án tái cấu trúc UI Workflow (No-Code & Binding)**
  - Tác vụ: Cập nhật giao diện WorkflowBindingList.tsx để sử dụng endpoint mới từ API Gateway thay cho endpoint deprecated. Xác nhận các tính năng "Business Mode Toggle", "Rule Builder", "Assignment Builder", và "Glow Red Validation" đã được cài đặt đầy đủ theo Giai đoạn 3 & 5 của thiết kế hệ thống.

- [x] **Rà soát chức năng hệ thống so với đề bài kiểm tra năng lực (Câu 2)**
  - Tác vụ: Đánh giá hệ thống theo 9 tiêu chí của Câu 2 trong tài liệu kiểm tra năng lực và viết báo cáo vào docs/Ra_soat_chuc_nang_cau_2.md.

- [x] **[Hotfix] Sửa lỗi parse JSON bị corrupted thành "[object Object]" trong Integration Upstream (07/10/2026)**
  - **Vấn đề**: Các thiết lập endpoints của API trong /admin/hub không lưu được và làm crash UI, dữ liệu ở database hiển thị thành "[object Object]".
  - **Nguyên nhân**: Lỗi xảy ra do dữ liệu rỗng ("") hoặc stringified json bị nest trong parseDto (user-service) và mapToUpstreamResponse khi đi qua gRPC, dẫn đến việc parse thất bại và đẩy nguyên chuỗi lỗi xuống Prisma lưu trữ dưới dạng JSON của 1 string.
  - **Giải pháp**: Viết helper safeParse và safeStringify an toàn để đảm bảo mọi payload đi vào Prisma đều là JavaScript Object chuẩn, từ đó Prisma tự động chuyển thành JSON đúng định dạng. Làm sạch dữ liệu hỏng trong MySQL trực tiếp bằng SQL script.

- [x] **[Hotfix] Sửa lỗi InvalidGrpcPackageException trong user-service (07/10/2026)**
  - **Vấn đề**: user-service crash khi khởi động với lỗi `InvalidGrpcPackageException [Error]: The invalid gRPC package (package "ai_assistant" not found)`.
  - **Nguyên nhân**: Trong mảng cấu hình packages gRPC ở `apps/user-service/src/main.ts` chứa `'ai_assistant'` và `'ai'`, nhưng trong các file proto (`ai_assistant.proto`, `ai.proto`) lại định nghĩa `package users;`.
  - **Giải pháp**: Xóa `'ai_assistant'` và `'ai'` khỏi danh sách packages trong `main.ts` do package `users` đã được load.

- [x] **[Hotfix] Sửa lỗi InvalidGrpcService cho ApiManagementService trong api-gateway (07/10/2026)**
  - **Vấn đề**: api-gateway crash khi bootstrap do lỗi `Error: The invalid gRPC service (service "ApiManagementService" not found)`.
  - **Nguyên nhân**: Bị trùng token DI. `ApiManagementGatewayModule` đăng ký Client gRPC bằng `MICROSERVICES.INTEGRATION.SYMBOL`, nhưng token này đã được `GlobalClientModule` đăng ký để load `users/integration.proto` (cho `IntegrationConfigService`). Hậu quả là NestJS DI container truyền nhầm client gRPC của IntegrationConfigService cho các controller của api-management, dẫn đến không tìm thấy `ApiManagementService` (thuộc `api-management.proto`).
  - **Giải pháp**: Tạo cấu hình độc lập `API_MANAGEMENT` trong `services.ts` với symbol riêng (`API_MANAGEMENT_PACKAGE`). Cập nhật `ApiManagementGatewayModule` và toàn bộ các provider liên quan (`api-management.controller.ts`, `executor.service.ts`, `partner-auth.guard.ts`, `registry.service.ts`) chuyển sang dùng `@Inject(MICROSERVICES.API_MANAGEMENT.SYMBOL)`.

- [x] **[Hotfix] Sửa lỗi encodeURIComponent URL (07/10/2026)**
  - **Vấn đề**: Hàm `encodeURIComponent` ở Next.js App Router (dòng số 8) bị crash do nhận dữ liệu không tương thích.
  - **Giải pháp**: Bỏ qua parse cứng hoặc fallback URL an toàn để UI luôn render được kể cả khi `id` chưa được resolve xong từ Server Components.

## Roadmap Chính - Tái cấu trúc module quản lý API

(Đồng bộ từ IMPLEMENTATION_PLAN.md - Giai đoạn thực hiện và Gate)

- [x] **P0: Baseline và Containment**
  - Inventory caller, data, routes và public paths hiện có.
  - Xây dựng test fixtures để bảo vệ các chức năng đang hoạt động.
  - Khóa cổng 	est-auth nguy hiểm (bypass TLS).
  - Validate lại các contract các tài module để đảm bảo tương thích.
- [x] **P1: Contract và Schema**
  - Chốt các Gate từ G-01 đến G-05 (Topology, Inbound Permissions, Legacy policies, Secrets).
  - Xây dựng proto v2, HTTP schema, permission matrix.
  - Thiết kế model và index mới (Migration additive).
- [x] **P2: Backend Quản Trị (User-service)**
  - Tái cấu trúc các use cases CRUD, list, lọc scope, OCC (Optimistic Concurrency Control).
  - Áp dụng các tính năng mới: Draft / Publish, Import API, Audit, Outbox pattern.
  - Quản lý các tham chiếu Credential.
- [x] **P3: Runtime và Đồng Bộ (API Gateway)**
  - Quản lý cơ chế Snapshot / Revision / Broadcast giữa các replicas.
  - Tái cấu trúc HTTP Executor và các Adapter cho xác thực.
  - Áp dụng Quota, Deadline, Redaction (chế độ bảo mật ẩn dữ liệu nhạy cảm).
- [x] **P4: Giao Diện và Consumer (Frontend admin_khcn)**
  - Xây dựng feature quản lý API mới bằng React Server Components (RSC), React Query.
  - Endpoint explorer, Import wizard.
  - Cập nhật adapter cho report, menu và URL.
- [x] **P5: Inbound có điều kiện (Dành cho đối tác)**
  - Cấp phát API Consumer / Key, xoay vòng (Rotate), thu hồi (Revoke).
  - Áp dụng Scope và Quota cho Inbound.
  - Triển khai xác thực đối tác (Partner authentication) nếu được duyệt qua G-02.
- [x] **P6: Rehearsal và Cutover (Phát hành)**
  - Reconcile, Backfill dữ liệu thực (dry-run).
  - Kiểm tra các lỗi giả lập (Fault testing), Tải (Load), phát hành thử nghiệm Canary.
  - Diễn tập rollback giữ nguyên trạng thái.
- [x] **P7: Dọn Legacy và Vận Hành**
  - Vô hiệu hoá adapter cũ / schema cũ sau thời gian hỗ trợ tương thích.
  - Hoàn thiện tài liệu, hồ sơ An toàn thông tin (ATTT) và runbook.
  - Đảm bảo traffic và tham chiếu từ legacy consumer trở về 0 trước khi xóa.

- [x] **Dựng lại module Workflow động trong admin_khcn (07/10/2026)**
  - Xây dựng lại danh sách/designer, binding và theo dõi instance theo API Gateway `/admin/workflow` làm nguồn dữ liệu và nguồn quyết định trạng thái.
  - Graph được lưu qua API; publish được backend validate. Catalog node/binding lấy từ backend, không dùng mock làm dữ liệu vận hành.
  - Bật JWT guard cho Workflow Gateway; actor và phạm vi đơn vị lấy từ JWT khi tạo/lọc binding, thay vì nhận actor/phạm vi do client tự gửi.
  - Ghi contract và ranh giới API trong `apps/admin_khcn/docs/WORKFLOW_ADMIN_MODULE.md`.
  - Kiểm tra: `admin_khcn` typecheck/lint; `api-gateway` build tsconfig typecheck/lint; `workflow-service` build tsconfig typecheck.
