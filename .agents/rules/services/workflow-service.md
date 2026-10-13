# Workflow Service
- **Database**: `admin_workflow`
- **Vai trò cốt lõi**:
  - Là nơi **lưu trữ, cấu hình và mô tả toàn bộ các nghiệp vụ và quy trình** của hệ thống (Process Definitions, BPMN Graphs, Swimlanes, State Machines).
  - Quản lý trạng thái thực thi phiên bản (`ProcessVersion`), phiên chạy thực tế (`ProcessInstance`), lịch sử luồng đi (`WorkflowTransition`), nhiệm vụ phê duyệt (`WorkflowTask`).
  - Cung cấp Rule Engine để tự động đánh giá điều kiện rẽ nhánh và kích hoạt các tác vụ hệ thống (`serviceTask`).
  - Cung cấp hợp đồng gRPC chuẩn để các Domain Service (như `hrm-service`, `document-service`) ủy quyền kiểm tra điều kiện chuyển bước (`validateAction`), thực hiện bước đi tiếp (`advanceProcess`), hoặc nhận kết quả xử lý.
- **Ràng buộc kiến trúc**:
  - Tách bạch giữa **Động cơ quy trình (State Machine Engine)** và **Nghiệp vụ chi tiết (Domain Data)**: `workflow-service` quản lý logic chuyển trạng thái và luồng duyệt, còn thông tin nghiệp vụ chi tiết của Task/Hồ sơ lưu tại service sở hữu.
  - Sơ đồ quy trình BPMN phải đảm bảo tọa độ phân làn mạch lạc, đường kết nối rõ ràng giữa các thẩm quyền duyệt.
