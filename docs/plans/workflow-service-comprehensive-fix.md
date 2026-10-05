# Kế hoạch Khắc phục và Tái cấu trúc Toàn diện Workflow Service & UI

**Trạng thái:** Đề xuất (Draft)
**Mục tiêu:** Sửa lỗi mất dữ liệu gRPC, bổ sung cơ chế cách ly dữ liệu đa người thuê (PBAC Tenant Isolation), chuẩn hóa giao tiếp Event-Driven (Transactional Outbox) và hoàn thiện giao diện No-Code Workflow.

---

## Technical Context & Vấn đề hiện tại
1. **Lỗi truyền tải dữ liệu (gRPC Struct Serialization):**
   - **Vấn đề:** Hiện tại `definition` (sơ đồ workflow) chứa `nodes` và `edges` được truyền qua gRPC bằng kiểu `google.protobuf.Struct`. Quá trình chuyển đổi này ở NestJS thường làm mất các thuộc tính lồng nhau (nested fields) như `data`, dẫn đến lỗi hiển thị hoặc trống trơn trên Frontend (React Flow crash).
   - **Giải pháp:** Cập nhật file `.proto` để truyền toàn bộ `graph` dưới dạng chuỗi `string definitionJson`, sau đó Frontend/API Gateway tự `JSON.parse()`.
2. **Thiếu cơ chế cách ly Tenant (PBAC Isolation):**
   - **Vấn đề:** Table `process_definitions` hiện đang lưu dùng chung (global) cho toàn hệ thống. Hàm `listProcesses` không lọc theo `organizationId`, dẫn đến nguy cơ lộ dữ liệu quy trình giữa các đơn vị.
   - **Giải pháp:** Thêm trường `organizationId` vào schema, và ép buộc truyền context từ `api-gateway` (lấy từ JWT token) xuống `workflow-service` qua gRPC.
3. **Chưa tuân thủ Event-Driven (Outbox Pattern):**
   - **Vấn đề:** Các hành động như `SubmitAction` hoặc `StartWorkflow` cần lưu trạng thái qua Transactional Outbox thay vì chỉ thay đổi DB cục bộ (theo quy định tại `AGENTS.md`).
4. **Giao diện No-Code chưa hoàn thiện:**
   - **Vấn đề:** Các Node rẽ nhánh (Gateway) và Giao việc (User Task) vẫn chỉ đang nhập liệu JSON thô, khó sử dụng cho người dùng cuối.

---

## Lộ trình Triển khai (Phases)

### Phase 1: Chuẩn hóa Hợp đồng gRPC & Schema (Backend)
- [ ] Cập nhật `apps/workflow-service/prisma/schema/main.prisma`: Thêm `organizationId`, `createdBy` vào `ProcessDefinition`. Cập nhật index cho truy vấn.
- [ ] Sửa file `shared/protos/workflow/workflow.proto`: Thay đổi trường `WorkflowDefinition definition = 10;` thành `string definitionJson = 10;` để chống mất dữ liệu nested. Biên dịch lại proto.
- [ ] Cập nhật `grpc.controller.ts` và `definition.service.ts` trong `workflow-service` để serialize/deserialize JSON và filter/kiểm tra quyền truy cập theo `organizationId` (PBAC).
- [ ] Cập nhật `workflow.controller.ts` trong `api-gateway` để truyền `req.user.organizationId` vào các call gRPC tương ứng.
- [ ] Tạo file migration (Prisma migrate dev).

### Phase 2: Áp dụng Transactional Outbox cho Execution (Backend)
- [ ] Cập nhật module `execution` (`SubmitAction`, `StartWorkflow`): Mọi thay đổi trạng thái instance phải được đóng gói vào bảng `outbox_events` (nằm trong `process_instances` hoặc bảng riêng `outbox_events` hiện có của schema).
- [ ] Đảm bảo cơ chế bảo vệ Idempotency (lệnh chạy 1 lần) cho việc `resume` workflow.

### Phase 3: Đồng bộ Frontend & Validation (UI)
- [ ] Cập nhật `useWorkflowData.ts`: Khôi phục sơ đồ từ `definitionJson` thay vì object thô.
- [ ] Hoàn thiện **Visual Rule Builder** cho Gateway node (Phase 2 cũ): Xây dựng giao diện kéo thả để thiết lập điều kiện (`Variables.isApproved === true`) thay vì gõ code.
- [ ] Hoàn thiện **Smart Assignment** cho UserTask node (Phase 3 cũ): Giao diện chọn Role, Phòng ban (tích hợp API `/users/roles`).
- [ ] Chặn nút **Publish/Lưu** nếu có UserTask chưa được gán người xử lý hoặc Gateway không có nhánh mặc định. Cảnh báo đỏ.

---

## Acceptance Criteria (Tiêu chí Nghiệm thu)
- Workflow editor không bị trắng xóa hoặc báo `Unassigned` do mất dữ liệu `data` từ gRPC.
- Nhân viên/Quản trị của Tổ chức A không nhìn thấy Workflow Definition của Tổ chức B.
- Có thể tạo quy trình, cấu hình tự động (No-Code) và gán phòng ban bằng giao diện đồ họa.
- Không có lỗi type, lint (chạy qua lệnh build CI nội bộ thành công).

---

## Constitution Check (Đối chiếu AGENTS.md)
- Tuân thủ Rule 4: *Service data sovereignty* - API Gateway không gọi DB, chỉ truyền JWT orgId.
- Tuân thủ Rule 4: *Safe distributed changes* - Sử dụng Transactional Outbox.
- Tuân thủ quy định PBAC: Phân quyền rành mạch theo `organizationId`.
