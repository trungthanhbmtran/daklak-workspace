# Blacklist & Anti-Patterns (Nhật Ký Lỗi Đã Giải Quyết)

Tài liệu này lưu trữ danh sách **những lỗi vi phạm cấu trúc, anti-patterns và các sai lầm đã từng xảy ra** trong dự án. Mục đích của file này là để các AI Agent không bao giờ được phép lặp lại những lỗi tương tự.

BẤT CỨ KHI NÀO AI AGENT SỬA XONG MỘT BUG NGHIÊM TRỌNG DO HIỂU SAI KIẾN TRÚC, PHẢI GHI NHẬN VÀO ĐÂY!

---

## 1. Lỗi Gateway & Response
### ❌ Vi phạm: Gói Response thủ công ở Controller
- **Mô tả:** AI Developer tự ý return `{ success: true, data: result }` trong các Controller ở `api-gateway`.
- **Hậu quả:** Gây ra lỗi `data.data` lồng nhau và cấu trúc không chuẩn vì `TransformInterceptor` ở Gateway đã tự động làm việc này.
- **Giải pháp:** Chỉ return dữ liệu thô (raw data) nhận được từ gRPC.

### ❌ Vi phạm: Nuốt lỗi (Swallow Error) và trả về HTTP 200
- **Mô tả:** Catch lỗi tại Microservice rồi `return { status: "error", message: "xxx" }`.
- **Hậu quả:** Gateway không nhận diện được lỗi, trả về HTTP 200 thay vì 400/500, Frontend không bắt được exception.
- **Giải pháp:** Microservice phải dùng `throw new RpcException(...)`. API Gateway sẽ có ExceptionFilter ánh xạ tự động sang mã lỗi HTTP.

---

## 2. Lỗi gRPC & Protobuf

### ❌ Vi phạm: Gán thuộc tính vào tham số payload gRPC mà không khởi tạo & Không dùng quyền để phân phối tài nguyên
- **Mô tả:** Trong các Controller gRPC (NestJS), viết `data.currentEmployeeCode = user.employeeCode` hoặc truy cập `data.prop` một cách mù quáng mà không khởi tạo `data = data || {}`, đồng thời không sử dụng quyền của User (`permissionsFlatten`) để phân phối và giới hạn tài nguyên truy cập.
- **Nguyên nhân:** Khi Client/Gateway gửi request gRPC không có payload body hoặc body rỗng (thường gặp ở các API tra cứu GET), bộ giải mã gRPC gán `data = undefined`. Dù `@CurrentUser() user` đã được chứng thực thành công từ gRPC metadata, việc gán trực tiếp thuộc tính vào `data` (đang là undefined) sẽ ném ra ngoại lệ: `TypeError: Cannot set properties of undefined (setting 'currentEmployeeCode')`. Hơn nữa, việc chỉ gán bừa biến người dùng mà không dùng quyền để xác định đúng tài nguyên mà người dùng đó được phép truy cập (theo phòng ban, địa bàn, phạm vi quản lý) là sai lệch nguyên tắc PBAC.
- **Hậu quả:** Microservice crash ngay tại Controller, văng RpcExceptionsHandler 500, ngắt kết nối gRPC và Frontend nhận lỗi timeout / internal server error dù người dùng đã đăng nhập hợp lệ; hoặc tiềm ẩn nguy cơ rò rỉ dữ liệu ngoài thẩm quyền được phân phối.
- **Giải pháp:**
  1. Bắt buộc thêm defensive initialization ở đầu mọi handler gRPC: `data = data || {};` trước khi đọc/ghi bất kỳ thuộc tính nào.
  2. Tuyệt đối không giả định `data` luôn là một object có sẵn khi nhận từ lời gọi gRPC.
  3. **Phân phối tài nguyên theo đúng quyền:** Mọi truy xuất dữ liệu phải dùng ngữ cảnh quyền từ `user` (`user.permissionsFlatten`, `user.unitId`, `user.employeeCode`) để phân phối đúng dữ liệu mà cán bộ đó được phép truy cập (ví dụ: Chuyên viên chỉ thấy việc của mình, Trưởng phòng thấy việc trong phòng ban mình quản lý, Lãnh đạo thấy toàn bộ đơn vị).

### ❌ Vi phạm: Dùng `google.protobuf.Struct` cho JSON động
- **Mô tả:** Dùng kiểu dữ liệu `Struct` trong file `.proto` để truyền tải dữ liệu phi cấu trúc (Unstructured data).
- **Hậu quả:** Code sinh ra cồng kềnh, khó parse ở các ngôn ngữ khác nhau, ảnh hưởng cực xấu đến hiệu năng.
- **Giải pháp:** Bắt buộc dùng `string` trong file `.proto` (Kết hợp `JSON.stringify` và `JSON.parse` tại Gateway/Service).

### ❌ Vi phạm: Mảng Packages gRPC xung đột (InvalidGrpcPackageException)
- **Mô tả:** Cấu hình file `main.ts` khai báo các package thừa không tồn tại trong proto, hoặc bị trùng token Injection (DI).
- **Hậu quả:** Ứng dụng Crash khi bootstrap (Vd: lỗi `ApiManagementService not found`).
- **Giải pháp:** Khai báo đúng duy nhất mảng symbol package đã định nghĩa. (Đã sửa lỗi này vào 07/10/2026).

---

## 3. Lỗi Database & Kiến trúc
### ❌ Vi phạm: Hard-code luồng duyệt (Workflow) tại Service con
- **Mô tả:** Service `hrm-service` hoặc `document-service` tự định nghĩa trạng thái duyệt (PENDING, APPROVED) và tự viết logic đổi trạng thái.
- **Hậu quả:** Vi phạm nghiêm trọng kiến trúc tập trung, làm hệ thống Workflow không theo dõi được quá trình.
- **Giải pháp:** Phải uỷ quyền (gọi RPC) sang `workflow-service`.

### ❌ Vi phạm: Quét toàn bộ cột dữ liệu (`SELECT *`)
- **Mô tả:** Viết câu lệnh `prisma.entity.findMany()` không có khối `select: {}`.
- **Hậu quả:** Gây tắc nghẽn bộ nhớ, sập RAM Node.js khi dữ liệu lớn.
- **Giải pháp:** Bắt buộc query chỉ những trường thực sự cần.

---

## 4. Lỗi Logic Thuật Toán
### ❌ Vi phạm: Sử dụng toán tử OR (`||`) gộp nhiều điều kiện lỗi
- **Mô tả:** Viết `if (!checkA() || !checkB()) throw Error("Lỗi A hoặc B")`.
- **Hậu quả:** Không xác định được lỗi cụ thể, có nguy cơ evaluate dư thừa.
- **Giải pháp:** Áp dụng nguyên tắc **Fail-Fast** -> Check A, ném lỗi A. Check B, ném lỗi B.

### ❌ Vi phạm: N+1 Query trong mảng
- **Mô tả:** Lặp qua mảng users và gọi `await prisma.user.update()` trong vòng lặp.
- **Hậu quả:** Khóa Database, làm chậm toàn hệ thống.
- **Giải pháp:** Dùng `updateMany` với mệnh đề `in: [...]`.

---
*(AI Agent lưu ý: Thường xuyên bổ sung các case thực tế vào file này trong quá trình làm việc)*
