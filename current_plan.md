# Kế hoạch: Giữ và hiển thị metadata khi import API

- [x] Rà soát parser, import session, bước commit, schema endpoint và giao diện endpoint.
- [x] Truyền headers/query/path params/body qua trường `metadataJson` của gRPC và chuẩn hóa chúng vào `schema` endpoint.
- [x] Lưu đầy đủ metadata khi tạo endpoint mới và khi ghi đè endpoint hiện có.
- [x] Hiển thị số lượng headers/params/body trong danh sách; cho phép xem và sửa giá trị đã import.
- [x] Chuẩn hóa schema endpoint thành JSON string khi trả connection qua gRPC để client đọc được metadata.
- [x] Sửa khóa phân giải trùng endpoint với path chứa dấu `:`; đọc query của Postman URL dạng chuỗi.
- [x] Hỗ trợ body/formData của Swagger 2; giữ body falsy và trạng thái enabled khi sửa endpoint.
- [x] Build API Gateway/user-service và typecheck frontend thành công; cập nhật roadmap.
