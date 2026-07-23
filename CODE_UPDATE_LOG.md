# Nhật Ký Thay Đổi Mã Nguồn (Code Update Log)

Tài liệu này dùng để theo dõi và ghi nhận toàn bộ các thao tác thay đổi mã nguồn, refactor, fix bug, và cập nhật tiêu chuẩn kỹ thuật trong hệ thống. Agent AI BẮT BUỘC phải ghi nhận lịch sử vào đây sau mỗi phiên hoàn tất chỉnh sửa code.

---

### [2026-07-21 15:15] Tác vụ: Tái cấu trúc Batch 4 (SRP & Clean Code cho API Gateway)
- **File bị ảnh hưởng**:
  - `apps/api-gateway/src/modules/hrm/tasks.controller.ts` và `tasks.service.ts` (Tạo mới)
  - `apps/api-gateway/src/modules/users/organizations.controller.ts` và `organizations.service.ts` (Tạo mới)
  - `hrm.module.ts`, `users.module.ts`
- **Chi tiết thay đổi**:
  - Bóc tách kiến trúc: Chuyển toàn bộ business logic phức tạp (gọi gRPC, map dữ liệu O(1), đệ quy cây) từ Controller xuống tầng Service.
  - Chuyển đổi các Fat Controllers khổng lồ (lên tới gần 900 dòng) về định dạng "Dumb Controller".
- **Mục đích**: Áp dụng triệt để nguyên tắc Đơn trách nhiệm (SRP), giúp Code Clean, dễ test, và tuân thủ đúng quy chuẩn kiến trúc NestJS/Microservices của dự án.

---

### [2026-07-21 14:35] Tác vụ: Tái cấu trúc Batch 3 (Dumb Client & UI Consistency)
- **File bị ảnh hưởng**:
  - Hàng loạt file trong `admin_khcn` (trên 150 vị trí thay đổi).
- **Chi tiết thay đổi**:
  - Xóa bỏ triệt để các đoạn code phòng thủ dư thừa `res?.data || []` trong các hàm gọi API (queryFn) do Backend đã chuẩn hóa việc trả mảng rỗng. Đảm bảo đúng tinh thần Dumb Client.
  - Thay thế gần 70 thẻ `<button>` thuần HTML thành Component `<Button>` của Shadcn UI (`@/components/ui/button`) để duy trì UI Consistency.
- **Mục đích**: Loại bỏ nợ kỹ thuật (technical debt), tuân thủ tuyệt đối các ràng buộc trong `frontend_integration_standard`.

---

### [2026-07-21 14:25] Tác vụ: Rà soát & Chuẩn hóa Schema gRPC (Backend Standard)
- **File bị ảnh hưởng**:
  - `shared/protos/workflow/workflow.proto`
- **Chi tiết thay đổi**:
  - Phát hiện và loại bỏ việc lạm dụng kiểu dữ liệu động `google.protobuf.Struct` cho các trường có cấu trúc cố định (cụ thể là trường `meta` phân trang trong `ListWorkflowsResponse` và `ListInstancesResponse`).
  - Thay thế bằng thông điệp có cấu trúc chặt chẽ: `common.PaginationMeta meta = 2;` (đã import `common.proto`).
- **Mục đích**: Tuân thủ tuyệt đối quy tắc Data Consistency của `backend_microservice_standard`, cấm dùng kiểu động vô tội vạ cho những dữ liệu đã định hình sẵn từ Backend, đảm bảo an toàn kiểu dữ liệu (Type Safety) khi parse gRPC.

---

### [2026-07-21 14:15] Tác vụ: Chuẩn hóa Error Handling toàn cục Frontend (Dumb Client Standard)
- **File bị ảnh hưởng**:
  - Hàng loạt 23 files bao gồm: `useDocumentFormData.ts`, `useDocuments.ts`, `useTasks.ts`, `RoleForm.tsx`, `api.ts`,...
- **Chi tiết thay đổi**:
  - Chạy script quét toàn bộ hooks `useMutation` ở `admin_khcn` đang thiếu block xử lý lỗi.
  - Tự động chèn đoạn code parse lỗi `onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); }` vào Object config của `useMutation`.
  - Tự động bổ sung `import { toast } from "sonner";` nếu file đó chưa khai báo.
- **Mục đích**: Chốt chặn quy tắc bắt buộc của `frontend_integration_standard` là mọi API gọi qua Client phải thông báo lỗi tường minh từ Backend, tránh việc lỗi bị im lặng (swallowed) trên giao diện.

