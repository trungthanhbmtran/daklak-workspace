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


- [x] **[Hotfix] Sửa lỗi API Gateway gọi nhầm gRPC localhost và bổ sung nút Tạo thủ công trong API Manager (07/10/2026)**
  - Sửa URL 0.0.0.0:50051 hardcoded trong ApiManagementGatewayModule thành constant MICROSERVICES.API_MANAGEMENT.URL.
  - Triển khai Dialog component cho nút "Tạo thủ công" (gọi useCreateConnection từ UI) cho phần quản trị API.

- [x] **[Hotfix] Sửa lỗi bị redirect ra màn hình login khi vào trang Quản lý API (07/10/2026)**
  - ApiManagementController trong api-gateway thiếu gRPC metadata (user-id) nên bị user-service từ chối (UNAUTHENTICATED), gây ra lỗi 401 Unauthorized đẩy user ra login.
  - Đã bổ sung tiện ích đọc và chèn metadata vào lời gọi gRPC trong Controller của gateway.

- [x] **[Hotfix] Sửa lỗi danh sách workflow bindings không hiển thị (07/10/2026)**
  - **Vấn đề**: Truy cập trang Quản lý Gắn nghiệp vụ (Bindings) nhưng bảng báo "Chưa có binding".
  - **Nguyên nhân**: gRPC tự động cast organizationId từ undefined (khi admin không thuộc đơn vị nào) sang chuỗi rỗng "". Service dùng "" query DB trong khi DB lưu là null, dẫn đến không tìm thấy data.
  - **Giải pháp**: Sửa logic trong workflow-service (binding.service.ts) để khi tìm kiếm sẽ cho phép lấy các global bindings (organizationId = null) hoặc bindings của tổ chức.

- [x] **[Hotfix] Sửa lỗi API Manager (và các Service khác) bị lỗi redirect login (401) do thiếu Server-Side Auth Guard (08/10/2026)**
  - **Vấn đề**: Người dùng truy cập /services/api-manager (hoặc các service khác) khi chưa có quyền (hoặc token đã hết hạn) bị báo 401 trên client và văng ra màn hình đăng nhập.
  - **Nguyên nhân**: File layout.tsx của api-manager, hrm, documents, v.v... bị thiếu hàm requireMenuAccess(pathname). Điều này khiến trang Next.js render unprotected trên server, gọi xuống client. Client sau đó gọi API lấy Menu Sidebar với token hỏng/thiếu quyền, dẫn tới Backend trả về 401, kích hoạt interceptor redirect về /login.
  - **Giải pháp**: Bổ sung requireMenuAccess(pathname) vào toàn bộ các file layout.tsx của các phân hệ để chặn ngay từ Server. Nếu thiếu quyền sẽ hiển thị Not Found (404), nếu hết token sẽ Redirect an toàn trên server thay vì báo 401 trên client.

- [x] **[Feature] Tích hợp SSO LifeSSO & VNeID cho portal-goverment (08/10/2026)**
  - Tích hợp đăng nhập SSO công dân bằng VNeID thông qua LifeSSO IS.
  - Implement Authorization Code flow trên Next.js (portal-goverment).
- [x] **[Hotfix] S?a l?i 401 Logout Loop li�n t?c tr�n h? th?ng (08/10/2026)**
  - **V?n d?**: Ngu?i d�ng b? vang ra m�n h�nh dang nh?p li�n t?c khi truy c?p c�c ch?c nang nhu Task Templates, L?ch s? Task, M?u b�o c�o d� d� du?c c?p quy?n.
  - **Nguy�n nh�n**: API Gateway g?i t?i m?t s? controller c?a hrm-service (TaskCatalogController, TaskHistoryController) du?c b?o v? b?i GrpcContextInterceptor (b?t bu?c ph?i c� Metadata Delegation Token), nhung API Gateway l?i g?i gRPC chay m� kh�ng attach metadata (thi?u this.getGrpcMetadata(req)). �i?u n�y d?n d?n microservice tr? m� l?i 16 (UNAUTHENTICATED), API Gateway quang l?i 401, khi?n client trigger h�m session-recovery nhung l?i b? d�nh infinite loop do replay request v?n l?i 401.
  - **Gi?i ph�p**: Truy?n req xu?ng service, g?i this.getGrpcMetadata(req) v� d�nh k�m v�o t?t c? c�c l?nh g?i gRPC b? thi?u trong tasks.service.ts v� task-templates.controller.ts.

