# Security Rules

- Validate dữ liệu đầu vào theo từng tầng. Fail fast và throw error.
- Không lộ lọt log chứa thông tin nhạy cảm.
- Bảo vệ các endpoint nội bộ (gRPC).
- **Phân phối Tài nguyên theo Ngữ cảnh Quyền (PBAC Resource Authorization):** Sau khi xác thực danh tính User thành công qua Guard gRPC, mọi thao tác truy vấn dữ liệu BẮT BUỘC phải dựa vào danh sách quyền (`permissionsFlatten`), mã cán bộ (`employeeCode`) và đơn vị (`unitId`/`departmentId`) để lọc và phân phối đúng tài nguyên được phép truy cập. Cấm tuyệt đối việc bỏ qua kiểm tra quyền hoặc gán mù quáng thông tin định danh vào payload mà không dùng để kiểm soát phạm vi truy cập dữ liệu.
