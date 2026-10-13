# Execution Log — Lane 1 (Code 1)

## [2026-10-13] Rà soát điều chỉnh Menu và Page liên quan bên trong HRM Service theo đúng Vị trí việc làm (VTVL) Trung ương quy định

### 1. Phạm vi & File tác động
- `apps/user-service/prisma/seeds/menus.seed.ts`: Bổ sung menu `HRM_POSITIONS_MENU` ("Khung Vị trí việc làm", route `/services/hrm/job-positions`, icon `Briefcase`).
- `apps/admin_khcn/app/services/hrm/page.tsx`: Khắc phục thiếu page root của HRM, tự động redirect về `/services/hrm/employees` khi người dùng bấm vào Hub hoặc Sidebar header.
- `apps/admin_khcn/app/services/hrm/job-positions/page.tsx`: Tạo page Server Component "Khung Vị trí việc làm theo Đơn vị" bên trong HRM module.
- `apps/admin_khcn/app/services/admin/unit-job-templates/client.tsx`: Chuẩn hóa tiêu đề và ghi chú pháp lý theo Nghị định 62/2020/NĐ-CP, Nghị định 106/2020/NĐ-CP và Quy định 137-QĐ/TW.
- `apps/admin_khcn/app/services/hrm/work-plans/layout.tsx`: Thêm tab "Khung Vị trí việc làm" (`/services/hrm/job-positions`) đồng bộ trong thanh điều hướng Work Plans.
- `apps/admin_khcn/features/hrm/components/work-plans/master-plans/ConfigureRankTasksClient.tsx`: Bổ sung Tab "Khối Cơ quan Đảng (QĐ 137)" bên cạnh "Khối Công chức (NĐ 62)" và "Khối Viên chức (NĐ 106)", tối ưu fluid `min-w-0`.
- `apps/admin_khcn/features/hrm/components/work-plans/master-plans/hooks/useConfigureRankTasks.ts`: Mở rộng `GovClassification` thêm `'DANG'`, tách đúng 3 nhóm VTVL (Công chức, Viên chức, Khối Đảng) từ `jobTitlesRes` và lưu đồng bộ 3 khối templates.
- `apps/admin_khcn/features/hrm/components/work-plans/master-plans/hooks/useTaskConfigForm.ts`: Cập nhật `classification` cho phép `'DANG'`.
- `apps/admin_khcn/features/hrm/components/work-plans/master-plans/PartyTaskConfig.tsx`: Tạo mới component cấu hình Thư viện Nhiệm vụ cho Khối Cơ quan Đảng theo Quy định 137-QĐ/TW của Ban Bí thư và Hướng dẫn BTCTW.
- `apps/admin_khcn/features/hrm/components/work-plans/master-plans/CivilServantTaskConfig.tsx` & `PublicEmployeeTaskConfig.tsx`: Chuẩn hóa 4 nhóm VTVL Trung ương quy định (Lãnh đạo quản lý, Nghiệp vụ chuyên ngành, Nghiệp vụ dùng chung, Hỗ trợ phục vụ) và hiển thị căn cứ pháp lý.
- `apps/hrm-service/prisma/seed.ts`: Bổ sung 18 nhiệm vụ mẫu chuẩn cho Khối Cơ quan Đảng (`classification: 'DANG'`).

### 2. Kiểm chứng máy thực tế
- `pnpm --filter admin_khcn run typecheck` (`tsc --noEmit`): Exit code 0 (Pass 100%).
- `pnpm --filter hrm-service run build`: Exit code 0 (Pass 100%).
- `pnpm --filter user-service run build`: Exit code 0 (Pass 100%).
- Diff rà soát: Tuân thủ 100% 7 Bộ ràng buộc kỹ thuật (`min-w-0`, `break-words`, không double `/admin`, Next.js 15 App Router, zero debug logs, UTF-8 không BOM).

## [2026-10-13] Chuẩn hóa Ranh giới Dịch vụ (Service Boundaries): Định biên & Khung VTVL vs Thư viện Nhiệm vụ & Định mức Công việc
- **Vấn đề rà soát:**
  * Người dùng thắc mắc tại sao bên trong HRM lại có màn hình cấu hình Khung VTVL trong khi nghiệp vụ này và Định biên đã được xây dựng hoàn chỉnh tại Organization (`user-service`).
  * Xác định nguyên nhân: Lượt trước đã tạo thừa route `/services/hrm/job-positions` nhúng lại `UnitJobTemplatesClient` và thêm tab/menu "Khung Vị trí việc làm" vào HRM, gây vi phạm Service Boundaries.
