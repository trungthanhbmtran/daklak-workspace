# HRM Service (NestJS + Prisma + gRPC)

Microservice quản lý **nhân viên** (Employee). Đơn vị (OrganizationUnit), Chức danh (JobTitle), Định biên (Position) đã chuyển sang **user-service**; hrm-service chỉ giữ bảng `employees` với `departmentId` và `jobTitleId` tham chiếu sang ID bên user-service (không FK).

## Công nghệ

- **NestJS 11** (microservice gRPC)
- **Prisma 7** (MySQL)
- **Proto**: `project_stc/protos/hrm/employee.proto`

## Cấu trúc

- `src/main.ts` – Khởi tạo gRPC microservice, port **50052**, package `employee`
- `src/modules/employees` – CRUD + List (lọc theo departmentId, jobTitleId, keyword, status)

## Chạy

1. **Biến môi trường** (`.env`):

   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/hrm_db"
   GRPC_URL=0.0.0.0:50052
   PROTO_PATH=../protos
   ```

2. **Migration**:

   ```bash
   npx prisma migrate deploy --schema=./prisma/schema
   ```

3. **Generate Prisma Client**:

   ```bash
   npm run prisma:generate
   ```

4. **Chạy service**:

   ```bash
   npm install
   npm run start:dev
   ```

## Tích hợp API Gateway

- **HRM (hrm-service, 50052)**: chỉ `EmployeeHandlers` – nhân viên.
- **Đơn vị / Chức danh / Định biên**: gateway cần gọi **user-service** (organization, jobtitle, staffing); không còn qua hrm-service.

## Proto

- Chỉ dùng `protos/hrm/employee.proto`. Import `common/common.proto` nếu cần (Meta pagination); đặt proto gốc tại `PROTO_PATH`.
