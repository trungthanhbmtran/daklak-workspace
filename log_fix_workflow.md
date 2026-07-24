# Lịch sử Fix lỗi HRM Service và Workflow Service

## Ngày 24/07/2026

### 1. Lỗi HRM-Service gọi gRPC (FindWorkflowByCode)
- **Vấn đề (Log)**: `hrm-service` xuất hiện lỗi `12 UNIMPLEMENTED: The server does not implement the method FindWorkflowByCode`.
- **Nguyên nhân**: Trong file `.proto` định nghĩa method này, `hrm-service` có gọi để lấy luồng xử lý, nhưng phía `workflow-service` (cụ thể là `GrpcWorkflowController`) chưa thực thi (implement) method `FindWorkflowByCode`.
- **Giải pháp**: 
  - Khai báo DTO `FindWorkflowByCodeGrpcDto` tại `apps/workflow-service/src/grpc/dto/workflow.dto.ts`.
  - Implement `@GrpcMethod('WorkflowService', 'FindWorkflowByCode')` tại `apps/workflow-service/src/grpc/grpc.controller.ts`, sử dụng logic `definitionService.getDefinition(data.code)`.
  - Build lại `workflow-service` và khởi động lại container để `hrm-service` có thể gọi thành công.

### 2. Lỗi NPM CI Docker của Workflow-Service (Bcrypt)
- **Vấn đề**: Khi build docker image cho `workflow-service`, tiến trình `npm ci` bị chết do thư viện `bcrypt` không tải được binary pre-build và cố gắng gọi Node-GYP với `Python` (nhưng container Node-Alpine không cài sẵn Python).
- **Nguyên nhân**: Package `bcrypt` bị thừa. `workflow-service` hoàn toàn không sử dụng thư viện này (chỉ `user-service` hoặc API Gateway cần dùng để băm mật khẩu).
- **Giải pháp**: Đã chạy `npm uninstall bcrypt @types/bcrypt` ở `workflow-service` để gỡ bỏ. Image build thành công.
