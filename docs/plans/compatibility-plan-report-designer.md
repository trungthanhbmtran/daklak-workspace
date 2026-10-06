# Kế hoạch tương thích và dọn dẹp mã (Compatibility & Migration Plan)

## 1. Trạng thái Legacy (Giữ nguyên)
* **API Route và RPC cũ:** Các RPC như `CreateTemplate`, `GetTemplateById`, `ExecuteTable` và route gateway `GET /reports/*` vẫn được giữ nguyên.
* **Database Schema:** `ReportTemplate` và `ReportWidget` cũ không bị xóa.
* **Frontend:** Các luồng sử dụng `ReportDashboard` và `ReportBuilder` sẽ tiếp tục render từ database/schema cũ. 
* **gRPC Contract:** Không xóa bất kỳ field số hiệu nào trong `report.proto`. Các RPC mới được đặt tại phần cuối của service.

## 2. Giai đoạn chuyển tiếp (Dual-Read / Adapter)
* Khi Report Designer mới đi vào hoạt động (Phase 3), bảng dữ liệu sẽ có lựa chọn "Migrate" từ Template cũ sang `ReportDefinition`. 
* Hệ thống **chỉ thêm mới (Additive)** vào `ReportDefinition`. Đối với các legacy template không thể map được, sẽ đưa ra danh sách yêu cầu convert tay.
* Chèn các Telemetry (hoặc Logger) vào các hàm/route cũ để đo đếm số lượng "deprecation callers".

## 3. Điều kiện tháo gỡ (Deprecation & Removal)
* Khi Metric usage của các route/RPC cũ chạm mức 0 trong 1 tháng.
* Có sự xác nhận (approve) từ Product Owner.
* Có bằng chứng đã backup/migrate dữ liệu thành công. 

*Tuyệt đối không xóa bất kỳ code cũ nào của phần report (cả UI lẫn backend) trong các phase tới cho đến khi đạt đủ các điều kiện tháo gỡ nêu trên.*
