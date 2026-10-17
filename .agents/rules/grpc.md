# gRPC & Protobuf Standards (Quản lý Hợp đồng Protobuf)

`shared/protos` là nguồn hợp đồng Protobuf dùng chung duy nhất của toàn bộ hệ thống.

---

## 1. Nguyên tắc Cốt lõi & Quản lý Hợp đồng Protobuf
1. **Source of Truth duy nhất:** Thư mục `shared/protos` (hoặc `packages/proto`) là nguồn chân lý duy nhất cho mọi gRPC contracts. Không tự tạo file `.proto` trùng lặp trong nội bộ service.
2. **Nguyên tắc Additive & Tương thích ngược:**
   - Giữ nguyên ý nghĩa, kiểu dữ liệu và ngữ nghĩa của contract.
   - Đánh giá tính tương thích ngược và tác động đến mọi consumer trước khi thay đổi contract.
   - Chỉ sửa hoặc tạo proto khi nghiệp vụ hoặc contract thực sự cần thay đổi.
   - Không đổi kiểu field, số field hoặc ý nghĩa field một cách tùy tiện.
3. **Quy tắc Quản lý Field Number:**
   - Sử dụng field number đúng quy tắc Protobuf (số nguyên dương tăng dần).
   - **Tuyệt đối KHÔNG tái sử dụng field number đã bị xóa.**
   - Nếu cần loại bỏ field, sử dụng `reserved` phù hợp (ví dụ: `reserved 4, 15 to 20; reserved "foo", "bar";`).
4. **Code Generation & Loader Compliance:**
   - Không sửa code generated bằng tay nếu công cụ sinh code có thể tạo lại từ proto.
   - Phải sử dụng đúng proto hiện có và đúng cấu hình loader/code generator của repository (lưu ý cấu hình `keepCase: false` của NestJS `@grpc/proto-loader` tự động map snake_case sang camelCase khi inject vào handler).
5. **Quản lý sửa đổi `.proto` an toàn:**
   - BẮT BUỘC sử dụng công cụ an toàn (ghi đè toàn bộ hoặc multi_replace, tuyệt đối KHÔNG cắt ghép chuỗi bằng script dễ gây mất ký tự).
   - Kiểm tra kỹ cú pháp đóng mở block `{ }` và bắt buộc chạy thử/build lại microservice tương ứng để xác nhận bộ tải gRPC đọc được file (không bị lỗi `illegal token` hoặc `InvalidProtoDefinitionException`).

---

## 2. Quy chuẩn Đặt tên trong Protobuf (Protobuf Naming Conventions)
Tuân thủ chi tiết [`.agents/rules/naming-conventions.md`](naming-conventions.md):
- **Message & Enum type:** Sử dụng `PascalCase`.
- **Field trong `.proto`:** Sử dụng `snake_case`.
- **RPC method & Service:** Sử dụng `PascalCase`.
- **Enum values:** Sử dụng `UPPER_SNAKE_CASE`, có prefix phù hợp để tránh trùng tên (ví dụ: `USER_STATUS_ACTIVE`).
- **Package name:** `lowercase` có thể dùng dấu chấm để phân cấp (ví dụ: `user.v1`, `daklak.document`).
- **Lưu ý:** Tuyệt đối không đổi tên field của REST JSON hoặc thuộc tính TypeScript sang `snake_case` chỉ để đồng nhất hình thức với `.proto`.

---

## 3. Ví dụ Minh họa Chuẩn mực Protobuf
```protobuf
syntax = "proto3";

package user.v1;

service UserService {
  rpc GetUserById(GetUserByIdRequest)
      returns (GetUserByIdResponse);
}

message GetUserByIdRequest {
  string user_id = 1;
}

message GetUserByIdResponse {
  string user_id = 1;
  string full_name = 2;
  string created_at = 3;
}
```
> [!NOTE]
> Ví dụ trên chỉ minh họa convention, không phải yêu cầu tạo thêm `user.v1` hoặc thay đổi contract hiện có. Phải kiểm tra chính xác package, message và service thực tế trước khi sửa code.

---

## 4. Quy trình Thay đổi RPC (5 Bước Chuẩn)
1. Khảo sát hợp đồng hiện hữu trong `shared/protos/`.
2. Cập nhật file `.proto` (bảo đảm tương thích ngược, không đổi field number cũ, dùng `reserved` nếu xóa).
3. Cập nhật Server implementation (Microservice).
4. Cập nhật Client implementation (API Gateway hoặc consumer service).
5. Build/Test kiểm chứng (`npx tsc --noEmit` / unit test).
