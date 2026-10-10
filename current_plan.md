# Kế hoạch: Giữ và hiển thị metadata khi import API

- [x] Rà soát parser, import session, bước commit, schema endpoint và giao diện endpoint.
- [x] Truyền headers/query/path params/body qua trường `metadataJson` của gRPC và chuẩn hóa chúng vào `schema` endpoint.
- [x] Lưu đầy đủ metadata khi tạo endpoint mới và khi ghi đè endpoint hiện có.
- [x] Hiển thị số lượng headers/params/body trong danh sách; cho phép xem và sửa giá trị đã import.
- [x] Cập nhật roadmap; kiểm tra parser với cURL mẫu, proto-loader và build/typecheck frontend, API Gateway, user-service.
