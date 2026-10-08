

## Kiến Trúc và Ràng Buộc Hệ Thống (Architecture Guidelines & Design Decisions)

Phần này mô tả các thiết kế chuẩn bắt buộc tuân thủ để tránh dư thừa và hiểu sai kiến trúc:

- **Workflow Authority:** workflow-service nắm giữ sinh mệnh của mọi quy trình. Các service khác (như HRM, Document) KHÔNG tự code luồng duyệt, phải gọi RPC sang workflow-service.
- **Fail-Fast Error Handling:** Bắt lỗi từng bước, ném RpcException ngay lập tức, không gộp điều kiện bằng ||. Trách nhiệm map lỗi sang HTTP thuộc về API Gateway.
- **Data Envelope:** API Gateway tự động bọc response (Envelope) qua TransformInterceptor. Các service/controller con tuyệt đối không được tự bọc tay { success, data }.
- **Dynamic gRPC Payload (Phi cấu trúc):** Dữ liệu phi cấu trúc (ví dụ JSON config) truyền qua gRPC bằng kiểu string (kết hợp JSON.stringify/parse), tuyệt đối không dùng google.protobuf.Struct.
- **Performance:** Bắt buộc áp dụng Structural Sharing, tránh .map().filter() lặp dư thừa. Các List query phải dùng Pagination chuẩn.

## Giai đoạn triển khai Agent Engineering System (Thực thi & Giám sát)

- [x] Khởi tạo bộ khung .agents/ (Rules, Skills, Commands).
- [x] Chốt cấu trúc critical-review (20 modules đánh giá kiến trúc).
- [x] Ánh xạ service-map.md, cấm truy vấn chéo cơ sở dữ liệu.
- [x] Chuẩn hóa Response Envelope & Cấm chuyển đổi dữ liệu dư thừa tại Gateway/Microservice.
- [x] Cấm dùng Struct trong gRPC, thay bằng string JSON.
- [x] Tạo performance-optimization.md bắt buộc Structural Sharing.
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

- [x] **[Hotfix] Sửa lỗi API Gateway gọi nhầm gRPC localhost và bổ sung nút Tạo thủ công trong API Manager (07/10/2026)**
  - Sửa URL  .0.0.0:50051 hardcoded trong ApiManagementGatewayModule thành constant MICROSERVICES.API_MANAGEMENT.URL.
  - Triển khai Dialog component cho nút "Tạo thủ công" (gọi useCreateConnection từ UI) cho phần quản trị API.
- [x] **[Hotfix] S?a l?i b? redirect ra m�n h�nh login khi v�o trang Qu?n l� API (07/10/2026)**
  - ApiManagementController trong pi-gateway thi?u gRPC metadata (user-id) n�n b? user-service t? ch?i (UNAUTHENTICATED), g�y ra l?i 401 Unauthorized d?y user ra login.
  - �� b? sung ti?n �ch d?c v� ch�n metadata v�o l?i g?i gRPC trong Controller c?a gateway.

- [x] **[Hotfix] S?a l?i danh s�ch workflow bindings kh�ng hi?n th? (07/10/2026)**
  - **V?n d?**: Truy c?p trang Qu?n l� G?n nghi?p v? (Bindings) nhung b?ng b�o "Chua c� binding".
  - **Nguy�n nh�n**: gRPC t? d?ng cast organizationId t? undefined (khi admin kh�ng thu?c don v? n�o) sang chu?i r?ng "". Service d�ng "" query DB trong khi DB luu l� null, d?n d?n kh�ng t�m th?y data.
  - **Gi?i ph�p**: S?a logic trong workflow-service (binding.service.ts) d? khi t�m ki?m s? cho ph�p l?y c�c global bindings (organizationId = null) ho?c bindings c?a t? ch?c.

- [x] **[Hotfix] S?a l?i API Manager (v� c�c Service kh�c) b? l?i redirect login (401) do thi?u Server-Side Auth Guard (08/10/2026)**
  - **V?n d?**: Ngu?i d�ng truy c?p /services/api-manager (ho?c c�c service kh�c) khi chua c� quy?n (ho?c token d� h?t h?n) b? b�o 401 tr�n client v� vang ra m�n h�nh dang nh?p.
  - **Nguy�n nh�n**: File layout.tsx c?a pi-manager, hrm, documents, v.v... b? thi?u h�m equireMenuAccess(pathname). �i?u n�y khi?n trang Next.js render unprotected tr�n server, g?i xu?ng client. Client sau d� g?i API l?y Menu Sidebar v?i token h?ng/thi?u quy?n, d?n t?i Backend tr? v? 401, k�ch ho?t interceptor redirect v? /login.
  - **Gi?i ph�p**: B? sung equireMenuAccess(pathname) v�o to�n b? c�c file layout.tsx c?a c�c ph�n h? d? ch?n ngay t? Server. N?u thi?u quy?n s? hi?n th? Not Found (404), n?u h?t token s? Redirect an to�n tr�n server thay v� b�o 401 tr�n client.
