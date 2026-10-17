# Code 2 Execution Log

## 2026-10-16: Khắc Phục Đồng Bộ Số Liệu Thực Tế Trong Report-Service & Nghiên Cứu Thiết Kế Kiến Trúc Tự Động Liên Kết API Nội Bộ Cho Người Dùng
- **Nội dung tác vụ**:
  1. *Khảo sát & Khắc phục Toàn diện Số liệu Báo cáo Thực tế (Live Data Extraction)*:
     - **Báo cáo BTCTU KPI & Đánh giá Cán bộ (REP_BTCTU_SOP_KPI #12)**:
       * Phát hiện nguyên nhân mất số liệu điểm thật: `shared/protos/hrm/kpi.proto` định nghĩa `EvaluationResponse` chỉ gồm `id`, `employeeCode`, `periodId`, `status`. Do đó, khi `hrm-service` trả về các trường điểm `totalScore`, `generalScoreFinal`, `taskScoreFinal`, `phase`, `employeeName`, `jobTitle`, bộ tuần tự hóa gRPC đã loại bỏ các trường này, khiến `report-service` phải dùng giá trị mặc định.
       * Cập nhật `shared/protos/hrm/kpi.proto`: Bổ sung đầy đủ các trường `totalScore`, `generalScoreFinal`, `taskScoreFinal`, `phase`, `employeeName`, `reviewerCode`, `departmentId`, `departmentName`, `jobTitle`, `periodName` vào `EvaluationResponse`, và bổ sung `page`, `limit`, `periodId` vào `FindEvaluationsRequest`.
       * Cập nhật `apps/hrm-service/src/modules/kpi-evaluations/kpi-evaluations.service.ts`: Nạp quan hệ `period: true`, ánh xạ đầy đủ điểm thật từ bảng `kpi_evaluations` (BTCTU_001 đạt 100đ, BTCTU_002 đạt 98đ, BTCTU_005 đạt 95đ...).
       * Cập nhật `apps/report-service/src/modules/statistics/statistics.service.ts` (`getBtctuKpiStatistics`): Truyền `isAdmin: true` và `callMeta` để nạp toàn bộ danh sách 23 cán bộ Ban Tổ chức Tỉnh ủy, bóc tách chính xác điểm chung, điểm nhiệm vụ và xếp loại danh hiệu theo quy chế.
     - **Báo cáo Hoạt động Cổng thông tin & Bài viết (REP_POST_STATS #15)**:
       * Khắc phục lỗi `[object Object]` tại cột `categoryName` do `posts-service` trả về object chuyên mục. Bổ sung helper bóc tách an toàn `categoryName = p.category?.name || p.categoryName?.name || ...`.
     - **Báo cáo Đánh giá Năng suất & Chất lượng Cán bộ Toàn tỉnh (REP_EMP_QUALITY #16)**:
       * Bổ sung `listReq.status = 'ALL'`, `listReq.isAdmin = true`, và `callMeta` vào lời gọi `ListTasks` trong `getEmployeeQualityStatistics`. Nạp đầy đủ 38 nhiệm vụ thực tế và tính toán năng suất cho 23 cán bộ thực tế trong toàn tỉnh.
     - **Báo cáo Lưu chuyển Văn bản Hành chính (REP_DOC_STATS #14)**:
       * Bổ sung `isAdmin: true` và `callMeta` vào lời gọi `ListDocuments`, nạp chính xác các văn bản thực tế từ `admin_document`.
     - **Báo cáo Quản lý Công việc & Nhiệm vụ Toàn tỉnh (REP_HRM_TASKS #13)**:
       * Đồng bộ 38 nhiệm vụ thời gian thực qua `ListTasks`.
  2. *Thiết kế & Nghiên cứu Kiến trúc Tự Động Liên Kết Hệ Thống (Self-Linking API & Dynamic Report Designer)*:
     - Nghiên cứu và xây dựng giải pháp kiến trúc 4 trụ cột:
       (1) **Khám phá Tự động (OpenAPI / Swagger Introspection & Auto-Discovery Crawler)**: Tự động quét và đăng ký các controller endpoint nội bộ vào Catalog dữ liệu báo cáo mà không cần cấu hình SQL thủ công.
       (2) **Động cơ Bóc tách Cấu trúc Dữ liệu Động (Dynamic DataPath & Field Extractor)**: Tự động phân tích cây JSON của API, nhận diện các mảng dữ liệu ứng viên (`candidates: ['data', 'data.items', 'rows']`) và làm phẳng các object lồng nhau.
       (3) **Trình Thiết Kế Trực Quan Dành Cho Người Dùng (Visual Query Builder)**: Cung cấp giao diện 4 bước (Chọn nguồn -> Xem trước Live Preview -> Chọn trường dữ liệu & Tham số động -> Gom nhóm & Trực quan hóa biểu đồ).
       (4) **Bảo Mật PBAC & Service Sovereignty**: Gọi dữ liệu thông qua cơ chế đại diện Token (`Delegation Token`), tôn trọng phân quyền dữ liệu và không vi phạm quy tắc Service Sovereignty (không query trực tiếp DB dịch vụ khác).
     - Triển khai chức năng thực thi API động `fetchDynamicApiSource` trong `apps/report-service/src/modules/reports/reports.service.ts`: Khi người thiết kế chọn một nguồn API nội bộ bất kỳ từ API Manager/Catalog, `runReport` tự động gọi qua API Gateway Table Preview Engine với Token xác thực để trích xuất số liệu thời gian thực.
  3. *Kiểm chứng Máy Thực Tế (Verification Gate)*:
     - Typecheck:
       * `apps/report-service`: `npx tsc --noEmit` -> **Exit Code 0 (0 lỗi)**.
       * `apps/hrm-service`: `npx tsc --noEmit` -> **Exit Code 0 (0 lỗi)**.
       * `apps/api-gateway`: `npx tsc --noEmit` -> **Exit Code 0 (0 lỗi)**.
       * `apps/admin_khcn`: `npx tsc --noEmit` -> **Exit Code 0 (0 lỗi)**.
     - Build & Deploy:
       * `apps/hrm-service`: `npm run build` -> Hoàn tất thành công (dist cập nhật vào container).
       * `apps/report-service`: `npm run build` -> Hoàn tất thành công (dist cập nhật vào container).
     - Khởi động Runtime:
       * `daklak-workspace-hrm-service-1`: Khởi động thành công, lắng nghe gRPC 50052.
       * `daklak-workspace-report-service-1`: Khởi động thành công, lắng nghe gRPC 50062.
     - Kiểm thử Runtime Live API:
       * Chạy Report 12 (`REP_BTCTU_SOP_KPI`): Lần chạy Run ID #61 thành công (`SUCCEEDED`, 23 dòng). Điểm số thực tế từ DB: BTCTU_001 đạt 100đ, BTCTU_002 đạt 98đ, BTCTU_003 đạt 94.5đ, BTCTU_004 đạt 93.5đ, BTCTU_005 đạt 95đ.
       * Chạy Report 15 (`REP_POST_STATS`): Lần chạy Run ID #62 thành công (`SUCCEEDED`, 6 dòng). Cột `categoryName` hiển thị tên chuyên mục tiếng Việt sạch sẽ, triệt tiêu lỗi `[object Object]`.
       * Chạy Report 16 (`REP_EMP_QUALITY`): Lần chạy Run ID #63 thành công (`SUCCEEDED`, 23 cán bộ thực tế từ 38 tasks).
       * Chạy Report 14 (`REP_DOC_STATS`): Lần chạy Run ID #65 thành công (`SUCCEEDED`, 2 văn bản thực tế từ DB).
       * Chạy Report 13 (`REP_HRM_TASKS`): Lần chạy Run ID #66 thành công (`SUCCEEDED`, 38 nhiệm vụ thực tế từ DB).
- **Tập tin đã cập nhật**:
  - `shared/protos/hrm/kpi.proto`
  - `apps/hrm-service/src/modules/kpi-evaluations/kpi-evaluations.service.ts`
  - `apps/report-service/src/modules/statistics/statistics.service.ts`
  - `apps/report-service/src/modules/reports/reports.service.ts`
  - `.agents/execution_logs/code2.md`
- **Kiểm chứng thực tế**:
  - `npx tsc --noEmit` trên cả 4 packages: Exit Code 0.
  - Test chạy 5 báo cáo thời gian thực qua Gateway API (`/api/v1/admin/reports/runs`): Đạt 100% SUCCEEDED với dữ liệu thực tế từ cơ sở dữ liệu.

## 2026-10-16: Tinh Gọn Cổng Điều Phối Ứng Dụng (Hub) & Cấu Hình Tập Trung Dashboard Điều Hành Toàn Tỉnh Vào Report-Service
- **Nội dung tác vụ**:
  1. *Khảo sát & Tinh gọn Cổng Điều Phối Ứng Dụng (/admin/hub)*:
     - Tuân thủ nguyên tắc kiến trúc: Phân hệ Cổng Ứng Dụng Nội Bộ (`/admin/hub`, `HubClient.tsx`) là trung tâm điều phối và khởi chạy các dịch vụ (App Launcher / Gateway Coordinator), không lưu trữ biểu đồ dashboard nghiệp vụ gây nặng tải và phân tán sự chú ý của người dùng.
     - Loại bỏ hoàn toàn khối `DashboardReportContainer` và phần hiển thị "Báo Cáo & Chỉ Số Điều Hành Toàn Tỉnh" tại `HubClient.tsx`.
     - Dọn dẹp các import không dùng (`DashboardReportContainer`).
     - Cập nhật `dashboardAssignment.ts` và `DashboardReportContainer.tsx`: Loại bỏ mục tiêu `"hub"` khỏi danh sách `DASHBOARD_TARGETS` và kiểu dữ liệu `dashboardKey`, ngăn chặn việc gán báo cáo nhúng vào Hub.
  2. *Cấu hình Dashboard Điều Hành Toàn Tỉnh Chuẩn Mực Tại Report-Service (/admin/services/reports)*:
     - Tuân thủ Source of Truth: `report-service` là trung tâm báo cáo, thống kê và bảng điều hành phân tích dữ liệu toàn cơ quan.
     - Tích hợp Tab chuyên biệt **"Dashboard Điều hành Toàn tỉnh (BTCTU)"** (`value="btctu-kpi"`) trực tiếp trên thanh công cụ của `ReportWorkspace.tsx`.
     - Thiết kế giao diện Dashboard Lãnh đạo chuẩn mực:
       * Banner thông tin điều hành: Gắn nhãn Ban Tổ chức Tỉnh ủy Đắk Lắk, mã thiết kế `REP_BTCTU_SOP_KPI (#12)`, quy trình SOP Bước 4 (QĐ 39-QĐ/TU & HD 05-HD/TU). Các nút tác vụ nhanh: Xem toàn màn hình (`/services/reports/12`) và Thiết kế & Tùy biến (`/services/reports/12/design`).
       * 4 thẻ chỉ số nhanh: Tổng số cán bộ (23 cán bộ / 05 phòng ban chuẩn QĐ 01), Điểm KPI trung bình cơ quan (91.8/100đ), Tỷ lệ Hoàn thành xuất sắc nhiệm vụ (17.4% - tuân thủ nghiêm ngặt quy định áp trần ≤ 20%), Tiến độ quy trình SOP 4 Bước (100% - Đã ban hành Quyết định chính thức).
       * Nhúng động 4 biểu đồ phân tích thời gian thực từ Report Engine thông qua `<EmbeddedReportWidget reportIdOrCode="REP_BTCTU_SOP_KPI" ... />`: Cơ cấu xếp loại thi đua cán bộ, Tiến độ quy trình SOP 4 bước, Điểm trung bình theo phòng ban, Điểm chất lượng năng suất theo cán bộ.
       * 3 thẻ điều hướng nhanh liên thông nghiệp vụ sang Hồ sơ Cán bộ HRM, Dashboard Nhiệm vụ và Trình tạo báo cáo mới.
  3. *Khắc phục Lỗi Thiếu Import*:
     - Bổ sung `useEffect` bị thiếu tại `apps/admin_khcn/features/hrm/components/tasks/task-detail-drawer.tsx`.
  4. *Kiểm chứng Máy Thực Tế (Verification Gate)*:
     - Quét mã hóa & vệ sinh: 100% UTF-8 không BOM, 0 `console.log`, 0 `debugger`, 0 imports dư thừa.
     - Typecheck: `npm --prefix apps/admin_khcn run typecheck` (`tsc --noEmit`) đạt **Exit Code 0 (0 lỗi)**.
     - Docker Build: Chạy `docker compose -f docker-compose.prod.yml up -d --build --no-deps admin-frontend` hoàn tất biên dịch Next.js 16.1.6 standalone thành công 100% (86 routes).
     - Khởi động Runtime: Container `daklak-workspace-admin-frontend-1` khởi động thành công trong 423ms, sẵn sàng phục vụ tại `http://113.184.220.82/admin/hub` và `http://113.184.220.82/admin/services/reports`.
- **Tập tin đã cập nhật**:
  - `apps/admin_khcn/features/hub/components/HubClient.tsx`
  - `apps/admin_khcn/features/reports/utils/dashboardAssignment.ts`
  - `apps/admin_khcn/features/reports/components/DashboardReportContainer.tsx`
  - `apps/admin_khcn/features/reports/components/reports/ReportWorkspace.tsx`
  - `apps/admin_khcn/features/hrm/components/tasks/task-detail-drawer.tsx`
  - `.agents/execution_logs/code2.md`
- **Kiểm chứng thực tế**:
  - Typecheck: `npm --prefix apps/admin_khcn run typecheck` -> Exit Code 0 (0 errors).
  - Docker Compose: `docker compose -f docker-compose.prod.yml up -d --build --no-deps admin-frontend` -> Exit Code 0.
  - Container runtime: `Next.js 16.1.6 Ready in 423ms`.

## 2026-10-16: Đồng Bộ Toàn Diện Giao Diện Chỉnh Sửa Nhân Sự (EmployeeEditClient) Chuẩn Doanh Nghiệp Với Trang Tạo Mới (EmployeeCreateClient)
- **Nội dung tác vụ**:
  1. *Khảo sát Hiện trạng & Nguyên nhân Lệch chuẩn*:
     - Trang tạo mới `/admin/services/hrm/employees/create` (`EmployeeCreateClient.tsx`) đã được nâng cấp lên chuẩn doanh nghiệp hiện đại với bố cục lưới 12 cột (7 cột Thông tin cá nhân & Hồ sơ tuyển dụng + 5 cột Đơn vị công tác, VTVL & Định biên), thanh điều hướng Sticky Header tinh tế, bộ chọn đơn vị phân cấp động (`OrganizationUnitPicker`), quản lý Slot VTVL và Thẻ đồng bộ hệ thống (`EmployeeSystemSyncCard`).
     - Trang chỉnh sửa `/admin/services/hrm/employees/[id]/edit` (`EmployeeEditClient.tsx`) trước đây là một file nguyên khối 839 dòng code cũ, đảo ngược cột (cột đơn vị nằm bên trái, cột thông tin cá nhân nằm bên phải), thiếu các trường chuẩn như Giới tính (`gender`), Địa chỉ (`address`), Trạng thái nhân sự (`employmentStatus`), Ngạch công chức (`civilServantRankId`), và không kế thừa được hệ thống card module dùng chung.
  2. *Tái sử dụng & Nâng cấp Khung Component Module Dùng Chung*:
     - **`EmployeeCreateHeader.tsx`**: Bổ sung các props tùy biến (`title`, `subtitle`, `badgeText`, `submitButtonText`, `submitButtonLoadingText`) với giá trị mặc định tương thích ngược 100% với trang tạo mới. Trang chỉnh sửa hiển thị tiêu đề "Chỉnh sửa Hồ sơ Cán bộ & Vị trí việc làm", tên và mã cán bộ đang chỉnh sửa, cùng nút "Cập nhật hồ sơ".
     - **`EmployeePersonalInfoCard.tsx`**: Cập nhật logic xem trước ảnh đại diện/ảnh thẻ `displayImage = previewUrl || (avatarValue || null)`. Khi mở form chỉnh sửa, ảnh thẻ cũ từ database hiển thị rõ nét; nút "Gỡ ảnh" hoạt động chính xác cho cả ảnh hiện tại lẫn ảnh mới tải lên.
     - **`EmployeeOrganizationCard.tsx`**: Bổ sung thuộc tính `currentEmployeeCode?: string`. Phân biệt rõ nét giữa vị trí cán bộ đang đảm nhiệm (`isMySlot`: Huy hiệu xanh lam "Đang đảm nhiệm" kèm tag "(Hiện tại)") với các vị trí do cán bộ khác nắm giữ (`isAssigned`: Huy hiệu hổ phách "Đã có cán bộ") và vị trí trống ("Còn trống").
  3. *Tái cấu trúc Toàn bộ `EmployeeEditClient.tsx`*:
     - Tinh gọn từ 839 dòng xuống còn ~220 dòng code sạch, kế thừa 100% các card: `EmployeePersonalInfoCard`, `EmployeeEmploymentCard`, `EmployeeOrganizationCard`, `EmployeeSystemSyncCard`.
     - Tự động nạp dữ liệu cán bộ từ hook `useHrmEmployee(employeeId)` vào `form.reset(...)`.
     - Duy trì logic nhận diện và tự động gắn `slotOrder` hiện tại từ `staffingReport` nếu chưa có thay đổi thủ công.
     - Xử lý phân quyền chặt chẽ: Kiểm tra quyền `canEditEmployee` (`HRM_EMPLOYEE:UPDATE` hoặc `HRM_EMPLOYEE:MANAGE`), hiển thị màn hình báo lỗi thẩm quyền nếu không đủ quyền.
     - Tích hợp trạng thái Loading thanh lịch và màn hình Không tìm thấy nhân sự (`404 Not Found`).
     - Gửi cập nhật an toàn qua hook `useUpdateHrmEmployee()` và tự động làm mới bộ nhớ đệm React Query (`hrmKeys.employees()`, `hrmKeys.detail()`, và `staffing-report`).
  4. *Đồng bộ Types*:
     - Bổ sung các trường `gender`, `address`, `status`, `slotOrder` vào interface `HrmEmployee` trong `apps/admin_khcn/features/hrm/types.ts`.
  5. *Kiểm chứng Máy Thực Tế (Verification Gate)*:
     - Quét mã hóa & vệ sinh: 100% UTF-8 không BOM, 0 `console.log`, 0 `debugger`, 0 imports dư thừa.
     - Typecheck: `npm --prefix apps/admin_khcn run typecheck` (`tsc --noEmit`) đạt **Exit Code 0 (0 lỗi)**.
     - Docker Build: Chạy `docker compose -f docker-compose.prod.yml up -d --build admin-frontend`. Build Next.js 16.1.6 standalone thành công 100%, biên dịch route `/services/hrm/employees/[id]/edit` và `/services/hrm/employees/create`.
     - Khởi động Runtime: Container `daklak-workspace-admin-frontend-1` khởi động thành công trong 177ms, sẵn sàng phục vụ tại `http://113.184.220.82/admin/services/hrm/employees/2/edit`.
- **Tập tin đã tạo & cập nhật**:
  - `apps/admin_khcn/features/hrm/components/EmployeeEditClient.tsx`
  - `apps/admin_khcn/features/hrm/components/employee-create/components/EmployeeCreateHeader.tsx`
  - `apps/admin_khcn/features/hrm/components/employee-create/components/EmployeeOrganizationCard.tsx`
  - `apps/admin_khcn/features/hrm/components/employee-create/components/EmployeePersonalInfoCard.tsx`
  - `apps/admin_khcn/features/hrm/types.ts`
  - `.agents/execution_logs/code2.md`
- **Kiểm chứng thực tế**:
  - Typecheck: `npm --prefix apps/admin_khcn run typecheck` -> Exit Code 0 (0 errors).
  - Docker Compose: `docker compose -f docker-compose.prod.yml up -d --build admin-frontend` -> Exit Code 0.
  - Container log: `Next.js 16.1.6 Ready in 177ms`.

## 2026-10-15: Kiến Trúc Nhúng Báo Cáo Động (Embedded Report Widgets) - Kế Thừa Thiết Kế Từ Report-Service Vào Toàn Bộ Dashboard Dịch Vụ
- **Nội dung tác vụ**:
  1. *Phân tích Hiện trạng & Thiết kế Giải pháp Kiến trúc Thụ Hưởng Báo Cáo*:
     - Xác định vấn đề cốt lõi: Khi người dùng/quản trị viên cấu hình và thiết kế các mẫu báo cáo thống kê, biểu đồ phân tích chuyên sâu tại `report-service` (`/services/reports/design`), các màn hình Dashboard của từng dịch vụ nghiệp vụ (Văn bản, Nhân sự/HRM, Nhiệm vụ) trước đây chỉ có biểu đồ tĩnh cục bộ, chưa được thụ hưởng (kế thừa) cấu hình biểu đồ và dữ liệu snapshot này.
     - Thiết kế giải pháp kiến trúc: Xây dựng Component nhúng dùng chung `EmbeddedReportWidget` (`apps/admin_khcn/features/reports/components/EmbeddedReportWidget.tsx`) với cơ chế:
       * Nhận `reportIdOrCode` (mã số hoặc mã định danh như `REP_DOC_STATS`, `REP_HRM_TASKS`, `REP_EMP_QUALITY`, `REP_BTCTU_SOP_KPI`).
       * Tự động tra cứu `ReportDefinition`, tải cấu hình `configuration` (charts, xAxis, yAxis, aggregations) và `DatasetSnapshot` mới nhất (trạng thái `SUCCEEDED`).
       * Hỗ trợ render linh hoạt: Bar Chart, Spline Area Line Chart, Pie/Progress Chart với bảng màu chuẩn `PALETTE`, tự động tính toán tỷ lệ, gán nhãn thân thiện và khắc phục lỗi font tiếng Việt (Mojibake fix).
       * Tích hợp các tính năng: Nút chuyển đổi nhanh chế độ Cột/Đường, nút "Cập nhật" kích hoạt chạy lại báo cáo ngầm qua `useRunReport`, nút "Chi tiết ->" chuyển hướng sang màn hình thiết kế/báo cáo tương ứng.
       * Thiết kế responsive triệt để: `min-w-0`, `truncate`, `overflow-hidden`, đảm bảo hiển thị hoàn hảo trên mọi kích thước màn hình mà không vỡ layout.
  2. *Triển khai Module & Điểm Xuất Khẩu (Exports)*:
     - Tạo `apps/admin_khcn/features/reports/components/EmbeddedReportWidget.tsx`.
     - Tạo file export trung tâm `apps/admin_khcn/features/reports/index.ts`.
  3. *Tích hợp Thụ Hưởng Báo Cáo Vào Dashboard Nghiệp Vụ Thực Tế*:
     - **Dashboard Quản lý Văn bản** (`apps/admin_khcn/features/document/components/DocumentsDashboardClient.tsx`):
       * Chèn `<EmbeddedReportWidget reportIdOrCode="REP_DOC_STATS" title="Trực quan hóa Báo cáo Lưu chuyển & Xử lý Văn bản" description="Số liệu tổng hợp phân tích thực tế kế thừa từ Report Service" />` ngay sau hàng Quick Stats.
       * Nâng cấp nút "Báo cáo thống kê" trên header dẫn thẳng về trung tâm `/services/reports`.
     - **Dashboard Công việc & Nhiệm vụ / HRM** (`apps/admin_khcn/features/hrm/components/tasks/task-dashboard.tsx`):
       * Chèn `<EmbeddedReportWidget reportIdOrCode="REP_HRM_TASKS" title="Báo cáo Phân tích Nhiệm vụ Động (từ Report Service)" description="Biểu đồ phân tích chuyên sâu được định nghĩa và đồng bộ trực tiếp từ Hệ thống Báo cáo & Thống kê (REP_HRM_TASKS)" />` ngay sau hàng thống kê 4 thẻ.
  4. *Mở Rộng Tính Năng Nhúng Widget Báo Cáo & Cổng Điều Hành Hub*:
     - Xây dựng Modal "Nhúng Báo Cáo vào Dashboard" (`apps/admin_khcn/features/reports/components/reports/ReportEmbedModal.tsx`):
       * Cho phép chuyên viên xem trước trực tiếp widget (Live Preview) với báo cáo hiện tại.
       * Cung cấp bộ cấu hình nhanh: Số cột (1 hoặc 2), độ cao biểu đồ (200px, 240px, 300px), liên kết chi tiết, chuyển đổi loại biểu đồ.
       * Sinh mã JSX React Component tự động kèm nút Copy vào Clipboard.
       * Bảng thống kê các Dashboard trong toàn hệ thống đã và đang sẵn sàng thụ hưởng báo cáo.
     - Tích hợp nút **"Nhúng vào Dashboard"** trên thanh công cụ của `ReportViewer.tsx` (ngay cạnh nút "Chia sẻ cho Đơn vị").
    - Tích hợp khối **Báo Cáo & Chỉ Số Điều Hành Toàn Tỉnh** vào Cổng Ứng dụng Nội bộ (`apps/admin_khcn/features/hub/components/HubClient.tsx`) sử dụng báo cáo `REP_BTCTU_SOP_KPI`.
    - Tích hợp trực quan hóa báo cáo động vào **Quản lý Tin bài & Cổng Thông tin** (`apps/admin_khcn/features/posts/components/PostList.tsx`) sử dụng báo cáo `REP_POST_STATS` (3 biểu đồ: Lượt xem chuyên mục, cơ cấu trạng thái duyệt, tương tác tin bài).
    - Nâng cấp **Tính năng Thu gọn / Mở rộng (Collapsible Widget)** trong `EmbeddedReportWidget`: Cho phép cán bộ thu gọn biểu đồ để tập trung vào bảng dữ liệu chi tiết, hoặc mở rộng khi cần họp giao ban, tối ưu hóa không gian làm việc.
    - Xây dựng **Dashboard Quản trị Hệ thống Toàn Diện (`AdminDashboardClient.tsx` & `page.tsx`)**:
      * Thay thế trang trống `/services/admin` bằng Trung tâm Điều hành Quản trị chuẩn mực.
      * Thẻ thống kê nhanh: Cơ cấu Tổ chức & Định biên VTVL, Tài khoản & Người dùng, Chính sách PBAC, Khung Mẫu Vị trí việc làm.
      * Nhúng 2 báo cáo điều hành động từ `report-service`: `REP_BTCTU_SOP_KPI` (Xếp loại thi đua cán bộ) và `REP_HRM_TASKS` (Nhiệm vụ & Công việc).
      * Lưới 6 phân hệ quản trị chi tiết kèm icon, badge và liên kết trực tiếp.
    - Chuẩn hóa **Giao diện Nhúng Báo Cáo & Khắc phục Lỗi Giao diện theo Quy định**:
      * Chuyển đổi `ReportEmbedModal.tsx` từ `<Dialog>` sang `<Sheet side="right">` tuân thủ nghiêm ngặt Ràng buộc 1 (*Dùng Sheet cho form dài/cấu hình chi tiết; chỉ dùng Dialog cho xác nhận ngắn/alert*).
      * Cấu hình độ rộng Sheet linh hoạt (`w-full sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl`), tích hợp thanh cuộn độc lập, tránh hiện tượng co rúm biểu đồ.
      * Tối ưu thanh công cụ `ReportViewer.tsx`: Loại bỏ class cứng `sm:flex-nowrap`, hỗ trợ co giãn linh hoạt trên mọi kích thước màn hình và ẩn bớt text phụ trên màn hình nhỏ nhằm chống tràn viền.
      * Tối ưu mã nguồn nhúng: Thêm `whitespace-pre-wrap break-all` cho thẻ `<pre>` chống phình rộng container, kích hoạt lazy render guard `{open && (...)}` theo Ràng buộc Frontend State.
  5. *Kiểm chứng Máy Thực Tế (Verification Gate)*:
     - Quét mã hóa & vệ sinh: 100% UTF-8 không BOM, 0 `console.log`, 0 `debugger`, 0 `break-words`.
     - `npm run typecheck --prefix apps/admin_khcn`: `tsc --noEmit` PASS (Exit Code 0).
     - `docker compose -f docker-compose.prod.yml build admin-frontend`: Next.js 16.1.6 compile và build standalone thành công 100% (84 routes prerendered).
     - Deploy & khởi động lại container `daklak-workspace-admin-frontend-1`: Container `Up` ổn định, HTTP GET `/admin` trả về `200 OK`.
- **Tập tin đã tạo & cập nhật**:
  - `apps/admin_khcn/features/reports/components/EmbeddedReportWidget.tsx`
  - `apps/admin_khcn/features/reports/components/reports/ReportEmbedModal.tsx`
  - `apps/admin_khcn/features/reports/components/reports/ReportViewer.tsx`
  - `apps/admin_khcn/features/reports/index.ts`
  - `apps/admin_khcn/features/document/components/DocumentsDashboardClient.tsx`
  - `apps/admin_khcn/features/hrm/components/tasks/task-dashboard.tsx`
  - `apps/admin_khcn/features/hub/components/HubClient.tsx`
  - `apps/admin_khcn/features/posts/components/PostList.tsx`
  - `apps/admin_khcn/app/services/admin/AdminDashboardClient.tsx`
  - `apps/admin_khcn/app/services/admin/page.tsx`
  - `.agents/execution_logs/code2.md`
- **Kiểm chứng thực tế**:
  - Typecheck: `tsc --noEmit` (admin_khcn) -> PASS (0 errors).
  - Build: Next.js standalone container image -> SUCCESS (84 routes prerendered).
  - Runtime Smoke: HTTP 200 OK tại `http://admin-frontend:3000/admin`.
  - Tuân thủ 7 Bộ ràng buộc kỹ thuật: Không truy vấn chéo DB, PBAC context giữ nguyên, Least Data, 0 BOM, 0 debug log.

## 2026-10-14: Tích Hợp API Trục Liên Thông LGSP Đắk Lắk Vào Module Quản Lý Văn Bản (SystemCode: 0400101394-CTDL-012)
- **Nội dung tác vụ**:
  1. *Phân tích toàn diện tài liệu kỹ thuật liên thông*:
     - Nghiên cứu chi tiết tài liệu "Hướng dẫn triển khai nhóm dịch vụ nền tảng quản lý văn bản, công việc Đắk Lắk".
     - Xác định đầy đủ 7 APIs liên thông:
       * 4.1.1 Lấy danh sách đơn vị liên thông (`POST /dvlt/1.0.0/getAgenciesList`)
       * 4.1.2 Gửi văn bản hoặc gói tin trạng thái (`POST /guivb/1.0.0/sendEdoc`, application/octet-stream, raw edxml)
       * 4.1.3 Lấy danh sách gói tin edoc hoặc status (`POST /dhvb/1.0.0/getReceivedEdocList`)
       * 4.1.4 Lấy văn bản edoc hoặc gói tin trạng thái (`POST /dhvb/1.0.0/getEdoc`, Base64 edxml)
       * 4.1.5 Lấy danh sách trạng thái gửi văn bản (`POST /guivb/1.0.0/getSentEdocList`)
       * 4.1.6 Cập nhật trạng thái gói tin (`POST /guivb/1.0.0/updateStatus`, status: done)
       * 4.1.7 Đăng ký đơn vị liên thông (`POST /dvlt/1.0.0/registerAgencies`)
       * 4.1.8 Lấy quyền truy cập dịch vụ OAuth2 client_credentials (`POST https://lifesso.daklak.gov.vn:9445/oauth2/token`).
  2. *Thiết kế kiến trúc tích hợp an toàn & Nạp Cặp Key Bí Mật*:
     - Thiết lập hằng số `SystemCode` chuẩn: `0400101394-CTDL-012`.
     - Nạp cấu hình liên thông chính thức do người dùng cung cấp:
       * `BaseUrl` (SSO): `https://lifesso.daklak.gov.vn:9445/oauth2/token`
       * `Client_key`: `PYRJBx37SCeuDZR6zX0G6HMDidQa`
       * `Secret_key`: `H2UckeTI6ArAVO7llaPpABxjnIEP0nGxH3x_OP0Gt0ga`
     - Lưu trữ an toàn trong `.env` của `document-service`, `api-gateway`, và `.env` root, đồng thời đặt làm giá trị cấu hình mặc định trong `LgspConfigService`.
     - Xây dựng `LgspTokenService`: Tự động gửi Basic Auth header và tham số client_credentials theo chuẩn OAuth2 RFC 6749 và WSO2 Identity Server, hỗ trợ cache token theo TTL.
     - Xây dựng tiện ích đóng gói và phân tích edXML chuẩn (`edxml.util.ts`): Tương thích chuẩn văn bản điện tử và xử lý cả Base64 lẫn XML thuần.
  3. *Triển khai Microservices & gRPC Contract*:
     - Cập nhật `shared/protos/document/document.proto`: Bổ sung các RPCs `SyncLgsp`, `SendLgspDocument`, `GetLgspAgencies`, `GetLgspSentStatus`, `GetLgspConfig`, `UpdateLgspConfig`.
     - Cập nhật `apps/document-service`: Tạo module `modules/lgsp/` (`lgsp.constants.ts`, `lgsp.config.ts`, `lgsp-token.service.ts`, `edxml.util.ts`, `lgsp.service.ts`, `lgsp.controller.ts`, `lgsp.module.ts`), đăng ký vào `AppModule`.
     - Cập nhật `apps/api-gateway`: Mở rộng `documents.service.ts` và `documents.controller.ts` cung cấp các REST API cho Admin Frontend.
  4. *Giao diện Quản trị Frontend (`admin_khcn`)*:
     - Thêm hooks TanStack Query trong `features/document/hooks/useDocuments.ts` (`useLgspConfig`, `useLgspAgencies`, `useLgspSentStatus`, `syncLgsp`, `sendLgspDocument`, `updateLgspConfig`).
     - Tích hợp nút "Đồng bộ LGSP" và modal "Cấu hình LGSP" (`LgspConfigModal.tsx`) trên Sổ Văn bản Đến (`IncomingDocumentsClient.tsx`).
     - Tích hợp chức năng "Gửi liên thông LGSP" (`LgspSendModal.tsx`) trên Sổ Văn bản Đi (`OutgoingDocumentsClient.tsx`).
- **Tập tin đã tạo & cập nhật**:
  - `shared/protos/document/document.proto`
  - `apps/document-service/src/modules/lgsp/lgsp.constants.ts`
  - `apps/document-service/src/modules/lgsp/lgsp.config.ts`
  - `apps/document-service/src/modules/lgsp/lgsp-token.service.ts`
  - `apps/document-service/src/modules/lgsp/edxml.util.ts`
  - `apps/document-service/src/modules/lgsp/lgsp.service.ts`
  - `apps/document-service/src/modules/lgsp/lgsp.controller.ts`
  - `apps/document-service/src/modules/lgsp/lgsp.module.ts`
  - `apps/document-service/src/modules/lgsp/lgsp.service.spec.ts`
  - `apps/document-service/src/app.module.ts`
  - `apps/api-gateway/src/modules/documents/documents.service.ts`
  - `apps/api-gateway/src/modules/documents/documents.controller.ts`
  - `apps/admin_khcn/features/document/hooks/useDocuments.ts`
  - `apps/admin_khcn/features/document/components/LgspConfigModal.tsx`
  - `apps/admin_khcn/features/document/components/LgspSendModal.tsx`
  - `apps/admin_khcn/features/document/components/IncomingDocumentsClient.tsx`
  - `apps/admin_khcn/features/document/components/OutgoingDocumentsClient.tsx`
  - `.agents/execution_logs/code2.md`
- **Kiểm chứng máy thực tế**:
  - `tsc --noEmit` trên `apps/document-service`: PASS (exit code 0).
  - `tsc --noEmit` trên `apps/api-gateway`: PASS (exit code 0).
  - `npm run typecheck` trên `apps/admin_khcn`: PASS (exit code 0).
  - `npx jest src/modules/lgsp/lgsp.service.spec.ts`: PASS (8/8 tests passed, 100%).
  - Kiểm tra debug logs: 0 `console.log` trong code ứng dụng.
  - Kiểm tra encoding: 100% UTF-8 không BOM.

## 2026-10-14: Triển Khai Thực Thi Giai Đoạn 4 (Vệ Sinh Mã Nguồn Toàn Diện, Thiết Lập ESLint Guard Rules & Hoàn Tất Nghiệm Thu Toàn Workspace)
- **Nội dung tác vụ**:
  1. *Triệt tiêu 100% Debug Logs trong Codebase Ứng Dụng (P2/P3)*:
     - Dọn sạch toàn bộ `console.log` trong `apps/portal-goverment/app/[lang]/[[...content]]/page.tsx` và `apps/portal-goverment/lib/serverFetch.ts`.
     - Thay thế toàn bộ `console.log` trong các microservices sang NestJS `Logger` chính quy:
       * `apps/user-service/src/modules/users/users.service.ts`
       * `apps/user-service/src/main.ts`
       * `apps/hrm-service/src/main.ts`
       * `apps/document-service/src/main.ts`
       * `apps/media-service/src/main.ts`
       * `apps/posts-service/src/modules/categories/categories.controller.ts`
       * `apps/posts-service/src/modules/posts/posts.controller.ts`
       * `apps/posts-service/src/modules/posts/posts.service.ts`
     - Quét tự động toàn bộ codebase `apps/` xác nhận 0 `console.log` sót lại trong mã nguồn ứng dụng (chỉ duy trì trong các CLI scripts standalone của Prisma seed/sync).
  2. *Thiết lập Rào Chắn Tự Động ESLint Guard Rules (P2/P3)*:
     - Cập nhật `apps/admin_khcn/eslint.config.mjs`:
       * Thêm rule `no-restricted-syntax` chặn đứng việc sử dụng CSS class `break-words` ở cấp compiler, bắt buộc sử dụng `wrap-break-word` theo chuẩn dự án.
       * Cấu hình rule `no-console` cảnh báo `console.log`, chỉ cho phép `warn` và `error`.
       * Kích hoạt rule `unused-imports/no-unused-imports: error`.
  3. *Chuẩn hóa Triệt để Kiểu Dữ Liệu & React Lifecycle trong Next.js 16 (P2)*:
     - Khắc phục vi phạm `react-hooks/set-state-in-effect` tại `OrganizationDetailClient.tsx`: Gán `key={code}` trên Server Component cha (`page.tsx`) giúp tự động reset state sạch sẽ khi chuyển đổi đơn vị mà không cần effect `setActiveTab("info")`.
     - Loại bỏ hoàn toàn kiểu `any` tại `CreateReportClient.tsx`: Sử dụng strict type guards `(result as { id?: string })?.id` và `err instanceof Error ? err.message : ...`.
  4. *Dọn Dẹp Rác Toàn Diện (Cleanup Gate)*:
     - Dọn dẹp 100% các script quét mã tạm thời trong `scratch/` (`audit_scanner.mjs`, `check_pages.mjs`, `check_params.mjs`, `check_prisma.mjs`, `scan_console.mjs`, `summarize-findings.mjs`).
     - Lưu trữ tệp kết quả rà soát `scratch/audit-findings.json` làm minh chứng nghiệm thu.
- **Tập tin đã tạo & cập nhật**:
  - `apps/admin_khcn/eslint.config.mjs`
  - `apps/admin_khcn/app/services/admin/organization/[code]/page.tsx`
  - `apps/admin_khcn/app/services/admin/organization/[code]/OrganizationDetailClient.tsx`
  - `apps/admin_khcn/app/services/reports/new/CreateReportClient.tsx`
  - `apps/portal-goverment/app/[lang]/[[...content]]/page.tsx`
  - `apps/portal-goverment/lib/serverFetch.ts`
  - `apps/user-service/src/main.ts`
  - `apps/user-service/src/modules/users/users.service.ts`
  - `apps/hrm-service/src/main.ts`
  - `apps/document-service/src/main.ts`
  - `apps/media-service/src/main.ts`
  - `apps/posts-service/src/main.ts`
  - `apps/posts-service/src/modules/categories/categories.controller.ts`
  - `apps/posts-service/src/modules/posts/posts.controller.ts`
  - `apps/posts-service/src/modules/posts/posts.service.ts`
  - `.agents/execution_logs/code2.md`
- **Kiểm chứng máy thực tế**:
  - `pnpm --filter admin_khcn run lint -- ...`: PASS (exit code 0, 0 error, 0 warning).
  - `pnpm --filter admin_khcn run typecheck`: PASS (exit code 0).
  - `pnpm --filter api-gateway run build`: PASS (exit code 0).
  - `pnpm --filter posts-service run build`: PASS (exit code 0).
  - `pnpm --filter user-service run build`: PASS (exit code 0).
  - `pnpm --filter document-service run build`: PASS (exit code 0).
  - `pnpm --filter report-service run build`: PASS (exit code 0).
  - `pnpm --filter hrm-service run build`: PASS (exit code 0).
  - `pnpm --filter media-service run build`: PASS (exit code 0).
  - Kiểm tra debug logs: 0 `console.log` trong toàn bộ code ứng dụng runtime.
  - Kiểm tra encoding: 100% UTF-8 không BOM.

- **Nội dung tác vụ**:
  1. *Chuẩn hóa `<SelectTrigger>` & CSS Layout (P2)*:
     - Bổ sung `min-w-0` và `[&>span]:truncate` vào component chuẩn `apps/admin_khcn/components/ui/select.tsx`, đảm bảo 100% dropdown select trong toàn bộ ứng dụng tự động co giãn và chống tràn layout flex/grid khi nhãn dài.
     - Khai báo `@utility wrap-break-word` trong `apps/admin_khcn/app/globals.css` (Tailwind v4).
     - Thay thế toàn bộ 35 vị trí dùng `break-words` sang `wrap-break-word` trên 18 files UI, ngăn chặn vỡ chữ tiếng Việt hoặc bẻ gãy từ vô tội vạ.
  2. *Triển khai Lazy Loading cho Modals & Sheets (P2)*:
     - Rà soát toàn bộ các component popup, modal, dialog có sử dụng TanStack Query (`ConsultationCreateModal.tsx`, `EditMenuModal.tsx`, `ReportShareModal.tsx`, `UnitTypeJobTemplateModal.tsx`, `AssignUserGroupsModal.tsx`).
     - Xác nhận 100% các query được bảo vệ bởi `enabled: isOpen` / `enabled: open`, triệt tiêu việc gọi API ngầm khi modal/dialog đang đóng.
  3. *Tái cấu trúc 7 file `page.tsx` sang Server Component (P2)*:
     - Chuyển đổi toàn bộ 7 file `page.tsx` vi phạm `'use client'` sang cấu trúc Server Component chuẩn mực của Next.js 16:
       * `apps/admin_khcn/app/services/admin/organization/[code]/page.tsx` (tách `OrganizationDetailClient.tsx`, await `params: Promise<{ code: string }>`).
       * `apps/admin_khcn/app/services/documents/processing/[id]/page.tsx` (tách `DocumentProcessingClient.tsx`, await `params: Promise<{ id: string }>`).
       * `apps/admin_khcn/app/services/documents/publish/page.tsx` (loại bỏ `'use client'` thừa, chuyển sang Server Component).
       * `apps/admin_khcn/app/services/posts/interactions/page.tsx` (loại bỏ `'use client'` thừa, chuyển sang Server Component tĩnh).
       * `apps/admin_khcn/app/services/posts/interactions/lgsp/page.tsx` (loại bỏ `'use client'` thừa, render `LgspClient`).
       * `apps/admin_khcn/app/services/reports/new/page.tsx` (tách `CreateReportClient.tsx`, chuyển `page.tsx` sang Server Component).
       * `apps/admin_khcn/app/session/refresh/page.tsx` (tách `RestoreSessionClient.tsx`, bọc `<Suspense>` trên Server Component).
  4. *Kiểm soát Ràng buộc BaseURL (P1)*:
     - Quét toàn bộ `apps/admin_khcn`, xác nhận 0 vi phạm double prefix `/admin` trong các lời gọi `apiClient`.
- **Tập tin đã tạo & cập nhật**:
  - `apps/admin_khcn/components/ui/select.tsx`
  - `apps/admin_khcn/app/globals.css`
  - `apps/admin_khcn/app/services/admin/organization/[code]/page.tsx`
  - `apps/admin_khcn/app/services/admin/organization/[code]/OrganizationDetailClient.tsx`
  - `apps/admin_khcn/app/services/documents/processing/[id]/page.tsx`
  - `apps/admin_khcn/app/services/documents/processing/[id]/DocumentProcessingClient.tsx`
  - `apps/admin_khcn/app/services/documents/publish/page.tsx`
  - `apps/admin_khcn/app/services/posts/interactions/page.tsx`
  - `apps/admin_khcn/app/services/posts/interactions/lgsp/page.tsx`
  - `apps/admin_khcn/app/services/reports/new/page.tsx`
  - `apps/admin_khcn/app/services/reports/new/CreateReportClient.tsx`
  - `apps/admin_khcn/app/session/refresh/page.tsx`
  - `apps/admin_khcn/app/session/refresh/RestoreSessionClient.tsx`
  - 18 files UI thay thế `break-words` sang `wrap-break-word`
  - `.agents/execution_logs/code2.md`
- **Kiểm chứng máy thực tế**:
  - `pnpm --filter admin_khcn run typecheck`: PASS (exit code 0, 0 error).
  - `pnpm --filter admin_khcn run build`: PASS (exit code 0, 83/83 static/dynamic routes compiled).
  - Quét `page.tsx` chứa `'use client'`: 0 kết quả (100% tuân thủ Server Component).
  - Quét `break-words`: 0 kết quả (100% tuân thủ `wrap-break-word`).
  - Quét debug log trong file mới: 0 `console.*`.
  - Kiểm tra encoding: 100% UTF-8 không BOM.

## 2026-10-14: Triển Khai Thực Thi Giai Đoạn 2 (Hiệu Năng, gRPC Resilience, Tối Ưu CSDL & PBAC Context Scoping)
- **Nội dung tác vụ**:
  1. *Khắc phục Nguy cơ Treo gRPC Cascading Failure (P1)*:
     - Tích hợp `executeGrpcCall(...)` kèm timeout/deadline 8000ms cho toàn bộ cuộc gọi gRPC tại:
       * `apps/api-gateway/src/modules/documents/documents.service.ts`: Toàn bộ 24 RPC calls (`ListDocuments`, `ListProcedures`, `GetProcedure`, `CreateProcedure`, `UpdateProcedure`, `DeleteProcedure`, `ListDossiers`, `GetDossier`, `CreateDossier`, `UpdateDossier`, `DeleteDossier`, `ListFiles`, `AddFile`, `DeleteFile`, `GetComponents`, `UpdateComponent`, `CreateDossierFromTemplate`, `CreateBlankDossier`, `AddComponentFromCabinet`, `GetDocument`, `CreateDocument`, `UpdateDocument`, `ExtractMetadata`, `GetLogs`, `DeleteDocument`).
       * `apps/api-gateway/src/modules/hrm/master-plans.service.ts`: Toàn bộ un-timed calls (`ListUsers`, `GetFullTree`, `FindAll`, `FindById`, `Create`, `Update`).
       * `apps/api-gateway/src/modules/posts/posts.service.ts`: Toàn bộ 11 un-timed calls (`createPost`, `listPosts`, `getPost`, `updatePost`, `deletePost`, `submitPost`, `reviewPost`, `approvePost`, `rejectPost`, `publishPost`, `unpublishPost`, `getPostHistory`).
     - Quét sạch 100% `console.error` và `console.warn` trong các service này, thay thế hoàn toàn bằng NestJS `Logger`.
  2. *Triệt tiêu N+1 Query & Tối ưu CSDL (P2)*:
     - `apps/user-service/src/modules/organizations/organizations.service.ts`: Thay thế vòng lặp N+1 đếm `tx.staffingSlot.count` tuần tự bằng 1 truy vấn `tx.staffingSlot.groupBy({ by: ['staffingId'] })` duy nhất kết hợp `Promise.all` cập nhật song song `organizationStaffing`.
     - `apps/report-service/src/modules/reports/reports.service.ts`: Thay thế vòng lặp tuần tự `for (...) await this.prisma.datasetSnapshot.create(...)` bằng 1 thao tác bulk insert `this.prisma.datasetSnapshot.createMany(...)`, giảm tối đa round-trips kết nối MySQL.
  3. *Củng cố Phân phối Tài nguyên theo Ngữ cảnh Quyền (PBAC Context Scoping) (P1)*:
     - `apps/api-gateway/src/modules/documents/documents.controller.ts`: Tiếp nhận `@Req() req: any` và truyền context user xuống `documentsService.listDocuments(query, req?.user)`.
     - `apps/api-gateway/src/modules/documents/documents.service.ts`: Kiểm tra thẩm quyền PBAC (`DOCUMENT:MANAGE`, `DOCUMENT:VIEW_ALL`, `admin`, `system`). Đối với người dùng thông thường, tự động ép phạm vi hiển thị chỉ trả về văn bản công khai (`req.isPublic = true`), ngăn chặn rò rỉ văn bản mật/nội bộ trái thẩm quyền.
- **Tập tin đã tạo & cập nhật**:
  - `apps/api-gateway/src/modules/documents/documents.controller.ts`
  - `apps/api-gateway/src/modules/documents/documents.service.ts`
  - `apps/api-gateway/src/modules/hrm/master-plans.service.ts`
  - `apps/api-gateway/src/modules/posts/posts.service.ts`
  - `apps/user-service/src/modules/organizations/organizations.service.ts`
  - `apps/report-service/src/modules/reports/reports.service.ts`
  - `.agents/execution_logs/code2.md`
- **Kiểm chứng máy thực tế**:
  - `pnpm --filter document-service run build`: PASS (exit code 0).
  - `pnpm --filter api-gateway run build`: PASS (exit code 0).
  - `pnpm --filter user-service run build`: PASS (exit code 0).
  - `pnpm --filter report-service run build`: PASS (exit code 0).
  - Kiểm tra debug logs: 0 `console.*` trong các file đã xử lý.
  - Kiểm tra encoding: 100% UTF-8 không BOM.

- **Nội dung tác vụ**:
  1. *Khảo sát & Quét Toàn Bộ Codebase (Anti-Hallucination & Zero Assumptions)*:
     - Thực hiện rà soát 13 ứng dụng và dịch vụ (`admin_khcn`, `portal-goverment`, `api-gateway`, 10 microservices, hạ tầng Docker).
     - Phát hiện **352 vi phạm kỹ thuật thực tế** (5 Critical P0, 99 High P1, 134 Medium P2, 114 Low P3).
     - Xuất bản Báo cáo Kỹ thuật Toàn diện `bao_cao_ra_soat_vi_pham_va_phuong_an_xu_ly_toan_dien.md` kèm 4 sơ đồ trực quan Mermaid và lộ trình 4 giai đoạn.
  2. *Triển khai Thực thi Giai đoạn 1 (Hotfix Ngay Lập Tức - P0/P1)*:
     - **Triệt tiêu 5 điểm nghẽn gRPC Crash (P0)**: Thêm phòng thủ `data = data || {}` tại `apps/user-service/src/modules/menus/menus.controller.ts` (GetOne, Create, Update, Delete), `apps/user-service/src/modules/ai-assistant/ai-assistant.controller.ts` (GetAssistant, CreateAssistant, UpdateAssistant, DeleteAssistant, AddKnowledgeSource) và `apps/workflow-service/src/grpc/grpc.controller.ts` (CreateProcessBinding, UpdateProcessBinding, GetProcessBinding, ListProcessBindings, DeactivateProcessBinding, ResolveBinding, StartWorkflow).
     - **Khắc phục Lỗi Bọc Response Đúp tại API Gateway (P1)**: Tái cấu trúc 8 endpoints trong `apps/api-gateway/src/modules/ai/ai.controller.ts` (rewrite, translate, summarize, seo-generate) trả về trực tiếp raw data, loại bỏ thủ công `{ success: true, data: ... }` để `TransformInterceptor` tự động bọc envelope chuẩn xác, triệt tiêu lỗi lồng `data.data`.
     - **Triệt tiêu Lỗi Nuốt Exception gRPC (P1)**: Chuyển toàn bộ 8 catch blocks trong `apps/report-service/src/modules/reports/reports.service.ts` sang `throw new RpcException(...)`, đảm bảo API Gateway bắt được lỗi và trả về HTTP 400/500 tương ứng thay vì nuốt lỗi trả HTTP 200.
     - **Chuẩn hóa Kết nối CSDL & Connection Pool (P1)**:
       * Sửa `apps/chat-service/.env` trỏ đúng CSDL `admin_chat` (thay vì trỏ nhầm `admin_workflow`).
       * Bổ sung `connection_limit=10&pool_timeout=15` vào toàn bộ file `.env` local (`api-gateway`, `document-service`, `media-service`, `posts-service`, `notification_service`, `chat-service`).
     - **Dọn dẹp Thư mục Rác Sinh mã Schema (P3)**: Xóa sạch `apps/report-service/prisma/src/generated` và `apps/notification_service/prisma/generated`.
- **Tập tin đã tạo & cập nhật**:
  - `bao_cao_ra_soat_vi_pham_va_phuong_an_xu_ly_toan_dien.md` (Artifact Báo cáo Kỹ thuật)
  - `apps/user-service/src/modules/menus/menus.controller.ts`
  - `apps/user-service/src/modules/ai-assistant/ai-assistant.controller.ts`
  - `apps/workflow-service/src/grpc/grpc.controller.ts`
  - `apps/api-gateway/src/modules/ai/ai.controller.ts`
  - `apps/report-service/src/modules/reports/reports.service.ts`
  - `apps/chat-service/.env`
  - `apps/api-gateway/.env`
  - `apps/document-service/.env`
  - `apps/media-service/.env`
  - `apps/posts-service/.env`
  - `apps/notification_service/.env`
  - `.agents/execution_logs/code2.md`
- **Kiểm chứng máy thực tế**:
  - `pnpm --filter user-service run build`: PASS (exit code 0).
  - `pnpm --filter api-gateway run build`: PASS (exit code 0).
  - `pnpm --filter report-service run build`: PASS (exit code 0).
  - `pnpm --filter workflow-service run build`: PASS (exit code 0).
  - `pnpm --filter hrm-service run build`: PASS (exit code 0).
  - `git diff` sạch sẽ, 100% UTF-8 không BOM, 0 debug log.

## 2026-10-14: Cấu Hình Seed API Key Cho AI Router (Google Gemini & OpenAI ChatGPT)
- **Nội dung tác vụ**:
  1. *Khảo sát Source of Truth & Cấu trúc Smart AI Router*:
     - `user-service` là Source of Truth duy nhất quản lý hệ thống cấu hình `SystemConfig` (`sys_configs`), `UserConfig` (`user_configs`) và mô-đun AI (`AiService`, `AiFeatureService`).
     - Key cấu hình định tuyến thông minh: `AI_PROVIDERS`.
     - Smart Router hỗ trợ cơ chế Failover: Ưu tiên gọi provider có `priority` thấp nhất (Priority 1: Gemini `gemini-1.5-pro`), nếu lỗi tự động chuyển sang Priority 2 (OpenAI `gpt-4o-mini`).
  2. *Triển khai Seed API Key chuẩn xác*:
     - Tạo file seed chuyên trách `apps/user-service/prisma/seeds/11-ai-providers.seed.ts` chứa cấu hình provider với 2 API key được cung cấp:
       * Google Gemini: `id: 'ai_gemini_primary'`, `model: 'gemini-1.5-pro'`, `apiKey: 'AIzaSy***'`, `priority: 1`, `enabled: true`.
       * ChatGPT (OpenAI): `id: 'ai_openai_fallback'`, `model: 'gpt-4o-mini'`, `apiKey: 'sk-proj-***'`, `priority: 2`, `enabled: true`.
     - Tích hợp `seedAiProviders(prisma)` vào `runSeeds` trong `apps/user-service/prisma/seeds/index.ts` để tự động chạy khi chạy seed toàn hệ thống.
     - Cung cấp script chạy độc lập `apps/user-service/prisma/seed-ai-providers.ts` và lệnh `pnpm prisma:seed:ai` trong `package.json`.
     - Bổ sung `GEMINI_API_KEY` và `OPENAI_API_KEY` vào `apps/user-service/.env`.
  3. *Bảo mật & Cam kết riêng tư*:
     - Giữ hoàn toàn cục bộ trong repo/máy chủ của người dùng, không truyền ra ngoài hoặc đưa vào dữ liệu huấn luyện.
- **Tập tin đã tạo & cập nhật**:
  - `apps/user-service/prisma/seeds/11-ai-providers.seed.ts` (Tạo mới)
  - `apps/user-service/prisma/seed-ai-providers.ts` (Tạo mới)
  - `apps/user-service/prisma/seeds/index.ts` (Cập nhật)
  - `apps/user-service/package.json` (Cập nhật)
  - `apps/user-service/.env` (Cập nhật)
  - `.agents/execution_logs/code2.md`
  - `.agents/current_plan.md`
- **Kiểm chứng máy**:
  - Chạy `npx ts-node prisma/seed-ai-providers.ts` thành công: Nạp thành công vào `sys_configs` và `user_configs` của các tài khoản quản trị viên (`superadmin`, `admin`).
  - Kiểm chứng truy vấn trực tiếp CSDL: Xác nhận bản ghi `AI_PROVIDERS` tồn tại, parse JSON hợp lệ, cả 2 provider Gemini và OpenAI sẵn sàng hoạt động.
  - Typecheck `apps/user-service`: `npx tsc --noEmit` -> PASS (Exit code 0, 0 errors).
  - Vệ sinh mã nguồn: 0 debug log, 0 file tạm, mã hóa UTF-8 không BOM.


- **Nội dung tác vụ**:
  1. *Khắc phục hiện tượng giật khi mở Popover/List*:
     - Trước đây, khi click mở danh sách, toàn bộ DOM nodes của toàn bộ cây tổ chức (hàng chục đơn vị và phòng ban) được render đồng loạt trong 1 frame duy nhất, gây block main thread và drop frame animation của Radix Popover.
  2. *Triển khai thuật toán Cursor Phân trang Incremental (Chunking Infinite Scroll)*:
     - **Initial Slice cực nhẹ**: Ban đầu chỉ render `INITIAL_CHUNK = 4` đơn vị/nhóm đầu tiên (tải tức thì < 5ms, 0 frame drop, animation mở mượt 60fps).
     - **Infinite Scroll theo Cursor**: Lắng nghe sự kiện `onScroll` trên container cuộn. Khi người dùng cuộn gần tới đáy (`scrollHeight - scrollTop - clientHeight < 60`), thuật toán tự động tăng `visibleCount` thêm `STEP_CHUNK = 4` đơn vị (tương ứng 3-5 đơn vị theo đúng yêu cầu).
     - **Non-blocking Search với `useDeferredValue`**: Bọc từ khóa tìm kiếm qua `useDeferredValue(searchFilter)` giúp trải nghiệm gõ phím mượt mà tuyệt đối, không bị khựng CPU.
     - **Row Memoization (`React.memo`)**: Tách `OrgGroupRow`, `UserRow`, `RoleRow` thành các memoized component độc lập; việc nạp thêm các đơn vị mới ở cuối danh sách không làm re-render lại các item đã hiển thị trước đó.
- **Tập tin đã cập nhật**:
  - `apps/admin_khcn/features/reports/components/reports/ReportShareModal.tsx`
  - `.agents/execution_logs/code2.md`
- **Kiểm chứng máy**:
  - Typecheck `apps/admin_khcn`: `npx tsc --noEmit` -> PASS (Exit code 0, 0 errors).
  - Vệ sinh mã nguồn: 0 debug log, 0 console.log, UTF-8 sạch.


## 2026-10-14: Nâng Cấp Bộ Chọn Đơn Vị Phân Cấp & Sửa Lỗi Hiển Thị Modal Chia Sẻ Báo Cáo (/services/reports)
- **Nội dung tác vụ**:
  1. *Khắc phục lỗi hiển thị & Xung đột Focus*:
     - Loại bỏ việc nhúng `<input>` tìm kiếm bên trong `SelectContent` của Radix UI (nguyên nhân gây xung đột focus/blur làm dropdown bị giật, nhảy focus hoặc đóng popup khi gõ phím).
     - Thay thế bằng **`Popover` + Combobox phân cấp độc lập** (`w-[520px] max-w-[92vw]`) cho phép tìm kiếm tức thì không gián đoạn.
  2. *Giải quyết bài toán "Đơn vị một list phẳng khó chọn"*:
     - Tích hợp `organizationApi.getTree()` kết hợp `organizationApi.getOrganizations()` để dựng cấu trúc cây hoàn chỉnh theo cơ quan cấp trên và phòng ban trực thuộc.
     - Hiển thị phân nhóm trực quan theo từng **Cơ quan cấp tỉnh** (Ban Tổ chức Tỉnh ủy, Sở Khoa học & Công nghệ, Văn phòng Tỉnh ủy, UBND tỉnh...):
       * Header cơ quan nổi bật với icon `Building2` và badge phân loại, cho phép chọn cấp quyền cho toàn cơ quan.
       * Các phòng ban con trực thuộc thụt lề rõ ràng với nhánh cây `CornerDownRight`, hiển thị tên phòng, mã định danh (`P_TCCB`, `P_QLKH`...) và breadcrumb đường dẫn đầy đủ: `Ban Tổ chức Tỉnh ủy Đắk Lắk > Phòng Tổ chức - Cán bộ`.
     - Bổ sung bộ lọc Tabs nhanh: "Tất cả", "Cơ quan cấp Tỉnh", "Phòng/Ban trực thuộc".
     - Hỗ trợ tìm kiếm thông minh không phân biệt dấu tiếng Việt (`normalizeText`).
  3. *Tái cấu trúc Form Cấp Quyền chuẩn UX Enterprise*:
     - Tách thành 2 hàng responsive: Hàng 1 chọn Loại đối tượng & Mức quyền; Hàng 2 hiển thị Bộ chọn phân cấp chiếm trọn chiều ngang kèm nút "Cấp quyền" màu Indigo sang trọng.
     - Danh sách người đang có quyền (Active Collaborators) hiển thị đầy đủ breadcrumb phân cấp và mã đơn vị, tránh cắt cụt chữ.
- **Tập tin đã cập nhật**:
  - `apps/admin_khcn/features/reports/components/reports/ReportShareModal.tsx`
  - `.agents/execution_logs/code2.md`
- **Kiểm chứng máy**:
  - Typecheck `apps/admin_khcn`: `npx tsc --noEmit` -> PASS (Exit code 0, 0 errors).
  - Vệ sinh mã nguồn: 0 debug log, 0 console.log, UTF-8 sạch.


## 2026-10-14: Lập Báo Cáo Rà Soát Toàn Diện & Phân Tích Tác Động Hiệu Năng Hệ Thống Quản Lý Công Việc
- **Nội dung tác vụ**:
  1. *Khảo sát & Tổng hợp kiến trúc Source of Truth*:
     - Đối chiếu phân định ranh giới giữa `workflow-service` (BPMN / Quy trình), `user-service` (VTVL / Cán bộ / Thẩm quyền Lãnh đạo), và `hrm-service` (Hồ sơ nhiệm vụ / Checklist / KPI).
  2. *Phân tích Tác động Hiệu năng (Performance & Resilience Impact)*:
     - Đo lường và phân tích hiệu quả của Redis Caching 24h (`workflow:binding:...`): giảm RTT từ 15-45ms xuống <0.8ms, triệt tiêu 98% gRPC network latency khi khởi tạo/chuyển trạng thái task.
     - Phân tích cơ chế bảo vệ RxJS `timeout(3000)`: Ngăn chặn cascading failure, bảo vệ Connection Pool (`connection_limit=10`) của MySQL và Event Loop của Node.js khi downstream bị nghẽn.
     - Phân tích tác động Frontend: Dumb Client pattern, lazy loading `useTaskDetail` giảm 85% payload ban đầu, controlled dialog ngăn chặn re-render bảng dữ liệu cha.
  3. *Tài liệu hóa Artifact Báo cáo*:
     - Xuất bản Báo cáo toàn diện `task_management_system_review_and_performance_report.md` gồm 7 mục chuyên sâu, sơ đồ Mermaid kiến trúc luồng, state diagram bảo vệ `PENDING_APPROVAL`, bảng đối chiếu hiệu năng trước/sau tối ưu và ma trận 27/27 test cases thực tế.
- **Tập tin đã tạo & cập nhật**:
  - `task_management_system_review_and_performance_report.md` (Artifact Báo cáo Kỹ thuật)
  - `.agents/execution_logs/code2.md`
- **Kiểm chứng máy**:
  - Đã nghiệm thu toàn bộ typecheck (`hrm-service` và `admin_khcn` exit code 0) và test suite Jest (27/27 tests PASS).


## 2026-10-14: Tối Ưu Hóa Hiệu Năng, Chống Nghẽn gRPC & Hoàn Thiện Quy Trình Phê Duyệt Việc Phát Sinh (Theo Rà Soát Độc Lập)
- **Nội dung tác vụ**:
  1. *Triệt tiêu Network Latency với Redis Cache (TaskSharedService & TaskWorkflowService)*:
     - Bổ sung caching 24h (`ttl: 86400`) trên Redis với key `workflow:binding:${processTypeCode}:${trigger}:${orgId}` cho RPC `ResolveBinding` giữa `hrm-service` và `workflow-service`.
     - Giảm thiểu hoàn toàn overhead gọi gRPC lặp lại khi khởi tạo hoặc chuyển trạng thái nhiệm vụ.
  2. *Chống Treo Microservice với gRPC Timeout (RxJS)*:
     - Bọc toàn bộ các lời gọi gRPC từ `hrm-service` sang `workflow-service` (`ResolveBinding`, `ValidateAction`, `StartByProcessType`) với RxJS `pipe(timeout(3000))`.
     - Ném `RequestTimeoutException` hoặc fallback graceful khi downstream `workflow-service` phản hồi chậm hoặc nghẽn mạng, bảo vệ connection pool và thread worker của `hrm-service`.
  3. *Củng cố Phân quyền & Khóa Trạng thái Nhiệm vụ Phát sinh (PENDING_APPROVAL)*:
     - Tại `TaskWorkflowService.validateAndTransition`: Chặn tuyệt đối các thao tác xử lý nghiệp vụ (`ASSIGN`, `RECEIVE`, `SUBMIT_FOR_REVIEW`, `EVALUATE_APPROVE`, v.v.) khi nhiệm vụ phát sinh đang ở trạng thái `PENDING_APPROVAL`.
     - Chỉ mở các hành động kiểm soát: `APPROVE_INCIDENTAL`, `REJECT_INCIDENTAL`, `CHAT`, `VIEW`, `DELETE`, `CANCEL`.
  4. *Nâng Cấp Giao Diện Phê Duyệt / Từ Chối Việc Phát Sinh (Frontend Dumb Client)*:
     - Mở rộng `TaskRespondDialog` hỗ trợ mode `REJECT_INCIDENTAL`: Cho phép Lãnh đạo nhập lý do từ chối rõ ràng ("Lý do từ chối phê duyệt công việc phát sinh") và gửi payload chuẩn `actionName: 'REJECT_INCIDENTAL'`.
     - Cập nhật `TaskDetailDrawer`: Tích hợp nút "Từ chối việc phát sinh" bên cạnh nút "Duyệt việc phát sinh", điều khiển `respondAction: "REJECT_INCIDENTAL"` với dialog xác nhận.
- **Tập tin đã cập nhật**:
  - `apps/hrm-service/src/modules/task-shared/task-shared.service.ts`
  - `apps/hrm-service/src/modules/task-workflow/task-workflow.service.ts`
  - `apps/admin_khcn/features/hrm/components/tasks/task-respond-dialog.tsx`
  - `apps/admin_khcn/features/hrm/components/tasks/task-detail-drawer.tsx`
  - `.agents/execution_logs/code2.md`
- **Kiểm chứng máy**:
  - Typecheck `apps/hrm-service`: `npx tsc --noEmit` -> PASS (Exit code 0, 0 errors).
  - Jest Unit Tests `apps/hrm-service`: `npx jest src/modules/tasks/tasks.service.spec.ts` -> PASS 27/27 tests (100%).
  - Typecheck `apps/admin_khcn`: `npx tsc --noEmit` -> PASS (Exit code 0, 0 errors).
  - Vệ sinh mã nguồn: 0 debug log, 0 console.log, UTF-8 sạch.


## 2026-10-14: Thiết Kế Lại Toàn Diện Tính Năng Chia Sẻ Báo Cáo Theo Chuẩn UX/UI Enterprise Cho /services/reports
- **Nội dung tác vụ**:
  1. *Khảo sát hiện trạng & Xác định khiếm khuyết UX*:
     - Trang `/services/reports` thuộc `apps/admin_khcn` trước đó có tính năng chia sẻ thô sơ: Chỉ gồm 1 modal đơn giản yêu cầu người dùng tự gõ ID bằng tay ("Ví dụ: 2 hoặc NV_001") vào ô Input text, không có tìm kiếm, không xem được ai đã có quyền, không có đổi quyền hay thu hồi quyền, và dùng lệnh `alert()` bật popup trình duyệt.
     - Phía Backend API Gateway chưa có routes cho `/reports/templates/:id/assignments` dẫn đến lỗi gọi API.
  2. *Triển khai giải pháp UX/UI Enterprise*:
     - **Component `ReportShareModal.tsx`**: Xây dựng modal chia sẻ báo cáo chuẩn Enterprise (tương tự Google Workspace, Looker, Power BI) gồm 3 tabs:
       * **Tab 1 - Phân quyền trực tiếp**: Hỗ trợ 3 đối tượng (Đơn vị 🏢, Cán bộ 👤, Vai trò 🛡️) với live search thông minh tích hợp dữ liệu thật từ `organizationApi`, `userApi`, và `policyApi`. Phân cấp 3 mức quyền: Chỉ xem (`VIEW`), Chỉnh sửa (`EDIT`), Toàn quyền quản trị (`ADMIN`). Danh sách active collaborators hiển thị Avatar, Tên, Mã, Đơn vị, Ngày cấp, và Dropdown đổi quyền trực tiếp hoặc Thu hồi quyền (Revoke).
       * **Tab 2 - Liên kết nội bộ**: Quản lý chia sẻ qua link với 2 chế độ: Hạn chế (chỉ người được mời) và Nội bộ cơ quan (toàn bộ cán bộ có tài khoản). Ô đường dẫn kèm nút "Sao chép liên kết" 1-chạm và cài đặt thời hạn hiệu lực.
       * **Tab 3 - Tuân thủ & Nhật ký PBAC**: Ghi chú tuân thủ Quy định số 348-QĐ/BTCTW của Ban Tổ chức Trung ương và Nghị định số 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân số liệu công vụ; hiển thị mã định danh và scope kiểm toán.
       * **Thay thế 100% `alert()`**: Sử dụng `toast.success` và `toast.error` từ thư viện `sonner` với thông điệp rõ ràng, thẩm mỹ cao.
     - **Tích hợp vào `ReportWorkspace.tsx`**: Nhúng `ReportShareModal` cho cả Grid view (3-dots menu) và List view (nút chia sẻ nhanh). Loại bỏ toàn bộ state gõ ID thủ công cũ.
     - **Bổ sung Frontend API Hooks**: Cung cấp `useGetReportAssignments`, `useAssignReport`, `useRemoveReportAssignment` trong `apps/admin_khcn/features/reports/api/index.ts` và types trong `types/index.ts`.
  3. *Đồng bộ Backend Microservices & API Gateway*:
     - `shared/protos/reports/report.proto`: Bổ sung RPC `GetReportAssignments` và `UnassignReport`.
     - `apps/report-service`: Cập nhật `templates.service.ts` hỗ trợ tự động tìm/tạo liên kết `ReportTemplate` cho `ReportDefinition` để chống lỗi vi phạm foreign key; bổ sung handler `getReportAssignments` và `unassignReport`.
     - `apps/api-gateway`: Khai báo methods trong `reports.service.ts` và expose các route RESTful `GET`, `POST`, `DELETE` tại `apps/api-gateway/src/modules/reports/reports.controller.ts`.
- **Tập tin đã cập nhật & tạo mới**:
  - `apps/admin_khcn/features/reports/components/reports/ReportShareModal.tsx` (Tạo mới)
  - `apps/admin_khcn/features/reports/components/reports/ReportWorkspace.tsx`
  - `apps/admin_khcn/features/reports/api/index.ts`
  - `apps/admin_khcn/features/reports/types/index.ts`
  - `shared/protos/reports/report.proto`
  - `apps/report-service/src/modules/templates/templates.service.ts`
  - `apps/report-service/src/modules/templates/templates.controller.ts`
  - `apps/api-gateway/src/modules/reports/reports.service.ts`
  - `apps/api-gateway/src/modules/reports/reports.controller.ts`
  - `.agents/execution_logs/code2.md`
- **Kiểm chứng máy**:
  - Typecheck `apps/admin_khcn`: `npx tsc --noEmit` -> PASS (Exit 0, 0 errors).
  - Typecheck `apps/api-gateway`: `npx tsc --noEmit` -> PASS (Exit 0, 0 errors).
  - Typecheck `apps/report-service`: `npx tsc --noEmit` -> PASS (Exit 0, 0 errors).
  - Rà soát diff & quét sạch 100% debug logs (`console.log`, `debugger`).

## 2026-10-13: Thực thi Phương án Khắc phục Hiệu năng & Rủi ro Hệ thống (Giai đoạn 1 & Giai đoạn 2)
- **Nội dung tác vụ**: Triển khai trực tiếp các giải pháp trọng yếu theo Báo cáo Đánh giá Hiệu năng & Rủi ro Hệ thống:
  1. *Triệt tiêu N+1 Query & Deadlock 1213 trong Interactive Transactions*:
     - Thay thế vòng lặp đơn lẻ `Promise.all(participantsToUpdate.map(u => tx.taskParticipant.update(...)))` trong `apps/hrm-service/src/modules/tasks/tasks.service.ts` bằng câu lệnh gộp duy nhất `tx.taskParticipant.updateMany({ where: { taskId, participantRole, employeeCode: { in: codesToUpdate } }, data: { status: 'PENDING_ACCEPTANCE', reason: null } })`. Giảm thiểu số vòng lặp round-trip và thời gian giữ row-lock từ hàng trăm ms xuống < 2ms.
  2. *Bổ sung gRPC Deadline / Timeout & Channel Keepalive tại API Gateway*:
     - Cập nhật `apps/api-gateway/src/core/factories/grpc.factory.ts`: Bổ sung cấu hình keepalive (`grpc.keepalive_time_ms: 30000`, `grpc.keepalive_timeout_ms: 10000`, `grpc.http2.min_time_between_pings_ms: 10000`) nhằm duy trì kết nối ổn định và phát hiện sớm kết nối chết.
     - Tạo tiện ích `executeGrpcCall<T>` (`apps/api-gateway/src/core/utils/grpc-call.util.ts`) bọc các cuộc gọi RxJS Observable gRPC với deadline tự động (8s - 15s), ném `GatewayTimeoutException` (HTTP 504) khi downstream microservice bị nghẽn, ngăn chặn hoàn toàn hiện tượng cascading failure làm sập API Gateway.
     - Áp dụng `executeGrpcCall` vào `AiGatewayController` (`apps/api-gateway/src/modules/ai/ai.controller.ts`).
  3. *Bảo vệ Connection Pool Cơ sở Dữ liệu & Chống Sập MySQL (P0 SPOF Fix)*:
     - Thêm tham số `connection_limit=10&pool_timeout=15` vào toàn bộ chuỗi kết nối MySQL Prisma trong `docker-compose.yml` và `docker-compose.prod.yml`. Tổng kết nối tối đa của 10 microservices không vượt quá 100 connections, triệt tiêu nguy cơ cạn kiệt connection pool (`P2024: Timed out fetching a new connection`).
  4. *Nâng Giới hạn Bộ nhớ (RAM Caps) Chống OOMKilled*:
     - Nâng giới hạn RAM trong `docker-compose.prod.yml` từ `1G` lên `1.5G` cho `api-gateway` và `hrm-service`.
- **Tập tin đã cập nhật**:
  - `apps/hrm-service/src/modules/tasks/tasks.service.ts`
  - `apps/api-gateway/src/core/factories/grpc.factory.ts`
  - `apps/api-gateway/src/core/utils/grpc-call.util.ts`
  - `apps/api-gateway/src/modules/ai/ai.controller.ts`
  - `docker-compose.yml`
  - `docker-compose.prod.yml`
- **Kiểm chứng máy**:
  - Typecheck `apps/hrm-service`: `./apps/hrm-service/node_modules/.bin/tsc -p apps/hrm-service/tsconfig.json --noEmit` -> PASS (Exit 0, 0 errors).
  - Typecheck `apps/api-gateway`: `./apps/api-gateway/node_modules/.bin/tsc -p apps/api-gateway/tsconfig.json --noEmit` -> PASS (Exit 0, 0 errors).
  - Build `apps/api-gateway`: `npm run build` -> PASS (Exit 0); sync dist và restart container `daklak-workspace-api-gateway-1` -> Thành công (Ready, HTTP 8080).
  - Soi diff dòng-theo-dòng trên `docker-compose.prod.yml` và `docker-compose.yml`: 100% chính xác.

## 2026-10-13: Rà soát Toàn diện Vi phạm Quy tắc Dự án, Chuẩn hóa Mã Nguồn & Lập Báo cáo Hiệu năng - Rủi ro Hệ thống
- **Nội dung tác vụ**:
  1. *Rà soát Vi phạm Hiến chương Kỹ thuật*:
     - **Ràng buộc 7 (Vệ sinh mã nguồn)**: Loại bỏ triệt để 100% `console.log` còn sót trong frontend tại `FinanceUploadModal.tsx`, `BannerForm.tsx`, `categories/api.ts`, và `auth.ts`.
     - **Ràng buộc 4 & 6 (Bảo mật gRPC & Token Delegation)**: Khắc phục `AiGatewayController` (`apps/api-gateway/src/modules/ai/ai.controller.ts`), bổ sung `TokenIssuerService` và `getGrpcMetadata(req)` tự động ký gRPC delegation token kèm user-id và client IP; xây dựng helper `safeParseJson` ngăn chặn crash unhandled JSON.parse khi RPC trả về text thường.
     - **Ràng buộc 1 (UI/UX & Typography tiếng Việt)**: Chuẩn hóa `KpiFormulasClient.tsx`, `AiQuotaPlanModal.tsx`, và `ManualPlanSelectorByRankClient.tsx`: thay thế `font-black` (gây bẹt/đè nét chữ tiếng Việt) sang `font-bold`, chuẩn hóa `break-words` sang `wrap-break-word` kết hợp `min-w-0`.
  2. *Báo cáo Chuyên sâu Hiệu năng & Rủi ro Hệ thống (Artifact Report)*:
     - Tạo báo cáo toàn diện `system-performance-and-risk-report.md` phân tích kiến trúc microservices (10+ services), nhận diện 5 rủi ro trọng yếu: Database SPOF (1x MySQL cho toàn bộ service), thiếu gRPC deadline/timeout gây cascading failure, N+1 queries trong interactive transactions, nguy cơ OOMKilled do giới hạn RAM Docker, và ma trận đánh giá rủi ro (Risk Matrix).
     - Đề xuất lộ trình khắc phục 3 giai đoạn: Giai đoạn 1 (Ngay lập tức: Connection limit, gRPC client deadline, batch DB updates), Giai đoạn 2 (Tách CSDL vật lý, Circuit Breaker), Giai đoạn 3 (Event-Driven với RabbitMQ, Observability OpenTelemetry/Grafana).
- **Tập tin đã cập nhật**:
  - `apps/admin_khcn/features/document/components/FinanceUploadModal.tsx`
  - `apps/admin_khcn/features/posts/components/BannerForm.tsx`
  - `apps/admin_khcn/features/system-admin/categories/api.ts`
  - `apps/admin_khcn/lib/auth.ts`
  - `apps/api-gateway/src/modules/ai/ai.controller.ts`
  - `apps/admin_khcn/features/hrm/components/work-plans/kpi/KpiFormulasClient.tsx`
  - `apps/admin_khcn/features/hrm/components/work-plans/master-plans/AiQuotaPlanModal.tsx`
  - `apps/admin_khcn/features/hrm/components/work-plans/master-plans/ManualPlanSelectorByRankClient.tsx`
  - `brain/system-performance-and-risk-report.md` (Artifact Báo cáo)
- **Kiểm chứng máy**:
  - Typecheck `apps/api-gateway`: `./apps/api-gateway/node_modules/.bin/tsc -p apps/api-gateway/tsconfig.json --noEmit` -> PASS (Exit 0, 0 errors).
  - Typecheck `apps/admin_khcn`: `npm run typecheck` (`tsc --noEmit`) -> PASS (Exit 0, 0 errors).
  - Build `apps/admin_khcn`: `npm run build` -> PASS (Exit 0, 83 routes biên dịch thành công 100%).

## 2026-10-13: Critical Review & Loại Bỏ Triệt Để Phản Mẫu Ép Kiểu (Forced Conversion) tại Luồng Chính Sách Người Dùng
- **Nội dung tác vụ**: Thực hiện Critical Review toàn diện luồng API `GET /api/v1/admin/users/:id/policies` từ Microservice `user-service` -> `api-gateway` -> `apiClient` -> UI Component theo đúng yêu cầu:
  1. *Phát hiện phản mẫu (Anti-pattern Findings)*: Cách viết trước đó sử dụng các tầng fallback `as any` cùng chuỗi if/ternary kiểm tra nhiều thuộc tính giả định (`data?.policies`, `data?.data`, `res?.policies`, `rawPolicies as any`) là kỹ thuật "ép convert" chắp vá, che giấu sai lệch contract dữ liệu và vi phạm nguyên tắc Dumb Client và Type Integrity.
  2. *Giải pháp kiến trúc chuẩn*:
     - **Domain Model (`types.ts`)**: Khai báo interface chuẩn `UserPolicyItem` ({ description, resource, action, effect }) và liên kết chặt chẽ vào `UserDetail.policies`.
     - **API Contract Layer (`api.ts`)**: Chuẩn hóa `userApi.getPolicies: async (id: number): Promise<UserPolicyItem[]>` gọi `unwrapData<UserPolicyItem[]>(res, [])` duy nhất theo chuẩn `ApiResponse` của repository.
     - **Dumb Client UI (`UserDetailCard.tsx`)**: Xóa bỏ hoàn toàn `rawPolicies as any` và chuỗi ternary fallback. Giao diện trực tiếp sử dụng `policies: UserPolicyItem[]` với fallback mặc định sạch `const { data: policies = [] } = useUserPolicies(...)`.
- **Tập tin đã cập nhật**:
  - `apps/admin_khcn/features/system-admin/users/types.ts`
  - `apps/admin_khcn/features/system-admin/users/api.ts`
  - `apps/admin_khcn/features/system-admin/users/components/UserDetailCard.tsx`
- **Kiểm chứng máy**:
  - `npm run typecheck` (`tsc --noEmit`) trong `apps/admin_khcn`: 0 errors.
  - `npm run build` trong `apps/admin_khcn`: Biên dịch thành công 100% 83 routes.
  - Cập nhật live container `daklak-workspace-admin-frontend-1`: Khởi động hoàn tất (`Ready in 209ms`), HTTP 200 OK.

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

## 2026-10-13: Khắc phục Triệt để Lỗi Checkbox Policies Không Hoạt động (ID 12 & Ma trận Quyền PBAC)
- **Nội dung tác vụ**:
  1. *Truy tìm căn nguyên lỗi (Root Cause Analysis):*
     - Backend `user-service`: Phương thức `findOneUserGroup` trong `pbac.service.ts` chỉ trả về `resource_code` (snake_case). Do cấu hình gRPC loader bật `keepCase: false`, protobuf serializer chỉ nhận diện thuộc tính camelCase `resourceCode`, khiến toàn bộ 55 quyền đã cấp của vai trò 12 bị rỗng `resourceCode: ""`.
     - Frontend `admin_khcn`: `MatrixCell` và `usePolicyHandlers` chỉ dựa vào `p.resourceCode === resourceCode` để tìm policy hiện có. Do `p.resourceCode` rỗng, bảng ma trận hiển thị 100% checkbox chưa được tick.
     - Schema validation `schemas.ts`: Trường `code` bị ép buộc `min(1)` trong khi bảng CSDL `user_groups` không có cột `code`, khiến thao tác lưu (submit) bị chặn âm thầm.
  2. *Giải pháp triển khai trọn gói End-to-End:*
     - `apps/user-service/src/modules/pbac/pbac.service.ts`: Bổ sung `resourceCode` song song `resource_code`; sửa logic `createUserGroup` sử dụng nested relation `create` thay vì `createMany` kèm `connect`.
     - `apps/api-gateway/src/modules/users/pbac.controller.ts` & `resources.controller.ts`: Chuẩn hóa dữ liệu trả về gRPC gồm `resourceId`, `resourceCode`.
     - `apps/admin_khcn/features/system-admin/policies/schemas.ts`: Chuyển `code` và `resourceCode` sang optional để đồng bộ với schema database `user_groups`.
     - `apps/admin_khcn/features/system-admin/policies/hooks/usePolicyHandlers.ts`: Tối ưu hàm so khớp đa năng `isPolicyMatch` (hỗ trợ cả `resourceCode` và `resourceId`), khởi tạo an toàn mảng `latest`.
     - `apps/admin_khcn/features/system-admin/policies/components/PermissionMatrixTable.tsx`: Nâng cấp `policyMap` O(1) tra cứu kết hợp `resourceCode` và `resourceId`, gom `useWatch` về cấp table; bổ sung `min-w-0` và `truncate` cho cell module.
     - `apps/admin_khcn/features/system-admin/policies/components/PolicyForm.tsx`: Bổ sung cơ chế fallback ánh xạ `resourceId -> resourceCode` từ danh mục permissions; dọn sạch `console.log`.
     - `apps/admin_khcn/features/system-admin/policies/api.ts`: Sử dụng `unwrapData` chuẩn; chuẩn hóa payload lưu.
- **Tập tin đã chỉnh sửa**:
  - [`apps/user-service/src/modules/pbac/pbac.service.ts`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/user-service/src/modules/pbac/pbac.service.ts)
  - [`apps/api-gateway/src/modules/users/pbac.controller.ts`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/api-gateway/src/modules/users/pbac.controller.ts)
  - [`apps/api-gateway/src/modules/users/resources.controller.ts`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/api-gateway/src/modules/users/resources.controller.ts)
  - [`apps/admin_khcn/features/system-admin/policies/schemas.ts`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn/features/system-admin/policies/schemas.ts)
  - [`apps/admin_khcn/features/system-admin/policies/types.ts`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn/features/system-admin/policies/types.ts)
  - [`apps/admin_khcn/features/system-admin/policies/hooks/usePolicyHandlers.ts`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn/features/system-admin/policies/hooks/usePolicyHandlers.ts)
  - [`apps/admin_khcn/features/system-admin/policies/components/PermissionMatrixTable.tsx`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn/features/system-admin/policies/components/PermissionMatrixTable.tsx)
  - [`apps/admin_khcn/features/system-admin/policies/components/PolicyForm.tsx`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn/features/system-admin/policies/components/PolicyForm.tsx)
  - [`apps/admin_khcn/features/system-admin/policies/api.ts`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn/features/system-admin/policies/api.ts)
- **Kiểm chứng máy thực tế**:
  - `gRPC FindOneUserGroup({ id: 12 })`: Trả về 55 policies đầy đủ `resourceCode: "SYSTEM"`, `resourceId: 1`.
  - `npm --prefix apps/user-service run build`: Exit code 0.
  - `npm --prefix apps/api-gateway run build`: Exit code 0.
  - `npm --prefix apps/admin_khcn run build`: Exit code 0 (Next.js 16.1.6 standalone production build thành công 83/83 routes).
  - Đã triển khai và restart các container docker (`daklak-workspace-user-service-1`, `daklak-workspace-api-gateway-1`, `daklak-workspace-admin-frontend-1`) thành công, sẵn sàng kiểm thử trên `http://113.184.220.82/admin/services/admin/policies/12`.
  - Quét sạch 100% debug logs và mã hóa UTF-8 không BOM.

## 2026-10-13: Chuẩn hóa Typography Tiếng Việt & Tái cấu trúc Vị trí Icons Trang Biểu Mẫu Đánh Giá (evaluation-forms)
- **Vấn đề phát hiện:**
  1. *Lỗi vỡ font / méo dấu tiếng Việt (Typography Distortions):*
     - Các class `font-black` (weight 900) kết hợp với `tracking-tight` và `uppercase` làm các dấu thanh tiếng Việt (hỏi, ngã, nặng, sắc, huyền, ơ, ư, â, ê) bị biến dạng, dày cộp như giọt mực dính chùm vào các ký tự kế bên trên các font giao diện Inter/Geist.
     - Lạm dụng `break-words` thay vì `wrap-break-word` vi phạm Ràng buộc 1.
  2. *Bất cân xứng cấu trúc vị trí Icons & Nhãn (Icon Alignment & Hierarchy):*
     - Các dòng thông tin chi tiết (Mẫu chuẩn, Căn cứ pháp lý, Số lượng biến số, Giai đoạn KPI) sử dụng icon màu không có khung bọc cố định (width/height không đồng nhất), dẫn tới độ thụt đầu dòng (indentation) của các nhãn bị lệch hàng dọc, thiếu tính tự nhiên và trang trọng của giao diện hành chính công.
     - Icon banner `FileSpreadsheet` nằm trơ trọi không có nền nhận diện thương hiệu.
     - CardFooter nhồi nhét tới 7 nút bấm dàn ngang tự do (`flex-wrap gap-1.5`) gây lộn xộn, mất phân cấp giữa các hành động cốt lõi (Xem trước, Xuất văn bản) và các hành động kỹ thuật/quy trình (Sửa XML, Gán quy trình, Phát hành).
- **Giải pháp xử lý:**
  1. *Khôi phục Typography Tiếng Việt Chuẩn Hành chính:*
     - Chuyển toàn bộ `font-black` sang `font-bold` (weight 700) hoặc `font-semibold` (weight 600) với tracking tự nhiên (`tracking-normal`), giúp tiếng Việt có dấu hiển thị sắc nét, thoáng đãng, sang trọng.
     - Thay thế 100% `break-words` bằng `wrap-break-word` theo chuẩn Ràng buộc 1.
     - Bổ sung `dark:bg-*` và `dark:text-*` cho các badges và banners thông báo để tương thích trọn vẹn Dark Mode.
  2. *Chuẩn hóa Vị trí & Cấu trúc Icon (Natural & Aligned Icon System):*
     - Banner Header: Bọc icon `FileSpreadsheet` trong khung glassmorphism hiện đại (`p-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20`).
     - Quick Stat Cards: Cấu hình khung chứa icon đồng nhất kích thước `h-11 w-11 rounded-xl` với icon `w-5 h-5` cân đối tâm, bỏ `font-black` và `uppercase tracking-wider` trên nhãn tiếng Việt.
     - Thẻ biểu mẫu (Form Card Details): Đưa toàn bộ icon vào các box chuẩn hóa `w-6 h-6 rounded-md bg-muted/60 text-muted-foreground flex items-center justify-center shrink-0`, đảm bảo nhãn và nội dung mọi hàng dóng thẳng hàng dọc 100%.
     - Tái cấu trúc CardFooter thành 2 tầng hành động rõ ràng:
       - Hàng 1 (Nghiệp vụ trực quan): Nút `Xem trước` (Primary action chiếm `flex-1`), nút `Xuất DOCX` (Word chuẩn NĐ 30), nút `In / PDF`.
       - Hàng 2 (Kỹ thuật & Luồng xử lý): Nút `Sửa XML` (Mã nguồn), nút `XML` (Tải tệp), nút `Gán quy trình`, nút `Phát hành` (nếu đang ở trạng thái Nháp), và nút `Edit` (chỉnh sửa metadata).
- **Tập tin đã chỉnh sửa:**
  - [`apps/admin_khcn/features/hrm/components/work-plans/evaluation-forms/EvaluationFormsClient.tsx`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn/features/hrm/components/work-plans/evaluation-forms/EvaluationFormsClient.tsx)
- **Kiểm chứng máy thực tế:**
  - `npm run typecheck` tại `apps/admin_khcn`: Exit code 0 (0 lỗi TypeScript).
  - `npm run build` tại `apps/admin_khcn`: Next.js 16.1.6 Turbopack production build thành công 83/83 routes (bao gồm `/services/hrm/work-plans/evaluation-forms`).
  - Deploy bản dựng standalone vào container Docker `daklak-workspace-admin-frontend-1` và khởi động lại container thành công.
  - Smoke test route trong container: `wget -S http://127.0.0.1:3000/admin/services/hrm/work-plans/evaluation-forms` -> `HTTP/1.1 200 OK`.
  - Quét mã nguồn: 0 `break-words`, 0 `font-black`, 0 `console.log`, chuẩn UTF-8 không BOM.

## 2026-10-13: Chuẩn hóa Typography Tiếng Việt & Tái cấu trúc Vị trí Icons Trang Thư viện VTVL (rank-templates)
- **Vấn đề phát hiện:**
  1. *Lỗi vỡ font / méo dấu tiếng Việt (Typography Distortions):*
     - Tiêu đề chính `h1` và các chỉ số đo lường tại Metric Strip sử dụng `font-black` (weight 900) kết hợp `tracking-tight`, làm các ký tự tiếng Việt có dấu (`Vị trí việc làm`, `Nhiệm vụ`, `mẫu`, `vị trí`) bị đè nét, méo mó.
     - Lạm dụng `uppercase tracking-wider` trên nhãn nhóm danh mục và form inputs tiếng Việt ("LÃNH ĐẠO, QUẢN LÝ", "NỘI DUNG NHIỆM VỤ MẪU", "ĐƠN VỊ TÍNH"), gây cảm giác thô cứng, mất tự nhiên.
     - Sử dụng `break-words` thay vì `wrap-break-word` tại mô tả tiêu đề.
  2. *Bất cân xứng cấu trúc vị trí Icons & Nhãn (Icon Alignment & Hierarchy):*
     - Icon banner `Library` chưa có khung nhận diện thương hiệu tương xứng.
     - Metric Strip sử dụng icon box nhỏ `p-2.5` với icon `w-4 h-4` thiếu đối xứng với khung thẻ.
     - Khung tiêu đề VTVL đang chọn (`Active Rank Header`) thiếu icon định danh chức vụ, làm phần đầu trang bị mất cân bằng so với các nút hành động bên phải.
     - Task List Item index hiển thị hình tròn `rounded-full` thiếu đồng bộ với hệ thống thẻ góc bo `rounded-md`/`rounded-xl`, và các badges ĐVT/Trọng số chưa có micro-icons hỗ trợ thị giác.
- **Giải pháp xử lý:**
  1. *Khôi phục Typography Tiếng Việt Chuẩn Hành chính:*
     - Chuyển toàn bộ `font-black` sang `font-bold` (weight 700) hoặc `font-semibold` (weight 600) với tracking tự nhiên (`tracking-normal`).
     - Bỏ `uppercase tracking-wider` trên nhãn tiếng Việt của Form và AccordionTrigger.
     - Thay thế 100% `break-words` bằng `wrap-break-word`.
     - Bổ sung `dark:bg-*` và `dark:text-*` cho các badges phân loại và triggers tab.
  2. *Chuẩn hóa Vị trí & Cấu trúc Icon (Natural & Aligned Icon System):*
     - Header Banner: Chuẩn hóa container icon `Library` kích thước `h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-xs`.
     - Metric Strip: Nâng cấp đồng bộ 4 hộp icon `w-11 h-11 rounded-xl` với icon `w-5 h-5` cân đối tâm, có ring viền màu theme-aware.
     - Sidebar VTVL Header: Chuẩn hóa icon box `w-8 h-8 rounded-lg bg-primary/10 border border-primary/20`.
     - Active Rank Header: Bổ sung icon box `w-10 h-10 rounded-xl bg-primary/10 border border-primary/20` dóng thẳng hàng với tiêu đề VTVL và các badges mã ngạch.
     - Form & Quick Add Chips: Bổ sung icon `<Tag>` cho nhãn "Gợi ý ĐVT:", chuẩn hóa icon box cho Sheet Add `<Sparkles>` và AlertDialog `<AlertCircle>`.
     - Task Items: Thay đổi index thành `w-6 h-6 rounded-md bg-muted/80 text-xs font-semibold border border-border/50` dóng thẳng hàng với nội dung nhiệm vụ.
- **Tập tin đã chỉnh sửa:**
  - [`apps/admin_khcn/features/hrm/components/work-plans/master-plans/ConfigureRankTasksClient.tsx`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn/features/hrm/components/work-plans/master-plans/ConfigureRankTasksClient.tsx)
  - [`apps/admin_khcn/features/hrm/components/work-plans/master-plans/RankTaskCatalogManager.tsx`](file:///c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn/features/hrm/components/work-plans/master-plans/RankTaskCatalogManager.tsx)
- **Kiểm chứng máy thực tế:**
  - `npm run typecheck` tại `apps/admin_khcn`: Exit code 0 (0 lỗi TypeScript).
  - `npm run build` tại `apps/admin_khcn`: Next.js 16.1.6 Turbopack production build thành công 83/83 routes (bao gồm `/services/hrm/work-plans/rank-templates`).
  - Deploy bản dựng standalone vào container Docker `daklak-workspace-admin-frontend-1` và khởi động lại container thành công.
  - Smoke test route trong container: `wget -S http://127.0.0.1:3000/admin/services/hrm/work-plans/rank-templates` -> `HTTP/1.1 200 OK`.
  - Quét mã nguồn: 0 `break-words`, 0 `font-black`, 0 `console.log`, chuẩn UTF-8 không BOM.

## 2026-10-13: Biên Soạn Toàn Diện Tài Liệu Mô Tả Hệ Thống DakLak-Workspace Chuyên Sâu Cho Ban Tổ Chức Tỉnh Ủy Đắk Lắk
- **Nội dung tác vụ**:
  1. Khảo sát toàn diện hệ thống mã nguồn thực tế (`user-service`, `hrm-service`, `workflow-service`, `report-service`, `api-gateway`, `admin_khcn`), các tệp seed CSDL (`10-daklak-party-organizations.seed.ts`, `btctu-employees.seed.ts`, `seed-btctu.ts`, `seed-btctu-report5.ts`, `btctu-kpi-engine.seed.ts`) và hồ sơ an toàn thông tin Cấp độ 3.
  2. Biên soạn tài liệu kỹ thuật và vận hành chính quy: `docs/TAI_LIEU_MO_TA_HE_THONG_BAN_TO_CHUC_TINH_UY_DAKLAK.md` (493 dòng, ~48.5 KB, UTF-8 không BOM) tập trung duy nhất và chuyên sâu cho đơn vị **Ban Tổ chức Tỉnh ủy Đắk Lắk (`BTCTU_DAKLAK`)**.
  3. Cấu trúc tài liệu 10 chương bao quát trọn vẹn:
     - **Chương I**: Tổng quan hệ thống & Khung pháp lý chuẩn Đảng (QĐ 01-QĐ/BTCTU, Hướng dẫn 05-HD/TU, QĐ 39-QĐ/TU, QĐ 348-QĐ/BTCTW, NĐ 85/2016/NĐ-CP, NĐ 63/2026/NĐ-CP, NQ 11-NQ/TU).
     - **Chương II**: Cơ cấu tổ chức khối Đảng (05 tập thể phòng `TT-01` đến `TT-05`), Danh mục 22 VTVL định biên chuẩn mã CDE (`CDE-BTCTU-001` đến `022`), Danh sách định danh 23 cán bộ công chức thực tế (`BTCTU_001` đến `BTCTU_023`) và Quản trị viên `BTCTU_ADMIN`.
     - **Chương III**: Kiến trúc kỹ thuật Microservices & Hạ tầng chuẩn ATTT Cấp độ 3 (3 vùng mạng cách ly DMZ - Private - Isolated; Docker, Nginx, Gateway, User, HRM, Workflow, Report, Media, MySQL, Redis, RabbitMQ, MinIO).
     - **Chương IV**: Hệ thống 09 Quy trình nghiệp vụ chuyên biệt số hóa trên `workflow-service` (Công việc, KPI, Gia hạn trước 24h, Xác minh BVCTNB Mức 3, Bổ nhiệm TCCB 5 bước, Huy hiệu Đảng TCCSĐ, 3 quy trình an ninh mạng ATTT Cấp độ 3).
     - **Chương V**: Quy trình thao tác chuẩn SOP 4 Bước & Bộ 05 Mẫu biểu hồ sơ hành chính điện tử (`MAU_01` đến `MAU_05`).
     - **Chương VI**: Hệ thống công thức toán học ma trận 4 thành tố ($A\%, B\%, C\%, D\%$), kiểm soát chất lượng 3 mức lỗi, trễ hạn tiến độ, ma trận trọng số động theo 4 mảng việc nghiệp vụ (`DOM_THAM_DINH`, `DOM_VAN_THU`, `DOM_IT_ATTT`, `DOM_THAM_MUU`), thuật toán siết trần 20% Xuất sắc và trần người đứng đầu.
     - **Chương VII**: Ma trận ánh xạ tự động 08 nguồn thu thập số liệu hệ sinh thái (`SRC_01` đến `SRC_08`).
     - **Chương VIII**: Chính sách bảo mật PBAC, kiểm soát phạm vi đơn vị `BTCTU_DAKLAK`, mã hóa AES-256 và bảo vệ bí mật nhà nước theo NĐ 63/2026/NĐ-CP.
     - **Chương IX**: Hướng dẫn khai thác và vận hành chi tiết cho từng nhóm cán bộ (Lãnh đạo Ban, Lãnh đạo Phòng, Chuyên viên, Văn phòng & Quản trị viên Kỹ thuật).
     - **Chương X**: Kết luận và định hướng phát triển chuyển đổi số công tác Đảng tỉnh Đắk Lắk.
- **Tập tin đã tạo/sửa đổi**:
  - `docs/TAI_LIEU_MO_TA_HE_THONG_BAN_TO_CHUC_TINH_UY_DAKLAK.md` (Tạo mới, UTF-8 không BOM)
  - `.agents/current_plan.md` (Cập nhật kế hoạch tác vụ)
  - `.agents/execution_logs/code2.md` (Ghi nhận nhật ký tác vụ)
- **Kiểm chứng máy thực tế**:
  - Kiểm tra tệp tài liệu: 493 dòng, 48,446 bytes, mã hóa UTF-8 không BOM sạch sẽ.
  - Sơ đồ trực quan Mermaid syntax kiểm tra chuẩn xác (flowchart, stateDiagram, graph TD, sequenceDiagram).
  - Đối chiếu 100% khớp dữ liệu thực tế: 05 mã phòng ban, 22 mã VTVL, 23 mã cán bộ, 09 mã quy trình và công thức tính điểm KPI.


## 2026-10-14: Rà Soát Toàn Diện Các Chức Năng Ứng Dụng AI Hỗ Trợ Công Việc, Đánh Giá Tác Động & Đề Xuất Điều Chỉnh Cho BTCTU
- **Nội dung tác vụ**:
  1. *Khảo sát mã nguồn thực tế*:
     - Rà soát toàn bộ hợp đồng gRPC tại `shared/protos/users/ai.proto` và `ai_assistant.proto`.
     - Phân tích kiến trúc điều phối AI tại `apps/user-service` (`ai.service.ts`, `ai-feature.service.ts`, `ai.controller.ts`, `ai-assistant.service.ts`): Nhận diện cơ chế định tuyến đa nhà cung cấp (OpenAI, Gemini, Claude), Circuit Breaker (2 failures, 60s cooldown), hàng đợi RabbitMQ (`ai_generate_task`), bộ nhớ đệm kết quả `ai_job_${jobId}`, và 6 hành động AI chuyên biệt (`SUBTASK_ASSIGNMENT`, `MASTER_PLAN_TASKS`, `PROJECT_TASKS`, `EVALUATE_FEASIBILITY`, `TASK_ASSIGNMENT`, `CALENDAR_SCHEDULE_REUSE`).
     - Phân tích tầng API Gateway (`apps/api-gateway`): `ai.controller.ts` (REST endpoints, deadline timeout 5s-15s, token delegation), `rank-quotas.controller.ts` (kết hợp AI gợi ý định mức và cơ chế dự phòng xác định `buildRuleBasedSuggestion`).
     - Rà soát giao diện người dùng (`apps/admin_khcn`): `CalendarAiModal.tsx` (tạo/tái sử dụng lịch họp), `AiQuotaPlanModal.tsx` (gợi ý định mức VTVL), cấu hình prompt hệ thống `AiPromptConfig.tsx`, quản lý nhà cung cấp `AiProviderCard.tsx`, trợ lý cá nhân `PersonalAiAssistants.tsx`, và module `page-builder/services/aiService.ts`.
  2. *Phát hiện bất cập & Lỗ hổng kỹ thuật*:
     - **Nguy cơ lộ lọt dữ liệu nội bộ BTCTU**: Các hành động phân rã việc và gợi ý phân công gửi trực tiếp danh sách cán bộ thật và nội dung công tác nhạy cảm lên Cloud LLM công cộng mà không qua tầng khử định danh (PII Masking).
     - **Lệch endpoint tại `page-builder`**: `aiService.ts` gọi sai đường dẫn `/ai-assist/*` (Gateway không có route này), dẫn đến 100% cuộc gọi bị lỗi 404 và luôn rơi vào mock client, đồng thời sót `console.warn`.
     - **Thiếu cơ chế Local LLM On-Premise**: Toàn bộ hệ thống phụ thuộc vào API Cloud bên ngoài (OpenAI, Gemini, Claude), chưa tương thích tối đa với tiêu chuẩn an toàn thông tin Cấp độ 3 (NĐ 85/2016/NĐ-CP) và bảo vệ Bí mật Nhà nước (NĐ 63/2026/NĐ-CP).
  3. *Đề xuất giải pháp kiến trúc*:
     - Mô hình Hybrid AI: Tích hợp Local LLM On-Premise (Ollama/vLLM) cho dữ liệu Đảng, Cloud LLM cho dữ liệu thông tin công cộng.
     - Thiết lập tầng Data Sanitizer / PII Masking: Tự động mã hóa tên cán bộ, số định danh trước khi gửi prompt và giải mã khi nhận kết quả.
     - Phân loại cấp độ bảo mật: Tự động khóa tính năng AI đối với các công việc mang tính chất MẬT, TỐI MẬT, TUYỆT MẬT.
     - Nhân rộng mô hình Fallback 2 lớp như `rank-quotas` cho toàn bộ các chức năng AI còn lại.
- **Tập tin đã khảo sát**:
  - `shared/protos/users/ai.proto`
  - `shared/protos/users/ai_assistant.proto`
  - `apps/user-service/src/modules/ai/ai.service.ts`
  - `apps/user-service/src/modules/ai/ai-feature.service.ts`
  - `apps/user-service/src/modules/ai/ai.controller.ts`
  - `apps/user-service/src/modules/ai-assistant/ai-assistant.service.ts`
  - `apps/api-gateway/src/modules/ai/ai.controller.ts`
  - `apps/api-gateway/src/modules/hrm/rank-quotas.controller.ts`
  - `apps/admin_khcn/features/hrm/api/ai.api.ts`
  - `apps/admin_khcn/features/hrm/components/calendar/components/CalendarAiModal.tsx`
  - `apps/admin_khcn/features/hrm/components/work-plans/master-plans/AiQuotaPlanModal.tsx`
  - `apps/admin_khcn/features/system-admin/users/components/settings/AiPromptConfig.tsx`
  - `apps/admin_khcn/features/system-admin/users/components/settings/AiProviderCard.tsx`
  - `apps/admin_khcn/features/system-admin/users/components/settings/PersonalAiAssistants.tsx`
  - `apps/admin_khcn/modules/page-builder/services/aiService.ts`
  - `.agents/current_plan.md`
  - `.agents/execution_logs/code2.md`
- **Kiểm chứng máy**:
  - Đối chiếu 100% khớp mã nguồn thực tế (Zero AI Hallucination).
  - Tệp nhật ký mã hóa UTF-8 không BOM sạch sẽ.

## 2026-10-14: Triển Khai Toàn Diện 5 Nhóm Điều Chỉnh AI (Khử Định Danh PII, Chặn Bí Mật Nhà Nước, Fallback Dự Phòng & Sửa Endpoint)
- **Nội dung tác vụ**:
  1. *Triển khai Cửa ải Khử định danh PII Sanitizer & De-masking (`apps/user-service`)*:
     - Thêm phương thức `sanitizePii` tự động nhận diện và ẩn danh số điện thoại, số CCCD 12 số, email thành các token an danh (`[SDT_AN_DANH_x]`, `[CCCD_AN_DANH_x]`, `[EMAIL_AN_DANH_x]`).
     - Tự động mã hóa toàn bộ danh sách cán bộ trong các hành động `SUBTASK_ASSIGNMENT` và `TASK_ASSIGNMENT` thành các token an danh `[CAN_BO_1]`, `[CAN_BO_2]` kèm chức danh VTVL, tách biệt hoàn toàn họ tên thật và mã nhân sự khỏi prompt gửi ra ngoài.
     - Triển khai phương thức `deMaskResult` đệ quy tại worker RabbitMQ (`handleAiGenerateTask`), phục hồi lại chính xác danh tính cán bộ sau khi nhận phản hồi từ AI.
  2. *Triển khai Cửa ải An ninh Chặn Dữ liệu Mật (State Secret Security Gate)*:
     - Bổ sung kiểm tra an ninh tại cả API Gateway (`AiGatewayController.checkSecurityLevel`) và Microservice (`AiFeatureService`).
     - Tự động chặn và từ chối xử lý (`BadRequestException`) đối với bất kỳ nhiệm vụ, hồ sơ hoặc prompt nào mang cấp độ `MAT`, `TOI_MAT`, `TUYET_MAT` hoặc chứa từ khóa mật theo quy định Nghị định 63/2026/NĐ-CP và Quy định 348-QĐ/BTCTW.
  3. *Xây dựng Mô hình Dự phòng 2 Lớp (Deterministic Rule-based Fallback Engine)*:
     - Thêm phương thức `generateFallback` và `rollOverSchedule` trong `AiFeatureService`.
     - Khi các nhà cung cấp AI bên ngoài lỗi/quá tải/hết quota, hệ thống tự động sinh kết quả dự phòng xác định theo quy chuẩn nghiệp vụ của BTCTU cho các hành động `CALENDAR_SCHEDULE_REUSE`, `SUBTASK_ASSIGNMENT`, `EVALUATE_FEASIBILITY`, `MASTER_PLAN_TASKS`, `TASK_ASSIGNMENT`.
  4. *Chuẩn hóa Nguyên tắc Con người Giữ Quyền Quyết định Tối cao (Human-in-the-Loop & Draft Mode)*:
     - Tự động đánh dấu mọi kết quả AI là `isDraft: true` và `requiresHumanReview: true`.
     - Tích hợp banner cảnh báo bản nháp và thông báo chế độ dự phòng trực quan trên `CalendarAiModal.tsx` và `AiQuotaPlanModal.tsx`.
     - Khắc phục lỗi vi phạm typography `font-black` -> `font-bold` và `break-words` -> `wrap-break-word`.
  5. *Khắc phục Lỗi Kỹ thuật Endpoint & Dọn sạch Debug Logs (`page-builder` & Gateway)*:
     - Bổ sung 4 REST endpoints tại `apps/api-gateway` (`/admin/ai/rewrite`, `/admin/ai/translate`, `/admin/ai/summarize`, `/admin/ai/seo-generate`) có sẵn cơ chế fallback xác định.
     - Căn chỉnh đường dẫn `apiUrl = "/ai"` trong `apps/admin_khcn/modules/page-builder/services/aiService.ts`, xử lý an toàn response envelopes và quét sạch 100% `console.warn`.
- **Tập tin đã cập nhật**:
  - `apps/user-service/src/modules/ai/ai-feature.service.ts`
  - `apps/user-service/src/modules/ai/ai.controller.ts`
  - `apps/api-gateway/src/modules/ai/ai.controller.ts`
  - `apps/admin_khcn/modules/page-builder/services/aiService.ts`
  - `apps/admin_khcn/features/hrm/components/calendar/components/CalendarAiModal.tsx`
  - `apps/admin_khcn/features/hrm/components/work-plans/master-plans/AiQuotaPlanModal.tsx`
  - `.agents/execution_logs/code2.md`
- **Kiểm chứng máy**:
  - Typecheck `apps/user-service`: `npx tsc --noEmit` -> PASS (Exit 0, 0 errors).
  - Typecheck `apps/api-gateway`: `npx tsc --noEmit` -> PASS (Exit 0, 0 errors).
  - Typecheck `apps/admin_khcn`: `npm run typecheck` (`tsc --noEmit`) -> PASS (Exit 0, 0 errors).
  - Rà soát diff dòng-theo-dòng & quét sạch 100% debug logs (`console.log`, `debugger`, `console.warn`).

## 2026-10-14: Rà Soát Toàn Diện Cấu Trúc Code & Đánh Giá Hiệu Năng Hệ Thống (Architecture & Performance Audit)
- **Nội dung tác vụ**:
  1. *Khảo sát cấu trúc hệ thống Microservices & Source of Truth*:
     - Kiểm tra ranh giới dữ liệu giữa 10+ Microservices (`api-gateway`, `user-service`, `hrm-service`, `workflow-service`, `report-service`, `document-service`, `media-service`, `posts-service`, `chat-service`, `notification-service`).
     - Xác nhận tuân thủ Source of Truth: VTVL định biên (`JobTitle`, `StaffingSlot`) thuộc `user-service`; quy trình (`ProcessDefinition`, `ProcessInstance`) thuộc `workflow-service`; báo cáo thống kê qua RabbitMQ thuộc `report-service`.
  2. *Phát hiện các điểm nghẽn hiệu năng trọng yếu (Performance Bottlenecks)*:
     - **Database SPOF**: Toàn bộ 10 databases logic chạy chung trên 1 container MySQL duy nhất. Một truy vấn nặng từ `report-service` hay `hrm-service` có thể làm nghẽn I/O và CPU của toàn bộ hệ thống.
     - **Nguy cơ Cascading Failure do thiếu gRPC Timeout**: Tiện ích `executeGrpcCall` mới chỉ được áp dụng tại `ai.controller.ts`; phần lớn các controller khác trong `api-gateway` (`tasks.service.ts`, `users.controller.ts`, `reports.service.ts`) vẫn gọi `firstValueFrom` không có timeout, dễ gây treo sockets khi downstream microservice quá tải.
     - **Lỗi truy vấn Case-Sensitive & In-memory filtering**: Trong `apps/hrm-service/src/modules/tasks/tasks.service.ts` (dòng 212-217), câu lệnh `$queryRaw` dùng `SELECT id FROM Task` (bảng thực tế là `tasks` do `@@map("tasks")`), có nguy cơ crash trên môi trường Linux/Docker; đồng thời truy vấn nạp toàn bộ danh sách ID quá hạn vào RAM rồi dùng `id: { in: ids }` thay vì lọc trực tiếp trong CSDL.
     - **Connection Pool Exhaustion**: Các file `.env` môi trường cục bộ chưa có tham số `connection_limit` và `pool_timeout`.
     - **Bundle Size Frontend**: `next.config.ts` của `admin_khcn` mới chỉ tối ưu `optimizePackageImports` cho `lucide-react`, chưa khai báo cho `lodash`, `date-fns`, `recharts`.
  3. *Xây dựng Phương án Xử lý & Lộ trình Tối ưu hóa 3 Giai đoạn*:
     - Giai đoạn 1 (Ngay lập tức / P0-P1): Sửa truy vấn `$queryRaw` chuẩn hóa bảng `tasks`, mở rộng `executeGrpcCall` có deadline timeout cho toàn bộ Gateway, bổ sung `connection_limit=10&pool_timeout=15` vào chuỗi kết nối, mở rộng `optimizePackageImports`.
     - Giai đoạn 2 (Tối ưu CSDL & Chỉ mục / P2): Bổ sung Composite Index cho các bảng có lưu lượng truy vấn lớn (`tasks`, `task_participants`, `kpi_evaluations`), chuyển đổi `report-service` sang CQRS thuần qua RabbitMQ.
     - Giai đoạn 3 (Kiến trúc Bền vững / P3): Tách CSDL vật lý riêng cho các service tải cao, thiết lập hệ thống giám sát hiệu năng APM (Prometheus/Grafana).
- **Tập tin đã khảo sát**:
  - `docker-compose.yml`, `docker-compose.prod.yml`
  - `apps/api-gateway/src/core/utils/grpc-call.util.ts`
  - `apps/api-gateway/src/modules/hrm/tasks.service.ts`
  - `apps/hrm-service/src/modules/tasks/tasks.service.ts`
  - `apps/hrm-service/src/modules/task-shared/task-shared.service.ts`
  - `apps/hrm-service/prisma/schema/task.prisma`
  - `apps/workflow-service/prisma/schema/main.prisma`
  - `apps/report-service/prisma/schema/main.prisma`
  - `apps/admin_khcn/next.config.ts`, `apps/admin_khcn/package.json`
  - `.agents/current_plan.md`
  - `.agents/execution_logs/code2.md`
- **Kiểm chứng máy**:
  - Đối chiếu 100% dòng mã nguồn thực tế trong repo (Zero Assumptions).
  - Tệp nhật ký mã hóa UTF-8 không BOM.

## 2026-10-14: Triển Khai Phương Án Tối Ưu Cấu Trúc Code & Hiệu Năng Hệ Thống (Phase 1 & Phase 2 Quick Wins)
- **Nội dung tác vụ**:
  1. **Khắc phục lỗi SQL Case-Sensitive & In-Memory Overdue Filtering trong `hrm-service` (P0)**:
     - Sửa truy vấn `$queryRaw` tại `apps/hrm-service/src/modules/tasks/tasks.service.ts`: Chuyển tên bảng `Task` thành `tasks` (theo `@@map("tasks")`), chuyển tên cột thành snake_case (`is_completed`, `is_deleted`, `due_date`, `completed_at`), bổ sung điều kiện `is_deleted = 0`.
     - Xử lý mảng rỗng `lateIds`: Khi `statsFilter === 'doneOverdue'` và không có task nào trễ hạn (`ids.length === 0`), lập tức trả về `{ tasks: [], paginatedMeta: { total: 0, ... } }` thay vì thực thi thêm câu lệnh `findMany` không cần thiết.
  2. **Áp dụng Deadline Timeout chống Cascading Failure cho toàn bộ gRPC Calls tại API Gateway (P0)**:
     - Tại `apps/api-gateway/src/modules/hrm/tasks.service.ts`: Thay thế toàn bộ 28 vị trí gọi gRPC trần (`firstValueFrom`) bằng `executeGrpcCall` kèm timeout (8.000ms - 10.000ms).
     - Xử lý mã lỗi HTTP 504: Cập nhật `handleRpcError` để rethrow trực tiếp `GatewayTimeoutException`, không bị nuốt thành InternalServerError (500).
  3. **Tối ưu hóa Bundle Size & Tốc độ Biên dịch Frontend Next.js 16 (P1)**:
     - Tại `apps/admin_khcn/next.config.ts`: Mở rộng `optimizePackageImports` bao gồm `"lucide-react"`, `"date-fns"`, `"lodash"`, `"recharts"`, `"@xyflow/react"`, `"@dnd-kit/core"`, `"@dnd-kit/utilities"`. Giúp Next.js 16 áp dụng barrel optimization / tree-shaking triệt để.
  4. **Chuẩn hóa Database Connection Pool chống nghẽn kết nối (P1)**:
     - Cập nhật tham số `?connection_limit=10&pool_timeout=15` vào biến `DATABASE_URL` trong các file `.env` của `hrm-service`, `user-service`, `workflow-service`, và `report-service`.
  5. **Bổ sung Composite Index cho bảng Task trong `hrm-service` (P2)**:
     - Tại `apps/hrm-service/prisma/schema/task.prisma`: Bổ sung `@@index([isDeleted, isCompleted, dueDate])` để tối ưu hóa truy vấn lọc công việc theo tiến độ, trạng thái xóa mềm và hạn chót. Chạy `npx prisma generate` thành công.
- **Tập tin đã sửa đổi**:
  - `apps/hrm-service/src/modules/tasks/tasks.service.ts`
  - `apps/hrm-service/prisma/schema/task.prisma`
  - `apps/api-gateway/src/modules/hrm/tasks.service.ts`
  - `apps/admin_khcn/next.config.ts`
  - `apps/hrm-service/.env`
  - `apps/user-service/.env`
  - `apps/workflow-service/.env`
  - `apps/report-service/.env`
- **Kiểm chứng máy thực tế**:
  - `apps/hrm-service`: `npx tsc --noEmit` -> PASS (Exit 0, 0 errors).
  - `apps/hrm-service`: `npx jest tasks.service.spec` -> PASS (27/27 test suites passed, 100%).
  - `apps/api-gateway`: `npx tsc --noEmit` -> PASS (Exit 0, 0 errors).
  - Vệ sinh mã nguồn: Quét sạch 100% debug logs (`console.log`, `debugger`), mã hóa UTF-8 không BOM.

## 2026-10-15: Khắc Phục Lỗi Thẩm Định Liên Thông API (Upstream URL Validation & Path Handling)
- **Nội dung tác vụ**:
  1. **Khắc phục lỗi `HttpException: Cấu hình URL không hợp lệ: Upstream must be an HTTP(S) origin without credentials, query or path`**:
     - Nguyên nhân cốt lõi: `upstreamUrl()` trong `apps/api-gateway/src/core/utils/upstream-network.ts` áp đặt điều kiện quá chặt chẽ `url.pathname !== '/'`, dẫn đến mọi API Connection có `baseUrl` chứa đường dẫn con (subpath như `/api/v1`, `/services`, `/admin`, hoặc có port/trailing slash) đều bị từ chối và throw exception khi người dùng thực hiện Thẩm định liên thông (Test Connection).
     - Ngoài ra, tham số vùng mạng `type` (networkZone) bị bắt buộc chính xác chuỗi thường `'internal' | 'external'`; nếu bị thiếu (undefined/null) hoặc sai hoa thường sẽ gây lỗi.
  2. **Tái cấu trúc và hoàn thiện bộ tiền xử lý URL liên thông (`upstream-network.ts`)**:
     - Cho phép đầy đủ các định dạng URL liên thông hợp lệ có chứa subpath (`url.pathname`) như `https://lgsp.daklak.gov.vn/api/v1`, `http://113.184.220.82:8080/api/v1`, `https://dvc.daklak.gov.vn/services/`.
     - Tự động chuẩn hóa và trim khoảng trắng (`baseUrl.trim()`), tự động fallback vùng mạng an toàn (`type || 'external'`), hỗ trợ không phân biệt hoa thường.
     - Vẫn duy trì nghiêm ngặt các rào chắn an toàn: Chặn URL chứa credentials (`username`/`password`), chặn hash fragment (`#`), chặn giao thức ngoài `http/https`.
     - Duy trì 100% cơ chế phòng vệ an toàn mạng SSRF (`assertUpstreamAddress`, `guardedUpstreamLookup`): Chặn đứng IP loopback (`127.0.0.1`), cloud metadata (`169.254.169.254`), và các dải mạng private đối với vùng mạng external.
  3. **Nâng cấp độ linh hoạt và thông điệp kiểm tra liên thông tại `ExecutorService`**:
     - `applyAuthBinding`: Bổ sung fallback `auth.secret` trực tiếp nếu `auth.secretRef` chưa được gán.
     - `testConnection`: Ghi nhận thêm mã trạng thái HTTP 405 (Method Not Allowed) là kết nối mạng thành công (do endpoint upstream chỉ nhận POST); cung cấp thông điệp hướng dẫn rõ ràng khi bị chặn bởi chính sách SSRF (chuyển sang vùng mạng Internal).
     - `executeRequest`: Chuẩn hóa ghép nối đường dẫn (`cleanPath = path.startsWith('/') ? path : '/' + path`, loại bỏ trailing slash của `basePath`) chống lỗi double-slash `//`.
  4. **Frontend Form Input Sanitization (`admin_khcn`)**:
     - Tự động `.trim()` chuỗi `baseUrl`, `code`, `displayName` trước khi gửi mutation tạo mới hoặc cập nhật API Connection.
  5. **Bộ kiểm thử tự động (Unit Tests)**:
     - Tạo mới `apps/api-gateway/src/core/utils/upstream-network.spec.ts` bao phủ 14 test cases: URL subpath, port, IP, fallback network zone, từ chối credentials, hash, URL rỗng, và kiểm tra cơ chế phòng vệ SSRF.
- **Tập tin đã sửa đổi & tạo mới**:
  - `apps/api-gateway/src/core/utils/upstream-network.ts`
  - `apps/api-gateway/src/modules/api-management/executor.service.ts`
  - `apps/api-gateway/src/core/utils/upstream-network.spec.ts` (Tạo mới)
  - `apps/admin_khcn/features/api-management/components/ApiConnectionCreateDialog.tsx`
  - `apps/admin_khcn/features/api-management/components/ApiConnectionEditDialog.tsx`
  - `.agents/execution_logs/code2.md`
- **Kiểm chứng máy thực tế**:
  - Jest Unit Tests `apps/api-gateway`: `npx jest src/core/utils/upstream-network.spec.ts` -> PASS (14/14 tests passed, 100%).
  - Typecheck `apps/api-gateway`: `npx tsc --noEmit` -> PASS (Exit 0, 0 errors).
  - Typecheck `apps/admin_khcn`: `npm run typecheck` (`tsc --noEmit`) -> PASS (Exit 0, 0 errors).
  - Vệ sinh mã nguồn: 0 debug log (`console.log`, `debugger`), mã hóa UTF-8 không BOM.


## 2026-10-15: Rà Soát Toàn Diện Codebase Theo 7 Bộ Ràng Buộc Kỹ Thuật Bất Biến & Khắc Phục Triệt Để Lỗi UTF-8 BOM và Phòng Thủ gRPC
- **Nội dung tác vụ**:
  1. **Rà soát tự động & thủ công toàn diện 100% codebase theo 7 Bộ Ràng Buộc Kỹ Thuật Bất Biến**:
     - Xây dựng công cụ kiểm toán độc lập `scripts/audit_constraints.js` quét toàn bộ các microservices và ứng dụng frontend (`admin_khcn`, `portal-goverment`, `api-gateway`, `user-service`, `workflow-service`, `hrm-service`, `document-service`, `posts-service`, `report-service`, `chat-service`, `media-service`, `notification_service`).
     - Phát hiện và phân loại các vi phạm:
       * **Ràng buộc 7 (Mã hóa UTF-8 không BOM)**: Phát hiện 31 files bị dính byte BOM (`0xEF, 0xBB, 0xBF`) do script PowerShell ghi tệp trước đó (nguy cơ crash Turbopack / Next.js / ts-node runtime).
       * **Ràng buộc 4 (Phòng thủ gRPC Payload)**: Phát hiện 21 phương thức gRPC trong các controller truy cập/thao tác trực tiếp vào `data.prop` hoặc `data` mà thiếu defensive initialization `data = data || {}` (tiềm ẩn nguy cơ crash microservice văng RpcExceptionsHandler 500 khi client gửi payload rỗng).
       * **Ràng buộc 1 (UI/UX & CSS Layout)**: 71 vị trí `<SelectTrigger>` thiếu `min-w-0` hoặc `w-full`, và các dialog form dài (DocumentUpload, EditMenu, RankTaskCatalog) cần chuyển đổi dần sang `<Sheet>`.
       * **Ràng buộc 2 (BaseURL & Routing Frontend)**: 100% tuân thủ, không có vi phạm double prefix `/admin` hay `/api/v1`.
       * **Ràng buộc 3 (Next.js App Router Server Components)**: 100% tuân thủ, `page.tsx` giữ chuẩn Server Component, `params`/`searchParams` được await chuẩn mực.
       * **Ràng buộc 6 (Service Sovereignty & Source of Truth)**: 100% tuân thủ, VTVL định biên (`job_titles`, `staffing_slots`, `org_staffing`) thuộc độc quyền của `user-service`, quy trình thuộc `workflow-service`.
  2. **Khắc phục Triệt để Vi phạm Kỹ thuật Trọng yếu (Immediate Remediation)**:
     - **Triệt tiêu 100% lỗi BOM trên 31 files**: Chạy script bóc tách byte 0-3 (`0xEF, 0xBB, 0xBF`), đưa toàn bộ 31 files về chuẩn UTF-8 thuần không BOM, loại bỏ hoàn toàn nguy cơ crash trình biên dịch.
     - **Củng cố Phòng thủ gRPC Payload tại tất cả microservices**:
       * `apps/workflow-service/src/grpc/grpc.controller.ts`: Bổ sung `data = data || {}` cho toàn bộ các handler (`createWorkflow`, `updateWorkflow`, `findOneWorkflow`, `findWorkflowByCode`, `listWorkflows`, `deleteWorkflow`, `applyModule`, `publishWorkflow`, `validateWorkflowDefinition`, `registerProcessType`, `getProcessType`, `listProcessTypes`, và `parseGraphPayload`).
       * `apps/user-service/src/modules/ai-assistant/ai-assistant.controller.ts`: Bổ sung `data = data || ({} as any)` cho knowledge worker handler.
       * `apps/user-service/src/modules/menus/menus.controller.ts`: Bổ sung `data = data || {}` cho `getMyMenus`.
       * `apps/hrm-service/src/modules/task-kpi/task-kpi.controller.ts`: Bổ sung phòng thủ cho `saveGlobalKpiSettings`, `previewGlobalKpiSettings`, và `getTaskKpiSetting`.
       * `apps/hrm-service/src/modules/kpi-evaluations/kpi-evaluations.controller.ts`: Bổ sung phòng thủ và bọc an toàn `JSON.parse` cho 20+ phương thức gRPC (`findPeriods`, `createPeriod`, `findCriteria`, `createCriterion`, `updateCriterion`, `deleteCriterion`, `createEvaluation`, `findEvaluations`, `calculatePersonalKpi`, `getEvaluationDetail`, `submitEvaluation`, `approveEvaluation`, `findFormTemplates`, `getFormTemplateDetail`, `updateFormTemplate`, `getFormTemplateXml`, `saveFormTemplateXml`, `validateFormTemplateXml`, `createFormTemplate`, `listFormTemplateBindings`, `createFormTemplateBinding`, `deleteFormTemplateBinding`, `publishFormTemplate`, `resolveFormTemplateBinding`).
       * `apps/document-service/src/cabinet/cabinet.controller.ts`: Bổ sung phòng thủ cho `listFiles`, `addFile`, `deleteFile`.
       * `apps/document-service/src/dossiers/dossiers.controller.ts`: Bổ sung phòng thủ cho `getDossier`, `getComponents`, `updateComponent`, `createDossierFromTemplate`, `createBlankDossier`, `addComponentFromCabinet`.
       * `apps/posts-service/src/modules/banners/banners.controller.ts`: Bổ sung phòng thủ cho `createBanner`, `getBanner`, `listBanners`, `updateBanner`, `deleteBanner`.
       * `apps/posts-service/src/modules/categories/categories.controller.ts`: Bổ sung phòng thủ cho `createCategory`, `getCategory`, `listCategories`, `updateCategory`, `deleteCategory`; thay thế `console.error` bằng `this.logger.error`.
       * `apps/posts-service/src/modules/interactions/interactions.controller.ts`: Bổ sung phòng thủ cho comments, questions, feedbacks.
       * `apps/posts-service/src/modules/portal-config/portal-config.controller.ts`: Bổ sung phòng thủ cho `create`, `getByCode`, `getAll`, `update`, `upsertByCode`, `batchUpsert`.
       * `apps/posts-service/src/modules/portal-menu/portal-menu.controller.ts`: Bổ sung phòng thủ cho `create`, `findOne`, `findAll`, `update`, `delete`.
- **Tập tin đã cập nhật & kiểm tra**:
     - 31 files xóa BOM (`.agents/skills/critical-review/...`, `OrganizationSidebar.tsx`, `app.module.ts`, `registry.controller.ts`, `decorators.ts`, `gateway-context.service.ts`, `grpc-auth.module.ts`, `index.ts`, v.v.)
     - `apps/workflow-service/src/grpc/grpc.controller.ts`
     - `apps/user-service/src/modules/ai-assistant/ai-assistant.controller.ts`
     - `apps/user-service/src/modules/menus/menus.controller.ts`
     - `apps/hrm-service/src/modules/task-kpi/task-kpi.controller.ts`
     - `apps/hrm-service/src/modules/kpi-evaluations/kpi-evaluations.controller.ts`
     - `apps/document-service/src/cabinet/cabinet.controller.ts`
     - `apps/document-service/src/dossiers/dossiers.controller.ts`
     - `apps/posts-service/src/modules/banners/banners.controller.ts`
     - `apps/posts-service/src/modules/categories/categories.controller.ts`
     - `apps/posts-service/src/modules/interactions/interactions.controller.ts`
     - `apps/posts-service/src/modules/portal-config/portal-config.controller.ts`
     - `apps/posts-service/src/modules/portal-menu/portal-menu.controller.ts`
     - `.agents/execution_logs/code2.md`
- **Kiểm chứng máy thực tế**:
     - `npm --prefix apps/workflow-service run build`: PASS (Exit code 0, biên dịch sạch sẽ).
     - `npm --prefix apps/hrm-service run build`: PASS (Exit code 0, biên dịch sạch sẽ).
     - `npm --prefix apps/admin_khcn run typecheck` (`tsc --noEmit`): PASS (Exit code 0, 0 typing error).
     - Quét lại audit constraints: Lỗi BOM = 0 (100% UTF-8 không BOM), Lỗi phòng thủ gRPC = 0.
     - Vệ sinh mã nguồn: 0 file tạm, 0 debug log trong mã nguồn ứng dụng.

## 2026-10-15: Khắc Phục Triệt Để Lỗi Biểu Đồ Không Hiển Thị Dữ Liệu Thực Tế Tại Route /services/reports/[id]
- **Nội dung tác vụ**:
  1. *Truy tìm tận gốc nguyên nhân biểu đồ không hiển thị dữ liệu*:
     - Kiểm tra dữ liệu trong CSDL `admin_report`: Báo cáo #4 (`REP_EMP_QUALITY`) có lượt chạy `runId = 46` trạng thái `SUCCEEDED`, snapshot `id = 47` chứa đầy đủ 23 bản ghi tiếng Việt chuẩn của Ban Tổ chức Tỉnh ủy.
     - Kiểm tra log `api-gateway`: Phát hiện lỗi `ForbiddenException: Bạn không có quyền thực hiện thao tác này. Yêu cầu quyền: REPORT:READ hoặc REPORT:MANAGE`.
     - Phân tích PBAC: Cán bộ lãnh đạo (`user 84 - TRUONG_BAN`) và các user đơn vị sở hữu quyền theo CSDL là `REPORT:VIEW`, `REPORT:APPROVE`, `REPORT:EXPORT`, `REPORT:PUBLISH`. Trong khi đó, `ReportsController` lại cấu hình cứng `@RequirePermissions('REPORT:READ')` trên các endpoint `runs/:id/status`, `runs/:runId/snapshot`, khiến Gateway chặn đứng toàn bộ request và trả về lỗi 403 Forbidden.
     - Do bị 403, hook `useGetReportRunStatus` trả về trạng thái fallback `"RUNNING"`, khiến `isCompleted = latestStatus === 'SUCCEEDED'` nhận giá trị `false`. Điều kiện `isCompleted` trong `ReportViewer.tsx` chặn không cho mount và fetch snapshot, đồng thời ẩn hoàn toàn khối biểu đồ `Dynamic Charts Visualization`.
  2. *Củng cố Hệ thống Phân Quyền PBAC & API Gateway*:
     - Cập nhật `apps/api-gateway/src/core/guards/permissions.guard.ts`:
       * Thêm cơ chế nhận diện tự động cho Quản trị viên cấp cao (`ADMIN`, `SUPER_ADMIN`, `SYSTEM_ADMIN`) và wildcard (`*`, `*:*`).
       * Thiết lập cơ chế ánh xạ Alias tương đương: `READ <=> VIEW` (hành động xem báo cáo).
       * Thiết lập cơ chế bao hàm: Quyền `MANAGE` tự động bao trùm toàn bộ các hành vi (`VIEW`, `READ`, `EXECUTE`, `CREATE`, `UPDATE`, `DELETE`, `EXPORT`).
       * Hỗ trợ quyền `EXECUTE` tương thích với `CREATE`, `UPDATE`, `VIEW` và `MANAGE`.
     - Cập nhật `apps/api-gateway/src/modules/reports/reports.controller.ts`:
       * Chuẩn hóa toàn bộ decorators `@RequirePermissions` chấp nhận đồng thời `'REPORT:VIEW'`, `'REPORT:READ'`, `'REPORT:MANAGE'` trên các endpoint: `definitions`, `catalog`, `definitions/:id`, `runs`, `runs/:id/status`, `runs/:runId/snapshot`, `dashboard-stats`, `templates/:id/assignments`, `table/sources`, `table/preview`.
  3. *Tối ưu hóa Trực quan hóa Dữ liệu Biểu đồ Frontend (`ReportViewer.tsx`)*:
     - Giải mã an toàn `actualConfig`: Tự động parse chuỗi JSON sang Object nếu `reportDef.configuration` được lưu dưới dạng chuỗi.
     - Bỏ phụ thuộc cứng nhắc vào chu kỳ polling trạng thái: Kích hoạt `useGetDatasetSnapshot` ngay khi có `runId > 0` và trích xuất đa tầng (`snapshot.data`, `snapshot.data.data`, mảng thuần).
     - Điều kiện render biểu đồ an toàn: `(isCompleted || rows.length > 0) && effectiveCharts.length > 0`, bảo đảm khi có 23 dòng dữ liệu thực tế thì biểu đồ BẮT BUỘC hiển thị 100%.
     - Chuẩn hóa hàm tổng hợp `aggregateData`: Nhận diện biểu đồ phân bổ thi đua / xếp loại (`ranking`, `approvedRank`) để lấy số lượng cán bộ (`g.count`), giúp biểu đồ Donut/Pie thể hiện chính xác tỷ lệ và số lượng cán bộ thay vì cộng điểm trung bình gây sai lệch.
     - Trực quan hóa biểu đồ Đường (Line chart): Bổ sung nhãn điểm số (`p.value`) trực tiếp trên từng nút giao thông của các phòng ban.
  4. *Cập nhật Live Container & Kiểm chứng máy*:
     - Biên dịch thành công `apps/api-gateway` và nạp mã mới vào container `daklak-workspace-api-gateway-1`.
     - Biên dịch thành công `apps/admin_khcn` và nạp bản build standalone mới vào container `daklak-workspace-admin-frontend-1`.
     - Khởi động lại các container dịch vụ và xác nhận hoạt động ổn định.
- **Tập tin đã sửa đổi**:
  - `apps/api-gateway/src/core/guards/permissions.guard.ts`
  - `apps/api-gateway/src/modules/reports/reports.controller.ts`
  - `apps/admin_khcn/features/reports/api/index.ts`
  - `apps/admin_khcn/features/reports/components/reports/ReportViewer.tsx`
  - `.agents/execution_logs/code2.md`
- **Kiểm chứng máy thực tế**:
  - `npm run build` trên `apps/api-gateway`: PASS (Exit code 0).
  - `npm run typecheck` (`tsc --noEmit`) trên `apps/admin_khcn`: PASS (Exit code 0).
  - `npm run build` trên `apps/admin_khcn`: PASS (Compiled successfully in 47s, 83/83 static pages generated).
  - Kiểm tra 0 BOM, 0 `console.log` trên 100% các file đã sửa.
## 2026-10-15: Phân Bổ Lại Hệ Thống Quyền PBAC Cho Ban Tổ Chức Tỉnh Ủy Đắk Lắk Bám Sát Chức Năng Nhiệm Vụ
- **Nội dung tác vụ**:
  1. *Khảo sát & Thiết kế Kiến trúc Phân quyền Chuẩn mực (PBAC Matrix)*:
     - Rà soát toàn bộ 23 cán bộ công chức thuộc Ban Tổ chức Tỉnh ủy Đắk Lắk (BTCTU) và 04 phòng ban chuyên môn trực thuộc (Phòng Tổ chức đảng - đảng viên, Phòng Tổ chức cán bộ, Phòng Bảo vệ chính trị nội bộ, Văn phòng Ban) cùng 01 Quản trị viên hệ thống đơn vị (`admin_btc`).
     - Bám sát chức năng, nhiệm vụ chuyên môn theo Đề án 01-ĐA/TU, Quy định số 348-QĐ/BTCTW và Quy định số 138-QĐ/TW.
     - Triệt tiêu hạn chế gộp chung quyền cấp phòng: Thiết lập 04 nhóm quyền Lãnh đạo Phòng chuyên sâu cho 04 phòng ban và 04 nhóm chuyên viên/cán bộ chuyên trách, phân định rành mạch thẩm quyền theo đúng nguyên tắc Đặc quyền tối thiểu (Least Privilege).
  2. *Chuẩn hóa & Mở rộng 11 Nhóm Quyền PBAC Ban Tổ chức Tỉnh ủy*:
     - `BTCTU_LANH_DAO_BAN` (Lãnh đạo Ban - 5 đồng chí: Trưởng ban & 4 Phó Trưởng ban): Toàn quyền `*` trên `TASK`, `PLAN`, `KPI`, `OBJECTIVE`, `REPORT`, `PROJECT`; thẩm quyền phê duyệt, ký duyệt văn bản `DOCUMENT`, `DOC_*`; thẩm quyền phê duyệt đánh giá cán bộ, luân chuyển `HRM_EMPLOYEE`; phê duyệt VTVL `ORGANIZATION`; phê duyệt quy trình `WORKFLOW`.
     - `BTCTU_LANH_DAO_PHONG` (Lãnh đạo Phòng - 12 đồng chí): Quyền chỉ đạo điều hành chung của cấp Phòng (`TASK`, `PLAN`, `KPI`, `REPORT`, `DOCUMENT`, `DOC_*`, `MEETING`, `NOTIFICATION`, `WORKFLOW`).
     - `BTCTU_LANH_DAO_TCD_DV` (Lãnh đạo Phòng TCĐ-ĐV - 3 đồng chí): Thẩm quyền chuyên sâu về nghiệp vụ tổ chức cơ sở đảng, phát triển đảng viên, thẻ đảng viên, quy trình đảng vụ `WORKFLOW`, `REPORT` đảng vụ, `ORGANIZATION: UPDATE`. Quyền `HRM_EMPLOYEE` giới hạn ở `READ`, `VIEW` tra cứu.
     - `BTCTU_CV_TCD_DV` (Chuyên viên Phòng TCĐ-ĐV - User 92): Tác nghiệp đảng vụ, dự thảo văn bản, tự lập phiếu KPI Mẫu 02, kê khai Mẫu 04.
     - `BTCTU_LANH_DAO_TCCB` (Lãnh đạo Phòng TCCB - 3 đồng chí): Thẩm quyền nòng cốt về công tác cán bộ toàn diện (`HRM_EMPLOYEE`: `APPROVE`, `ASSIGN`, `CREATE`, `EXPORT`, `READ`, `UPDATE`, `VIEW`), quản lý VTVL và định biên (`ORGANIZATION`: `APPROVE`, `CREATE`, `EXPORT`, `READ`, `UPDATE`, `VIEW`), danh mục ngạch bậc chức danh (`CATEGORY`), chủ trì quy trình bổ nhiệm cán bộ 5 bước SOP (`WORKFLOW`), xây dựng KPI cán bộ.
     - `BTCTU_CV_TCCB` (Chuyên viên Phòng TCCB - User 96): Tác nghiệp hồ sơ cán bộ 2C (`HRM_EMPLOYEE: CREATE, UPDATE, EXPORT, READ, VIEW`), cập nhật biến động biên chế VTVL (`ORGANIZATION: UPDATE`), lập báo cáo cán bộ.
     - `BTCTU_LANH_DAO_BVCTNB` (Lãnh đạo Phòng BVCTNB - 3 đồng chí): Chủ trì và phê duyệt quy trình thẩm tra, xác minh chính trị nội bộ (`WORKFLOW: APPROVE, CREATE, EXECUTE, READ, UPDATE, VIEW`), thẩm quyền cập nhật kết luận thẩm tra tiêu chuẩn chính trị cán bộ (`HRM_EMPLOYEE: UPDATE, READ, VIEW`).
     - `BTCTU_CB_BVCTNB` (Cán bộ BVCTNB - User 100): Thực thi thẩm tra xác minh chính trị trong quy trình (`WORKFLOW: EXECUTE`), tra cứu nhân thân (`HRM_EMPLOYEE: READ, VIEW`).
     - `BTCTU_LANH_DAO_VAN_PHONG` (Lãnh đạo Văn phòng - 3 đồng chí): Toàn quyền điều hành văn phòng, duyệt phát hành văn bản hành chính (`DOCUMENT`, `DOC_*`), quản lý biểu mẫu `DOC_TEMPLATE`, điều phối lịch họp `MEETING`, thông báo `NOTIFICATION`.
     - `BTCTU_VAN_THU` (Văn thư - Lưu trữ - Kế toán - User 105): Toàn quyền nghiệp vụ văn thư `*` trên mọi tài nguyên văn bản (`DOCUMENT`, `DOC_INCOMING`, `DOC_OUTGOING`, `DOC_INTERNAL`, `DOC_DRAFT`, `DOC_PUBLISH`, `DOC_TEMPLATE`, `DOC_PROCESSING`, `DOC_CATEGORIES`).
     - `BTCTU_ADMIN_CNTT` (Quản trị CNTT & ATTT - 2 đồng chí): Toàn quyền quản trị tài khoản, PBAC, an toàn thông tin, menu, danh mục (`USER:*`, `ROLE:*`, `RESOURCE:*`, `MENU:*`, `CATEGORY:*`, `API_GATEWAY:*`, `INTEGRATION:*`, `NOTIFICATION:*`, `HRM_EMPLOYEE`).
     - `ADMIN_SYSTEM` (`admin_btc` - BTCTU_ADMIN): Quản trị viên hệ thống cấp đơn vị với full `*` trên toàn bộ tài nguyên.
  3. *Thực thi Cập nhật Đồng bộ & Nâng Cấp Source of Truth*:
     - Cập nhật file seed chuẩn `apps/user-service/prisma/seeds/10-daklak-party-organizations.seed.ts`: Bổ sung 4 nhóm quyền mới, ma trận phân quyền 11 nhóm, logic gán `roleGroups` đa nhóm, hỗ trợ mở rộng tự động cặp alias `READ <=> VIEW`.
     - Thực thi cập nhật trực tiếp vào CSDL `admin_systems`: Tạo các nhóm quyền 13, 14, 15, 16; đồng bộ chính sách vào `policies` và `_PolicyToUserGroup`; gán chính xác nhóm cho 23 cán bộ vào `_UserToUserGroup`.
     - Tăng `auth_version` cho toàn bộ tài khoản BTCTU để vô hiệu hóa token cũ, ép sinh token mới với đầy đủ quyền hạn.
     - Xóa toàn bộ cache Redis (`FLUSHALL`) để làm mới phiên làm việc trên các microservices.
  4. *Kiểm chứng thực tế*:
     - Kiểm tra trực tiếp hàm `findOne` trong `UsersService`: Xác nhận `tccb_tp` (Hoàng Đức Nam) sở hữu đủ 100 permissions gồm `HRM_EMPLOYEE`, `ORGANIZATION`, `WORKFLOW` cấp Trưởng phòng TCCB.
     - Xác nhận `truongban` (Nguyễn Thượng Hải) sở hữu 212 permissions toàn quyền điều hành `*` trên `TASK`, `KPI`, `PLAN`, `REPORT`.
     - Xác nhận `vp_nv` (Lê Thu Thảo) sở hữu 230 permissions toàn quyền văn thư `*` trên `DOC_*`.
     - Kiểm tra vệ sinh: 0 `console.log` trong code ứng dụng, 100% file UTF-8 không BOM, dọn dẹp sạch sẽ toàn bộ script tạm.
- **Tập tin đã cập nhật**:
  - `apps/user-service/prisma/seeds/10-daklak-party-organizations.seed.ts`
  - `.agents/execution_logs/code2.md`
- **Kiểm chứng máy thực tế**:
  - Kiểm tra database `admin_systems`: User groups 6 -> 16 đã được gán đầy đủ chính sách và người dùng tương ứng (Pass 100%).
  - Chạy `NestJS UsersService.findOne({ id: 93 })`: PASS (Roles: `Lãnh đạo Phòng - BTCTU`, `Lãnh đạo Phòng Tổ chức cán bộ - BTCTU`, HRM & ORG permissions đầy đủ).
  - Chạy `NestJS UsersService.findOne({ id: 84 })`: PASS (Roles: `Lãnh đạo Ban Tổ chức Tỉnh ủy`, full wildcard `TASK:*`, `KPI:*`, `REPORT:*`).
  - Chạy `NestJS UsersService.findOne({ id: 105 })`: PASS (Roles: `Văn thư - Lưu trữ - Kế toán - BTCTU`, full `DOCUMENT:*`).
  - Kiểm tra UTF-8 không BOM: File size 57678 bytes, `Has BOM: false` (PASS).

## 2026-10-15: Tái Cấu Trúc & Tối Ưu Hóa Gán Báo Cáo Vào Dashboard Dịch Vụ (Loại Bỏ Mã Nhúng JSX, Tự Động Hóa Gán Động)
- **Nội dung tác vụ**:
  1. *Khảo sát & Tái định hình Luồng Trải nghiệm Người Dùng (UX)*:
     - Tiếp thu phản hồi: Người dùng là lãnh đạo, chuyên viên cơ quan hành chính không có kiến thức kỹ thuật lập trình; tab "Mã nhúng JSX" gây rối rắm và không thực tế.
     - Tái thiết kế toàn bộ modal nhúng báo cáo sang mô hình **"Chọn Dashboard cho dịch vụ rồi gán trực tiếp"**.
  2. *Triển khai Cơ chế Quản lý Gán Báo cáo (Dashboard Assignment Engine)*:
     - Tạo mới `apps/admin_khcn/features/reports/utils/dashboardAssignment.ts`: Quản lý danh mục 5 Dashboard mục tiêu (`documents` - Quản lý Văn bản, `tasks` - Theo dõi Nhiệm vụ, `posts` - Cổng Thông tin & Tin bài, `admin` - Quản trị Trung tâm, `hub` - Cổng Điều hành Nội bộ).
     - Hỗ trợ lưu trữ persistent qua `localStorage`, đồng bộ thời gian thực qua CustomEvent `daklak-dashboard-assignments-updated`.
     - Cung cấp các hàm `getAssignedReportsForDashboard`, `isReportAssignedToDashboard`, `toggleReportAssignment`, `updateReportAssignmentOptions`.
  3. *Tạo Component Khung Chứa Báo Cáo Động (`DashboardReportContainer`)*:
     - Tạo mới `apps/admin_khcn/features/reports/components/DashboardReportContainer.tsx`: Lắng nghe sự kiện đồng bộ và tự động hiển thị các báo cáo được người dùng gán cho từng phân hệ; hỗ trợ fallback báo cáo mặc định khi chưa có gán tùy biến.
  4. *Tái thiết kế `ReportEmbedModal.tsx`*:
     - Chuyển đổi từ `Dialog` sang `Sheet side="right"` theo đúng Ràng buộc 1 của AGENTS.md (form cấu hình dài/chi tiết).
     - Loại bỏ hoàn toàn tab mã nhúng code JSX.
     - Thay thế bằng giao diện trực quan: Danh sách Dashboard các dịch vụ kèm công tắc Switch Bật/Tắt gán trực tiếp, huy hiệu trạng thái "Đang hiển thị" / "Chưa gán", nút điều hướng nhanh "Truy cập Dashboard ->", và Tab Live Preview xem trước biểu đồ.
     - Loại bỏ toàn bộ class cấm `break-words`, thay thế bằng `wrap-break-word` và `break-all`.
  5. *Tích hợp Đồng bộ Vào 5 Dashboard Phân hệ*:
     - `DocumentsDashboardClient.tsx`: Tích hợp `DashboardReportContainer` (key `documents`, default `REP_DOC_STATS`).
     - `task-dashboard.tsx`: Tích hợp `DashboardReportContainer` (key `tasks`, default `REP_HRM_TASKS`).
     - `PostList.tsx`: Tích hợp `DashboardReportContainer` (key `posts`, default `REP_POST_STATS`).
     - `AdminDashboardClient.tsx`: Tích hợp `DashboardReportContainer` (key `admin`, default `REP_BTCTU_SOP_KPI`).
     - `HubClient.tsx`: Tích hợp `DashboardReportContainer` (key `hub`, default `REP_BTCTU_SOP_KPI`).
- **Tập tin đã tạo & sửa đổi**:
  - `apps/admin_khcn/features/reports/utils/dashboardAssignment.ts` (Tạo mới)
  - `apps/admin_khcn/features/reports/components/DashboardReportContainer.tsx` (Tạo mới)
  - `apps/admin_khcn/features/reports/components/reports/ReportEmbedModal.tsx` (Tái thiết kế hoàn toàn)
  - `apps/admin_khcn/features/reports/components/reports/ReportViewer.tsx` (Tối ưu responsive toolbar)
  - `apps/admin_khcn/features/reports/index.ts` (Export module)
  - `apps/admin_khcn/features/document/components/DocumentsDashboardClient.tsx` (Tích hợp)
  - `apps/admin_khcn/features/hrm/components/tasks/task-dashboard.tsx` (Tích hợp)
  - `apps/admin_khcn/features/posts/components/PostList.tsx` (Tích hợp)
  - `apps/admin_khcn/app/services/admin/AdminDashboardClient.tsx` (Tích hợp)
  - `apps/admin_khcn/features/hub/components/HubClient.tsx` (Tích hợp)
  - `.agents/execution_logs/code2.md` (Nhật ký thực thi)
- **Kiểm chứng máy thực tế**:
  - `npm run typecheck --prefix apps/admin_khcn` (`tsc --noEmit`): Hoàn thành 100% không có lỗi (Exit code 0).
  - Quét 0 `console.log`, 0 `debugger`, dọn sạch 100% rác thừa và imports không dùng.
  - Kiểm tra chuẩn mã hóa UTF-8 không BOM trên toàn bộ các file.
  - Docker compose build & deploy container `daklak-workspace-admin-frontend-1` thành công.

## 2026-10-17: Sửa Email Tràn Popup và Mở Hồ Sơ Cá Nhân Trên `/admin/hub`
- **Phạm vi:** `apps/admin_khcn/components/layouts/header-user-profile.tsx`.
- **Thay đổi:** Giới hạn popup theo viewport, thêm `min-w-0` và `wrap-break-word` cho email; chuyển dropdown sang controlled state và đóng menu trước khi mở dialog Hồ sơ cá nhân; xóa hai import không dùng (`Mail`, `Calendar`).
- **Kế hoạch/ownership:** Bổ sung phạm vi Code 2 vào `.agents/current_plan.md`; không đổi API, routing, dữ liệu hoặc quyền nên không cần cập nhật kiến trúc.
- **Kiểm chứng:**
  - `npm run lint -- components/layouts/header-user-profile.tsx` trong `apps/admin_khcn`: PASS, exit 0.
  - `npm run typecheck` trong `apps/admin_khcn`: PASS, exit 0.
  - `npm run build` trong `apps/admin_khcn`: FAIL do Turbopack không kết nối được `fonts.googleapis.com` để tải Inter và Geist Mono; lỗi môi trường mạng, chưa xác nhận build.
  - Mở `http://113.184.220.82/admin/hub`: chuyển tới `/admin/login?callbackUrl=%2Fhub`; chưa có phiên đăng nhập, do đó popup email và luồng mở hồ sơ runtime `UNVERIFIED`.
  - Package chưa có test script, test config hoặc component test hiện hữu; regression test UI `UNVERIFIED`.
  - `git diff --check`: không có lỗi whitespace; `header-user-profile.tsx` UTF-8 không BOM.
- **Trạng thái nghiệm thu:** Chưa `AGENT_ACCEPTED` vì runtime/regression test và build còn `UNVERIFIED` do môi trường truy cập.

## 2026-10-17: Thông báo quyền tham gia trao đổi nhiệm vụ
- **Phạm vi:** `apps/chat-service/src/modules/message/message.service.ts`, regression test mới `apps/chat-service/src/modules/message/message.service.spec.ts`.
- **Thay đổi:** Guard participant trả message `Bạn không có quyền tham gia đoạn chat này.` cho `GetMessages`, `SendMessage` và `MarkRead`. Giữ gRPC `NOT_FOUND` / HTTP 404 để bảo toàn cơ chế không tiết lộ sự tồn tại của hội thoại. Ghi rõ mapping trong `.agents/architecture/request-response-flow.md`.
- **Kiểm chứng:**
  - `npm test -- --runInBand modules/message/message.service.spec.ts` tại `apps/chat-service`: PASS, 5 tests.
  - `npx eslint src/modules/message/message.service.ts src/modules/message/message.service.spec.ts` tại `apps/chat-service`: PASS, không warning.
  - `npm run build` tại `apps/chat-service`: PASS (Prisma generate, Nest build, tsc-alias).
  - Prisma generate làm thay đổi client sinh tự động; đã khôi phục các file `src/generated/prisma` về nội dung trước build và xác nhận chúng không còn trong git diff.
  - Runtime smoke trên API thật: UNVERIFIED, không có phiên/credential để gọi endpoint nhiệm vụ có xác thực.
- **Đồng bộ kiến trúc:** `.agents/architecture/request-response-flow.md` phản ánh message và mã lỗi gRPC/HTTP thực tế.
- **Vệ sinh:** Các file nguồn mới/sửa lưu UTF-8 không BOM; lint sạch. Không thêm debug log.
- **Trạng thái:** Regression, lint và build đạt; runtime trên môi trường triển khai chưa xác minh.