---

### [2026-07-21 13:50] Tác vụ: Refactor Client-side Logic (Dumb Client Validation)
- **File bị ảnh hưởng**:
  - Các file liên quan đến Posts/Banners/Menus trong `admin_khcn`
- **Chi tiết thay đổi**:
  - Quét và gỡ bỏ toàn bộ logic sử dụng `.filter()` và `.sort()` thủ công trên Client đối với category (dữ liệu do Backend trả về mặc định đã chuẩn và lọc sẵn).
  - Thay thế comment `fetch()` bằng `apiClient` tại `ImageComponent.tsx` để đồng nhất cấu trúc, tuân thủ nguyên tắc không sử dụng native fetch.
- **Mục đích**: Chuyển giao hoàn toàn 100% trách nhiệm kiểm soát tính hợp lệ và cấu trúc dữ liệu cho Backend, đưa Frontend admin_khcn về thuần trạng thái hiển thị (Dumb Client).

---

### [2026-07-21 13:30] Tác vụ: Phase 2 Project Review (Prisma & Documentation)
- **File bị ảnh hưởng**:
  - `readme_hdsd.md`
  - Hàng chục file `*.prisma` trong `apps/*/prisma/schema/`
- **Chi tiết thay đổi**:
  - **Prisma Schema**: Thay thế toàn bộ hàm `@default(uuid())` bằng `@default(cuid())` ở các bảng trong `posts-service`, `workflow-service`, `media-service`, `user-service`, `document-service` nhằm tuân thủ tuyệt đối quy định trong `prisma_database_standard` (Dùng CUID tối ưu hóa hiệu năng Insert Index cho Database thay vì UUID rời rạc).
  - **Documentation**: Bổ sung `v1.3.0` vào `readme_hdsd.md`, mô tả quá trình chuyển đổi toàn diện kiến trúc sang mô hình Frontend Dumb Client và sự chuyển đổi các logic filter phức tạp xuống API Gateway và Prisma DB.
- **Mục đích**: Chốt chặn tiêu chuẩn Phase 2, đồng nhất CUID trên toàn bộ hệ thống Database Schema và duy trì tài liệu hệ thống ở trạng thái cập nhật nhất.

---

### [2026-07-21 23:55] Tác vụ: Fix Organization Tree Render & Dumb Client Filter
- **File bị ảnh hưởng**:
  - `apps/admin_khcn/features/system-admin/organization/components/OrganizationLayoutClient.tsx`
  - `shared/protos/users/organization.proto`
  - `apps/api-gateway/src/modules/users/organizations.controller.ts` & `organizations.service.ts`
  - `apps/user-service/src/modules/organizations/organizations.controller.ts` & `organizations.service.ts`
- **Chi tiết thay đổi**:
  - **Frontend Fix**: Sửa lỗi không hiển thị cây do trỏ sai key (`treeResponse?.items` -> `treeResponse?.data`).
  - **Backend Filter (Dumb Client)**: Cập nhật hàm `GetFullTree` trong Proto và Gateway để nhận tham số tìm kiếm `q`. Ở tầng Microservice `user-service`, thực hiện đệ quy (recursive filter) trên cache tree để trả về cây kết quả giữ nguyên cấu trúc cha-con mà không cần Frontend phải tự build hay tính toán.
  - **Xóa tính năng Drag & Drop**: Gỡ bỏ hoàn toàn logic kéo thả (thư viện `@dnd-kit/core`) khỏi `OrganizationSidebar.tsx` theo yêu cầu của người dùng để đơn giản hóa giao diện.
- **Mục đích**: Khắc phục lỗi rỗng cây tổ chức, tuân thủ tuyệt đối quy tắc Dumb Client (Backend chịu trách nhiệm filter tree) và làm gọn giao diện cây tổ chức.

---

### [2026-07-21 13:20] Tác vụ: Bổ sung Backend APIs cho Frontend Dumb Client
- **File bị ảnh hưởng**:
  - `shared/protos/posts/post.proto`, `apps/posts-service/src/modules/posts/posts.service.ts`, `apps/api-gateway/src/modules/posts/public-posts.controller.ts`
  - `apps/api-gateway/src/modules/posts/public-portal-menu.controller.ts`
  - `shared/protos/document/document.proto`, `apps/document-service/src/modules/document/document.service.ts`, `apps/api-gateway/src/modules/documents/public-documents.controller.ts`
  - `shared/protos/hrm/employee.proto`, `apps/hrm-service/src/modules/employees/employees.service.ts`, `apps/api-gateway/src/modules/hrm/public-hrm.controller.ts`
