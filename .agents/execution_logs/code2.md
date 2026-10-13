# Code 2 Execution Log

## 2026-10-13: Căn chỉnh tọa độ & Luồng kết nối Sơ đồ Quy trình Workflow Service
- **Nội dung tác vụ**: Điều chỉnh tọa độ vị trí các node và các cổng kết nối (handles) trong sơ đồ quy trình của `workflow-service` (`WF_BTCTU_QUAN_LY_CONG_VIEC` và `WF_BTCTU_DANH_GIA_KPI`) để phân biệt rõ ràng luồng nghiệp vụ thuận/nghịch và chống đè chéo đường nối.
- **Tập tin đã sửa đổi**:
  - `apps/workflow-service/prisma/seed-btctu.ts`: Căn chỉnh tọa độ x các bước thẩm quyền Lãnh đạo Ban (`task_ldb_approve` x: 1900, `gateway_ldb_check` x: 2220, `task_auto_kpi` x: 2520, `end_completed` x: 2820, `end_rejected` x: 2220 y: 70), nối đúng đích `e_ldb_gw_eval` sang `gateway_ldb_check`, gán các cổng `source-bottom`/`target-top`/`target-bottom` cho các nhánh rẽ và hoàn trả.
- **Kiểm chứng máy**:
  - Đã chạy cập nhật trực tiếp vào cơ sở dữ liệu qua `update_diagram_positions.ts`.
  - Biên dịch kiểm thử thành công: `npm run build` của `workflow-service` hoàn thành với exit code 0.
## 2026-10-13: Chuẩn hóa Kiến trúc & Quy tắc Hệ thống (Architecture & Rules Source of Truth)
- **Nội dung tác vụ**: Cập nhật toàn bộ tài liệu kiến trúc và quy tắc phân ranh giới dịch vụ (`.agents/architecture/`, `.agents/rules/`, `.agents/AGENTS.md`) để làm rõ Source of Truth theo đúng yêu cầu:
  1. `user-service`: Là cơ quan chủ quản duy nhất của Cấu trúc Vị trí việc làm (VTVL - `JobTitle`), Đề án định biên (`OrganizationStaffing`), Suất biên chế (`StaffingSlot`), cùng toàn bộ phân công nghiệp vụ theo dõi (`StaffingSlotDomain` - lĩnh vực, `StaffingSlotGeographicArea` - địa bàn, `StaffingSlotMonitoredUnit` - phòng ban/đơn vị theo dõi). Nghiêm cấm các service khác (như `hrm-service`) tự ý tạo bảng hay xây dựng khung rời rạc.
  2. `workflow-service`: Nơi lưu trữ, cấu hình và mô tả toàn bộ quy trình nghiệp vụ hệ thống (BPMN, transitions, swimlanes, execution state).
  3. `api-gateway` (API Manager): Quản lý các nguồn kết nối chính bao gồm danh mục API, xây dựng API nội bộ và các API liên thông hệ thống (LGSP, DVC).
  4. `report-service`: Nơi thiết kế báo cáo hệ thống, xây dựng các Dashboard phân quyền sử dụng báo cáo cho từng cá nhân, đơn vị; là trung tâm giám sát tiến độ và hiệu suất.
- **Tập tin đã cập nhật**:
  - `.agents/AGENTS.md`
  - `.agents/rules/source-of-truth.md`
  - `.agents/rules/services/user-service.md`
  - `.agents/rules/services/workflow-service.md`
  - `.agents/rules/services/api-gateway.md`
  - `.agents/rules/services/report-service.md`
  - `.agents/architecture/service-map.md`
  - `.agents/architecture/source-of-truth.md`
- **Kiểm chứng máy**: Kiểm tra cấu trúc schema thực tế tại `apps/user-service/prisma/schema/organization.prisma` khớp 100% với mô tả; đảm bảo mã hóa UTF-8 không BOM trên toàn bộ tài liệu.
## 2026-10-13: Thiết lập Cửa ải Kiến trúc (Architecture Pre-flight), Chống Trùng lặp & Triệt tiêu Ảo giác AI (Anti-Hallucination)
- **Nội dung tác vụ**: Thiết lập các quy tắc bắt buộc trong toàn bộ hệ sinh thái Agent (`AGENTS.md`, `.agents/AGENTS.md`, skills, commands, rules, checklists) để:
  1. Yêu cầu Agent BẮT BUỘC hiểu sâu sắc cấu trúc hệ thống và Source of Truth trước khi bắt đầu bất kỳ tác vụ nào.
  2. Tuyệt đối chống trùng lặp chức năng, entity, bảng CSDL và DTO giữa các microservices.
  3. Triệt tiêu ảo giác AI (Zero Assumptions): Cấm tự suy đoán hoặc bịa đặt tên bảng, tên cột, endpoint, proto method nếu chưa kiểm chứng trực tiếp từ file mã nguồn thực tế trong repo (`schema.prisma`, `.proto`, controllers, types).
  4. Chuẩn hóa quy trình phát triển phần mềm thành 6 bước (Strict SDLC Gates).
- **Tập tin đã cập nhật**:
  - `AGENTS.md` (root)
  - `.agents/AGENTS.md`
  - `.agents/rules/00-core.md`
  - `.agents/rules/architecture.md`
  - `.agents/skills/code1/SKILL.md`
  - `.agents/skills/code2/SKILL.md`
  - `.agents/commands/code1.md`
  - `.agents/commands/code2.md`
  - `.agents/checklists/pre-implementation.md`
  - `.agents/checklists/architecture-review.md`
## 2026-10-13: Thiết lập Command kpi-answer & Rà soát 9 Nhóm Chức năng KPI/OKR
- **Nội dung tác vụ**:
  1. Xây dựng command `.agents/commands/kpi-answer.md` cung cấp bài trả lời toàn diện cho câu hỏi xây dựng phần mềm quản lý, đánh giá kết quả thực hiện nhiệm vụ bằng KPI/OKR.
  2. Rà soát chi tiết 9 nhóm chức năng tối thiểu theo đề bài đối chiếu trực tiếp với mã nguồn thực tế của hệ sinh thái (`user-service`, `hrm-service`, `workflow-service`, `report-service`, `document-service`, `admin_khcn`).
  3. Xây dựng 2 sơ đồ trực quan Mermaid: Sơ đồ kiến trúc hệ thống Microservices & Sơ đồ luồng đánh giá KPI/OKR tuần tự (Sequence Diagram).
- **Tập tin đã tạo/sửa đổi**:
  - `.agents/commands/kpi-answer.md` (Tạo mới - UTF-8 không BOM)
  - `.agents/execution_logs/code2.md` (Cập nhật nhật ký)
- **Kiểm chứng máy**: Kiểm tra encoding UTF-8 không BOM thành công (`No BOM (Clean UTF-8)`). Toàn bộ 9/9 nhóm tính năng đều được đối chiếu chính xác với thực thể CSDL, gRPC proto và components UI thực tế trong repo.
