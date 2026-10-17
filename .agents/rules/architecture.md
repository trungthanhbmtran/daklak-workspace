# Architecture Rules

## 1. Nguyên tắc chung & Source of Truth
- Project sử dụng kiến trúc Microservices.
- Giao tiếp giữa các service thông qua: gRPC, RabbitMQ (Events), HTTP (nếu cần thiết, qua Gateway).
- Shared protobuf tại `shared/protos` là source of truth cho contract.
- **Bắt buộc tra cứu Source of Truth trước khi code:** Tuyệt đối không duplicate entity/bảng CSDL nếu đã thuộc về service chủ quản (`user-service` sở hữu VTVL, định biên, phân công; `workflow-service` sở hữu quy trình; `api-gateway` sở hữu kết nối/API liên thông; `report-service` sở hữu báo cáo/dashboard).
- **Triệt tiêu ảo giác AI (Anti-AI Hallucination):** Tuyệt đối không giả định cấu trúc bảng, tên cột, API route, protobuf method. Bắt buộc đọc file mã nguồn thực tế trước khi implement.

## 2. API Gateway
- Chịu trách nhiệm: Authentication, Authorization, Request adaptation, routing gRPC/API tới Microservice.
- KHÔNG đưa business logic (tính KPI, thực thi rule workflow, validate trùng lặp) vào Gateway.
- KHÔNG truy cập database của service khác từ Gateway.

## 3. Không Over-engineer
- Giữ mọi thứ đơn giản, tường minh (explicit).
- Không tự tạo framework mới (abstract factory, generic repository, v.v.) nếu repository chưa có.

## 4. Chuẩn hóa Data Transfer Object (DTO) & Validation
- Mọi API endpoint nhận dữ liệu từ Client **bắt buộc** phải có Class DTO kèm các decorator của `class-validator` (vd: `@IsString()`, `@IsOptional()`). 
- Không dùng kiểu `any` hoặc parse manual từ body.
- Hệ thống áp dụng chung một `PaginationDto` chuẩn cho các request GET danh sách (bao gồm `page`, `pageSize`, `search`, `sortBy`).

## 5. Type Safety & Cross-boundary Types
- Cấu trúc kiểu dữ liệu (Types/Interfaces) cho các Response / Payload phải được chia sẻ từ Backend xuống Frontend thông qua thư mục `shared/types` hoặc sinh tự động (auto-generated) từ code gốc.
- Frontend không được tự ý tái định nghĩa lại các kiểu dữ liệu của Backend bằng tay (hoặc lạm dụng `any`) để đảm bảo không gãy cấu trúc khi Backend thay đổi trường dữ liệu.

## 6. Chuẩn hóa Response Envelope & Phân định Dữ liệu (Data vs Meta Segregation)
- **Chuẩn 5 trường duy nhất của API Gateway:** Mọi response JSON từ API Gateway tuân thủ cấu trúc `{ success, data, meta, message, timestamp }`.
- **Nguyên tắc "Data luôn nằm trong Data" (Single-Level Flattened Data):**
  - Controllers của Microservices và Gateway chỉ trả về entity hoặc mảng entities thuần túy.
  - CẤM TUYỆT ĐỐI tự ý gói bọc lồng đúp `{ success: true, data: { data: ... } }`.
  - `TransformInterceptor` tại Gateway là chốt chặn đảm bảo phẳng hóa mọi tầng bọc đúp.
- **Phân định rõ ràng trách nhiệm từng trường dữ liệu:**
  - `data`: CHỈ chứa dữ liệu thực thể nghiệp vụ dùng để render. Tuyệt đối không nhồi nhét quyền hạn, phân trang vào trong ruột `data`.
  - `meta`: Nơi tập trung toàn bộ siêu dữ liệu phụ trợ:
    * `meta.pagination`: Chứa thông tin phân trang chuẩn hóa (`total`, `page`, `pageSize`, `totalPages`).
    * `meta.actions` / `meta.permissions`: Chứa cờ quyền hành động trên tài nguyên (`canEdit`, `canDelete`, `canApprove`...).
  - `success`: Boolean biểu thị trạng thái request (`true` / `false`).
  - `message`: Chuỗi thông báo người dùng (thông báo thành công hoặc cảnh báo).
- **Phía Client:** Dữ liệu để render chỉ cần đúng 1 cấp là lấy được (`res.data` hoặc biến unwrap từ hook), không bao giờ phải viết `res.data.data` hoặc chọc nhiều cấp.

## 7. Ràng buộc Bắt buộc: Đồng bộ Kiến trúc Hệ thống (Mandatory Architecture Synchronization Gate)
- **Nguyên tắc bất biến:** Tài liệu kiến trúc tại `.agents/architecture/` (`service-map.md`, `source-of-truth.md`, `dependency-map.md`, `request-response-flow.md`, `workflow-map.md`) là **Source of Truth tài liệu kỹ thuật duy nhất**. Bất kỳ chỉnh sửa nào trong code làm thay đổi cấu trúc hệ thống BẮT BUỘC phải được cập nhật đồng bộ ngay vào các file kiến trúc tương ứng.
- **Trường hợp bắt buộc cập nhật (Trigger Events):**
  1. **Thay đổi CSDL / Model:** Thêm/sửa bảng, quan hệ, khóa ngoại reference ID trong Prisma -> Cập nhật `service-map.md` và `source-of-truth.md`.
  2. **Thay đổi API Gateway:** Thêm/sửa route path, method, DTO, phân quyền PBAC -> Cập nhật `request-response-flow.md` và `service-map.md`.
  3. **Thay đổi gRPC / Protobuf:** Thêm/sửa RPC method, message definition -> Cập nhật `dependency-map.md` và `service-map.md`.
  4. **Thay đổi RabbitMQ:** Thêm/sửa event name, queue, publisher/consumer -> Cập nhật `dependency-map.md` và `request-response-flow.md`.
  5. **Thay đổi Quy trình (Workflow):** Thêm/sửa states, transitions, swimlanes -> Cập nhật `workflow-map.md` và `source-of-truth.md`.
  6. **Thay đổi Frontend Feature:** Thêm tuyến trang mới, parallel route `@sheet` -> Cập nhật `service-map.md`.
- **Cửa ải Kiểm soát (Gate Enforcement):** Trước khi đóng task, AI Agent BẮT BUỘC chạy `git diff --name-only` và đối chiếu [`.agents/architecture/SYNC-GUIDELINES.md`](../architecture/SYNC-GUIDELINES.md). Mọi PR/Task có thay đổi mã nguồn mà không cập nhật tài liệu kiến trúc tương ứng sẽ bị **TỪ CHỐI NGHIỆM THU (GATE REJECTED)**.


