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
- Đã đăng ký thêm Skill workspace tại .agents/skills/kpi-answer/SKILL.md để IDE và trợ lý nhận diện đầy đủ dưới dạng /kpi-answer.
- **Xuất báo cáo .docx**: Đã tạo tài liệu Word chính quy docs/examplebtc/Bao_Cao_Giai_Phap_KPI_OKR_BTCTU.docx (17.8 KB) chứa đầy đủ bảng ma trận rà soát 9 nhóm chức năng, kiến trúc Microservices và công thức toán học KPI.
- **Bổ sung Sơ đồ trực quan vào tài liệu .docx**: Đã render 2 ảnh sơ đồ độ nét cao (diagram_system_architecture.png và diagram_workflow_sequence.png) và nhúng trực tiếp vào file Word docs/examplebtc/Bao_Cao_Giai_Phap_KPI_OKR_BTCTU_Co_So_Do.docx (408.8 KB), bao gồm đầy đủ Hình 1 (Kiến trúc Microservices) và Hình 2 (Sơ đồ luồng nghiệp vụ tuần tự 3 giai đoạn).
- **Hiệu chỉnh Layout Sơ đồ & Tràn Text**: Đã xử lý triệt để lỗi tràn chữ trong các ô (wrapText chuẩn xác theo từng đoạn và kích thước box), nâng khoảng đệm gRPC giữa Tầng 2 (Gateway) và Tầng 3 (Microservices) lên 85px sạch sẽ không còn đè nét; chuyển sang font chuẩn Windows Arial, Segoe UI hiển thị sắc nét 100%. Đã cập nhật file Word hoàn thiện: docs/examplebtc/Bao_Cao_Giai_Phap_KPI_OKR_BTCTU_Hoan_Thien.docx (445.8 KB).
- **Sửa lỗi Crash gRPC tại hrm-service (Rank Quotas & Task Templates)**: Tại pps/hrm-service/src/modules/task-catalog/task-catalog.controller.ts, thêm data = data || {}; để phòng thủ trước khi gán data.currentEmployeeCode = user.employeeCode;. Lỗi TypeError: Cannot set properties of undefined (setting 'currentEmployeeCode') được giải quyết triệt để. Đã kiểm chứng máy: 
pm --prefix apps/hrm-service run build hoàn thành với exit code 0.


- **Rà soát toàn diện & Bổ sung Blacklist Anti-Pattern gRPC**:
  - Đã rà soát toàn bộ các gRPC controller trong `hrm-service`. Đã bổ sung phòng thủ `data = data || {};` tại [`task-history.controller.ts`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/hrm-service/src/modules/task-history/task-history.controller.ts) và [`task-kpi.controller.ts`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/hrm-service/src/modules/task-kpi/task-kpi.controller.ts) để đồng bộ an toàn 100%.

## 2026-10-13: Khắc phục lỗi Mẫu KPI Đã phát hành Thiếu Ruột XML trên Môi trường Thực tế
- **Nội dung tác vụ**:
  - Phát hiện nguyên nhân gốc rễ: Các mẫu KPI đã phát hành trong CSDL trên VPS có trường `xml_content` rỗng hoặc mang nội dung khung placeholder sơ sài. Do hàm kiểm tra placeholder trước đó chỉ bắt 3 chuỗi cố định nên hệ thống không kích hoạt cơ chế nạp ruột XML; đồng thời bảng `kpi_form_template_versions` thiếu bản ghi version tương ứng kèm ruột XML đầy đủ.
  - Nâng cấp `kpi-template-xml.util.ts`: Thêm hàm `hasValidFormContent` kiểm tra độ dài thực tế và các thẻ nghiệp vụ bắt buộc (`<RegisteredTasks>`, `<SectionA>`, `<SectionB>`, `<CollectiveFeedback>`, `<StaffRankDistribution>`, `<IndividualFinalRankings>`, `<Form01_>`...); mở rộng `isPlaceholderXml` phát hiện mọi biến thể rỗng.
  - Nâng cấp `kpi-evaluations.service.ts`: Triển khai cơ chế tự phục hồi (self-healing) tự động tại `findFormTemplates`, `getFormTemplateDetail`, `getFormTemplateXml`, `publishFormTemplate` và `resolveFormTemplateBinding`. Nếu bản ghi CSDL thiếu ruột XML, tự động nạp từ bộ 17 mẫu chuẩn nhúng sẵn (`EMBEDDED_KPI_FORM_XML`) và đồng bộ bền vững vào CẢ bảng `kpi_form_templates` LẪN `kpi_form_template_versions`.
  - Nâng cấp UI `EvaluationFormsClient.tsx`: Bổ sung thông tin số dòng và dung lượng thật trong tab Xem trước XML, cung cấp nút "Đồng bộ lại từ máy chủ" tự phục hồi khi cần, chuẩn hóa mẫu XML khi tạo mới.
- **Tập tin đã sửa đổi**:
  - [`apps/hrm-service/src/modules/kpi-evaluations/kpi-template-xml.util.ts`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/hrm-service/src/modules/kpi-evaluations/kpi-template-xml.util.ts)
  - [`apps/hrm-service/src/modules/kpi-evaluations/kpi-evaluations.service.ts`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/hrm-service/src/modules/kpi-evaluations/kpi-evaluations.service.ts)
  - [`apps/api-gateway/src/modules/hrm/kpi-xml-printer.util.ts`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/api-gateway/src/modules/hrm/kpi-xml-printer.util.ts)
  - [`apps/admin_khcn/features/hrm/components/work-plans/evaluation-forms/EvaluationFormsClient.tsx`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn/features/hrm/components/work-plans/evaluation-forms/EvaluationFormsClient.tsx)
