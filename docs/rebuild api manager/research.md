# Khảo sát và quyết định

Ngày: 06/10/2026. Bằng chứng mã nguồn E-01..E-15 ở kế hoạch chính; không phải kết quả kiểm tra production.

| Quyết định | Căn cứ | Phương án đã cân nhắc |
|---|---|---|
| Xây lại module trong topology hiện tại | Integration config và proto thực tế do user-service phục vụ; Gateway schema/UI tồn tại song song thiếu handler | Sửa UI đơn thuần; tách integration-service/DB ngay; dùng gateway chuyên dụng |
| Endpoint có method/path theo operation | Runtime đang dùng allowedMethods/allowedPaths độc lập | JSON metadata và nhân chéo allowlist không giữ được ý định |
| Publication snapshot theo global revision | ETag maxVersion-count không bao phủ mọi mutation | Timestamp polling dễ bỏ sót cùng thời điểm; maxVersion không phải global sequence |
| Mutation/audit/outbox trong một transaction | Hiện ghi lần lượt; event delivery không được đảm bảo bằng log | Emit đồng bộ trong transaction gây dependency mạng/lock; polling đơn độc thiếu thông tin publish |
| Một HTTP executor, adapter transport riêng | Proxy và report hiện lặp auth/request logic; frontend interceptor làm mất metadata | Nhiều client riêng tạo drift SSRF/PBAC; gom envelope streaming vào JSON phá semantics |
| Secret reference opaque có quyền binding | Env provider hiện đọc tên biến được cấu hình; UI/auth JSON không thống nhất | Cho UI nhập env ref tùy ý có thể truy xuất secret ngoài phạm vi |
| API nội bộ có manifest và permission metadata | UI endpoint legacy gọi route thiếu handler, không chứng minh guard động | Proxy hóa mọi controller làm mất validation/domain boundary |
| Quarantine dữ liệu thiếu cặp method/path | Danh sách rời không đủ xác định intent cũ | Backfill tích Descartes hoặc suy đoán theo thứ tự có thể mở quyền/sai endpoint |
| Capability matrix cho auth | UI có Bearer/OAuth/mTLS trong khi proxy chỉ dùng basic/apiKey | Giữ UI option rộng tạo cấu hình không thực thi được |

## Những gì chưa biết

- DB production có bản ghi/caller sử dụng GatewayService/GatewayRoute/ApiKey hay không; owner cụ thể của dữ liệu `DEFAULT`.
- Tải thực, SLO, SLA thu hồi và thời gian chấp nhận snapshot cũ; chưa có số đo hạ tầng.
- Đối tác inbound, scope dữ liệu và secret manager/CA được vận hành cho phép.
- Route Next test-auth được expose thế nào qua basePath/ingress ở từng môi trường.
- Binding thực tế `@EventPattern` trên RegistryService và broadcast tới replica; phải kiểm thử transport thật.
- Mức độ đầy đủ của policy/service scope ngoài module; chỉ giải quyết đường gọi liên quan, không hứa sửa toàn hệ thống.

Các unknown đã được chuyển thành G-01..G-05 và task kiểm chứng P0/P3/P6, không được executor đoán trong implementation.

## Nguồn tham chiếu

- [OpenAPI 3.1.1](https://spec.openapis.org/oas/v3.1.1.html): tham chiếu cấu trúc operation/schema, không khẳng định phiên bản mới nhất.
- [NestJS Validation](https://docs.nestjs.com/techniques/validation): DTO runtime và ValidationPipe.
- [OWASP SSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html): đích allowlist, DNS và redirect.
- Charter/blacklist/architecture/module docs và project skills: chuẩn kỹ thuật nội bộ; không thay bằng chứng pháp lý.
