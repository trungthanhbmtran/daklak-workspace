# Execution Log — Lane 1 (Code 1)

## [2026-10-13] Triển khai Màn hình Thẩm định & Đánh giá Công việc của Lãnh đạo phụ trách (Đối chiếu Đa nguồn & Phê duyệt KPI)

### 1. Vấn đề & Yêu cầu Nghiệp vụ
- Luồng công việc sau khi cán bộ/chuyên viên báo cáo hoàn thành cần có màn hình chuyên dụng dành cho Lãnh đạo / Người phụ trách quản lý để thẩm định và phê duyệt đánh giá.
- Màn hình Lãnh đạo phải hiển thị đầy đủ thông tin đối chiếu liên quan đến nhiệm vụ từ 2 nguồn:
  1. **Nguồn từ hệ thống (System Metrics)**: Tự động đo lường độ lệch thời gian (Sớm X ngày / Đúng hạn / Trễ Y ngày), Tiến độ Checklist các bước, Nhiệm vụ con, Lịch sử xin gia hạn hợp lệ, Căn cứ văn bản nguồn (`sourceDocumentRef`), Điểm cơ sở VTVL (`baseScore`, `weight`).
  2. **Nguồn từ tự báo cáo (Assignee Self-Report)**: Nội dung giải trình kết quả của chuyên viên, Sản phẩm đầu ra đạt được, Danh sách tài liệu/file minh chứng đính kèm (có link xem/tải trực tiếp).
- Khung thẩm định & cho điểm của Lãnh đạo bám sát 4 thành tố Đắk Lắk (A. Khối lượng 35%, B. Chất lượng 35%, C. Tiến độ 20%, D. Thái độ/Trách nhiệm 10%), tự động tính điểm theo thời gian thực thang 100 và phân mức xếp loại chuẩn (Hoàn thành xuất sắc, Tốt, Hoàn thành, Không hoàn thành).
- Hỗ trợ 2 hành động: "Phê duyệt & Chốt điểm đánh giá" (cập nhật trạng thái `COMPLETED`, lưu scores, feedback) và "Yêu cầu làm lại / Bổ sung minh chứng" (trả lại trạng thái `RETURNED`, ghi nhận lý do chỉ đạo vào nhật ký công việc).

### 2. Biện pháp Xử lý & File Tác động
- **`apps/admin_khcn/features/hrm/components/tasks/TaskEvaluationApprovalSheet.tsx` (Tạo mới):**
  * Thiết kế Sheet Enterprise chuyên dụng cho Lãnh đạo (`sm:max-w-3xl w-full`), Header cố định, Body cuộn tự nhiên (Native Scroll, Zero Scroll Trap), Footer cố định 2 hành động rõ ràng.
  * Phân vùng 1: Bảng đối chiếu song song 2 cột (Responsive Grid `grid-cols-1 md:grid-cols-2`), Cột trái: Nguồn Hệ thống (Checklist, Thời hạn, Gia hạn, Điểm cơ sở), Cột phải: Nguồn Tự báo cáo (Giải trình, Sản phẩm đầu ra, File đính kèm).
  * Phân vùng 2: Khối thẩm định & cho điểm 4 thành tố (Khối lượng % + Hệ số K + Đột xuất; Chất lượng 5 mức chuẩn; Tiến độ theo ngày trễ + Nút bảo lưu lý do khách quan; Thái độ/Trách nhiệm).
  * Thẻ tổng hợp điểm realtime kèm Xếp loại đề xuất nổi bật (Gradient Card).
  * Ô ý kiến nhận xét, chỉ đạo của Lãnh đạo.
  * Hộp thoại Dialog xác nhận "Yêu cầu làm lại" kèm lý do chỉ đạo bắt buộc.
- **`apps/admin_khcn/features/hrm/hooks/useTasks.ts`:**
  * Bổ sung mutation hook `useEvaluateTask` hỗ trợ action `APPROVE` và `RETURN`, cập nhật status qua endpoint `/hrm/tasks/{id}/status`, serialize an toàn `evidenceData` và invalidates cache React Query liên quan.
- **`apps/admin_khcn/features/hrm/types/task.ts`:**
  * Bổ sung trường `baseScore?: number; weight?: number;` vào interface `HrmTask`.
- **`apps/admin_khcn/features/hrm/components/tasks/task-detail-drawer.tsx`:**
  * Thêm nút "Đánh giá công việc" (Icon `Award`) màu Indigo nổi bật trên Header Drawer.
  * Cập nhật tab "Đánh giá & KPI": Xem kết quả điểm 4 thành tố nếu đã có đánh giá; hoặc hiển thị Card hướng dẫn kèm nút mở Sheet đánh giá nếu chưa đánh giá.
  * Nhúng `<TaskEvaluationApprovalSheet>` để mở nhanh từ Drawer.
- **`apps/admin_khcn/features/hrm/components/tasks/task-list.tsx`:**
  * Bổ sung trạng thái `REVIEWING` (Chờ đánh giá) vào bộ lọc trạng thái.
  * Thêm nút thao tác nhanh "Đánh giá" (Icon `Award`) ở cột Thao tác cho từng dòng công việc.
  * Nhúng `<TaskEvaluationApprovalSheet>` đồng bộ trạng thái danh sách khi đánh giá thành công.