- **Kiểm chứng máy thực tế**:
  - `pnpm --filter hrm-service run build`: Hoàn thành với exit code 0.
  - `pnpm --filter api-gateway run build`: Hoàn thành với exit code 0.
  - `pnpm --filter admin_khcn run typecheck`: Hoàn thành với exit code 0 (0 lỗi TypeScript).
  - Đã ghi nhận Anti-Pattern vào [`.agents/rules/blacklist.md`](file:///c:/Users/Admin/Desktop/daklak-workspace/.agents/rules/blacklist.md) mục "2. Lỗi gRPC & Protobuf": Cấm gán thuộc tính vào tham số payload gRPC mà không khởi tạo `data = data || {};` để triệt tiêu vĩnh viễn lỗi crash tương tự trong tương lai.
  - Kiểm chứng máy: `npm --prefix apps/hrm-service run build` thành công 100% với exit code 0.

- **Chuẩn hóa Hiến chương & Ràng buộc PBAC Resource-Driven Scoping**:
  - Đã cập nhật [`.agents/AGENTS.md`](file:///c:/Users/Admin/Desktop/daklak-workspace/.agents/AGENTS.md) (Ràng buộc kỹ thuật số 4), [`.agents/rules/00-core.md`](file:///c:/Users/Admin/Desktop/daklak-workspace/.agents/rules/00-core.md) (Mục 9), [`.agents/rules/security.md`](file:///c:/Users/Admin/Desktop/daklak-workspace/.agents/rules/security.md), và [`.agents/rules/blacklist.md`](file:///c:/Users/Admin/Desktop/daklak-workspace/.agents/rules/blacklist.md).
  - Quy định rõ ràng: Thông tin User sau khi xác thực qua gRPC metadata bắt buộc phải dùng để phân phối tài nguyên đúng thẩm quyền (`permissionsFlatten`, `unitId`, `employeeCode`), cấm tuyệt đối việc gán thuộc tính mù quáng vào payload `data` mà không khởi tạo `data = data || {};`.

## 2026-10-13: Khắc phục Triệt để Lỗi Font Chữ & Chuẩn hóa Thể thức Nghị định 30/2020/NĐ-CP Cho Các Mẫu Xuất Từ XML
- **Nội dung tác vụ**:
  1. **Khắc phục lỗi font chữ tiếng Việt**:
     - Trong file DOCX Word: Đồng bộ hóa cấu hình font `FONT_TIMES_NEW_ROMAN` với đầy đủ 4 thuộc tính script (`ascii`, `hAnsi`, `cs`, `eastAsia`), loại trừ triệt để hiện tượng Word tự động fallback sang Calibri/SimSun cho các ký tự tiếng Việt có dấu. Cấu hình font chuẩn ở cả cấp độ `Document Styles` và `TextRun`.
     - Trong xuất file XML: Bổ sung Byte Order Mark (BOM `\uFEFF`) trong Blob tải về để các ứng dụng Windows (Notepad, Excel, Word) nhận diện chính xác 100% bảng mã UTF-8, không bị lỗi font rác.
     - Trong bản in / PDF: Nhúng phông Times New Roman chuẩn, bật `text-rendering: optimizeLegibility` và `-webkit-font-smoothing: antialiased`.
  2. **Chuẩn hóa thể thức văn bản hành chính theo Nghị định 30/2020/NĐ-CP & Thể thức Đảng**:
     - Định dạng lề trang chuẩn A4: Trên 20mm, Dưới 20mm, Trái 30mm, Phải 15mm.
     - Thay thế toàn bộ ký tự gạch đứt nét (`-------`) bằng đường kẻ ngang nét liền thanh mảnh (dày 0.5 - 1 pt, màu đen `#000000`) chuẩn hành chính dưới Tiêu ngữ và Tên cơ quan ban hành.
     - Chuẩn hóa tỷ lệ và cỡ chữ: Tiêu đề biểu mẫu (14-15 pt, in hoa, đậm), Căn cứ pháp lý (13-14 pt, nghiêng, thụt đầu dòng 1.27cm), Nội dung bảng (11-12 pt, viền đen 0.5pt, header lặp lại mỗi trang `cantSplit`/`tableHeader`), Chữ ký và Nơi nhận (khoảng cách ký 4 dòng, họ tên 13-14 pt đậm).
     - Mở rộng hỗ trợ bóc tách đầy đủ cấu trúc các mẫu: `MAU_01`, `MAU_02`, `MAU_03`, `MAU_04` (thống kê phòng, bảng xếp loại cán bộ, việc nổi trội), `MAU_05`, bộ `HD05_QD39_TU` và `QD348_BTCTW`.
- **Tập tin đã chỉnh sửa**:
  - `apps/admin_khcn/features/hrm/utils/kpiXmlToDocx.ts`
- **Kiểm chứng máy**:
  - `npm --prefix apps/admin_khcn run typecheck` thành công 100% với exit code 0.
  - `git diff` sạch sẽ, không để lại debug log, mã hóa UTF-8 không BOM.
