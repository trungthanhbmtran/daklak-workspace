# Changelog

Tài liệu này ghi chép lại toàn bộ lịch sử các bản cập nhật, sửa lỗi và thêm tính năng mới của dự án Daklak Workspace. Format dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added (Tính năng mới)
- **Personal AI Models**: Thêm tính năng cho phép người dùng tự cấu hình khóa API cho các mô hình AI của riêng họ (OpenAI, Gemini, Claude).
  - Bổ sung bảng `user_configs` trong cơ sở dữ liệu `user-service`.
  - Bổ sung gRPC `UserConfigService` để giao tiếp giữa API Gateway và User Service.
  - Cập nhật `AiService` và AI Worker để ưu tiên sử dụng khóa API cá nhân nếu người dùng đã cấu hình, nếu không sẽ tự động fallback sang cấu hình hệ thống chung.
  - Cập nhật giao diện thanh Header: bấm vào avatar sẽ có thêm nút "Cài đặt AI & Ứng dụng" để mở bảng điều khiển AI cá nhân bằng `Dialog`.

- **Personal AI Assistants (Custom RAG & Bot)**: Khởi tạo hệ thống Trợ lý AI Cá nhân.
  - Bổ sung cấu hình `qdrant` vào `docker-compose.prod.yml` làm Vector Database.
  - Thiết kế và triển khai CSDL (Prisma schema) cho `AiAssistant`, `AiKnowledgeSource`, `AiAssistantTool` bên trong `user-service`.
  - Khai báo file protobuf `ai_assistant.proto` và tích hợp REST Controller `AiAssistantGatewayController` tại API Gateway.
  - Hỗ trợ các API cho chức năng: Quản lý Trợ lý (CRUD), Thêm bớt công cụ (Tools), Quản lý Nguồn tài liệu (Knowledge Sources).
  - Hỗ trợ tải lên tài liệu định dạng PDF, DOCX (tích hợp `pdf-parse`, `mammoth` tại API Gateway) để tự động trích xuất văn bản, tạo vector và lưu vào Qdrant.

## [1.0.1] - 2026-09-12

### Fixed (Đã sửa lỗi)
- **PBAC & Menu Access**: Khắc phục lỗi hiển thị trang "Không tìm thấy trang" (404 Not Found) khi tài khoản Super Admin truy cập vào `/services/admin`.
  - **Nguyên nhân**: Sự thiếu đồng bộ giữa `keepCase: false` của gRPC và field name trả về dạng `snake_case` (`allowed_paths`) bên trong `user-service`. Dẫn tới field này bị gRPC loại bỏ tự động trước khi gửi tới API Gateway.
  - **Khắc phục**: Chuyển đổi tên biến từ `allowed_paths` thành `allowedPaths` bên trong `menus.service.ts` và `menus.controller.ts` tại `user-service`.

### Changed (Cập nhật)
- Cập nhật tài liệu triển khai (`readme.md`), thêm mục **Nhật ký gỡ lỗi (Troubleshooting)** nhằm cảnh báo về quy tắc map gRPC Object (camelCase vs snake_case).
- Cập nhật tài liệu kỹ năng AI `grpc` (`.agents/skills/grpc/SKILL.md`) để bắt buộc các agent sau này tuân thủ trả về `camelCase` khi cấu hình gRPC `keepCase: false`.
- Khởi tạo chính sách **CONTINUOUS DOCUMENTATION** (`.agents/rules/agent-execution-policy.md`) nhằm đảm bảo sau mỗi lần thực thi mọi nội dung bảo trì, sửa lỗi và tính năng mới đều được cập nhật vào `CHANGELOG.md`.