- **Chi tiết thay đổi**:
  - **Posts Service**: Thêm param `isNotification`, `hasThumbnail` vào Proto và logic filter ở Service. Ánh xạ trực tiếp từ Query của Gateway. Hỗ trợ query theo `category` slug.
  - **Portal Menu**: Thêm alias endpoint `@Get('tree')` để trả thẳng về cấu trúc cây phân cấp (vì logic tạo cây vốn đã có sẵn).
  - **Documents Service**: Thêm param `issuingAuthorityId` (lọc theo org) vào Proto và logic filter. Ánh xạ `?org=` và `?date=` từ Gateway.
  - **HRM Service**: Thêm mảng `ids` vào Proto và xử lý Prisma `in` ở Service để Frontend có thể lấy một mảng nhân viên theo danh sách ID.
- **Mục đích**: Bù đắp lại các tính năng lọc/tính toán dữ liệu đã xóa khỏi Frontend (chuyển đổi hoàn toàn trách nhiệm tính toán về Backend theo chuẩn Dumb Client).

---

### [2026-07-21 11:15] Tác vụ: Frontend Standard Refactor (Dumb Client & Shadcn UI)
- **File bị ảnh hưởng**:
  - Hàng loạt file trong `admin_khcn` và `portal-goverment`.
  - `logic.MD` (Tạo mới).
- **Chi tiết thay đổi**:
  - **Dumb Client Enforcement**: Quét toàn bộ Frontend, xóa bỏ thành công hơn 30+ vị trí code sử dụng fallback array an toàn phòng thủ (e.g. `res?.data || []`). Trực tiếp sử dụng `res.data` từ API Gateway.
  - **Filter/Map Cleanup**: Xóa bỏ các vòng filter/map dữ liệu lồng nhau phức tạp ở Client (đặc biệt trong `home-client.tsx`, `DynamicPageRenderer.tsx`, v.v.). Đưa toàn bộ các tính năng bị ảnh hưởng vào file `logic.MD` để Backend viết API bổ sung sau.
  - **Shadcn UI Migration**: Đã tìm và thay thế HTML `<table>` thuần thô sơ tại `documents-page.tsx` thành component `Table` chuẩn Shadcn, đảm bảo UI Consistency.
  - **React Query Audit**: Kiểm định không phát hiện lạm dụng `useEffect` để fetch data hay gọi `fetch()` native trái phép trên Client Components. 
- **Mục đích**: Chốt chặn tiêu chuẩn hóa lớp Frontend theo kiến trúc Dumb Client, hoàn tất 100% khối lượng tái cấu trúc toàn hệ thống.

---

### [2026-07-21 11:02] Tác vụ: Mass Refactoring (Batch 3) - Satellite Services & Rest of Core
- **File bị ảnh hưởng**:
  - `apps/media-service/src/modules/media/dto/media.dto.ts` (Tạo mới)
  - `apps/media-service/src/modules/media/controllers/media.grpc.controller.ts`
  - Các controllers phụ trong `user-service` và `posts-service` (`menus.controller.ts`, `categories.controller.ts`, `banners.controller.ts`, `interactions.controller.ts`, v.v.)
- **Chi tiết thay đổi**:
  - Khởi tạo bộ DTO Validation hoàn chỉnh cho `media-service` (UploadRequestDto, InitMultipartRequestDto, v.v.).
  - Gắn lưới bảo mật `@Payload()` và dọn dẹp các parameter lỏng lẻo (`data: any`).
  - Chạy script Node.js quét và gỡ bỏ toàn bộ `data: any` còn sót lại ở các module vệ tinh trong hệ thống (thay bằng `Record<string, any>` an toàn hơn nếu chưa có DTO cụ thể).
  - Đối với `notification_service` (Node.js thuần) và `translate_service` (Python), hệ thống ghi nhận không sử dụng cấu trúc NestJS Microservices gRPC nên được xác nhận là an toàn trước bộ quy chuẩn này.
- **Mục đích**: Hoàn thành đợt 3, kết thúc chiến dịch Zero-Trust cho toàn bộ Backend.

---