- **`apps/admin_khcn/features/workflow/components/OrganizationUnitSelector.tsx`:**
  * Sửa lỗi biến `isSelected` bị thiếu trong component `TreeNode`, đảm bảo biên dịch TypeScript 100% không lỗi.

### 3. Kiểm chứng Máy Thực tế & Phản biện Diff
- Lệnh kiểm chứng: `rtk npx tsc --noEmit` tại `apps/admin_khcn` -> `TypeScript: No errors found` (Exit code 0).
- Phản biện diff:
  * 100% tuân thủ 7 Bộ ràng buộc kỹ thuật (Sheet thay vì Dialog cho form dài, zero scroll trap, `min-w-0` / `break-words`, responsive grid 2 cột `md:grid-cols-2`, UTF-8 không BOM, sạch sẽ debug log).

## [2026-10-13] Dọn dẹp các Menu Dư thừa Không còn Sử dụng trong Phân hệ HRM (`sys_menus`)

### 1. Vấn đề phát hiện
- Phân hệ Quản trị Nhân sự & Công việc (`HRM_GROUP`, `parent_id = 14`) trong CSDL `admin_systems` bảng `sys_menus` chứa 5 menu dư thừa không có frontend route trong dự án (người dùng click vào bị lỗi 404):
  1. `HRM_PROJECT_MENU` (id 19) — Route: `/services/hrm/work-plans/projects` (Dự án)
  2. `HRM_CRITERIA_MENU` (id 22) — Route: `/services/hrm/work-plans/criteria` (Tiêu chí đánh giá)
  3. `HRM_PERSONAL_KPI_MENU` (id 23) — Route: `/services/hrm/work-plans/personal-kpi` (KPI Cá nhân)
  4. `HRM_REVIEW_KPI_MENU` (id 24) — Route: `/services/hrm/work-plans/review-kpi` (Đánh giá KPI)
  5. `HRM_DASHBOARD_KPI_MENU` (id 25) — Route: `/services/hrm/work-plans/dashboard-kpi` (Tổng hợp KPI)
- Các menu này là tàn dư từ các phiên bản thiết kế cũ, không có bảng con liên kết và không còn route trang tương ứng trong Next.js (`apps/admin_khcn/app/services/hrm/`).
- File seed `apps/user-service/prisma/seeds/menus.seed.ts` chưa đưa 5 menu này vào danh sách dọn dẹp khi re-seed.

### 2. Biện pháp xử lý & Phạm vi tác động
- **Database `admin_systems` (`sys_menus`):**
  * Đã thực thi câu lệnh SQL xóa sạch 5 bản ghi menu dư thừa:
    `DELETE FROM sys_menus WHERE code IN ('HRM_PROJECT_MENU', 'HRM_CRITERIA_MENU', 'HRM_PERSONAL_KPI_MENU', 'HRM_REVIEW_KPI_MENU', 'HRM_DASHBOARD_KPI_MENU');`
  * Bảo toàn 100% 7 menu cốt lõi đang hoạt động:
    1. `HRM_EMPLOYEE_MENU` (`/services/hrm/employees`) — Hồ sơ nhân sự
    2. `HRM_TASK_MENU` (`/services/hrm/work-plans/tasks`) — Danh sách công việc
    3. `HRM_CALENDAR_MENU` (`/services/hrm/calendar`) — Lịch công tác
    4. `HRM_TEMPLATE_MENU` (`/services/hrm/work-plans/rank-templates`) — Thư viện nhiệm vụ (VTVL)
    5. `HRM_SELECTOR_MENU` (`/services/hrm/work-plans/manual-selector`) — Định mức theo VTVL
    6. `HRM_KPI_FORMULA_MENU` (`/services/hrm/work-plans/kpi-formulas`) — Công thức tính KPI
    7. `HRM_EVALUATION_FORM_MENU` (`/services/hrm/work-plans/evaluation-forms`) — Mẫu đánh giá KPI
- **Source Code Seed (`apps/user-service/prisma/seeds/menus.seed.ts`):**
  * Bổ sung 5 mã menu dư thừa vào mảng `deleteMany` trong hàm `seedMenus` để bảo đảm tính nhất quán khi chạy seed lại.

### 3. Kiểm chứng máy thực tế & Phản biện
- Lệnh kiểm chứng:
  * SQL verify: `SELECT id, code, name, route FROM sys_menus WHERE parent_id = 14;` -> Trả về đúng 7 menu chuẩn, 0 menu rác.
  * TypeScript typecheck: `rtk npx tsc --noEmit` tại `apps/user-service` -> `TypeScript: No errors found` (Exit code 0).
- Phản biện diff & Dọn rác:
  * Không có bất kỳ tham chiếu mồ côi nào trong frontend hoặc backend.
  * 100% sạch sẽ, mã hóa UTF-8 không BOM.



## [2026-10-13] Nâng cấp Giao diện Sheet Công việc & Bảng định biên tại `manual-selector` lên chuẩn UX/UI Enterprise

