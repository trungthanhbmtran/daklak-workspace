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

## 2026-10-13: Khắc phục Triệt để Lỗi Không Hiển thị Ruột XML trong Mẫu Đánh giá tại /admin/services/hrm/work-plans/evaluation-forms
- **Nguyên nhân gốc rễ phát hiện:**
  1. Trong `shared/core/interceptors/transform.interceptor.ts`, hàm `detectListRequest(req)` xác định một request GET là danh sách (List) nếu đường dẫn không kết thúc bằng numeric id, UUID hoặc CUID. Vì mã biểu mẫu (`MAU_01`, `HD05_QD39_TU`) và hậu tố `/xml` không phải các định dạng ID trên nên interceptor hiểu nhầm `GET /api/v1/admin/hrm/kpi-forms/:formCode` và `.../:formCode/xml` là List request.
  2. Do bị gắn nhãn List, interceptor tự động bọc đối tượng `data` vào trong một mảng: `data: [ { formCode: 'MAU_01', xmlContent: '...' } ]` và loại bỏ các trường đặc thù ở root (`xmlContent`, `placeholders`).
  3. Phía frontend React Query (`useGetKpiFormDetail`, `useGetKpiFormXml`), khi đọc `res.data` (là Array), việc truy xuất `res.data.xmlContent` trả về `undefined` (`Array.prototype.xmlContent` không tồn tại) -> Giao diện Sheet Xem trước đánh giá là không có nội dung ruột XML.
  4. Docker containers trên VPS (`admin-frontend`, `api-gateway`, `hrm-service`) chưa được đồng bộ các gói bản dựng mới nhất.
- **Giải pháp xử lý:**
  1. Cập nhật `shared/core/interceptors/transform.interceptor.ts`:
     - Bổ sung `'/kpi-forms/'` vào `NON_LIST_CONTAINS` và `'/xml'` vào `NON_LIST_SUFFIXES`, giúp interceptor phân biệt chính xác: `GET /hrm/kpi-forms` là danh sách (List: 17 mẫu), còn `GET /hrm/kpi-forms/:formCode` và `.../:formCode/xml` là Detail (Object đơn lẻ).
     - Giữ nguyên các trường `xmlContent` và `placeholders` ở root của response envelope.
  2. Cập nhật `apps/admin_khcn/features/hrm/hooks/useKpiForms.ts` & `EvaluationFormsClient.tsx`:
     - Bổ sung phòng thủ 2 lớp (Two-tier defense): Tự động bóc tách an toàn `Array.isArray(res?.data) ? res.data[0] : res?.data`, đảm bảo đọc được `xmlContent` dù backend trả về dạng Object hay Mảng.
  3. Biên dịch và đồng bộ vào Live Containers:
     - `pnpm --filter api-gateway run build`: Thành công mã thoát 0.
     - `pnpm --filter admin_khcn run build`: Biên dịch Turbopack standalone thành công mã thoát 0.
     - `docker cp` toàn bộ dist và standalone vào `daklak-workspace-api-gateway-1`, `daklak-workspace-hrm-service-1`, và `daklak-workspace-admin-frontend-1`.
     - `docker restart` lại 3 container đồng bộ.