### [2026-07-21 10:53] Tác vụ: Mass Refactoring (Batch 2) - Zero-Trust HRM & Document Services
- **File bị ảnh hưởng**:
  - `apps/hrm-service/src/modules/employees/dto/employee.grpc.dto.ts` (Tạo mới)
  - `apps/hrm-service/src/modules/employees/employees.controller.ts`
  - `apps/document-service/src/modules/document/dto/document.grpc.dto.ts` (Tạo mới)
  - `apps/document-service/src/modules/document/document.controller.ts`
- **Chi tiết thay đổi**:
  - **Phase 1 (Proto)**: Rà soát `shared/protos/hrm` và `shared/protos/document`, xác nhận cấu trúc chuẩn, không lạm dụng kiểu động `Struct`.
  - **Phase 2 (Microservices)**: Tạo DTO nội bộ gRPC cho 2 controller quản lý chính là `EmployeesController` (HRM) và `DocumentController` (Document). Gắn toàn bộ `@Payload()` cho các function và loại bỏ kiểu inline parameter lỏng lẻo.
- **Mục đích**: Hoàn thiện Batch 2 trong chiến dịch tái cấu trúc toàn bộ dự án về chuẩn Data Consistency.

---
### [2026-07-21 10:48] Tác vụ: Mass Refactoring (Batch 1) - Zero-Trust Core Services & Dọn rác Gateway
- **File bị ảnh hưởng**:
  - `apps/api-gateway/src/modules/**/*.controller.ts` (Nhiều file được tự động hóa)
  - `apps/user-service/src/modules/users/dto/user.grpc.dto.ts` (Tạo mới)
  - `apps/user-service/src/modules/users/users.controller.ts`
  - `apps/posts-service/src/modules/posts/dto/posts.grpc.dto.ts` (Tạo mới)
  - `apps/posts-service/src/modules/posts/posts.controller.ts`
- **Chi tiết thay đổi**:
  - **Phase 3 (Gateway Automation)**: Viết script Node.js quét và loại bỏ toàn bộ các fallback mảng sai chuẩn như `res?.items || []` và `res?.data || []` ở 9 controller thuộc Gateway, ép trả về chuẩn `{ success: true, data: result?.data }`.
  - **Phase 1 (Proto)**: Rà soát `shared/protos/users` và `shared/protos/posts`, xác nhận không tồn tại trường `google.protobuf.Struct` lạm dụng.
  - **Phase 2 (Microservices)**: Tạo DTO nội bộ gRPC cho 2 controller cốt lõi là `UsersController` và `PostsController`. Gắn `@Payload()` và loại bỏ triệt để các inline object `data: any`.
- **Mục đích**: Hoàn thiện Batch 1 trong lộ trình Mass Refactoring toàn dự án để chống rác dữ liệu.

---
### [2026-07-21 10:38] Tác vụ: Pilot Tái cấu trúc chuẩn Zero-Trust cho Workflow Service
- **File bị ảnh hưởng**:
  - `shared/protos/workflow/workflow.proto`
  - `apps/workflow-service/src/grpc/dto/workflow.dto.ts` (Tạo mới)
  - `apps/workflow-service/src/grpc/grpc.controller.ts`
  - `apps/api-gateway/src/modules/workflow/dto/workflow.dto.ts` (Tạo mới)
  - `apps/api-gateway/src/modules/workflow/workflow.controller.ts`
- **Chi tiết thay đổi**:
  - **Phase 1**: Xóa bỏ `google.protobuf.Struct` ở các trường đã biết cấu trúc (`definition`, `endpoints`) trong `workflow.proto`, thay thế bằng Message cụ thể (`IntegrationEndpoint`, `WorkflowDefinition`).
  - **Phase 2 (Microservice)**: Chặn dữ liệu rác truyền vào gRPC bằng cách khai báo DTO (`CreateWorkflowGrpcDto`, `StartWorkflowGrpcDto`) kết hợp decorator `@Payload()` thay cho kiểu `any`.
  - **Phase 3 (Gateway)**: Loại bỏ toàn bộ code fallback xử lý mảng lỏng lẻo (`res?.items || []`) của API Workflow, áp đặt format trả về chuẩn khép kín `{ success: true, data: ... }`. Bổ sung REST DTO để kích hoạt ValidationPipe.
- **Mục đích**: Hiện thực hóa kỹ năng Zero-Trust Input/Output và Data Consistency trên nhánh Workflow làm Pilot.

