# Kế hoạch sửa lỗi: Authentication unavailable or invalid

## 1. Phân tích nguyên nhân gốc rễ (Root Cause Analysis)

Lỗi `Authentication unavailable or invalid` (HTTP 500) xuất hiện khi Next.js gọi API `GET /api/v1/admin/hrm/tasks`. Quá trình lỗi diễn ra như sau:
1. **Mất khóa công khai:** API Gateway xác thực phiên của người dùng thành công và tạo một JWT nội bộ (Delegation Token) ký bằng khóa RSA để gửi cho `hrm-service` qua gRPC metadata. Tuy nhiên, biến môi trường `JWT_PUBLIC_KEY` bị thiếu trong file `.env`. Do đó, `api-gateway` tự tạo một cặp khóa tạm thời (ephemeral keys) trên RAM, trong khi `hrm-service` lại đọc biến `JWT_PUBLIC_KEY` rỗng từ `.env`.
2. **Xác thực nội bộ thất bại ngay lập tức:** Khi `hrm-service` nhận token, hàm `verifyGatewayContextToken` thất bại ngay lập tức vì không có Public Key (chuỗi `pem` bị rỗng).
3. **Bắt lỗi sai (Error Mapping):** `hrm-service` trả về lỗi gRPC với mã `16 (UNAUTHENTICATED)`. Tuy nhiên, hàm `handleRpcError` bên trong `api-gateway` (`tasks.service.ts`) không xử lý mã `16`, dẫn đến việc nó tự động chuyển thành `InternalServerErrorException` (HTTP 500) thay vì HTTP 401. 
4. **Nút thắt cổ chai hệ thống (Bottleneck):** Kể cả khi có Public Key, `GatewayContextService` trong các microservice (như `hrm-service`) vẫn gọi ngược lại `user-service` qua gRPC (`GetAuthState`) để xác thực token nội bộ. Điều này là dư thừa (vì token nội bộ chỉ sống 60 giây và đã được Gateway xác thực) và dễ gây lỗi timeout nếu `user-service` khởi động lại (do kết nối gRPC bị kẹt trạng thái `TRANSIENT_FAILURE`).

## 2. Các bước triển khai (Implementation Steps)

**Bước 1: Cấu hình RSA Key Pair cố định**
- Tạo một cặp khóa RSA 2048-bit.
- Thêm `JWT_PRIVATE_KEY` và `JWT_PUBLIC_KEY` vào file `.env` và `.env.production`. Điều này giúp `api-gateway` và tất cả các microservices có chung một khóa để ký và xác minh token.

**Bước 2: Xử lý Exception Mapping tại API Gateway**
- Sửa hàm `handleRpcError` trong `apps/api-gateway/src/modules/hrm/tasks.service.ts` (và các file tương tự nếu có).
- Bổ sung xử lý: `if (code === 16) throw new UnauthorizedException(message);`
- Bổ sung xử lý: `if (code === 7) throw new ForbiddenException(message);`
- Điều này đảm bảo frontend nhận đúng mã HTTP 401/403 để chuyển hướng người dùng về trang đăng nhập thay vì báo lỗi 500.

**Bước 3: Tối ưu kiến trúc xác thực nội bộ (GatewayContext)**
- Sửa file `shared/security/gateway-context.ts` tại hàm `validateGatewayContext`.
- Bổ sung logic: Nếu token có `aud === AUTH_JWT.internalAudience` (tức là token ủy quyền nội bộ ngắn hạn 60s từ Gateway), thì bỏ qua bước gọi gRPC `getState` và Redis `getRedis`.
- Chỉ xác thực chữ ký (Signature), `exp`, `iss` và trả về luôn `GatewayContext`. Điều này giúp cắt đứt vòng lặp gọi chéo giữa các microservice, tăng hiệu năng và độ ổn định của hệ thống lên gấp nhiều lần.

## Phản biện sau khi lập kế hoạch (Critique)

| Mức độ | Vấn đề/giả định bị phản biện | Ảnh hưởng | Điều chỉnh trong kế hoạch hoặc lý do giữ nguyên |
|---|---|---|---|
| **Major** | Sửa `validateGatewayContext` bỏ qua Redis check có gây lổ hổng bảo mật không? | Trễ thời gian thu hồi quyền truy cập (Revocation) | **Giữ nguyên kế hoạch.** Token nội bộ (`internalAudience`) được API Gateway sinh ra và chỉ có hiệu lực đúng 60 giây. API Gateway đã kiểm tra Redis Denylist trước khi sinh ra token này. Việc tin tưởng token 60s hoàn toàn đạt chuẩn bảo mật Microservices và loại bỏ Single Point of Failure (SPOF) cho `user-service`. |
| **Minor** | Hàm `handleRpcError` có thể bị duplicate ở nhiều service trong `api-gateway`. | Rác code, dễ bỏ sót. | **Điều chỉnh:** Sẽ dùng IDE search toàn bộ `handleRpcError` trong thư mục `apps/api-gateway/` để sửa đồng loạt, thay vì chỉ sửa ở `tasks.service.ts`. |
| **Minor** | Cập nhật `.env` nhưng quên cập nhật trên server production thật. | Lỗi vẫn xảy ra trên Production. | Ghi chú lại trong Báo cáo thực thi để đội ngũ DevOps cập nhật secret trên môi trường thật (Docker Swarm/K8s). |

### Kết luận phản biện
- **Các gate cần đạt trước khi triển khai:** Chạy thử sinh RSA key và kiểm tra gRPC gọi thành công từ Gateway sang HRM.
- **Quyết định còn mở và ai cần chốt:** Người triển khai (DevOps) cần cấu hình hai biến `JWT_PRIVATE_KEY` và `JWT_PUBLIC_KEY` vào hệ thống quản lý secret trên Production. Kế hoạch này đã an toàn để AI thực thi trên workspace nội bộ.