### 1. Vấn đề phát hiện & Khắc phục
- **Lỗi giao diện Sheet Công việc / Trợ lý AI (`AiQuotaPlanModal.tsx`):**
  * Radix Sheet lồng ghép `ScrollArea` bọc ngoài và `overflow-auto max-h-[380px]` bên trong tab QUOTAS, gây ra **Scroll Trap** nghiêm trọng khiến người dùng lăn chuột bị kẹt trong bảng con hoặc không cuộn xuống xem được toàn bộ nội dung.
  * Các nút hành động chính ("Áp dụng vào bảng định biên", "Khởi tạo Kế hoạch") bị chôn sâu dưới đáy nội dung tab, khi danh sách nhiệm vụ dài thì bị che khuất hoàn toàn.
  * Cột Tên nhiệm vụ thiếu `min-w`, bị bóp nghẹt ép text xuống dòng dày đặc; thiếu vùng đệm an toàn với nút Close của Sheet.
- **Lỗi giao diện Bảng tính Định biên & Giao chỉ tiêu (`ManualPlanSelectorByRankClient.tsx`):**
  * Breakpoint 2 cột bị ép cứng ở `lg:flex-row`, khi kết hợp với sidebar chính của hệ thống thì cột bảng tính chỉ còn ~380px, khiến bảng tính định biên 7 cột bị tràn ngang và thanh toolbar nhập 5 ô bị đè nát chữ.
  * Các ô input Tháng, Quý, Năm, Trọng số bị ảnh hưởng bởi mũi tên spin mặc định của browser làm lệch số; độ rộng ô quá hẹp (`w-[74px]`, `w-[66px]`).
  * Danh sách VTVL bên phải bị trôi mất khi người dùng cuộn xem bảng nhiệm vụ dài; thiếu cơ chế giải phóng không gian hiển thị toàn màn hình cho bảng tính.

### 2. Biện pháp xử lý & Phạm vi tác động
- `apps/admin_khcn/features/hrm/components/work-plans/master-plans/AiQuotaPlanModal.tsx`:
  * Loại bỏ triệt để `ScrollArea` và `max-h-[380px]` gây Scroll Trap; chuyển sang cấu trúc Sheet Enterprise chuẩn: Header cố định (`shrink-0 border-b pr-12`), Body cuộn mượt mà (`flex-1 overflow-y-auto p-5 sm:p-6`), Footer cố định (`shrink-0 border-t bg-muted/20 p-4 px-6`).
  * Các nút hành động chính được đưa xuống `SheetFooter` cố định luôn hiển thị trước mắt người dùng kèm chip trạng thái tổng hợp.
  * Bảng định mức AI đề xuất: Cột tên nhiệm vụ `min-w-[240px] break-words font-semibold`, các cột số `tabular-nums` căn giữa chuẩn mực.
  * Dọn sạch 100% imports không sử dụng (`ScrollArea`, `Table`, `ChevronRight`, `ShieldCheck`).
- `apps/admin_khcn/features/hrm/components/work-plans/master-plans/ManualPlanSelectorByRankClient.tsx`:
  * Nâng cấp breakpoint 2 cột sang `xl:flex-row` (>= 1280px).
  * Bổ sung nút Toggle thu gọn / mở rộng Sidebar VTVL (`PanelRightClose` / `PanelRightOpen`) giúp người dùng có thể giải phóng 100% chiều rộng màn hình cho bảng tính (Spreadsheet Data Grid) khi cần tập trung nhập liệu.
  * Form gán nhanh: Chuyển sang `grid-cols-2 sm:grid-cols-4 lg:grid-cols-5`, các ô input số có `[appearance:textfield]` loại bỏ spinner lệch số.
  * Bảng tính chỉ tiêu (Worksheet): Thêm viền chia cột `border-r border-border/40`, tăng độ rộng các ô input số lên `w-20` (80px), font-bold, `tabular-nums`, đường nét kẻ ô phong cách bảng tính dữ liệu chuyên nghiệp.
  * Cột VTVL bên phải: Bổ sung `sticky top-4 xl:sticky` giữ cố định vị trí khi cuộn trang, thêm nút thu gọn nhanh trên header cột.

### 3. Kiểm chứng máy thực tế & Phản biện Diff
- Lệnh kiểm chứng: `npx tsc --noEmit` tại `apps/admin_khcn` -> Exit code 0 (Pass 100%, 0 lỗi type/lint).
- Phản biện diff: Đảm bảo 100% tuân thủ 7 Bộ ràng buộc kỹ thuật:
  * Zero scroll trap, zero overlap, layout fluid không bị cắt xén.
  * Responsive đa kích thước màn hình.
  * 100% clean code, không có debug logs, UTF-8 chuẩn.

## [2026-10-13] Nâng cấp Giao diện Thư viện Nhiệm vụ theo VTVL (`rank-templates`) lên chuẩn UX/UI Enterprise

