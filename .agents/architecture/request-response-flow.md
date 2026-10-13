# Request/Response Flow & Structure

Tài liệu này mô tả cấu trúc giao tiếp chuẩn (Envelope) giữa các thành phần trong hệ thống: từ Client (Frontend) tới API Gateway, và từ API Gateway tới các Microservices nội bộ.

## 1. Giao tiếp từ Client tới API Gateway (HTTP REST)

Toàn bộ các request từ Client (như `admin_khcn`, `portal-goverment`) tới API Gateway đều sử dụng giao thức HTTP/REST (JSON).

### Response Envelope Chuẩn
Dựa trên `TransformInterceptor` đặt tại API Gateway, mọi HTTP Response trả về cho Frontend BẮT BUỘC phải được format theo cấu trúc (Envelope) thống nhất sau đây. Các Developer Agent KHÔNG được tự ý thay đổi cấu trúc trả về ở controller của Gateway.

```json
{
  "success": true | false,
  "data": { ... } | [ ... ],
  "meta": {
    "pagination": {
      "total": 100,
      "page": 1,
      "pageSize": 20,
      "totalPages": 5
    }
  },
  "timestamp": "2026-10-08T00:00:00.000Z",
  "message": "Optional message string"
}
```

**Quy tắc xử lý của Gateway:**
- Tự động dọn dẹp các giá trị `null` / `undefined` (Deep Clean) trước khi trả về Frontend.
- Tự động nhận diện request dạng danh sách (List Request) dựa vào method `GET`, param `page/limit`, hoặc cấu trúc URL. Nếu là List Request nhưng data trống, sẽ trả về `data: []` thay vì `data: {}`.
- Đối với danh sách, tự động chuẩn hóa object `meta.pagination`.

## 2. Giao tiếp từ API Gateway tới Microservices (gRPC)

Bên dưới Gateway, giao tiếp nội bộ giữa Gateway và các Microservices (hoặc giữa các Microservices với nhau) hoàn toàn sử dụng **gRPC**.

### Cấu trúc gRPC Request/Response
- **Source of Truth**: Nằm tại thư mục `shared/protos/`.
- Dữ liệu truyền tải là dạng nhị phân theo chuẩn Protobuf, không có vỏ bọc (envelope) `success` hay `timestamp` như HTTP REST, mà được định nghĩa chính xác theo từng thông điệp (Message) trong file `.proto`.
- Khi API Gateway nhận được dữ liệu trả về từ Microservice qua gRPC (dưới dạng JS Object tương ứng với Proto Message), Gateway sẽ tự động đưa dữ liệu này qua `TransformInterceptor` để bọc lại thành JSON Envelope chuẩn trước khi trả về cho Client.

### Xử lý Lỗi (Error Handling)
- Các Microservices phải throw lỗi qua RpcException (hoặc các cơ chế gRPC Error chuẩn).
- API Gateway sẽ đón các Exception này qua ExceptionFilter (như `AllExceptionsFilter` hoặc `HttpExceptionFilter`) và ánh xạ (map) mã lỗi gRPC sang mã lỗi HTTP (400, 401, 403, 404, 500...) kèm theo cấu trúc báo lỗi thống nhất cho Client:
```json
{
  "success": false,
  "message": "Mô tả lỗi từ Microservice",
  "statusCode": 400,
  "timestamp": "..."
}
```

## 3. Quy Tắc Chống Chuyển Đổi Dư Thừa (Anti-Redundancy Rules)

Để tránh tình trạng code cồng kềnh và tốn tài nguyên chuyển đổi không cần thiết (redundant formatting/mapping), các Agent và Developer phải tuyệt đối tuân thủ:

### Tại API Gateway:
- **KHÔNG BỌC DỮ LIỆU BẰNG TAY**: Tại Controller, chỉ cần `return result` thô nhận được từ gRPC. Tuyệt đối KHÔNG viết mã tự bọc kiểu `return { success: true, data: result }`. Nếu làm vậy, Interceptor sẽ tiếp tục bọc thêm một lớp nữa dẫn đến lỗi `data.data` lồng nhau.
- **KHÔNG XÓA NULL/UNDEFINED BẰNG TAY**: `TransformInterceptor` đã có hàm `deepClean` đệ quy tự động dọn dẹp các trường rỗng. Không viết thêm các hàm utility thừa thãi trong Controller để xử lý việc này.

### Tại Microservices:
- **TRẢ VỀ ĐÚNG PROTO**: Chỉ trả về đúng các thuộc tính (properties) đã định nghĩa trong file `.proto`. Không tự ý thêm vỏ bọc "meta" hay "success" ở tầng Microservice, vì dữ liệu đi qua gRPC là nhị phân (binary payload).
- **XỬ LÝ DỮ LIỆU PHI CẤU TRÚC (Unstructured Data)**: Nếu cần truyền tải dữ liệu JSON động (dynamic object, config), **BẮT BUỘC dùng kiểu `string`** trong `.proto` (rồi dùng `JSON.stringify` / `JSON.parse` tại Gateway/Service để chuyển đổi). **Tuyệt đối KHÔNG sử dụng `google.protobuf.Struct`** vì nó cồng kềnh, khó parse và làm phức tạp hệ thống.
- **NGUYÊN TẮC FAIL-FAST (Xử lý lỗi từng bước)**: Khi validate logic hoặc phân quyền, phải kiểm tra từng điều kiện và ném lỗi (throw error) ngay lập tức khi sai. KHÔNG dùng toán tử `||` để gộp nhiều điều kiện phức tạp (VD: `if (!A || !B || !C)`) khiến chương trình phải đánh giá (evaluate) dư thừa. Trả về đúng thông báo lỗi cho điều kiện đầu tiên bị vi phạm.
- **KHÔNG BẮT LỖI RỒI TRẢ VỀ HTTP 200**: Nếu có lỗi nghiệp vụ (Business Error), phải throw `RpcException` ngay lập tức. KHÔNG ĐƯỢC catch lỗi rồi `return { status: "error", message: "..." }` qua gRPC. Việc map lỗi gRPC sang HTTP (400, 500) là trách nhiệm tự động của Gateway Exception Filter.

### Tại Frontend (Client):
- **TẬP TRUNG VÀO `response.data`**: Dữ liệu thực sự luôn nằm ở `response.data`. Frontend không cần viết thêm các Adapter hay Interceptor phức tạp để đoán cấu trúc trả về.
- **TẬN DỤNG `meta.pagination` CHUẨN**: Mọi danh sách phân trang từ Gateway đều đã được chuẩn hoá với các thuộc tính: `total`, `page`, `pageSize`, `totalPages`. Frontend chỉ việc bám vào giao thức này để bind thẳng vào Table component mà không cần tự tính toán lại các tham số dư thừa.