- [x] **[Hotfix] Sửa lỗi văng ra login 401 khi vào API Management (08/10/2026)**
  - **Vấn đề**: Người dùng bị văng ra màn hình đăng nhập (lỗi 401) khi vào trang Quản lý API, tạo thành infinite logout loop.
  - **Nguyên nhân**: Lỗi lấy metadata trong GrpcAuthGuard của NestJS @GrpcMethod. Thay vì nhận object { metadata }, switchToRpc().getContext() trong phiên bản này trả về trực tiếp Metadata object. Khi gọi 
pcContext?.metadata sẽ trả về undefined, dẫn đến báo lỗi UNAUTHENTICATED: Missing metadata từ internal service, bị AllExceptionsFilter map thành HTTP 401, gây ra trigger logout sai lệch trên frontend.
  - **Giải pháp**: 
    1. Sửa GrpcAuthGuard đọc Metadata object trực tiếp và lưu user vào rgs[2] (ServerUnaryCall) để PbacGuard đọc.
    2. Sửa đổi error mapping trong AllExceptionsFilter: map gRPC code 13 (INTERNAL) thành HTTP 503 thay vì 401 để ngăn chặn lỗi internal service trigger logout. Rebuild user-service và api-gateway.
- [x] **[Refactor] T�i c?u tr�c to�n b? d? �n theo quy t?c m?i (08/10/2026)**
  - S?a l?i g�i Response th? c�ng t?i api-gateway (TransformInterceptor).
  - Kh?c ph?c l?i vi ph?m import axios tr?c ti?p ? apps/admin_khcn.

- [x] **[Hotfix] Sửa lỗi Invalid delegation token trong module quản lý API (08/10/2026)**
  - **Vấn đề**: Khi truy cập vào quản lý API, bị văng ra trang login do lỗi "16 UNAUTHENTICATED: Invalid delegation token".
  - **Nguyên nhân**: "ApiManagementController" trong "api-gateway" khi chuyển tiếp request qua gRPC sang "api-management-service" đã không truyền token uỷ quyền đúng chuẩn (GatewayContextToken) mà chỉ truyền "user-id".
  - **Giải pháp**: Inject "TokenIssuerService" vào "ApiManagementController" và sử dụng hàm "signDelegation" để tạo delegation token chuẩn (chứa id, sid, exp ngắn, audience nội bộ), sau đó truyền qua header "authorization" (gRPC metadata) giống như các module khác.

- [x] **[Hotfix] Bổ sung endpoint phân tích API (08/10/2026)**
  - **Vấn đề**: Báo lỗi "Cannot POST /api/v1/admin/api-management/connections/import/upload" khi thực hiện tải lên file phân tích Swagger/Postman.
  - **Nguyên nhân**: Trong quá trình tái cấu trúc API Gateway, Controller ApiManagementController đã bị thiếu việc khai báo 2 endpoint import/upload và import/commit.
  - **Giải pháp**: Đã bổ sung hai endpoint này để nhận file upload, gọi đến ImportParserService để phân tích (YAML, JSON), và sau đó gọi gRPC CreateImportSession / CommitImportSession sang API Manager.

