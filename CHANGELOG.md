# Changelog

Tài liệu này ghi chép lại toàn bộ lịch sử các bản cập nhật, sửa lỗi và thêm tính năng mới của dự án Daklak Workspace. Format dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [1.0.1] - 2026-09-12

### Fixed (Đã sửa lỗi)
- **PBAC & Menu Access**: Khắc phục lỗi hiển thị trang "Không tìm thấy trang" (404 Not Found) khi tài khoản Super Admin truy cập vào `/services/admin`.
  - **Nguyên nhân**: Sự thiếu đồng bộ giữa `keepCase: false` của gRPC và field name trả về dạng `snake_case` (`allowed_paths`) bên trong `user-service`. Dẫn tới field này bị gRPC loại bỏ tự động trước khi gửi tới API Gateway.
  - **Khắc phục**: Chuyển đổi tên biến từ `allowed_paths` thành `allowedPaths` bên trong `menus.service.ts` và `menus.controller.ts` tại `user-service`.

### Changed (Cập nhật)
- Cập nhật tài liệu triển khai (`readme.md`), thêm mục **Nhật ký gỡ lỗi (Troubleshooting)** nhằm cảnh báo về quy tắc map gRPC Object (camelCase vs snake_case).
- Cập nhật tài liệu kỹ năng AI `grpc` (`.agents/skills/grpc/SKILL.md`) để bắt buộc các agent sau này tuân thủ trả về `camelCase` khi cấu hình gRPC `keepCase: false`.
- Khởi tạo chính sách **CONTINUOUS DOCUMENTATION** (`.agents/rules/agent-execution-policy.md`) nhằm đảm bảo sau mỗi lần thực thi mọi nội dung bảo trì, sửa lỗi và tính năng mới đều được cập nhật vào `CHANGELOG.md`.
