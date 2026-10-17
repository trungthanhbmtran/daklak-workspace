# HƯỚNG DẪN ĐỒNG BỘ KIẾN TRÚC HỆ THỐNG (ARCHITECTURE SYNCHRONIZATION GUIDELINES)

Tài liệu này quy định chi tiết quy trình, tiêu chuẩn và ma trận bắt buộc để AI Agents (Codex Orchestrator, Code 1, Code 2, Code 3) thực hiện **Đồng bộ hóa Kiến trúc Hệ thống** (`.agents/architecture/`) sau mỗi lần cập nhật, điều chỉnh mã nguồn.

---

## 1. Nguyên Tắc Cốt Lõi (Inviolable Principles)

1. **"Code Thay Đổi, Kiến Trúc Phải Đồng Bộ" (Code Changed, Architecture MUST Sync):**
   - Tài liệu kiến trúc tại `.agents/architecture/` là **Source of Truth tài liệu kỹ thuật duy nhất** của toàn bộ dự án.
   - Mã nguồn thực tế và tài liệu kiến trúc phải luôn luôn ở trạng thái **phản chiếu 1:1**. Bất kỳ sự lệch pha nào giữa code và kiến trúc đều bị coi là lỗi nghiêm trọng (Architecture Drift).
2. **Cửa ải Nghiệm thu Bắt buộc (Mandatory SDLC Gate):**
   - Cửa ải **"Đồng bộ Kiến trúc"** là cửa ải bắt buộc số 8 trong 8 Bộ ràng buộc kỹ thuật.
   - Nếu tác vụ có chỉnh sửa CSDL, API endpoint, gRPC method, RabbitMQ event, workflow hay routing mà **không cập nhật tài liệu kiến trúc tương ứng**, tác vụ đó **BỊ TỪ CHỐI NGHIỆM THU (GATE REJECTED)**.
3. **Triệt tiêu Ảo giác (Zero Assumptions & Anti-AI Hallucination):**
   - Chỉ cập nhật vào kiến trúc những thực thể, bảng, cột, method, endpoint **đã thực sự được viết và kiểm chứng trong mã nguồn**.
   - Tuyệt đối không mô tả phỏng đoán, không ghi các tính năng chưa có hoặc dự kiến tương lai vào các tài liệu kiến trúc hiện hành.

---

## 2. Ma Trận Kích Hoạt & Phân Định File Bắt Buộc Cập Nhật (Trigger Event Matrix)

Mỗi khi rà soát `git diff`, AI Agent đối chiếu ma trận dưới đây để xác định chính xác các file trong `.agents/architecture/` cần cập nhật:

| Hành động trong Mã Nguồn | Phạm vi file ảnh hưởng | File Kiến trúc BẮT BUỘC cập nhật | Nội dung chi tiết cần cập nhật |
|---|---|---|---|
| **Thêm / sửa bảng CSDL, quan hệ (Relations), enums** | `schema.prisma`, `migrations/` | • `service-map.md`<br>• `source-of-truth.md` | - Tên bảng mới, các cột khóa ngoại reference ID.<br>- Xác định Service độc quyền sở hữu (Source of Truth).<br>- Ghi chú cấm các service khác query trực tiếp. |
| **Thêm / sửa API Route, Controller, DTO Gateway** | `apps/api-gateway/src/modules/` | • `request-response-flow.md`<br>• `service-map.md` | - URL path, HTTP method, vai trò phân quyền (PBAC).<br>- Luồng chuyển tiếp gRPC tới Microservice.<br>- Cấu trúc Response Envelope chuẩn 5 trường (`success`, `data`, `meta`, `message`, `timestamp`). |
| **Thêm / sửa file `.proto`, gRPC method, Service contract** | `shared/protos/*.proto`, controllers gRPC | • `dependency-map.md`<br>• `service-map.md` | - Package proto, tên Service gRPC, RPC method mới.<br>- Sơ đồ quan hệ Client -> Service qua gRPC.<br>- Kiểu payload input/output (lưu ý string JSON cho object phức tạp). |
| **Thêm / sửa RabbitMQ Event, Queue, Message Bus** | `RabbitmqService`, `publishEvent`, consumers | • `dependency-map.md`<br>• `request-response-flow.md` | - Tên Event (`message.created`, `conversation.created`...).<br>- Tên Queue (`gateway_queue`, `chat_events_queue`...).<br>- Service gửi (Producer) và các Service nhận (Consumers). |
| **Thêm / sửa Quy trình duyệt, Trạng thái, Chuyển làn (BPMN)** | `workflow-service`, BPMN configs, transitions | • `workflow-map.md`<br>• `source-of-truth.md` | - Sơ đồ trạng thái (Workflow States), điều kiện chuyển bước.<br>- Trách nhiệm phân làn (Swimlanes: Lãnh đạo, Chuyên viên).<br>- Contract gRPC giao tiếp giữa domain service và `workflow-service`. |
| **Thêm / sửa Module, Phân hệ Frontend chính** | `apps/admin_khcn/`, `apps/portal-goverment/` | • `service-map.md`<br>• `request-response-flow.md` | - Tuyến route trang mới, các Sheet/Drawer chi tiết.<br>- Các Hook API tiêu thụ endpoint từ Gateway. |
| **Thêm / sửa Microservice mới hoặc cổng mạng (Port)** | `docker-compose.yml`, `main.ts`, configs | • `service-map.md`<br>• `dependency-map.md` | - Tên service, DB database name, Port HTTP/gRPC.<br>- Các dependency hạ tầng (MySQL, Redis, RabbitMQ, MinIO). |

---

## 3. Tiêu Chuẩn Chi Tiết Cho Từng File Kiến Trúc

### 3.1. File `.agents/architecture/service-map.md`
- **Mục đích:** Danh bạ toàn bộ các Services, cơ sở dữ liệu chủ quản, các module con và phạm vi nghiệp vụ.
- **Yêu cầu khi cập nhật:**
  * Giữ đúng cấu trúc 4 phân nhóm: (1) Core Services, (2) Business Domain Services, (3) Communication & Integration Services, (4) Frontend Applications.
  * Mỗi service phải ghi rõ: Tên service, Database name (`DB: ...`), Chức năng cốt lõi, Danh sách thực thể quản lý (`Quản lý: ...`).

### 3.2. File `.agents/architecture/source-of-truth.md`
- **Mục đích:** Xác định thẩm quyền dữ liệu tối cao, chống trùng lặp thực thể giữa các microservices.
- **Yêu cầu khi cập nhật:**
  * Khẳng định rõ ràng Service nào là chủ quản độc quyền cho thực thể mới.
  * Ghi rõ các service khác khi tương tác chỉ được phép lưu `Reference ID` (vd: `userId`, `taskId`, `conversationId`), tuyệt đối không copy nguyên bảng hay tạo bảng giả mạo.

### 3.3. File `.agents/architecture/dependency-map.md`
- **Mục đích:** Bản đồ phụ thuộc tĩnh và động giữa các thành phần hệ thống.
- **Yêu cầu khi cập nhật:**
  * Sơ đồ phụ thuộc qua gRPC: Service A gọi RPC nào của Service B qua port nào.
  * Sơ đồ phụ thuộc qua Message Broker (RabbitMQ): Danh sách queues, prefetch count, các routing key / events trao đổi bất đồng bộ.
  * Phụ thuộc hạ tầng: Redis Cache, Redis Pub/Sub, MinIO Storage, MariaDB/MySQL.