- **Biện pháp xử lý & chuẩn hóa:**
  1. **Khẳng định phân định trách nhiệm chuẩn (Service Sovereignty):**
     * **`user-service` (Quản trị hệ thống & Tổ chức)**: Độc quyền sở hữu Master Data về **Khung Vị trí việc làm theo Đơn vị** (`unit_type_job_templates` tại `/services/admin/unit-job-templates`) và **Định biên biên chế tổ chức** (`org_staffing`, `staffing_slots` tại `/services/admin/organization/[code]` tab "Định biên & Chức danh").
     * **`hrm-service` (Nhân sự, Công việc & KPI)**: Kế thừa 100% danh mục Chức danh/VTVL và Định biên từ `user-service`. HRM **KHÔNG** định nghĩa lại VTVL hay định biên biên chế. HRM chỉ quản lý **Thư viện nhiệm vụ mẫu chuẩn hóa theo VTVL** (`task_rank_templates` tại `/services/hrm/work-plans/rank-templates`) và **Giao Định mức khối lượng nhiệm vụ KPI theo định biên** (`rank_quotas` tại `/services/hrm/work-plans/manual-selector`).
  2. **Dọn dẹp triệt để trùng lặp:**
     * Đã xóa bỏ hoàn toàn thư mục & file `apps/admin_khcn/app/services/hrm/job-positions`.
     * Đã xóa tab "Khung Vị trí việc làm" khỏi `apps/admin_khcn/app/services/hrm/work-plans/layout.tsx`.
     * Đã xóa menu `HRM_POSITIONS_MENU` khỏi `apps/user-service/prisma/seeds/menus.seed.ts` và thêm lệnh xóa tự động trong seed.
  3. **Kiểm chứng máy:**
     * `pnpm --filter admin_khcn run typecheck`: Exit code 0.
     * `pnpm --filter user-service run build`: Exit code 0.

## [2026-10-13] Tích hợp AI Tự động Định mức & Xây dựng Kế hoạch Nhiệm vụ kèm Tái thiết kế Giao diện
- **Yêu cầu:** Thêm AI vào chức năng tự động định mức, xây dựng kế hoạch thực hiện nhiệm vụ cho các đơn vị hoặc cá nhân; điều chỉnh lại giao diện trang `manual-selector` chuyên nghiệp, chỉn chu và tiện dụng.
- **Phạm vi file đã triển khai:**
  1. `apps/api-gateway/src/modules/hrm/rank-quotas.controller.ts`:
     - Bổ sung endpoint `POST /admin/hrm/rank-quotas/ai-suggest`.
     - Hỗ trợ gọi AI microservice `MICROSERVICES.AI` (`AiService.GenerateText`) và fallback sang bộ máy quy tắc thông minh chuẩn hóa Trung ương (`buildRuleBasedSuggestion`) hỗ trợ cả phạm vi `INDIVIDUAL` (vị trí cá nhân) và `UNIT` (toàn đơn vị), bám sát NĐ 62/2020, NĐ 106/2020, QĐ 137-QĐ/TW.
     - Tính toán chuẩn mực: Chỉ tiêu Tháng, Quý (x3), Năm (x12), cân bằng tổng trọng số W% đúng 100%, sản phẩm đầu ra, và Kế hoạch hành động 4 Quý.
  2. `apps/api-gateway/src/modules/hrm/hrm.module.ts`:
     - Đăng ký `registerGrpcService(MICROSERVICES.AI)`.
  3. `apps/admin_khcn/features/hrm/api/rank-quotas.api.ts`:
     - Thêm method `aiSuggest` và các interfaces `AiSuggestQuotaPayload`, `AiSuggestQuotaResult`, `AiSuggestedQuotaItem`.
  4. `apps/admin_khcn/features/hrm/components/work-plans/master-plans/AiQuotaPlanModal.tsx`:
     - Tạo mới Drawer/Sheet Trợ lý AI hiện đại với 2 tab: "Định mức Nhiệm vụ" (Quotas) và "Bản Kế hoạch Hành động" (Master Plan).
     - Cho phép chọn phạm vi (Vị trí cá nhân / Toàn bộ đơn vị), định hướng (Chuẩn hóa / Cao điểm / Chuyển đổi số).
     - Nút "Áp dụng vào bảng Định mức hiện tại" và "Khởi tạo Kế hoạch (Master Plan)".
  5. `apps/admin_khcn/features/hrm/components/work-plans/master-plans/ManualPlanSelectorByRankClient.tsx`:
     - Nâng cấp toàn diện Hero Command Header, bổ sung nút Trợ lý AI gradient rực rỡ.
     - Bổ sung Mini Stats Ribbon (KPI overview: Vị trí, Định biên, Số nhiệm vụ, Chỉ tiêu Tháng/Quý/Năm, Tổng trọng số W% cảnh báo 100%).
     - Tối ưu 2 cột fluid `min-w-0`, `break-words`, inputs bo tròn hiện đại, card VTVL rõ ràng.
