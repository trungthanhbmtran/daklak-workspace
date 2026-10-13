# Architecture Rules

## 1. Nguyên tắc chung & Source of Truth
- Project sử dụng kiến trúc Microservices.
- Giao tiếp giữa các service thông qua: gRPC, RabbitMQ (Events), HTTP (nếu cần thiết, qua Gateway).
- Shared protobuf tại `shared/protos` là source of truth cho contract.
- **Bắt buộc tra cứu Source of Truth trước khi code:** Tuyệt đối không duplicate entity/bảng CSDL nếu đã thuộc về service chủ quản (`user-service` sở hữu VTVL, định biên, phân công; `workflow-service` sở hữu quy trình; `api-gateway` sở hữu kết nối/API liên thông; `report-service` sở hữu báo cáo/dashboard).
- **Triệt tiêu ảo giác AI (Anti-AI Hallucination):** Tuyệt đối không giả định cấu trúc bảng, tên cột, API route, protobuf method. Bắt buộc đọc file mã nguồn thực tế trước khi implement.

## 2. API Gateway
- Chịu trách nhiệm: Authentication, Authorization, Request adaptation, routing gRPC/API tới Microservice.
- KHÔNG đưa business logic (tính KPI, thực thi rule workflow, validate trùng lặp) vào Gateway.
- KHÔNG truy cập database của service khác từ Gateway.

## 3. Không Over-engineer
- Giữ mọi thứ đơn giản, tường minh (explicit).
- Không tự tạo framework mới (abstract factory, generic repository, v.v.) nếu repository chưa có.

## 4. Chuẩn hóa Data Transfer Object (DTO) & Validation
- Mọi API endpoint nhận dữ liệu từ Client **bắt buộc** phải có Class DTO kèm các decorator của `class-validator` (vd: `@IsString()`, `@IsOptional()`). 
- Không dùng kiểu `any` hoặc parse manual từ body.
- Hệ thống áp dụng chung một `PaginationDto` chuẩn cho các request GET danh sách (bao gồm `page`, `pageSize`, `search`, `sortBy`).

## 5. Type Safety & Cross-boundary Types
- Cấu trúc kiểu dữ liệu (Types/Interfaces) cho các Response / Payload phải được chia sẻ từ Backend xuống Frontend thông qua thư mục `shared/types` hoặc sinh tự động (auto-generated) từ code gốc.
- Frontend không được tự ý tái định nghĩa lại các kiểu dữ liệu của Backend bằng tay (hoặc lạm dụng `any`) để đảm bảo không gãy cấu trúc khi Backend thay đổi trường dữ liệu.