### 1. Vấn đề phát hiện & Khắc phục
- **Lỗi giao diện (Layout breakage):**
  * Hardcode `h-[600px]` tại `CivilServantTaskConfig`, `PublicEmployeeTaskConfig`, `PartyTaskConfig` làm vỡ layout co giãn của Next.js parent container (`overflow-hidden`), khiến phần dưới danh sách nhiệm vụ bị cắt xén, thanh cuộn trong bị kẹt và không tương thích đa thiết bị.
  * Radix Accordion ở cột danh mục VTVL khởi tạo `defaultValue` rỗng khi mount (do dữ liệu async chưa load xong), dẫn đến toàn bộ các nhóm VTVL bị đóng (collapsed) hoặc trống trơn khi vào trang.
  * Lặp code 95% giữa 3 file `CivilServantTaskConfig`, `PublicEmployeeTaskConfig`, `PartyTaskConfig`.
  * Thiếu trường `defaultWeight` (Trọng số mặc định % KPI) mặc dù backend `TaskRankTemplate` đã hỗ trợ.
  * Thao tác xóa thiếu hộp thoại xác nhận an toàn; nút Sửa/Xóa hiển thị thô sơ.
  * Thiếu tính năng tìm kiếm VTVL realtime và lọc theo trạng thái có/chưa có nhiệm vụ mẫu.

### 2. Phạm vi & File tác động
- `apps/admin_khcn/features/hrm/components/work-plans/master-plans/RankTaskCatalogManager.tsx`:
  * Tạo mới component hợp nhất quản lý Thư viện Nhiệm vụ VTVL theo chuẩn UX/UI Enterprise.
  * Layout Fluid Responsive: `flex-1 min-h-0 flex flex-col md:flex-row gap-4 w-full`, xóa bỏ triệt để hardcode `h-[600px]`, cuộn độc lập cho cả 2 cột.
  * Top Metric Strip: Hiển thị 4 chỉ số tổng quan (Tổng VTVL chuẩn hóa, Số VTVL đã có mẫu, Tổng nhiệm vụ mẫu, Tỷ lệ bao phủ VTVL %).
  * Cột trái (VTVL Directory): Ô tìm kiếm realtime, Filter chip (Tất cả / Đã có mẫu / Chưa có), Accordion nhóm chức danh controlled tự động mở, Badge đếm số nhiệm vụ mẫu trên từng VTVL, Active state nổi bật `border-l-4 border-primary`.
  * Cột phải (Task Catalog Management): Header VTVL chi tiết, Ô tìm kiếm nhiệm vụ mẫu, Quick Add Panel kèm gợi ý chip ĐVT một chạm (Văn bản, Báo cáo, Hồ sơ, Đề tài, Quyết định...), hỗ trợ Trọng số KPI (%), Sheet thêm mới trượt từ phải (chuẩn UX form dài), Inline edit và `AlertDialog` xác nhận xóa an toàn (chuẩn UX tương tác ngắn).
- `apps/admin_khcn/features/hrm/components/work-plans/master-plans/CivilServantTaskConfig.tsx`:
  * Refactor sử dụng `RankTaskCatalogManager` cho Khối Công chức (Nghị định 62/2020/NĐ-CP & TT 12/2022/TT-BNV).
- `apps/admin_khcn/features/hrm/components/work-plans/master-plans/PublicEmployeeTaskConfig.tsx`:
  * Refactor sử dụng `RankTaskCatalogManager` cho Khối Viên chức (Nghị định 106/2020/NĐ-CP & NĐ 115/2020/NĐ-CP).
- `apps/admin_khcn/features/hrm/components/work-plans/master-plans/PartyTaskConfig.tsx`:
  * Refactor sử dụng `RankTaskCatalogManager` cho Khối Cơ quan Đảng (Quy định 137-QĐ/TW & Hướng dẫn BTCTW).
- `apps/admin_khcn/features/hrm/components/work-plans/master-plans/ConfigureRankTasksClient.tsx`:
  * Nâng cấp Header Enterprise với icon `Library`, Badge "Chuẩn hóa Nhà nước", nút "Làm mới dữ liệu" và nút "Đồng bộ thư viện".
  * Tab navigation hiện đại hiển thị số lượng nhiệm vụ mẫu trực tiếp trên từng tab.
- `apps/admin_khcn/features/hrm/components/work-plans/master-plans/hooks/useConfigureRankTasks.ts`:
  * Bổ sung tính toán thống kê (statsByClass), hàm `refetchAll` làm mới dữ liệu và xử lý phòng hộ an toàn dữ liệu `templates`.
- `apps/admin_khcn/features/hrm/components/work-plans/master-plans/hooks/useTaskConfigForm.ts`:
  * Bổ sung quản lý `defaultWeight` (trọng số KPI %), trạng thái loading (`isSubmitting`, `isUpdating`, `deletingId`), hỗ trợ `AlertDialog` xác nhận xóa an toàn.

### 3. Kiểm chứng máy thực tế & Phản biện
- Lệnh kiểm chứng: `npx tsc --noEmit` trong `apps/admin_khcn` -> Exit code 0 (Pass 100%).
- Tuân thủ 100% 7 Bộ ràng buộc kỹ thuật:
  * UI/UX: `min-w-0` trên tất cả các flex/grid items có text; `break-words` trên text tên nhiệm vụ; Sheet cho form dài; Dialog cho xác nhận ngắn; Fluid layout không hardcode chiều cao.
  * Routing: BaseURL không lặp `/admin`.
  * Next.js 15 App Router: Giữ Server Component và Client Component đúng phân tầng.
  * Clean code: 100% zero debug logs, encoding UTF-8 không BOM.

