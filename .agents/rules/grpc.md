# gRPC Rules & Standards

1. **Source of Truth:** Thư mục `shared/protos` (hoặc `packages/proto`) là nguồn chân lý duy nhất cho mọi gRPC contracts. Không tự tạo file `.proto` trùng lặp trong nội bộ service.
2. **Quản lý sửa đổi `.proto` an toàn:**
   - BẮT BUỘC sử dụng công cụ an toàn (ghi đè toàn bộ hoặc multi_replace, tuyệt đối KHÔNG cắt ghép chuỗi bằng script dễ gây mất ký tự).
   - Kiểm tra kỹ cú pháp đóng mở block `{ }` và bắt buộc chạy thử/build lại microservice tương ứng để xác nhận bộ tải gRPC đọc được file (không bị lỗi `illegal token` hoặc `InvalidProtoDefinitionException`).
3. **Quy trình thay đổi RPC:**
   - 1. Khảo sát hợp đồng hiện hữu.
   - 2. Cập nhật file `.proto` (bảo đảm tương thích ngược).
   - 3. Cập nhật Server implementation.
   - 4. Cập nhật Client implementation.
   - 5. Build/Test kiểm chứng.
