# API Gateway & API Manager (`apps/api-gateway`)

`apps/api-gateway` là lớp tiếp nhận và điều phối giao tiếp từ bên ngoài vào toàn bộ hệ sinh thái hệ thống.

- **Database nội bộ:** `daklak_db` (Chỉ lưu trữ cấu hình route, auth rate limits, connections, logging).

---

## 1. Trách nhiệm của API Gateway

API Gateway chịu trách nhiệm:
1. **Công bố REST endpoints:** Đóng vai trò là entrypoint duy nhất cho các Client (Frontend `admin_khcn`, `portal-goverment`, Mobile app, và các đối tác bên ngoài).
2. **Xác thực và phân quyền:** Xác thực JWT token, trích xuất ngữ cảnh người dùng, gán metadata (`GatewayContextToken`), và kiểm tra phân quyền (PBAC/RBAC) theo cơ chế hiện có.
3. **Validate request ở ranh giới API:** Sử dụng NestJS Pipes (`ValidationPipe`, `ParseIntPipe`, class-validator DTOs) để chặn dữ liệu không hợp lệ hoặc chuỗi rác ngay tại ranh giới HTTP, không để lọt xuống microservices.
4. **Chuyển đổi giao thức (Protocol Mediation):** Chuyển đổi HTTP request/response sang các request/response tương ứng của gRPC.
5. **Điều phối và định tuyến:** Điều phối lời gọi đến đúng microservice chủ quản theo Source of Truth.
6. **Tổng hợp dữ liệu (BFF Aggregation):** Tổng hợp dữ liệu từ nhiều microservice khi thực sự cần thiết cho màn hình client, giảm thiểu số lượt gọi mạng từ frontend.
7. **Chuẩn hóa HTTP status code và định dạng lỗi REST:**
   - Map lỗi gRPC/upstream sang mã lỗi HTTP tương ứng (400, 401, 403, 404, 429, 500) qua ExceptionFilters.
   - Chuẩn hóa envelope đầu ra qua `TransformInterceptor` (`{ success, data, meta, message, timestamp }`).
8. **Khả năng phục hồi (Resilience):** Xử lý timeout, retry, circuit breaking, lỗi kết nối và lỗi upstream theo cơ chế hiện có.
9. **Least Data & Bảo mật:** Chỉ query và trả về những trường dữ liệu cần thiết, được phép công bố cho client; không làm lộ cấu trúc nhạy cảm của CSDL nội bộ.
10. **Quản lý Kết nối Liên thông (API Manager & Integration Hub):** Xây dựng và kiểm soát các kết nối liên thông ra bên ngoài (LGSP Tỉnh, Cổng Dịch vụ công Quốc gia, các CSDL chuyên ngành, Webhooks).

---

## 2. Ranh giới Bất biến (Những việc Gateway KHÔNG ĐƯỢC làm)

Gateway tuyệt đối KHÔNG ĐƯỢC:
1. **Không lưu trữ nghiệp vụ cốt lõi:** Không trở thành nơi lưu trữ nghiệp vụ cốt lõi của các microservice domain.
2. **Không truy cập trực tiếp Database của microservice:** Tuyệt đối không kết nối chéo hay query trực tiếp CSDL của các domain service khác.
3. **Không tự triển khai lại nghiệp vụ:** Không tự tái hiện toàn bộ nghiệp vụ đã thuộc quyền quản lý của domain service chủ quản.
4. **Không tạo bản sao dữ liệu:** Không tạo bản sao dữ liệu hoặc bảng nghiệp vụ chỉ để tiện gọi API.
5. **Không dựng luồng duyệt song song:** Tuyệt đối không tự đặt ra quy trình nghiệp vụ song song với `workflow-service`.
6. **Không tự chế tầng abstraction thừa:** Không tạo thêm một service hoặc tầng abstraction nếu chưa chứng minh được nhu cầu thực tế.
7. **Không chuyển tiếp mù quáng:** Không chuyển tiếp mù quáng mọi request mà không có mapping, DTO validation và xử lý lỗi phù hợp.

---

## 3. Nguyên tắc Triển khai & Tái sử dụng Mã nguồn

- **Tái sử dụng tối đa:** Ưu tiên sử dụng các module, controller, guard, decorator, client và cấu hình microservice hiện có.
- **Granular Endpoints:** Cung cấp API tách nhỏ theo ngữ cảnh hiển thị, hỗ trợ Client tải theo nhu cầu (Lazy Tabs / Dynamic Loading).
- **Phân định Envelope:** Dữ liệu hiển thị nằm ở `data` (phẳng 1 tầng, không bọc đúp `data.data`), quyền thao tác nằm ở `meta.actions` / `meta.permissions`, phân trang ở `meta.pagination`.