- **Kiểm chứng máy thực tế:**
  - `pnpm --filter admin_khcn run typecheck` (`tsc --noEmit`): Exit code 0 (Pass 100%).
  - `pnpm --filter api-gateway run build`: Exit code 0 (Pass 100%).

## [2026-10-13] Nạp Cấu trúc XML vào Biểu mẫu Seed HRM: Bộ 1 (HD05-HD/TU & QĐ 39-QĐ/TU) & Bộ 2 (QĐ 348-QĐ/BTCTW Phụ lục VIII)
- **Mục tiêu:** Cập nhật trọn vẹn dữ liệu XML biểu mẫu vào CSDL seed của `hrm-service`:
  1. **BỘ 1 (HD05-TU / QĐ39-TU):** Cấu trúc XML Đánh giá, xếp loại cán bộ hằng quý (thang điểm 100: 30đ Tiêu chí chung + 70đ KPI Nhiệm vụ với chỉ số A, B, C, D; khống chế trần xuất sắc 20%; cảnh báo điều chuyển nếu 2 quý liên tiếp không hoàn thành):
     - `HD05_QD39_TU`: Trọn bộ container XML `OfficialEvaluationSystem`.
     - `M01_TOTRINH`: Mẫu 01 - Tờ trình đề nghị đánh giá, xếp loại quý.
     - `M02_TUKIEMDIEM`: Mẫu 02 - Bản tự kiểm điểm cá nhân (2A, 2B, 2C).
     - `M03_SCORECARD_KPI`: Mẫu 03 - Bản tự đánh giá & Scorecard KPI hằng quý (Section A: 30đ, Section B: 70đ).
     - `M04_TONGHOP_QUY`: Mẫu 04 - Bảng tổng hợp kết quả đánh giá và đề xuất xếp loại quý.
     - `M05_BAOCAO_QUYETDINH`: Mẫu 05 - Báo cáo / Quyết định phê duyệt mức xếp loại chất lượng quý.
  2. **BỘ 2 (QĐ348-BTCTW Phụ lục VIII):** Cấu trúc XML Kết nối, chia sẻ dữ liệu CSDL Đảng & Cán bộ giữa Ban Tổ chức Tỉnh ủy với Trung tâm Dữ liệu Quốc gia (LGSP / TSLCD):
     - `QD348_BTCTW`: Trọn bộ container XML `PartyDataIntegrationSystem`.
     - `M01_KHAI_THAC`: Mẫu 01 - Phiếu đề nghị kết nối, chia sẻ dữ liệu.
     - `M02_CHAP_THUAN`: Mẫu 02 - Quyết định chấp thuận kết nối, chia sẻ dữ liệu.
     - `M03_XUNG_DOT`: Mẫu 03 - Biên bản phát hiện xung đột dữ liệu (Single Source of Truth).
     - `M04_TAM_NGUNG`: Mẫu 04 - Thông báo tạm ngừng / chấm dứt kết nối.
     - `M05_BAOCAO_NAM`: Mẫu 05 - Báo cáo kết quả kết nối, chia sẻ dữ liệu hằng năm (Đúng, Đủ, Sạch, Sống).
- **Phạm vi file đã thực hiện:**
  - `apps/hrm-service/templates/kpi-forms/`: Tạo 12 file XML mẫu chuẩn định dạng UTF-8 không BOM:
    * `hd05-qd39-tu-full.xml`, `m01-totrinh.xml`, `m02-tukiemdiem.xml`, `m03-scorecard-kpi.xml`, `m04-tonghop-quy.xml`, `m05-baocao-quyetdinh.xml`
    * `qd348-btctw-full.xml`, `m01-khai-thac.xml`, `m02-chap-thuan.xml`, `m03-xung-dot.xml`, `m04-tam-ngung.xml`, `m05-baocao-nam.xml`
  - `apps/hrm-service/src/modules/kpi-evaluations/kpi-template-xml.util.ts`: Cập nhật `DEFAULT_KPI_FORM_TEMPLATES` đồng bộ 17 biểu mẫu (5 mẫu gốc + 6 mẫu Bộ 1 + 6 mẫu Bộ 2).
  - `apps/hrm-service/src/modules/kpi-evaluations/kpi-evaluations.service.ts`: Cập nhật fallback upsert tự động lưu đầy đủ category, targetRole, schemaVersion và xmlContent khi query.
  - `apps/hrm-service/prisma/btctu-kpi-engine.seed.ts`: Nạp và upsert 100% 17 biểu mẫu vào `kpi_form_templates` và `kpi_form_template_versions` (version 1, status PUBLISHED).