- [x] **[Hotfix] Khôi phục API Quản lý Partner (08/10/2026)**
  - **Vấn đề**: Client gọi /api/v1/admin/api-management/partners báo lỗi 404 Cannot GET/POST.
  - **Nguyên nhân**: PartnerController được cài đặt bằng HTTP decorators bên trong user-service, nhưng API Gateway không cấu hình route proxy nào cả.
  - **Giải pháp**: Mở rộng pi-management.proto với các method quản lý Partner; thay đổi PartnerController trong user-service thành gRPC endpoint; và tạo mới PartnerController trong pi-gateway để expose ra HTTP rồi forward bằng gRPC.


- [x] **[Feature] ?ng b? API Manager m?i vo h? th?ng Bo co (09/10/2026)** 
  - C?p nh?t ReportSourceOption contract d? ch?a upstream alias.
  - C?u hnh gRPC d? lin k?t 
eport-service v?i pi-management.
  - Fetch danh sch API endpoint t? API Manager d? tch h?p vo V2 Report Catalog.

## Unplanned Tasks
- [x] **[Hotfix] Khắc phục sơ đồ quy trình không hiển thị trong editor (09/10/2026)**
  - **Vấn đề**: Danh sách workflow hiển thị đủ 5 quy trình nhưng mở chi tiết lại thấy tên, mô tả và sơ đồ rỗng.
  - **Nguyên nhân**: ID quy trình là CUID nhưng bộ bọc response chung chỉ nhận diện UUID hoặc ID số, khiến GET detail bị coi là list và đối tượng workflow bị chuyển thành mảng.
  - **Giải pháp**: Bổ sung nhận diện CUID khi phân loại response; typecheck frontend thành công. Giao diện trên máy chủ cần được xác minh sau khi triển khai.
- [x] Chuyển đổi thiết kế báo cáo động (Dynamic Report Designer), xóa logic hardcode trong reports.service.ts và reports.controller.ts.
- [x] Nâng cấp giao diện Trung tâm Báo cáo (Enterprise UI): Chuyển đổi ReportWorkspace.tsx sang giao diện nâng cao với Tabs, KPIs, Grid/List view toggle và filters.
- [x] Nâng cấp giao diện Quản lý API (API Manager): Chuyển đổi giao diện `ApiManagementDashboard`, `PartnerManagement` và `ApiConnectionCard` sang chuẩn Enterprise UI/UX với Dashboards, KPIs, Gradient Cards và Layout cao cấp.
- [x] **[Hotfix] Sửa danh sách nguồn và xem dữ liệu API trong thiết kế báo cáo (09/10/2026)**
  - Chuyển delegation token người dùng từ API Gateway qua report-service khi đọc API Manager catalog.
- Hiện đường dẫn endpoint, schema khai báo và dữ liệu mẫu thực tế (qua endpoint preview có lọc dữ liệu nhạy cảm).

- [x] **[Hotfix] Hiển thị đầy đủ nhánh và nét nối trong Workflow Designer (09/10/2026)**
  - Chuẩn hóa cạnh từ API, bao gồm graph legacy dùng `sourceNodeId`/`targetNodeId`.
  - Render đúng cổng nhánh `true`/`false` của gateway, nhãn action/condition và tăng độ tương phản của đường nối.
  - Lint các file workflow đã pass; toàn bộ typecheck đang vướng lỗi import `Percentage` không liên quan trong `KpiFormulasClient.tsx`.
  - Đã xác nhận lỗi trên trang production trước sửa; cần triển khai frontend để xác nhận trực quan sau sửa.
- [x] **[Hotfix] Nhận tọa độ API và tự bố trí sơ đồ workflow theo cây (09/10/2026)**
  - Đọc vị trí từ `position`, `positionAbsolute`, `uiMetadata` và `_uiMetadata`.
  - Khi backend không có tọa độ hợp lệ, xếp node theo tầng từ quan hệ cạnh; ưu tiên nhánh `true` phía trên và `false` phía dưới.
  - Lưu vị trí trên node vào `definition` để giữ bố cục sau khi kéo thả; cần xác nhận trực quan sau khi frontend được triển khai.