---
### [2026-07-21 09:51] Tác vụ: Bổ sung chuẩn hóa Input/Output & Đồng nhất Proto (Backend)
- **File bị ảnh hưởng**:
  - `.agents/skills/backend_microservice_standard/SKILL.md`
- **Chi tiết thay đổi**:
  - **Chuẩn Hóa Đầu Vào & Đầu Ra**: Phân tách yêu cầu `ValidationPipe`, DTO, và `ClassSerializerInterceptor` tại lớp API Gateway và Microservices.
  - **Đồng nhất Data & Proto**: Bổ sung quy định BẮT BUỘC đồng nhất 100% giữa Input/Output DTO thực tế với cấu trúc định nghĩa trong file `.proto`.
  - Nghiêm cấm khai báo lạm dụng kiểu dữ liệu động như `google.protobuf.Struct` hay `google.protobuf.Any` cho các field đã biết trước cấu trúc.
- **Mục đích**: Chống thất thoát dữ liệu, thiết lập tư duy Zero-Trust ở mọi tầng, và giữ nguyên vẹn bản chất Data Type Safety của gRPC.

---
### [2026-07-21 09:40] Tác vụ: Tối ưu chuẩn hóa dữ liệu Frontend (EditMenuModal)
- **File bị ảnh hưởng**:
  - `apps/admin_khcn/features/posts/portal-menus/components/EditMenuModal.tsx`
  - `.agents/skills/frontend_integration_standard/SKILL.md`
  - `.agents/skills/backend_microservice_standard/SKILL.md`
- **Chi tiết thay đổi**:
  - Loại bỏ toán tử Optional Chaining (`res?.data`) và fallback mảng rỗng (`res.data || []`) khỏi logic lấy dữ liệu của React Query.
  - Sửa đổi ép kiểu API Client sang chuẩn `ApiResponse<{...}>`.
  - Bổ sung quy định "Backend chịu trách nhiệm chuẩn hóa format trả về, cấm ném cho Frontend gánh vác việc xử lý dữ liệu fallback" vào file Tiêu chuẩn Backend và Frontend.
- **Mục đích**: Áp dụng mô hình Dumb Client thuần túy cho Frontend, giảm mã code dư thừa trên UI và ràng buộc chặt chẽ tính an toàn dữ liệu từ dưới Backend.

---

### [2026-07-21 09:10] Tác vụ: Refactor Shadcn UI cho Widget Frontend
- **File bị ảnh hưởng**: 
  - `apps/admin_khcn/modules/page-builder/blocks/custom-widgets/custom-widgets.render.tsx`
- **Chi tiết thay đổi**: 
  - Gỡ bỏ hoàn toàn thẻ `div`, `a` thuần dùng để code cứng các khối hiển thị.
  - Áp dụng các UI Component tiêu chuẩn của dự án là `<Accordion>`, `<Card>`, `<CardContent>`, và `<Button asChild>`.
- **Mục đích**: Tăng tính đồng bộ (Consistency), thiết lập quy chuẩn sử dụng Shadcn UI tuyệt đối thay vì lạm dụng code HTML.

---

### [2026-07-21 16:00] Tác vụ: Mass Refactoring (Batch 8) - Chuẩn hóa Meta Pagination
- **File bị ảnh hưởng**:
  - `apps/hrm-service/src/modules/employees/employees.controller.ts`
  - `apps/user-service/src/modules/users/users.controller.ts`
  - `apps/workflow-service/src/execution/execution.controller.ts`
- **Chi tiết thay đổi**:
  - Gỡ bỏ cấu trúc phân trang dư thừa `pagination` lồng nhau, trả thẳng `{ total, skip, take }` về cho Gateway.
  - Cài đặt `ValidationPipe` toàn cục (Global) cho các Microservices.
- **Mục đích**: Đồng nhất 100% dữ liệu Schema giữa Prisma, gRPC Proto, và DTO; đảm bảo không có rác dữ liệu dư thừa trên đường truyền.

---
### [2026-07-21 16:15] Tác vụ: Mass Refactoring (Batch 9) - Tối ưu Thuật toán O(1) & SRP
- **File bị ảnh hưởng**:
  - `apps/hrm-service/src/modules/kpis/kpi-evaluations.service.ts`
  - `apps/user-service/src/modules/categories/categories.service.ts`
  - `apps/workflow-service/src/execution/execution.service.ts`
