# Service & Development Boundaries

## 1. Ranh giới giữa các Microservices (Service Data Sovereignty)
- **Mỗi service là độc lập:** Sở hữu cơ sở dữ liệu riêng, domain logic riêng.
- **KHÔNG ĐƯỢC:** Service A query trực tiếp database của Service B (vi phạm Data Sovereignty).
- **KHÔNG ĐƯỢC:** Import trực tiếp code từ thư mục service này sang service khác (trừ khi dùng package/shared chính thức).
- **Giao tiếp liên dịch vụ:** Bắt buộc thông qua gRPC contracts hoặc RabbitMQ events.

## 2. Ranh giới Coder và Ownership (Conflict-Free Boundaries)
Khi chạy song song, ownership phải được chốt trong kế hoạch đã duyệt theo file cụ thể; không dùng ranh giới thư mục này thay cho review từng file.

- Code 1, Code 2 và Code 3 đều có thể thực hiện full-stack. Số lane xác định command và execution log, không xác định chuyên môn.
- Nếu task tách Backend/Frontend an toàn sau khi contract được khóa, coordinator giao từng phạm vi không chồng lấn cho coder phù hợp và worktree riêng.
- Các thư mục dưới đây chỉ gợi ý vùng trách nhiệm để phân công:
  - Backend thường gồm apps/api-gateway/, apps/*-service/, prisma/, libs/ và packages/proto/.
  - Frontend thường gồm apps/admin_khcn/, apps/portal-goverment/ và packages/ui/.
- Shared contract/code/config được nhiều phía sử dụng phải có đúng một owner trong plan. Không lane nào tự sửa file ngoài ownership đã duyệt; thay đổi ownership cần coordinator cập nhật plan và review lại.
