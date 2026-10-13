# API Gateway & API Manager
- **Database**: `daklak_db` (Lưu trữ cấu hình route, auth rate limits, connections)
- **Vai trò cốt lõi**:
  1. **Cửa ngõ định tuyến (Routing & Reverse Proxy)**: Nhận HTTP REST từ Frontend (`admin_khcn`, `portal-goverment`), chứng thực JWT Auth, gán metadata token ngữ cảnh (`GatewayContextToken`) và chuyển tiếp qua gRPC xuống microservices nội bộ.
  2. **API Manager & Integration Hub**:
     - Nơi quản lý tập trung các nguồn kết nối chính bao gồm các API của toàn hệ thống.
     - Xây dựng, quản lý và kiểm soát các **API nội bộ** giao tiếp giữa các thành phần.
     - Xây dựng và quản lý các **API liên thông của hệ thống** (kết nối LGSP Tỉnh, Cổng Dịch vụ công Quốc gia, các CSDL chuyên ngành, Webhooks đối soát).
     - Quản lý cấu hình upstream, bảo mật, giới hạn truy cập (rate-limiting), giám sát hiệu năng gọi API.
  3. **Chuẩn hóa Envelope**: Tự động bọc dữ liệu trả về theo format `{ success, data, meta, timestamp }` qua `TransformInterceptor`.
- **Ràng buộc kiến trúc**:
  - Tuyệt đối KHÔNG chứa business logic của domain nghiệp vụ.
  - Tuyệt đối KHÔNG query trực tiếp database của các service nghiệp vụ khác.
