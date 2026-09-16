# Changelog

Tài liệu này ghi chép lại toàn bộ lịch sử các bản cập nhật, sửa lỗi và thêm tính năng mới của dự án Daklak Workspace. Format dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added (Tính năng mới)
- **Personal AI Models**: Thêm tính năng cho phép người dùng tự cấu hình khóa API cho các mô hình AI của riêng họ (OpenAI, Gemini, Claude).
  - Bổ sung bảng `user_configs` trong cơ sở dữ liệu `user-service`.
  - Bổ sung gRPC `UserConfigService` để giao tiếp giữa API Gateway và User Service.
  - Cập nhật `AiService` và AI Worker để ưu tiên sử dụng khóa API cá nhân nếu người dùng đã cấu hình, nếu không sẽ tự động fallback sang cấu hình hệ thống chung.
  - Cập nhật giao diện thanh Header: bấm vào avatar sẽ có thêm nút "Cài đặt AI & Ứng dụng" để mở bảng điều khiển AI cá nhân bằng `Dialog`.

### Changed (Cập nhật)
- **Organization Details UI Refactor**: Chuyển đổi mô hình hiển thị chi tiết Đơn vị tổ chức trên giao diện Admin từ Client Tabs sang Next.js App Router Pages.
  - Thay thế `OrganizationDetailClient` bằng cấu trúc trang độc lập: `/info`, `/scope`, `/staffing`.
  - Hỗ trợ tốt hơn việc chia sẻ liên kết trực tiếp (Deep linking) và giảm nhẹ logic state phía client.

- **Organization API Optimization (Over-fetching fix)**: Cải thiện mạnh mẽ hiệu suất load cây đơn vị tổ chức.
  - **Backend**: Xóa bỏ việc load thừa (include) hàng loạt `unitDomains` (kèm translations) khi gọi `GetFullTree`, `GetOrganizations`, và `GetSubTree` trong `user-service`.
  - **Frontend**: Trang Thông tin và trang Phạm vi phụ trách của đơn vị giờ đây sẽ tự động sử dụng hook `useOrganizationDetailQuery` (gọi riêng API `GET /admin/organizations/:id`) để lấy chi tiết khi người dùng nhấn vào đơn vị cụ thể, thay vì phụ thuộc vào một cục data khổng lồ. Màn hình chờ (Skeleton) cũng được bổ sung để nâng cao UX.

- **Personal AI Assistants (Custom RAG & Bot)**: Khởi tạo hệ thống Trợ lý AI Cá nhân.
  - Bổ sung cấu hình `qdrant` vào `docker-compose.prod.yml` làm Vector Database.
  - Thiết kế và triển khai CSDL (Prisma schema) cho `AiAssistant`, `AiKnowledgeSource`, `AiAssistantTool` bên trong `user-service`.
  - Khai báo file protobuf `ai_assistant.proto` và tích hợp REST Controller `AiAssistantGatewayController` tại API Gateway.
  - Hỗ trợ các API cho chức năng: Quản lý Trợ lý (CRUD), Thêm bớt công cụ (Tools), Quản lý Nguồn tài liệu (Knowledge Sources).
  - Hỗ trợ tải lên tài liệu định dạng PDF, DOCX (tích hợp `pdf-parse`, `mammoth` tại API Gateway) để tự động trích xuất văn bản, tạo vector và lưu vào Qdrant.

### Fixed (Đã sửa lỗi)
- **Staffing / HRM Assignment**: Khắc phục lỗi "không gán cá nhân theo đơn vị được mặc dù đã cấu hình" trên frontend (`admin_khcn`).
  - **Nguyên nhân**: Hàm `assignPosition` trong `user-service` tạo vị trí nhưng không gán user vào `StaffingSlot` cụ thể cũng như không tăng bộ đếm `currentCount` của định biên. Hơn nữa, sự kiện bắn ra không được `hrm-service` lắng nghe nên dữ liệu phòng ban của nhân viên không bao giờ được đồng bộ.
  - **Khắc phục**: Sửa `assignPosition` để tự động tìm Slot trống và gán `employeeCode`. Bổ sung `@EventPattern('user.position.assigned')` tại `hrm-service` (`employees.controller.ts`, `employees.service.ts`) để lắng nghe sự kiện và cập nhật `departmentId`, `jobTitleId` theo thời gian thực.

- **Organization / Unit Scope & Type**: Khắc phục lỗi không hiển thị/cập nhật phân loại tổ chức và bị mất dữ liệu tên, mã tổ chức khi cập nhật phạm vi phụ trách.
  - **Nguyên nhân**: Frontend gửi `categoryCode` nhưng backend lại dùng `typeId`, đồng thời gRPC API bị gom chung vào `UpdateUnit`. Vì proto3 mặc định chuỗi rỗng khi tham số bị thiếu, cập nhật `scope` làm wipe out (xóa trắng) tên/mã của đơn vị.
  - **Khắc phục**: 
    - Thêm trường `type_code` vào protobuf và ánh xạ nó với `typeId` trên CSDL.
    - Tách riêng gRPC endpoint thành `UpdateUnitScope` chuyên biệt để cập nhật `domain_ids` và `scope`, không dùng chung `UpdateUnit` nhằm tránh lỗi wipe out.
    - Cập nhật frontend `api.ts` để đọc chính xác `typeCode`.
## [1.0.1] - 2026-09-12

### Fixed (Đã sửa lỗi)
- **PBAC & Menu Access**: Khắc phục lỗi hiển thị trang "Không tìm thấy trang" (404 Not Found) khi tài khoản Super Admin truy cập vào `/services/admin`.
  - **Nguyên nhân**: Sự thiếu đồng bộ giữa `keepCase: false` của gRPC và field name trả về dạng `snake_case` (`allowed_paths`) bên trong `user-service`. Dẫn tới field này bị gRPC loại bỏ tự động trước khi gửi tới API Gateway.
  - **Khắc phục**: Chuyển đổi tên biến từ `allowed_paths` thành `allowedPaths` bên trong `menus.service.ts` và `menus.controller.ts` tại `user-service`.

### Changed (Cập nhật)
- Cập nhật tài liệu triển khai (`readme.md`), thêm mục **Nhật ký gỡ lỗi (Troubleshooting)** nhằm cảnh báo về quy tắc map gRPC Object (camelCase vs snake_case).
- Cập nhật tài liệu kỹ năng AI `grpc` (`.agents/skills/grpc/SKILL.md`) để bắt buộc các agent sau này tuân thủ trả về `camelCase` khi cấu hình gRPC `keepCase: false`.
- Khởi tạo chính sách **CONTINUOUS DOCUMENTATION** (`.agents/rules/agent-execution-policy.md`) nhằm đảm bảo sau mỗi lần thực thi mọi nội dung bảo trì, sửa lỗi và tính năng mới đều được cập nhật vào `CHANGELOG.md`.