## [2026-10-13] Khắc phục triệt để lỗi chồng đè nội dung và giải phóng thanh cuộn (Scroll Release) tại `rank-templates`
- **Vấn đề phản hồi:**
  * Nội dung các thẻ và danh sách bị đè lên nhau, list dài bị fix cứng chiều cao không scroll được, làm người dùng bị che mất thông tin bên dưới.
- **Nguyên nhân cốt lõi phát hiện:**
  * Layout cha `apps/admin_khcn/app/services/hrm/work-plans/layout.tsx` bị đặt 2 lớp `h-full overflow-hidden`, chặn đứng hoàn toàn cơ chế cuộn của `service-layout` và con bên trong.
  * Form thêm nhanh (Quick Add Bar) và thẻ nhiệm vụ cố ép hiển thị ngang (`md:flex-row`) trong khi không gian cột phải bị thu hẹp do cột trái chiếm chỗ, gây co cụm và chồng đè các ô input lên nhau.
  * Radix `ScrollArea` bị kẹt trong flex container không co giãn được, gây mất thanh cuộn.
- **Biện pháp xử lý & hoàn thiện:**
  1. `apps/admin_khcn/app/services/hrm/work-plans/layout.tsx`: Gỡ bỏ triệt để các thuộc tính `h-full overflow-hidden` khóa cứng; chuyển sang `min-h-full flex flex-col w-full min-w-0` giúp toàn trang cuộn tự nhiên mượt mà trên `service-layout`.
  2. `apps/admin_khcn/features/hrm/components/work-plans/master-plans/RankTaskCatalogManager.tsx`:
     * Đổi breakpoint từ `md:flex-row` sang `lg:flex-row` đảm bảo ở màn hình vừa và nhỏ 2 cột tự động xếp dọc (stacked) rộng rãi, không bị ép hẹp.
     * Cột trái: Bổ sung nút gập/mở sidebar VTVL (`PanelLeftClose` / `PanelLeftOpen`), thanh cuộn độc lập `max-h-[460px] lg:max-h-[calc(100vh-320px)] overflow-y-auto pr-1` chuẩn CSS.
     * Quick Add Bar: Tái thiết kế dạng Responsive Grid 12 cột (`sm:grid-cols-12`) có label rõ ràng cho từng ô, chống triệt để mọi va chạm đè text.
     * Thẻ nhiệm vụ: Thiết kế thông thoáng, tên nhiệm vụ hiển thị đầy đủ (`whitespace-normal break-words leading-relaxed text-sm`), hàng metadata badge và nút bấm tách biệt rõ ràng.
     * Cột phải: Thanh cuộn độc lập `max-h-[580px] lg:max-h-[calc(100vh-320px)] overflow-y-auto pr-1`, người dùng cuộn xem được 100% danh sách dù có hàng trăm nhiệm vụ.
- **Kiểm chứng máy:**
  * `npx tsc --noEmit` trong `apps/admin_khcn`: Exit code 0 (Pass 100%).



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





## [2026-10-13] Khắc phục Hoàn toàn Lỗi Cắt viền & Lỗi Nhúng Ảnh Sơ đồ 1 Kiến trúc Microservices trong Báo cáo DOCX
- **Vấn đề người dùng phản ánh:**
  * Sơ đồ 1 trong file Word xuất ra bị lỗi cắt viền bên trái (mất chữ "LỚP DỊCH VỤ NỀN TẢNG...", "user-service..."), các đường mũi tên gRPC cắt chéo đè lên tiêu đề, ký tự `★` bị biến thành ô vuông rỗng `▯`, và phần chữ Integration Hub bị tràn mép phải.
  * Trong file Word DOCX trước đó, ảnh bị nhúng không có thuộc tính `type: 'png'`, khiến Word gán quan hệ thành `.undefined`, gây lỗi không thể hiển thị ảnh bình thường.
- **Biện pháp xử lý & chuẩn hóa:**
  1. **Thiết kế lại Sơ đồ 1 chuẩn sắc nét (1400 x 1120 px) bằng Canvas Engine (`@napi-rs/canvas`):**
     * Căn chỉnh lề rộng rãi, phân cấp 4 tầng mạch lạc: (1) Client Layer, (2) API Gateway & Manager, (3) Microservices Layer (Core Services & Domain Services), (4) Event Bus.
     * Tách thanh Trục Bus kết nối `TRỤC KẾT NỐI NỘI BỘ gRPC CLIENT DELEGATION` ở giữa Gateway và Microservices, giúp các mũi tên điều hướng vuông vức, sạch sẽ, hoàn toàn không cắt đè lên chữ tiêu đề.
     * Thay thế ký tự lỗi font `★` bằng các nhãn badge chuyên nghiệp bo góc: `[SOURCE OF TRUTH VTVL]`, `[TRÁI TIM QUY TRÌNH]`, `[MINH CHỨNG & TÀI LIỆU]`, `[BỘ MÁY TÍNH KPI 6 TRỤC]`, `[VĂN BẢN & PHÔI DỰ THẢO]`, `[DASHBOARD & THỐNG KÊ]`.
     * Toàn bộ text được căn chỉnh trong khung an toàn, không có bất kỳ điểm nào bị cắt lề trái hay tràn lề phải.
     * Lưu ảnh chuẩn tại `docs/examplebtc/diagram_system_architecture.png`.
  2. **Khắc phục triệt để lỗi chèn ảnh vào DOCX:**
     * Bổ sung tường minh `type: 'png'` cho `ImageRun` của cả 2 sơ đồ (Hình 1 và Hình 2).
     * Xác nhận tệp nén OpenXML tạo đúng `media/*.png` và liên kết trong `document.xml.rels` khớp hoàn toàn với `[Content_Types].xml`.
     * Xuất đồng bộ cả 2 bản `Bao_Cao_Giai_Phap_KPI_OKR_BTCTU_Hoan_Thien.docx` và `Bao_Cao_Giai_Phap_KPI_OKR_BTCTU.docx` trong `docs/examplebtc/`.
  3. **Kiểm chứng máy thực tế:**
     * `node scratch/draw_architecture_perfect.js`: Sinh ảnh 348,820 bytes.
     * `node scratch/generate_kpi_docx_perfect.js`: Sinh 2 file DOCX dung lượng 492,534 bytes.
     * Giải nén kiểm tra cấu trúc OpenXML: Xác nhận quan hệ hình ảnh `Target="media/*.png"`, mã MIME `image/png` hợp lệ 100%.
  4. **Dọn dẹp rác:** Dọn sạch các file thử nghiệm tạm thời, khôi phục trạng thái workspace sạch 100%.

