# Report Service
- **Database**: `admin_report`
- **Vai trò cốt lõi**:
  1. **Nơi thiết kế báo cáo hệ thống**: Định nghĩa mẫu biểu báo cáo động, mẫu biểu thống kê định kỳ/đột xuất theo các biểu mẫu hành chính nhà nước.
  2. **Xây dựng Dashboard phân quyền theo dõi**: Xây dựng các màn hình trực quan hóa số liệu (Dashboards) phân cấp sử dụng báo cáo cho từng cá nhân, lãnh đạo phòng, và thủ trưởng đơn vị.
  3. **Nơi các đơn vị sử dụng theo dõi toàn diện**: Cung cấp trung tâm tra cứu, giám sát tiến độ thực hiện nhiệm vụ, tỷ lệ hoàn thành KPI, biểu đồ xếp loại và số liệu tổng hợp đa chiều.
- **Ràng buộc kiến trúc**:
  - Thu thập số liệu qua gRPC hoặc sự kiện RabbitMQ từ các Domain Services (`hrm-service`, `document-service`, `workflow-service`, `user-service`), tuyệt đối KHÔNG query trực tiếp CSDL của service khác.
  - Áp dụng chặt chẽ phân quyền PBAC và ràng buộc `organizationId`, đảm bảo đơn vị nào chỉ được xem số liệu thống kê thuộc phạm vi quản lý của đơn vị đó.