- **Kiểm chứng máy thực tế:**
  - `pnpm --filter hrm-service run build`: Mã thoát 0 (Generated Prisma client + nest build hoàn tất).
  - `npx ts-node prisma/btctu-kpi-engine.seed.ts`: Mã thoát 0 (Đã nạp thành công 17 biểu mẫu hành chính & cấu trúc XML vào CSDL).
  - `pnpm --filter admin_khcn run typecheck` (`tsc --noEmit`): Mã thoát 0 (Pass 100%).


### [13/10/2026] Khắc phục Triệt để Lỗi Không Hiển thị Data XML Trong Các Biểu Mẫu KPI Đánh Giá Tại `/admin/services/hrm/work-plans/evaluation-forms`
- **Yêu cầu & Vấn đề phát hiện:**
  - Người dùng truy cập `http://113.184.220.82/admin/services/hrm/work-plans/evaluation-forms`, bấm vào các biểu mẫu nhưng không thấy dữ liệu XML bên trong ("không thấy data XML trong các mẫu trên này bạn chưa import đúng chứ").
  - **Nguyên nhân gốc rễ:**
    1. `apps/hrm-service/Dockerfile` ở stage `runner` chỉ copy `dist` và `protos`, **hoàn toàn bỏ quên thư mục `templates/`**. Khi chạy container trên VPS, `fs.existsSync(filePath)` luôn trả về `false`, khiến service trả về fallback XML trống `<Placeholder>Nội dung đang được cập nhật</Placeholder>`.
    2. Trong `kpi-evaluations.service.ts`, hàm `findFormTemplates()` chỉ chạy upsert khi `dbTemplates.length < DEFAULT_KPI_FORM_TEMPLATES.length` và `!found`. Nếu các bản ghi mẫu đã được sinh từ trước với nội dung rỗng/placeholder, hệ thống không bao giờ tự động cập nhật lại nội dung XML thật vào DB.
    3. Tại `api-gateway`, endpoint `GET /admin/hrm/kpi-forms/:formCode/xml` trả về envelope phẳng `{ success, formCode, xmlContent }` không có wrapper `data: { ... }`. Trong khi đó, frontend `EvaluationFormsClient.tsx` tại các hàm `handleDownloadXml`, `handleExportDocx`, `handlePrintPdf`, `handleOpenEditXml` lại truy cập `res.data?.xmlContent`, dẫn đến `xml` luôn bị `undefined` -> báo lỗi "Nội dung file XML đang trống" / mở editor trống trơn.
- **Giải pháp xử lý:**
  1. **Nhúng trực tiếp 100% dữ liệu 17 mẫu XML vào TypeScript** (`kpi-templates-embedded.data.ts`): Đảm bảo dù chạy trên Docker không mount volume, môi trường dev hay test, dữ liệu XML gốc của cả 17 mẫu đều luôn sẵn sàng 100%, không bao giờ bị phụ thuộc vào đường dẫn đĩa vật lý.
  2. **Tự động làm lành (Self-Healing) & Tự động Import vào DB**:
     - Trong `kpi-evaluations.service.ts`, các hàm `findFormTemplates`, `getFormTemplateDetail`, `getFormTemplateXml` đều tích hợp kiểm tra `isPlaceholderXml()`. Nếu bản ghi trong CSDL còn là placeholder hoặc rỗng, hệ thống sẽ tự động cập nhật đè dữ liệu XML chuẩn vào bảng `kpi_form_templates` và `kpi_form_template_versions`.
     - Tạo script đồng bộ độc lập `apps/hrm-service/prisma/sync-kpi-templates.ts`.
  3. **Cập nhật Dockerfile**: Bổ sung `COPY templates` vào cả `/app/templates` và `/app/dist/apps/hrm-service/templates`.
  4. **Chuẩn hóa API Gateway & Frontend**:
     - `api-gateway` `kpi-forms.controller.ts`: Đảm bảo `getXml` trả về đồng thời cả `data: { xmlContent, ... }` lẫn `xmlContent` ở root.
     - `admin_khcn` `EvaluationFormsClient.tsx` & `useKpiForms.ts`: Truy xuất an toàn `res?.data?.xmlContent || res?.xmlContent || ''`.
- **Kiểm chứng máy thực tế:**
  - `apps/hrm-service`: `npm run build` -> Exit code 0 (Pass 100%).
  - `apps/api-gateway`: `npm run build` -> Exit code 0 (Pass 100%).
  - `apps/admin_khcn`: `npm run typecheck` (`tsc --noEmit`) -> Exit code 0 (Pass 100%).