### 3.4. File `.agents/architecture/request-response-flow.md`
- **Mục đích:** Luồng dữ liệu End-to-End từ Client đến Cơ sở dữ liệu và phản hồi ngược lại.
- **Yêu cầu khi cập nhật:**
  * Mô tả chu trình: Client Request -> API Gateway (Auth Guard, PBAC Scoping) -> Transform Interceptor -> gRPC Delegation -> Microservice Controller -> Domain Service -> Prisma DB.
  * Khẳng định cấu trúc Response Envelope 5 trường chuẩn `{ success, data, meta, message, timestamp }` và nguyên tắc dữ liệu render nằm trong `data` (1 cấp duy nhất), quyền và phân trang nằm trong `meta`.

### 3.5. File `.agents/architecture/workflow-map.md`
- **Mục đích:** Trung tâm mô hình hóa các quy trình nghiệp vụ (State Machines & BPMN).
- **Yêu cầu khi cập nhật:**
  * Cập nhật sơ đồ Mermaid biểu diễn chu trình trạng thái (khởi tạo, xử lý, thẩm định, hoàn thành, trả lại).
  * Mô tả cách thức các domain services (`hrm-service`, `document-service`) gọi RPC sang `workflow-service` để xin phép chuyển trạng thái và cập nhật tiến trình.

---

## 4. Quy Trình 4 Bước Đồng Bộ Kiến Trúc Cho AI Agent (4-Step Sync Protocol)

Trước khi hoàn thành tác vụ, AI Agent BẮT BUỘC thực hiện tuần tự 4 bước sau:

```
[Bước 1: Rà soát git diff]
       │
       ▼
[Bước 2: Đối chiếu Trigger Matrix]
       │
       ▼
[Bước 3: Cập nhật các file .agents/architecture/]
       │
       ▼
[Bước 4: Ghi nhận Báo cáo Thực thi & Execution Log]
```

### Chi tiết từng bước:
1. **Bước 1 - Rà soát diff (`git diff --name-only`):**
   - Chạy lệnh kiểm tra danh sách file đã thay đổi trong commit/task hiện tại.
2. **Bước 2 - Đối chiếu Trigger Matrix:**
   - Xác định xem có thay đổi nào liên quan đến Database, API, gRPC, RabbitMQ, Workflow hay Service mới không.
3. **Bước 3 - Cập nhật file kiến trúc thực tế:**
   - Mở file tương ứng trong `.agents/architecture/`.
   - Dùng công cụ `replace_file_content` hoặc `write_to_file` để bổ sung mô tả chính xác.
   - Đảm bảo mã hóa UTF-8 không BOM.
4. **Bước 4 - Ghi nhận vào Báo cáo & Nhật ký:**
   - Trong Báo cáo Thực thi, mục `Bước 7 - Đồng bộ Kiến trúc`: Liệt kê chính xác tên các file kiến trúc đã cập nhật và tóm tắt nội dung thay đổi.
   - Ghi lại bằng chứng vào file nhật ký lane tương ứng (`.agents/execution_logs/code1.md`, `code2.md`, `code3.md`).

---

## 5. Bảng Tự Kiểm Tra Nhanh (Pre-Completion Checklist)

- [ ] Tôi đã chạy `git diff --name-only` để rà soát toàn bộ thay đổi mã nguồn?
- [ ] Tôi đã kiểm tra xem có thay đổi CSDL, gRPC, API, Event RabbitMQ, hoặc Workflow không?
- [ ] Tôi đã cập nhật đầy đủ các file tương ứng trong `.agents/architecture/` (`service-map.md`, `source-of-truth.md`, `dependency-map.md`, `request-response-flow.md`, `workflow-map.md`)?
- [ ] Tên bảng, tên cột, tên RPC method, tên queue trong tài liệu kiến trúc khớp 100% với mã nguồn thực tế (Zero Hallucination)?
- [ ] File tài liệu kiến trúc được lưu đúng chuẩn UTF-8 không BOM?
- [ ] Báo cáo nghiệm thu và Execution Log đã ghi nhận rõ ràng mục Đồng bộ Kiến trúc?
