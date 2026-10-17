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

## 3. Nguyên tắc Kiến trúc Granular Endpoints & Least Data (Chống Monolithic Mega-Fetch)
- **Granular API Design:** Mỗi microservice và API Gateway phải cung cấp các endpoint độc lập, tách nhỏ theo đúng phạm vi dữ liệu nghiệp vụ thay vì một monolithic endpoint gom tất cả quan hệ.
- **Chi tiết thực thể vs Dữ liệu con/Tabs:**
  - Endpoint chi tiết chính (`GET /entities/:id`): Chỉ trả về thông tin thực thể cốt lõi, không chứa các danh sách con có kích thước động hoặc lịch sử.
  - Các danh sách con (Sub-items, Steps, History/Audit Log, Comments, KPI/Evaluations): Phải có endpoint độc lập riêng (`GET /entities/:id/sub-items`, `GET /entities/:id/history`...).
- **Giới hạn truy vấn (Bounded Queries):** Mọi endpoint danh sách lịch sử/nhật ký phải có giới hạn (`take: 100`) hoặc phân trang rõ ràng, không bao giờ truy vấn `findMany` không giới hạn gây cạn kiệt bộ nhớ hoặc nghẽn I/O.

## 4. Ranh giới Kiến trúc của API Gateway (`apps/api-gateway`)
Tuân thủ chi tiết tại [`.agents/rules/services/api-gateway.md`](services/api-gateway.md):
- **Trách nhiệm:** Lớp tiếp nhận và điều phối giao tiếp từ bên ngoài vào hệ thống. Công bố REST endpoints, xác thực/phân quyền, validate request tại ranh giới (Pipes/DTOs), chuyển đổi HTTP sang gRPC, điều phối microservices, tổng hợp dữ liệu (BFF) khi cần thiết, chuẩn hóa status code và format lỗi/envelope (`TransformInterceptor`), xử lý resilience/timeout/upstream errors, trả về đúng dữ liệu cần thiết (Least Data).
- **Ranh giới bất biến (CẤM):**
  1. Không trở thành nơi lưu trữ nghiệp vụ cốt lõi của các microservice domain.
  2. Không truy cập trực tiếp database của microservice khác.
  3. Không tự triển khai lại toàn bộ nghiệp vụ đã thuộc domain service.
  4. Không tạo bản sao dữ liệu hoặc bảng nghiệp vụ chỉ để tiện gọi API.
  5. Không tự đặt ra quy trình nghiệp vụ song song với `workflow-service`.
  6. Không tạo thêm service hoặc tầng abstraction nếu chưa chứng minh được nhu cầu.
  7. Không chuyển tiếp mù quáng mọi request mà không có mapping, validation và xử lý lỗi phù hợp.
- **Tái sử dụng:** Ưu tiên tối đa sử dụng các module, controller, guard, decorator, client và cấu hình microservice hiện có.


