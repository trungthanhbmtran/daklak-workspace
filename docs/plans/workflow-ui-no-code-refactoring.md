# Kế Hoạch Tái Cấu Trúc Giao Diện Workflow (No-Code First)

**Mục tiêu:** Xây dựng lại giao diện Workflow Designer để người dùng nghiệp vụ (Business Analyst, End-User) có thể dễ dàng thiết lập quy trình, phân việc, cài đặt rẽ nhánh và áp dụng vào đúng đối tượng mà không cần biết code hay cấu hình kỹ thuật phức tạp.

## 1. Phân Tích Hiện Trạng
- **UI hiện tại:** Có Node Palette, React Flow Canvas và Properties Panel. Tuy nhiên, bảng thuộc tính vẫn chứa nhiều trường hợp mang tính kỹ thuật (ví dụ: DevConfig, viết biểu thức trực tiếp).
- **Rẽ nhánh (Gateway) & Giao việc (Assignment):** Vẫn yêu cầu người dùng hiểu cấu trúc dữ liệu bên dưới (expression string, role ID).
- **Áp dụng (Binding):** Nằm gọn trên Topbar qua dropdown "Gắn vào Form", thiếu tính trực quan về điều kiện áp dụng.

## 2. Các Thay Đổi Kiến Trúc Giao Diện (UI Architecture Changes)

### Giai đoạn 1: Chế độ hiển thị "Business Mode" vs "Expert Mode"
- **Properties Panel:** Thêm Toggle Switch (Công tắc) ở góc trên để chuyển đổi giữa `Business Mode` (Mặc định) và `Expert Mode`.
- **Business Mode:** 
  - Ẩn hoàn toàn các Tab/Accordion như `DevConfig`, `ScriptTaskProperties`, API Header Config.
  - Các node kỹ thuật (API Gateway, Nginx Proxy) sẽ không xuất hiện trong Node Palette. Nếu hiển thị thì gọi chung là "Hệ thống tự động" với các Action định sẵn (Gửi Email, Cập nhật trạng thái).
- **Expert Mode:** Dành cho Developer (giữ nguyên cấu hình như hiện tại để không mất tính linh hoạt).

### Giai đoạn 2: Xây dựng Visual Rule Builder (Rẽ nhánh)
- **Thay thế nhập text expression ở Gateway Edge:** 
  - Sử dụng giao diện Visual Rule Builder trong `EdgeProperties.tsx`.
  - Thiết kế UI 3 cột cho mỗi dòng Rule: `[Chọn Trường Dữ Liệu] [Toán Tử] [Giá trị]`.
  - *Ví dụ:* `[Tổng tiền] [Lớn hơn] [10,000,000]`. Có nút "Thêm điều kiện (AND/OR)".
- **Backend Mapping:** UI này sẽ sinh ra mảng JSON mô tả Rule hoặc chuỗi AST. Backend Rule Engine sẽ map từ JSON này sang Expression Engine thay vì người dùng tự gõ JavaScript.

### Giai đoạn 3: Smart Assignment Builder (Giao việc)
- **User Task Properties:** Tái cấu trúc phần Assignment (Người xử lý).
- Cung cấp giao diện trực quan với 3 loại gán việc chính:
  1. **Động (Dynamic):** "Người tạo hồ sơ", "Quản lý trực tiếp", "Người xử lý bước trước".
  2. **Theo Chức danh (Role-based):** Chọn từ danh sách Dropdown (có search) các chức danh từ DB (orgRoles).
  3. **Theo Đơn vị/Phòng ban (Department-based):** Tree-select (Cây phòng ban).
- Cấu hình này tự sinh JSON chiến lược phân công (Strategy Pattern) xuống Backend theo đúng điều 10 của Architecture Manifest.

### Giai đoạn 4: Cải tiến Workflow Binding (Áp dụng đúng đối tượng)
- Đưa nút "Kích hoạt & Áp dụng" vào một Dialog/Drawer lớn (Workflow Deployment Settings) thay vì Dropdown nhỏ ở Topbar.
- **Tính năng trong Deployment Settings:**
  - **Mục tiêu áp dụng:** Chọn Form/Module (Quy trình nghỉ phép, Thanh toán...).
  - **Điều kiện áp dụng (Criteria):** Sử dụng Visual Rule Builder ở Giai đoạn 2 để cấu hình: "Chỉ áp dụng quy trình này nếu Đơn vị = IT".
  - **Xung đột:** Hiển thị cảnh báo nếu có quy trình khác đang áp dụng cho cùng điều kiện.

### Giai đoạn 5: Validate & Feedback Trực Quan
- **Canvas Validation:** Khi người dùng nhấn "Lưu", nếu thiếu cấu hình (VD: Gateway thiếu nhánh Default, User Task chưa có người duyệt), Node đó sẽ có **viền đỏ phát sáng (Glow red)** và hiện Tooltip thông báo tiếng Việt rõ ràng.
- **Templates:** (Định hướng tương lai) Khi tạo mới, hiển thị màn hình chọn "Template có sẵn" thay vì canvas trống.

## 3. Quản Lý Rủi Ro & Tuân Thủ (Plan Critique)
- **Kiến trúc (Architecture Manifest):** Các thay đổi này hoàn toàn nằm ở `Presentation Layer` (Frontend), gen ra JSON cấu hình mà Workflow Runtime Backend (Domain Layer) đã định nghĩa. Không vi phạm Architecture.
- **Performance:** Không gọi thêm API nặng nề, chỉ sử dụng dữ liệu cached `orgRoles`, `workflowModules` hiện có.
- **Rollback:** Vì dùng chung cấu trúc Definition JSON, những workflow cũ vẫn parse và chạy được. Nếu Business Mode bị lỗi, người dùng có thể gạt sang Expert Mode để fix bằng tay.

## 4. Các Bước Thực Thi Tiếp Theo (Cho Agent)
- Cập nhật `PropertiesPanel.tsx` và `UserTaskProperties.tsx` để thêm Business Mode toggle.
- Xây dựng component `RuleBuilderUI.tsx` và tích hợp vào `EdgeProperties.tsx`.
- Cập nhật Dialog `WorkflowBinding.tsx` thay cho Dropdown ở `Topbar.tsx`.