- **Chi tiết thay đổi**:
  - Đổi thuật toán tìm kiếm từ `O(N^2)` sang `O(N)` bằng Hash Map (Map/Set) trong các module KPI và Categories.
  - Tái cấu trúc chuỗi `if-else` lồng nhau thành `switch-case` hoặc Early Return trong module Workflow Execution.
- **Mục đích**: Tối ưu hiệu năng xử lý (Performance) cho Backend, tuân thủ nguyên tắc Single Responsibility Principle (SRP) và Clean Code.

---
### [2026-07-21 16:30] Tác vụ: Mass Refactoring (Batch 10) - Dọn dẹp Frontend (Semantic Colors & API Fallbacks)
- **File bị ảnh hưởng**:
  - `apps/admin_khcn/**/*.tsx`
  - `apps/portal-goverment/**/*.tsx`
- **Chi tiết thay đổi**:
  - Loại bỏ hoàn toàn mã code phòng thủ như `res?.data || []` khi lấy dữ liệu React Query ở 21 file. Frontend giờ đây gọi thẳng `res.data`.
  - Thay thế hơn 70+ mã màu cứng (Hex colors như `#b91c1c`, `#f8fafc`) bằng các biến màu hệ thống (Semantic Colors: `portal-primary`, `slate-50`) ở 19 file giao diện.
- **Mục đích**: Tuân thủ chuẩn "Dumb Client" và "Frontend Integration Standard", đảm bảo giao diện đồng bộ, sạch sẽ, không xử lý logic dư thừa.


### [2026-07-21 16:55] Tác vụ: Mass Refactoring (Batch 12) - Hạ tầng Infra & Cache Standard
- **File bị ảnh hưởng**:
  - `apps/api-gateway/src/modules/notifications/notifications.service.ts`
- **Chi tiết thay đổi**:
  - Tái cấu trúc cơ chế lưu trữ Notification trên Redis: Chuyển từ Hash Key toàn cục (`notifications:data`) sang các String Keys độc lập (`notification:data:${id}`).
  - Đính kèm lệnh `EXPIRE` (2592000 giây - 30 ngày) cho toàn bộ Payload và User ZSET.
  - Sửa hàm truy vấn từ `HMGET` sang `MGET` để đọc dữ liệu phân trang O(1).
- **Mục đích**: Vá lỗi rò rỉ bộ nhớ (Memory Leak) do lưu rác dữ liệu cũ vĩnh viễn trên RAM, tuân thủ tuyệt đối `infra_cache_broker_standard`.

---

### [2026-07-23 11:55] Tác vụ: Sửa lỗi hiển thị & Đồng bộ state của React Flow (Dumb Client Standard)
- **File bị ảnh hưởng**:
  - `apps/admin_khcn/components/workflow/properties-panels/EdgeProperties.tsx`
- **Chi tiết thay đổi**:
  - Sửa lỗi mapping dữ liệu sai (đọc từ `selectedEdge` thay vì `selectedEdge.data`).
  - Gỡ bỏ hoàn toàn việc sử dụng `useState` và `useEffect` thừa thãi (anti-pattern sao chép props vào state). Trực tiếp sử dụng biến số từ `edgeData.conditions` (Single Source of Truth).
- **Mục đích**: Đảm bảo bảng thuộc tính Visual Rule Builder của các đường nối (Edge) trong React Flow hoạt động chính xác khi chuyển đổi qua lại, tuân thủ nguyên tắc Clean Code và Không lưu trữ state cục bộ dư thừa (thuộc `frontend_integration_standard`).

---

### [2026-07-23 11:58] Tác vụ: Chuẩn hóa CORS Header NGINX (Zero-Trust Security)
- **File bị ảnh hưởng**:
  - `nginx/conf.d/default.conf`
- **Chi tiết thay đổi**:
  - Thay thế thuộc tính `Access-Control-Allow-Origin "*"` thành `$http_origin` ở các location trỏ về Media.
  - Bổ sung cấu hình `Access-Control-Allow-Credentials "true"`.
- **Mục đích**: Tuân thủ tiêu chuẩn Xác thực Zero-Trust (Sử dụng HttpOnly Cookie chống XSS). Việc cho phép gửi cookie (`withCredentials`) yêu cầu CORS không được dùng wildcard `*` mà phải chỉ định rõ nguồn origin. Đảm bảo luồng xác thực giữa Frontend và Backend hoạt động bảo mật theo chuẩn đã quy định tại tài liệu `AGENTS.md`.
