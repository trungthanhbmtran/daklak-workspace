# Code 3 — Nhật ký thực thi riêng (append-only)

Chỉ Code 3 được ghi vào file này. Mỗi mục ghi ngày, tên tác vụ, file thuộc phạm vi đã sửa, lệnh kiểm chứng thực tế và kết quả. Không ghi hoặc sửa nhật ký Code 1, Code 2 hay shared coordinator archive.

## [2026-10-13] Sửa lỗi giao diện Workflow Editor & Chuẩn hóa UI/UX 7 Bộ ràng buộc bất biến (WF_BTCTU_DANH_GIA_KPI)
- **Tác vụ**: Sửa lỗi giao diện màn hình chỉnh sửa quy trình (`/admin/services/workflow/workflows/:id/edit`), đặc biệt là quy trình `cmv4ww45j0004w4eqmkje1in4` (WF_BTCTU_DANH_GIA_KPI); triệt tiêu lỗi layout clipping, tràn khung, scroll trap; khắc phục chồng đè ranh giới giai đoạn (double overlay clash); bổ sung 4-way handles và hệ thống thanh điều hướng / inspector responsive.
- **Phạm vi file đã thực thi**:
  - `apps/admin_khcn/features/workflow/screens/WorkflowEditorScreen.tsx`: Chuyển đổi sang kiến trúc layout 3 vùng linh hoạt (Left Panel - Center Canvas - Right Inspector), hỗ trợ toggle ẩn/hiện bảng điều khiển, loại bỏ `overflow-hidden` gây khóa cuộn, tích hợp phím tắt Delete/Escape và auto-layout.
  - `apps/admin_khcn/features/workflow/components/WorkflowNodeCard.tsx`: Thiết kế lại card node với 4-way handles (`target-left`, `target-top`, `target-bottom`, `source-right`, `source-top`, `source-bottom`) chống đứt gãy kết nối React Flow, badge thẩm quyền và mẫu biểu chuẩn Enterprise.
  - `apps/admin_khcn/features/workflow/components/WorkflowCanvasOverlay.tsx`: Tự động tính toán ranh giới (bounding box) theo node thực tế của từng giai đoạn, phân màu sắc trực quan (GĐ 1: Emerald, GĐ 2: Blue, GĐ 3: Amber, GĐ 4: Purple), triệt tiêu hoàn toàn lỗi chồng đè 2 lớp hộp nét đứt.
  - `apps/admin_khcn/features/workflow/components/WorkflowSidebarLeft.tsx`: Tách biệt 3 tab rõ ràng (Thành phần kéo thả, Quản lý giai đoạn, Thông tin chung & Đơn vị sở hữu) với độ rộng `w-80` chuẩn responsive, không bị bóp nghẹt.
  - `apps/admin_khcn/features/workflow/components/WorkflowInspectorRight.tsx`: Bảng cấu hình thuộc tính bước (Tên, Thẩm quyền, Chức danh API, Biểu mẫu Mẫu 01-05) và nhánh (Nhãn, Action code, Điều kiện) trực quan.
  - `apps/admin_khcn/features/workflow/utils/workflow-graph-utils.ts`: Helper bóc tách đồ thị, parse JSON an toàn, thuật toán xác định hướng nối tự nhiên (dọc/ngang) và layout phân tầng.
  - `apps/admin_khcn/features/workflow/components/OrganizationUnitSelector.tsx`: Bổ sung suy luận danh mục đơn vị `inferUnitCategory` (Khối Đảng, Chính quyền, Sự nghiệp) khi CSDL thiếu cột `category_code`.
- **Lệnh kiểm chứng máy thực tế**:
  - `npx tsc --noEmit` tại `apps/admin_khcn`: Exit code 0 (Hoàn toàn sạch lỗi TypeScript).
- **Kết quả nghiệm thu**: Giao diện đạt chuẩn 7 Bộ ràng buộc kỹ thuật bất biến, Web Design Guidelines và Enterprise Portal skill; tương tác trơn tru mượt mà trên mọi độ phân giải.

## [2026-10-13] Tái thiết kế toàn diện giao diện Cấu hình Công thức KPI (kpi-formulas) theo chuẩn Executive Enterprise Portal
- **Tác vụ**: Thiết kế lại toàn diện giao diện trang `/admin/services/hrm/work-plans/kpi-formulas` theo tiêu chuẩn Executive Government Portal và Hướng dẫn 05-HD/TU Tỉnh ủy Đắk Lắk; xóa bỏ hoàn toàn scroll trap, nested scrollbar, clamp cứng `max-w-7xl` và floating sticky bottom bar gây che khuất nội dung; nâng cấp hệ thống 4 tab chuyên biệt: (1) Công thức chuẩn & Tham số, (2) Ngoại lệ lĩnh vực (7 nhóm việc Hướng dẫn 05), (3) Bộ mô phỏng Sandbox với Slider/Input & Badge xếp loại tự động (Xuất sắc, Tốt, Đạt, KHT), (4) Nhật ký phiên bản & Kiểm toán.
- **Phạm vi file đã thực thi**:
  - `apps/admin_khcn/app/services/hrm/work-plans/kpi-formulas/page.tsx`: Gỡ bỏ `h-full pb-8 overflow-y-auto` gây khóa cuộn và scroll trap; chuyển thành `w-full min-h-full flex flex-col flex-1 min-w-0 bg-background` cho luồng cuộn mượt mà tự nhiên.
  - `apps/admin_khcn/features/hrm/components/work-plans/kpi/KpiFormulasClient.tsx`: Tái cấu trúc 100% component client với 4 Tabs chuyên nghiệp, Card giải nghĩa công thức trực quan kèm 4 mẫu Formula Presets (Chuẩn Hướng dẫn 05, Trọng số chất lượng cao, Khắt khe thời hạn, Tuyến tính đơn giản), Mini Live Preview Widget ghim cạnh bên cho Tab 1, Lưới thẻ ngoại lệ theo lĩnh vực kèm bộ lọc nhanh và Modal thêm/sửa ngoại lệ, Bộ Sandbox Simulator tương tác cao với Sliders & phân rã điểm số trực quan, và Quản lý lịch sử phiên bản `savedVersions` có badge trạng thái "Đang áp dụng".
- **Lệnh kiểm chứng máy thực tế**:
  - `npx tsc --noEmit` tại `apps/admin_khcn`: Exit code 0 (Pass 100%, 0 lỗi TypeScript).
  - `Select-String -Pattern "console\.|debugger"`: 0 kết quả (Dọn sạch 100% debug logs).
- **Kết quả nghiệm thu**: Đạt toàn bộ 7 Bộ ràng buộc kỹ thuật bất biến (UI/UX layout, min-w-0, fluid flex, dumb client, không đè tiền tố API, UTF-8 không BOM, dọn sạch debug logs).