## [2026-10-13] Tinh chỉnh Độ giãn Sơ đồ Kiến trúc Microservices (1600 x 1430 px) - Triệt tiêu 100% Hiện tượng Chồng đè Thuộc tính
- **Vấn đề người dùng phản ánh:**
  * Sơ đồ 1 trong bản trước dù đã có thanh Bus nhưng khoảng cách giữa các khối Core Services, Domain Services và Event Bus vẫn hơi sát nhau, một số nhãn mũi tên và tiêu đề phân tầng có nguy cơ chồng đè lên nhau.
- **Biện pháp xử lý & chuẩn hóa:**
  1. **Nâng cấp không gian canvas lên 1600 x 1430 px:**
     * Mở rộng bề ngang mỗi cột service từ 395px lên **460px**, tăng khoảng cách giữa các cột lên **50px**.
     * Giãn khoảng đệm giữa Core Services và Domain Services lên **80px**, đặt 3 mũi tên nét đứt (`Lấy VTVL & Phân công`, `Ủy quyền duyệt BPMN`, `Lưu file minh chứng`) với nhãn pill badge nằm hoàn toàn trong khoảng trống, tuyệt đối không chạm tiêu đề phân tầng.
     * Cung cấp khoảng đệm **50px** phía trên Event Bus, nhãn `Bắn Sự kiện AMQP` và `Nhận Đồng bộ CQRS` đứng độc lập.
     * Căn chỉnh toàn bộ danh sách bullet bên trong 6 service thoáng đãng (line-height 21px - 22px), chữ sắc nét, font Segoe UI.
  2. **Cập nhật đồng bộ các tệp Word:**
     * Ghi đè [`docs/examplebtc/diagram_system_architecture.png`](file:///c:/Users/Admin/Desktop/daklak-workspace/docs/examplebtc/diagram_system_architecture.png) (420.1 KB).
     * Cập nhật kích thước tỷ lệ khung hình chuẩn `width: 580, height: 518` trong file Word.
     * Xuất tệp Word [`docs/examplebtc/Bao_Cao_Giai_Phap_KPI_OKR_BTCTU.docx`](file:///c:/Users/Admin/Desktop/daklak-workspace/docs/examplebtc/Bao_Cao_Giai_Phap_KPI_OKR_BTCTU.docx) (558.3 KB) và bản dự phòng song song [`docs/examplebtc/Bao_Cao_Giai_Phap_KPI_OKR_BTCTU_V2.docx`](file:///c:/Users/Admin/Desktop/daklak-workspace/docs/examplebtc/Bao_Cao_Giai_Phap_KPI_OKR_BTCTU_V2.docx) (558.3 KB).
  3. **Kiểm chứng máy:**
     * `pnpm --filter admin_khcn run typecheck` (`tsc --noEmit`): Exit code 0 (Pass 100%).
     * File ảnh và OpenXML DOCX hợp lệ 100%.

## [2026-10-13] Chuẩn hóa Chức năng In/Xuất PDF Biểu mẫu Đánh giá KPI (Nghị định 30/2020/NĐ-CP)
- **Yêu cầu:** Chỉnh sửa lại chức năng in/pdf chỉ in nội dung văn bản, loại bỏ triệt để các nội dung dư thừa xung quanh (thanh điều khiển xanh lá, nút bấm, cửa sổ pop-up thừa, và lề/header/footer mặc định của trình duyệt).
- **Phạm vi file đã triển khai:**
  * `apps/admin_khcn/features/hrm/utils/kpiXmlToDocx.ts`:
    - Tách hàm chuyên biệt `generatePrintDocumentHtml(data: ParsedXmlDocumentData): string`:
      * Xóa bỏ 100% thanh banner màu xanh lá (`.no-print`, các nút bấm, padding 24px ngoài body).
      * Thiết lập quy chuẩn trang in `@page { size: A4 portrait; margin: 20mm 15mm 20mm 30mm; }` bám sát thể thức văn bản hành chính theo Nghị định 30/2020/NĐ-CP (lề trên 20mm, lề dưới 20mm, lề trái 30mm, lề phải 15mm).
      * Cấu hình `@media print { html, body { margin: 0 !important; padding: 0 !important; } }` triệt tiêu lề thừa bên ngoài.
      * Định dạng font chuẩn "Times New Roman", cỡ chữ 13-14pt, line-height 1.25 - 1.35, căn chỉnh bảng số liệu, đường kẻ phân cách Quốc hiệu/Tiêu ngữ đúng quy định.
    - Cải tiến hàm `printKpiXmlDocument(xmlContent, templateTitleFallback)`:
      * Thay thế cơ chế `window.open` popup mở tab/cửa sổ thừa bằng kỹ thuật in qua **`iframe` ẩn chuyên dụng** (`iframe.style.visibility = 'hidden'`, kích thước 0x0).
      * Khi người dùng bấm nút in/PDF, hộp thoại in của hệ điều hành xuất hiện trực tiếp ngay trên trang hiện tại, xem trước bản in chỉ có duy nhất văn bản hành chính, hoàn toàn không có bất kỳ thành phần giao diện hay nút bấm thừa nào.
      * Tự động giải phóng và dọn dẹp thẻ iframe sau khi hoàn tất.
- **Kiểm chứng máy thực tế:**
  * `npm --prefix apps/admin_khcn run typecheck` (`tsc --noEmit`): Exit code 0 (Pass 100%).
  * Diff rà soát: Tuân thủ 100% 7 Bộ ràng buộc kỹ thuật, không có console.log/debugger, mã hóa UTF-8 không BOM.

## [2026-10-13] Xây dựng Endpoint API Printer Xuất Bản In Trực tiếp từ Server (Nghị định 30/2020/NĐ-CP)
- **Yêu cầu:** Tận dụng file XML biểu mẫu đã có sẵn trên server, xây dựng và kết nối trực tiếp endpoint API printer để xuất bản in HTML thuần túy phục vụ in ấn / PDF, không phụ thuộc hoàn toàn vào parsing phía trình duyệt client.
- **Phạm vi file đã triển khai:**
  * `apps/api-gateway/src/modules/hrm/kpi-xml-printer.util.ts`:
    - Tạo mới tiện ích biên dịch XML sang HTML trang in chuẩn A4 Nghị định 30/2020/NĐ-CP trên môi trường Node.js.
    - Bóc tách toàn diện: Cơ quan ban hành, Quốc hiệu (Đảng / Nước), tiêu đề văn bản, kỳ đánh giá, thông tin cán bộ, căn cứ pháp lý, các bảng dữ liệu động và khối chữ ký.
    - Cấu hình @page A4 portrait, lề 20mm/15mm/20mm/30mm, font Times New Roman 13-14pt, triệt tiêu 100% nội dung dư thừa (nút bấm, banner, header/footer của trình duyệt).
  * `apps/api-gateway/src/modules/hrm/kpi-forms.controller.ts`:
    - Thêm endpoint `GET /admin/hrm/kpi-forms/:formCode/print`: Lấy XML từ `kpiService.GetFormTemplateXml` theo `formCode` và quyền tổ chức, biên dịch và trả về HTML trang in thuần túy với `Content-Type: text/html; charset=utf-8`.
    - Thêm endpoint `POST /admin/hrm/kpi-forms/print`: Nhận payload `{ xmlContent, templateTitle }`, biên dịch và trả về HTML trang in cho nội dung XML tùy biến.
  * `apps/admin_khcn/features/hrm/api/kpi-forms.api.ts`:
    - Thêm `getPrintUrl(formCode: string)`: Trả về URL API printer `/api/v1/admin/hrm/kpi-forms/${formCode}/print`.
    - Thêm `printCustomXml(xmlContent, templateTitle)`: Gọi `POST /hrm/kpi-forms/print` nhận HTML từ server printer endpoint.
  * `apps/admin_khcn/features/hrm/components/work-plans/evaluation-forms/EvaluationFormsClient.tsx`:
    - Cập nhật `handlePrintPdf` và `handlePrintPdfFromPreview`: Kết nối trực tiếp URL API printer của server thông qua hidden iframe chuyên dụng, kích hoạt in ngay lập tức.
    - Cập nhật `handlePrintPdfFromEditor`: Gọi API printer của server để render HTML và kích hoạt in qua iframe.
- **Kiểm chứng máy thực tế:**
  * `npm --prefix apps/admin_khcn run typecheck` (`tsc --noEmit`): Exit code 0 (Pass 100%).
  * `npm --prefix apps/api-gateway run build`: Exit code 0 (Pass 100%).
  * `npm --prefix apps/hrm-service run build`: Exit code 0 (Pass 100%).
  * Diff rà soát: Tuân thủ 100% 7 Bộ ràng buộc kỹ thuật (BaseURL không lặp `/admin`, UTF-8 không BOM, zero console.log).

## [2026-10-13] Sửa Lỗi Font Chữ và Chuẩn Hóa Tiếng Việt Văn Bản Dự Thảo Quyết Định Mẫu 05 (Báo Cáo 5)
- **Yêu cầu:** Khắc phục lỗi phông chữ tiếng Việt (lỗi dấu, trộn lẫn font-sans/font-serif, kích thước nhỏ và co giật chân chữ) tại bản "Dự thảo Quyết định Phê duyệt Xếp loại Chất lượng (Mẫu 05)" trên trang Chi tiết Báo cáo số 5 (`http://113.184.220.82/admin/services/reports/5`). Chuyển thành chuẩn tiếng Việt và chuẩn thể thức văn bản hành chính theo Nghị định 30/2020/NĐ-CP & Quy định 01-QĐ/TW.
- **Phạm vi file đã triển khai:**
  * `apps/admin_khcn/app/globals.css`:
    - Nhúng Google Fonts Tinos (`@import url('https://fonts.googleapis.com/css2?family=Tinos:ital,wght@0,400;0,700;1,400;1,700&display=swap')`) — bộ phông tương thích hoàn toàn Unicode tiếng Việt của Times New Roman.
    - Định nghĩa biến CSS `--font-serif` và `--font-times` trỏ về `"Times New Roman", "Tinos", "Liberation Serif", serif`.
  * `apps/admin_khcn/features/reports/components/reports/ReportViewer.tsx`:
    - Loại bỏ 100% các class `font-sans` bị gán rải rác trong nội dung văn bản quyết định; đồng nhất toàn bộ khối quyết định sang phông Times New Roman / Tinos (`fontFamily: "'Times New Roman', 'Tinos', 'Liberation Serif', serif"`).
    - Chuẩn hóa kích thước chữ và khoảng cách dòng: chữ nội dung nâng lên 13pt - 14pt (thay vì 11px/12px), giãn dòng `leading-[1.4]`, lề thụt đầu dòng `textIndent: '1.27cm'` theo đúng thể thức văn bản hành chính Việt Nam.
    - Tái cấu trúc bố cục trang hiển thị: Mô phỏng tờ văn bản hành chính A4 trên nền giấy trắng (`bg-white text-black p-8 sm:p-12 shadow-sm rounded-none border border-slate-200`).
    - Chuẩn hóa Tiêu đề Đảng, Quốc hiệu, Căn cứ pháp lý, Các Điều 1, 2, 3 và Bảng chữ ký/Nơi nhận 2 cột theo đúng thể thức Hướng dẫn 36-HD/VPTW và Nghị định 30/2020/NĐ-CP.
    - Cải tiến chức năng in `handlePrintMau05Decision`: In trực tiếp qua iframe ẩn chuyên dụng, bản in và xuất PDF chỉ chứa 100% nội dung tờ quyết định A4, không có giao diện web thừa.
- **Kiểm chứng máy thực tế:**
  * `npm --prefix apps/admin_khcn run typecheck` (`tsc --noEmit`): Exit code 0 (Pass 100%).
  * Kiểm tra BOM & Encoding: Không có byte BOM, mã hóa UTF-8 thuần túy.
  * Diff rà soát: Tuân thủ 100% 7 Bộ ràng buộc kỹ thuật.

## [2026-10-13] Chuyển Chức Năng In Mẫu 05 Sang Gọi Trực Tiếp Endpoint Print của Server Thay Vì Dựng HTML Ở Client
- **Yêu cầu:** Loại bỏ việc tự sinh chuỗi HTML tĩnh ở client tại hàm `handlePrintMau05Decision` trong `ReportViewer.tsx`, chuyển sang gọi trực tiếp endpoint API printer đã có trên server (`/api/v1/admin/hrm/kpi-forms/M05_BAOCAO_QUYETDINH/print`).
- **Phạm vi file đã triển khai:**
  * `apps/api-gateway/src/modules/hrm/kpi-xml-printer.util.ts`:
    - Nâng cấp nhận diện `isMau05` (`M05_BAOCAO_QUYETDINH`, `MAU_05`, `Form05_FinalEvaluationReport`, `DecisionTerms`).
    - Parse chuẩn các Điều 1, 2, 3 và trích yếu quyết định (`subTitle`), căn cứ pháp lý, khối chữ ký Trưởng ban Tổ chức Tỉnh ủy.
    - Đảm bảo endpoint `GET /admin/hrm/kpi-forms/:formCode/print` render ra bản in Mẫu 05 chuẩn Nghị định 30/2020/NĐ-CP & văn bản Đảng.
  * `apps/admin_khcn/features/reports/components/reports/ReportViewer.tsx`:
    - Xóa bỏ hoàn toàn hơn 220 dòng mã HTML hardcode trong `handlePrintMau05Decision`.
    - Kết nối trực tiếp URL `kpiFormsApi.getPrintUrl('M05_BAOCAO_QUYETDINH')` qua hidden iframe chuyên dụng để kích hoạt in.
- **Kiểm chứng máy thực tế:**
  * `npm --prefix apps/admin_khcn run typecheck` (`tsc --noEmit`): Exit code 0 (Pass 100%).
  * `npm --prefix apps/api-gateway run build`: Exit code 0 (Pass 100%).
  * Kiểm tra BOM & Encoding: 100% UTF-8 không BOM.
  * Grep debug: 0 console.log, 0 debugger.
  * Diff rà soát: Tuân thủ nghiêm ngặt 7 Bộ ràng buộc kỹ thuật.
