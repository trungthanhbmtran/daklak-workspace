# Quy chuẩn Đặt tên (Naming Conventions)

Tài liệu này quy định chuẩn mực đặt tên (naming conventions) trên toàn bộ hệ sinh thái dự án (Backend, Frontend, Database, gRPC, REST API, Files & Folders). Mọi AI Agent và lập trình viên BẮT BUỘC phải tuân thủ nghiêm ngặt.

---

## 3.1. camelCase

Dùng `camelCase` cho:
- Biến và thuộc tính trong TypeScript/JavaScript.
- Function, method và tham số.
- NestJS DTO properties.
- Các trường của object và response JSON REST API.
- Domain object, service method, repository method và dữ liệu ứng dụng TypeScript.
- Prisma model fields nếu convention hiện có của dự án sử dụng camelCase.
- Các trường request và response ở phía frontend.

**Ví dụ:**
`userId`, `employeeName`, `createdAt`, `processInstanceId`, `getUserById()`, `submitWorkflowAction()`.

> [!WARNING]
> Không sử dụng `snake_case` cho các biến và thuộc tính TypeScript mới chỉ vì tên cột database hoặc field Protobuf sử dụng `snake_case`.

---

## 3.2. PascalCase

Dùng `PascalCase` cho:
- Class.
- Interface và type alias.
- Enum type.
- NestJS Controller, Service, Module, Guard, Pipe, Interceptor và Exception class.
- DTO class, entity class và các type/class khác theo quy ước framework.
- Protobuf message, service và RPC method theo convention của Protobuf.

**Ví dụ:**
`UserService`, `CreateUserDto`, `WorkflowController`, `ProcessInstance`, `SubmitActionRequest`.

> [!WARNING]
> Không đặt tên class bằng `snake_case` hoặc `camelCase`.

---

## 3.3. snake_case

Dùng `snake_case` cho:
- Field trong file `.proto`.
- Tên package Protobuf theo quy ước package lowercase, có thể dùng dấu chấm để phân cấp.
- Tên cột database vật lý khi phù hợp với convention của dự án.
- Tên bảng database nếu dự án hiện tại sử dụng snake_case.
- Các trường dữ liệu SQL, migration và raw SQL khi tương ứng với schema thực tế.
- Các cấu trúc dữ liệu hoặc hệ thống bên ngoài yêu cầu snake_case.

**Ví dụ:**
`user_id`, `employee_name`, `created_at`, `process_instance_id`.

> [!WARNING]
> Không đổi tên field của REST JSON hoặc thuộc tính TypeScript sang `snake_case` chỉ để đồng nhất hình thức với Protobuf hoặc database.

---

## 3.4. kebab-case

Dùng `kebab-case` cho:
- Tên file và thư mục TypeScript khi phù hợp với convention NestJS hoặc convention đã có của module.
- Tên file controller, service, module, DTO, guard và các thành phần tương tự.
- Tên file tài liệu, skill hoặc rule khi convention hiện tại sử dụng kebab-case.

**Ví dụ:**
`user.service.ts`, `create-user.dto.ts`, `workflow.controller.ts`, `naming-conventions.md`.

> [!WARNING]
> Không tự ý đổi tên hàng loạt file đang hoạt động nếu việc đổi tên không cần thiết.

---

## 3.5. UPPER_SNAKE_CASE

Dùng `UPPER_SNAKE_CASE` cho:
- Biến môi trường.
- Hằng số cấu hình toàn cục khi phù hợp với convention hiện tại.
- Enum values trong Protobuf theo convention chuẩn.
- Các mã định danh hoặc constant có quy ước này trong dự án.

**Ví dụ:**
`DATABASE_URL`, `JWT_SECRET`, `RABBITMQ_URL`, `USER_SERVICE_URL`, `PROCESS_STATUS_PENDING`.

> [!WARNING]
> Không dùng `UPPER_SNAKE_CASE` cho biến thông thường hoặc thuộc tính object TypeScript.

---

## 3.6. Quy tắc ưu tiên

Nếu một file, framework, công cụ sinh code hoặc thư viện có convention riêng:
1. **Tuân thủ convention chính thức của công cụ.**
2. **Tuân thủ contract đã được công bố và đang được sử dụng.**
3. **Tuân thủ convention ổn định của module hiện tại.**
4. **Áp dụng quy tắc chung trong `.agents/` khi không có quy định cụ thể hơn.**
5. **Không dùng quy tắc chung để phá vỡ contract hoặc làm hỏng code đang chạy.**