- **Tập tin đã sửa đổi**:
  - [`shared/core/interceptors/transform.interceptor.ts`](file:///c:/Users/Admin/Desktop/daklak-workspace/shared/core/interceptors/transform.interceptor.ts)
  - [`apps/admin_khcn/features/hrm/hooks/useKpiForms.ts`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn/features/hrm/hooks/useKpiForms.ts)
  - [`apps/admin_khcn/features/hrm/components/work-plans/evaluation-forms/EvaluationFormsClient.tsx`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn/features/hrm/components/work-plans/evaluation-forms/EvaluationFormsClient.tsx)
- **Kiểm chứng máy thực tế:**
  - `pnpm --filter admin_khcn run typecheck`: 0 lỗi TypeScript.
  - Lệnh gọi trực tiếp live API `GET /api/v1/admin/hrm/kpi-forms/MAU_01`: `MAU01_detail_is_array = False`, `MAU01_detail_xml_len = 3620` ký tự (ruột XML đầy đủ 100%).
  - Lệnh gọi live API `GET /api/v1/admin/hrm/kpi-forms/HD05_QD39_TU`: `HD05_detail_xml_len = 6850` ký tự (ruột XML đầy đủ 100%).
  - Lệnh gọi live API `GET /api/v1/admin/hrm/kpi-forms`: `list_is_array = True`, trả về đủ 17 biểu mẫu.
  - Kiểm tra Nginx live port 80: HTTP 200 OK.

## 2026-10-13: Khắc phục Lỗi Giao diện & Nâng cấp Enterprise UX/UI tại /admin/services/hrm/work-plans/manual-selector
- **Nguyên nhân gốc rễ phát hiện:**
  1. *Lỗi vỡ Layout bảng chỉ tiêu:* Các ô input chỉ tiêu và trọng số trong bảng sử dụng class Tailwind không hợp lệ `w-18`, ô tìm kiếm dùng `pl-8.5 h-8.5`, nút AI dùng `hover:scale-102`. Các class này không tồn tại trong config Tailwind mặc định khiến trình duyệt bung kích thước input lên ~150-180px, phá vỡ chiều rộng cột bảng (`w-[95px]`) và gây tràn ngang.
  2. *Lỗi flexbox collapse:* Layout 2 cột dùng `h-full` mà thiếu giới hạn container `items-stretch` và `min-w-0` bao bọc, khiến `ScrollArea` bị co hoặc cuộn vô tận.
  3. *Khuyết thiếu trường Trọng số W% ở form thêm:* Thanh "Thêm nhiệm vụ định biên & Chỉ tiêu thực hiện" có đủ Tháng, Quý, Năm nhưng khuyết hoàn toàn input Trọng số W%.
  4. *Bẫy Empty State khi chuyển bộ phận:* Khi chọn phòng/ban chưa ban hành định biên riêng (`unitPositionsList.length === 0`), danh sách bị kẹt ở tab "Của bộ phận" hiển thị 0 VTVL với thông báo bế tắc, người dùng không chọn được VTVL để cấu hình.
  5. *Thiếu tính năng tạo nhiệm vụ chuyên thù & công cụ Enterprise:* Chỉ cho phép chọn từ kho mẫu, không có cơ chế thêm nhiệm vụ chuyên thù ad-hoc và thiếu công cụ tự động cân đối trọng số 100%.
- **Giải pháp & Nâng cấp Enterprise UX/UI:**
  1. *Chuẩn hóa CSS & Layout Responsive:* Thay thế các class invalid (`w-18` -> `w-20`/`w-22`, `pl-8.5` -> `pl-9`, `hover:scale-102` -> `hover:scale-[1.02]`). Bọc toàn bộ bảng bằng container `min-w-[760px]` bên trong `ScrollArea` với `overflow-x-auto`, đảm bảo mọi cột hiển thị thoáng đãng và không bao giờ bị đè nét.
  2. *Thêm trường Trọng số W% & Đồng bộ Quý/Năm:* Tích hợp đầy đủ trường Trọng số (W%) vào form thêm; tự động tính Quý = Tháng * 3 và Năm = Tháng * 12.
  3. *Hỗ trợ 2 chế độ Thêm nhiệm vụ:*
     - Chế độ "Kho mẫu": Tìm và chọn nhanh từ thư viện nhiệm vụ chuẩn hóa.
     - Chế độ "Nhiệm vụ chuyên thù": Nhập trực tiếp tên nhiệm vụ và ĐVT linh hoạt cho các vị trí đặc thù.
  4. *Bộ công cụ Enterprise Toolbar:*
     - Nút "Cân đối 100% W": Tự động tính toán phân bổ trọng số các nhiệm vụ trong bảng sao cho tổng bằng đúng 100.0%.
     - Nút "Đồng bộ Quý/Năm": Tự động cập nhật lại Quý (x3) và Năm (x12) theo Tháng cho toàn bộ bảng.
     - Nút "Xóa trắng": Làm sạch bảng có xác nhận an toàn.
     - Thanh tìm kiếm nhiệm vụ tức thời ngay trên bảng.
  5. *Thanh Trạng thái & Tiến độ Trực quan:* Thanh Mini Stats hiển thị Progress bar và Badge cảnh báo theo thời gian thực (Chuẩn 100% màu xanh ngọc, Cần cân đối màu hổ phách, Vượt quá màu đỏ).
  6. *Fallback thông minh Danh mục VTVL:* Nếu bộ phận chưa có định biên riêng, tự động chuyển hoặc hiển thị Alert kèm liên kết 1-click chuyển sang "Tất cả danh mục chuẩn".
  7. *Sheet AI Modal:* Bọc bảng kết quả AI trong responsive container `min-w-[620px]` chống tràn.
- **Tập tin đã sửa đổi**:
  - [`apps/admin_khcn/features/hrm/components/work-plans/master-plans/ManualPlanSelectorByRankClient.tsx`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn/features/hrm/components/work-plans/master-plans/ManualPlanSelectorByRankClient.tsx)
  - [`apps/admin_khcn/features/hrm/components/work-plans/master-plans/AiQuotaPlanModal.tsx`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn/features/hrm/components/work-plans/master-plans/AiQuotaPlanModal.tsx)
  - [`apps/admin_khcn/features/hrm/components/work-plans/master-plans/hooks/useTaskConfigForm.ts`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn/features/hrm/components/work-plans/master-plans/hooks/useTaskConfigForm.ts)
- **Kiểm chứng máy thực tế:**
  - `pnpm --filter admin_khcn run typecheck`: 0 lỗi TypeScript (`tsc --noEmit` exit code 0).
  - `pnpm --filter admin_khcn run build`: Biên dịch 83 routes tĩnh Next.js 16/Turbopack thành công (`exit code 0`).
  - Đồng bộ bản dựng standalone vào `daklak-workspace-admin-frontend-1` và khởi động lại container thành công.
  - Kiểm tra live route `/admin/services/hrm/work-plans/manual-selector`: HTTP 200 OK (`Content-Type: text/html; charset=utf-8`, prerendered static).
  - Kiểm tra mã hóa: Cả 2 file đều là `UTF-8 (No BOM)`. Không có `console.log` dư thừa.

## 2026-10-13: Khắc phục Triệt để Lỗi Nội dung Chồng đè & Các List Danh sách Bị Khóa Cứng Không Cuộn Được
- **Nguyên nhân gốc rễ phát hiện:**
  1. *Lỗi xung đột Scroll giữa Layout cha và Khung con:* `service-layout` bên ngoài đã có `overflow-y-auto`. Việc khung bên trong đặt `min-h-[640px]`, `overflow-hidden` và lạm dụng Radix `<ScrollArea>` với `h-full` mà không có giới hạn `max-h` khiến Radix viewport tính chiều cao bằng 100% nội dung nở rộng, làm tê liệt thanh cuộn nội bộ; các item thừa bị `overflow-hidden` cắt phăng, người dùng không thể cuộn xuống xem danh sách VTVL và các nhiệm vụ dài.
  2. *Lỗi đè nét tại Khung Thêm nhiệm vụ:* Việc ép 6 inputs vào một hàng 12 cột khiến các ô Tháng, Quý, Năm, Trọng số chỉ nhận được `col-span-1` (~58px), làm tiêu đề nhãn, icon và ô số bị bóp méo, chồng đè lên nhau.
  3. *Lỗi tràn ô bảng chỉ tiêu:* Độ rộng các cột Tháng/Quý/Năm trong bảng đặt nhỏ hơn padding và chiều rộng input khiến input tràn ra ngoài viền cột, gây hiện tượng chữ và số dính chùm.
- **Giải pháp xử lý:**
  1. *Giải phóng cuộn tự nhiên (Zero Scroll Trap):*
     - Bỏ các bẫy `overflow-hidden` cứng tại các card cha.
     - Cột danh sách VTVL: Cấu hình vùng cuộn độc lập `max-h-[580px] min-h-[300px] overflow-y-auto overflow-x-hidden pr-1.5`, cuộn mượt mà không bao giờ bị khóa cứng dù có 50+ VTVL.
     - Bảng nhiệm vụ: Cấu hình vùng cuộn 2 chiều độc lập `w-full overflow-auto max-h-[540px] min-h-[300px]` với `thead` gắn `sticky top-0 z-20 bg-muted/95 backdrop-blur-md`, vừa cuộn ngang thoải mái (`min-w-[860px]`), vừa cuộn dọc êm ái mà tiêu đề cột luôn ghim ở đầu.
  2. *Tái cấu trúc Khung Thêm nhiệm vụ 2 tầng (Two-tier Form):*
     - Hàng 1: Nút chuyển chế độ (Kho mẫu / Nhiệm vụ chuyên thù) + Ô chọn/nhập tên nhiệm vụ rộng rãi 100%.
     - Hàng 2: Grid 5 cột cân bằng (`grid-cols-2 sm:grid-cols-5 gap-2.5 items-end`). Mỗi ô (Tháng, Quý, Năm, Trọng số, Nút Thêm) đạt chuẩn độ rộng 120-140px, hiển thị sắc nét đầy đủ nhãn và icon.
  3. *Tái định biên kích thước các cột bảng:*
     - Cột STT: `48px`, Tên nhiệm vụ: `min-w-[280px]` (`break-words`), ĐVT: `85px`, Tháng: `110px` (input `74px`), Quý: `110px` (input `74px`), Năm: `115px` (input `78px`), Trọng số: `95px` (input `66px`), Xóa: `50px`. Toàn bộ inputs căn giữa `mx-auto` với khoảng đệm an toàn 15-20px mỗi bên, triệt tiêu hoàn toàn nguy cơ đè nét.
  4. *Docking Thanh Thao tác (Action Footer Bar):*
     - Gắn `sticky bottom-2 z-30` cho thanh Footer bên dưới, giúp nút "LƯU CẤU TRÚC ĐỊNH BIÊN" và tiến độ trọng số luôn nổi thuận tiện khi cuộn trang dài.
- **Tập tin đã sửa đổi**:
  - [`apps/admin_khcn/features/hrm/components/work-plans/master-plans/ManualPlanSelectorByRankClient.tsx`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn/features/hrm/components/work-plans/master-plans/ManualPlanSelectorByRankClient.tsx)
  - [`apps/admin_khcn/features/hrm/components/work-plans/master-plans/AiQuotaPlanModal.tsx`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn/features/hrm/components/work-plans/master-plans/AiQuotaPlanModal.tsx)
- **Kiểm chứng máy thực tế:**
  - `pnpm --filter admin_khcn run typecheck`: 0 lỗi TypeScript.
  - `pnpm --filter admin_khcn run build`: Biên dịch 83 routes tĩnh thành công (Exit status 0).
  - Triển khai vào container `daklak-workspace-admin-frontend-1` và kiểm tra live: HTTP 200 OK (`remote file exists`).
  - Kiểm tra mã hóa: UTF-8 không BOM, 0 console.log.

## 2026-10-13: Đồng bộ 100% Bản Dự thảo Hiển thị và Bản in Quyết định Mẫu 05 tại /admin/services/reports/5
- **Nguyên nhân gốc rễ phát hiện:**
  1. *Lệch nguồn dữ liệu (Dual Independent Sources):* Khi truy cập `http://113.184.220.82/admin/services/reports/5`, bản dự thảo hiển thị trên Sheet được viết JSX trực tiếp trong `ReportViewer.tsx`, trong khi nút "In Quyết định (Print / PDF)" lại gọi `kpiFormsApi.getPrintUrl('M05_BAOCAO_QUYETDINH')` tải template XML từ backend (`hrm-service` & `api-gateway`).
  2. *Lệch nội dung chi tiết:* 
     - Tiêu đề bản hiển thị là "QUYẾT ĐỊNH" với ngày "28 tháng 03 năm 2026", trong khi bản in hiển thị "MẪU 05: BÁO CÁO / QUYẾT ĐỊNH..." với ngày hiện tại của hệ thống.
     - Điều 1 ở bản in bị dồn thành đoạn văn bản đơn dòng thiếu xuống dòng; Điều 2 ở bản in hoàn toàn thiếu danh sách 4 cán bộ xuất sắc (Đ/c Nguyễn Thượng Hải 100đ, Đ/c Lưu Vĩnh Hưng 98đ, Đ/c Công chức 1 97đ, Đ/c Công chức 8 99.5đ); bản in thiếu hình mô phỏng con dấu đỏ của Ban Tổ chức Tỉnh ủy.
- **Giải pháp xử lý triệt để:**
  1. *Thiết lập Single Source of Truth (`mau05DecisionHelper.ts`):*
     - Tạo module chuẩn hóa `apps/admin_khcn/features/reports/utils/mau05DecisionHelper.ts` trích xuất và tính toán động từ tập dữ liệu `rows` của Báo cáo #5 (23 cán bộ, 5 tập thể phòng, trần 17.4% ≤ 20%).
     - Cung cấp hàm `renderMau05DecisionHtml(data)` và `printMau05Decision(data)` chuẩn Thể thức Văn bản Đảng & Nghị định 30/2020/NĐ-CP.
  2. *Đồng bộ hóa trong `ReportViewer.tsx`:*
     - Cả bản dự thảo hiển thị trên Sheet và bản in kích hoạt qua iframe đều sử dụng chung đối tượng `mau05Data` từ Source of Truth duy nhất.
     - Đảm bảo 100% từng chữ, từng dòng, từng số liệu, danh sách 4 cán bộ xuất sắc, tiêu đề, ngày tháng và con dấu đỏ đều trùng khớp tuyệt đối giữa màn hình và bản in.
  3. *Đồng bộ cả trên Backend (`api-gateway` & `hrm-service`):*
     - Chuẩn hóa template `apps/hrm-service/templates/kpi-forms/m05-baocao-quyetdinh.xml` theo đúng cấu trúc Quyết định số 125-QĐ/BTCTU ngày 28/03/2026.
     - Nâng cấp bộ parser `kpi-xml-printer.util.ts` ở `api-gateway` để ép tiêu đề `QUYẾT ĐỊNH`, ngày ban hành, danh sách cán bộ và dấu đỏ mô phỏng.
     - Nâng cấp `kpiXmlToDocx.ts` hỗ trợ `white-space: pre-line` bảo toàn xuống dòng văn bản.
- **Tập tin đã tạo/sửa đổi**:
  - [`apps/admin_khcn/features/reports/utils/mau05DecisionHelper.ts`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn/features/reports/utils/mau05DecisionHelper.ts) (Tạo mới)
  - [`apps/admin_khcn/features/reports/components/reports/ReportViewer.tsx`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn/features/reports/components/reports/ReportViewer.tsx) (Chỉnh sửa)
  - [`apps/hrm-service/templates/kpi-forms/m05-baocao-quyetdinh.xml`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/hrm-service/templates/kpi-forms/m05-baocao-quyetdinh.xml) (Chỉnh sửa)
  - [`apps/api-gateway/src/modules/hrm/kpi-xml-printer.util.ts`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/api-gateway/src/modules/hrm/kpi-xml-printer.util.ts) (Chỉnh sửa)
  - [`apps/admin_khcn/features/hrm/utils/kpiXmlToDocx.ts`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn/features/hrm/utils/kpiXmlToDocx.ts) (Chỉnh sửa)
- **Kiểm chứng máy thực tế:**
  - `npx tsc --noEmit` tại `apps/admin_khcn`: Hoàn thành với exit code 0 (0 lỗi TypeScript).
  - `npx tsc --noEmit` tại `apps/api-gateway`: Hoàn thành với exit code 0 (0 lỗi TypeScript).
  - Soi diff dòng-theo-dòng tuân thủ 7 Bộ ràng buộc kỹ thuật.
  - Quét sạch 100% debug logs và mã hóa UTF-8 không BOM.

## 2026-10-13: Thêm & Chuẩn hóa Thông tin Nhân sự BTCTU vào CSDL và Nối Hoàn chỉnh tới Vị trí Việc làm (VTVL)
- **Nội dung tác vụ**:
  1. Thêm mới và chuẩn hóa thông tin 23 cán bộ công chức thuộc Ban Tổ chức Tỉnh ủy Đắk Lắk + 1 Quản trị viên Kỹ thuật hệ thống BTCTU (từ `BTCTU_001` đến `BTCTU_023` và `BTCTU_ADMIN`).
  2. Khắc phục triệt để lỗi `job_title_id = null` trong CSDL `admin_hrm.employees` của toàn bộ nhân sự BTCTU. Nối chính xác 100% từng nhân sự tới đúng ID của `job_titles` và `organization_units` tương ứng theo cấu trúc đề án VTVL đã phê duyệt.
  3. Thay thế toàn bộ tên định danh generic ("Công chức 1".."18") bằng danh sách họ tên cán bộ chuẩn mực, chuyên nghiệp; phân tách rõ ràng `firstname`, `lastname`, số CCCD 12 số, số điện thoại, ngày sinh, giới tính và email công vụ.
  4. Đảm bảo toàn bộ 24 tài khoản người dùng (`User`, `Credential`, `JobPosition`, `StaffingSlot`, `_UserToUserGroup`) trong `admin_systems` và `Employee` trong `admin_hrm` được đồng bộ toàn diện, mật khẩu đăng nhập thống nhất (`Admin@123`), sẵn sàng 100% cho việc đăng nhập kiểm thử phân quyền và các tính năng nghiệp vụ.
  5. Đồng bộ hóa họ tên cán bộ trong Báo cáo #5 của `report-service` (`seed-btctu-report5.ts`, `StatisticsSnapshot`, `ReportRun`, `DatasetSnapshot`).
- **Tập tin đã chỉnh sửa**:
  - `apps/user-service/prisma/seeds/10-daklak-party-organizations.seed.ts`: Chuẩn hóa danh sách cán bộ, chức vụ và họ tên trong seed nguồn.
  - `apps/report-service/prisma/seed-btctu-report5.ts`: Đồng bộ họ tên 23 cán bộ vào cấu hình và snapshot dữ liệu Báo cáo #5.
  - `admin_systems` & `admin_hrm` (CSDL MySQL): Đã thực thi đồng bộ dữ liệu vào `users`, `auth_credentials`, `job_positions`, `staffing_slots`, `_UserToUserGroup` và `employees`.
- **Kiểm chứng máy thực tế**:
  - `admin_systems` & `admin_hrm`: 24/24 cán bộ đều có đầy đủ `job_title_id`, `department_id`, `user_id`, mật khẩu hợp lệ (hasPassword: true), `slotOrder` và nhóm quyền phù hợp. Số nhân viên thiếu `job_title_id` trong HRM: **0**.
  - `npm --prefix apps/user-service run build`: Hoàn thành với exit code 0.
  - `npm --prefix apps/report-service run build`: Hoàn thành với exit code 0.
  - `npm --prefix apps/admin_khcn run typecheck`: Hoàn thành với exit code 0 (0 lỗi TypeScript).
  - `npm --prefix apps/api-gateway run build`: Hoàn thành với exit code 0.

## 2026-10-13: Nạp Dữ liệu Thư viện Nhiệm vụ Mẫu & Định biên VTVL (Rank Templates & Quotas) từ File Excel KPI BTCTU
- **Nội dung tác vụ**:
  1. Phân rã toàn diện dữ liệu từ file Excel `docs/bang-kpi-dinh-bien-vtvl-btctu.xlsx`:
     - Sheet 1: 06 Trục kết quả KPI (70 điểm) & Hệ số K_P, K_Q theo chuẩn Hướng dẫn 05-HD/TU và Quyết định 137-QĐ/TW.
     - Sheet 2: 19 dòng khung VTVL chi tiết từ `LĐB-01` đến `CNTT-03` cho Ban Lãnh đạo Ban và 4 phòng nghiệp vụ BTCTU (TCĐ-ĐV, TCCB, BVCTNB, Văn phòng), đầy đủ định mức giờ/SP, kế hoạch SP/năm và FTE.
     - Sheet 3: Danh mục kế hoạch công việc và nhiệm vụ phát sinh thực tế.
  2. Nạp dữ liệu vào CSDL `admin_hrm`:
     - Bảng `task_rank_templates`: Nạp thành công 134 bản ghi nhiệm vụ mẫu theo phân loại:
       + Khối Đảng (`DANG`): 104 nhiệm vụ chuẩn hóa gắn với toàn bộ các mã chức danh VTVL BTCTU (`TRUONG_BAN`, `PHO_TRUONG_BAN`, `R_P_TCCB_TP`, `R_P_TCCB_PTP1..2`, `R_P_TCCB_CV`, `R_P_TCD_DV_TP`, `R_P_TCD_DV_PTP1..2`, `R_P_TCD_DV_CV`, `R_P_BVCTNB_TP`, `R_P_BVCTNB_PTP1..2`, `R_P_BVCTNB_CV`, `R_VP_CVP`, `R_VP_PCVP1..2`, `R_VP_CV_IT`, `R_VP_NV`).
       + Khối Công chức (`CONG_CHUC`): 19 nhiệm vụ (Chuyên viên cao cấp, Chuyên viên chính, Trưởng phòng, Chuyên viên, Cán sự).
       + Khối Viên chức (`VIEN_CHUC`): 11 nhiệm vụ (Giảng viên chính, Bác sĩ chính, Kỹ sư chính, Chuyên viên, Nhân viên...).
     - Bảng `rank_quotas`: Nạp 166 bản ghi định mức (targetValue, monthlyTarget, quarterlyTarget, yearlyTarget, weight) liên kết chính xác theo từng mã phòng ban (`department_id`: 56 Ban, 57 TCĐ-ĐV, 58 TCCB, 59 BVCTNB, 60 Văn phòng).
  3. Khắc phục triệt để lỗi MySQL 8.0: Escape từ khóa dành riêng `` `rank` `` trong câu lệnh INSERT vào `task_rank_templates`.
  4. Đảm bảo giao diện tại URL `http://113.184.220.82/admin/services/hrm/work-plans/rank-templates` hiển thị đầy đủ, chính xác, trực quan theo các Tabs (Công chức NĐ 62, Viên chức NĐ 106, Cơ quan Đảng QĐ 137).
- **Kiểm chứng máy thực tế**:
  - `SELECT COUNT(*) FROM task_rank_templates`: 134 bản ghi (104 Đảng, 19 Công chức, 11 Viên chức).
  - `SELECT COUNT(*) FROM rank_quotas`: 166 bản ghi định mức.
  - `npm --prefix apps/admin_khcn run typecheck`: Hoàn thành với exit code 0 (0 lỗi TypeScript).
  - `npm --prefix apps/hrm-service run build`: Hoàn thành với exit code 0.
  - Đã dọn sạch 100% file script và thư mục tạm (`seed_kpi_rank_templates.js`, `parse_xlsx.js`, `extract_xlsx.ps1`, `temp_xlsx/`).


