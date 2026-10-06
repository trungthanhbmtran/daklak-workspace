# Hướng dẫn kiểm chứng khi triển khai

Trạng thái: các command dưới đây là hướng dẫn tương lai, **chưa chạy trong lượt lập kế hoạch**. Không cần khởi động production để nghiệm thu tài liệu.

## Điều kiện trước khi chạy

- Đọc kế hoạch/contract/tasks; dùng checkout/nhánh thực thi theo quy trình repository, không ghi đè việc khác.
- Node/runtime/dependency hiện hữu; kiểm tra scripts và generated type toolchain sau T005. Không tự nâng package/provider để làm test chạy.
- Môi trường dev/staging riêng: MySQL/Redis/RabbitMQ, ít nhất 2 gateway replica, fake HTTPS upstream và CA thử được cấu hình đúng; không `rejectUnauthorized:false`.
- Fixtures: hai organization, actor có quyền quản trị, actor chỉ xem, actor không quyền, service identity registry; chỉ dùng secret giả. Mô hình grant theo PBAC.
- Backup/bản sao dữ liệu cho rehearsal và approved limits G-05; không dump secret/đọc `.env` vào log hoặc commit.

## Lệnh nền theo script hiện tại

Chạy từ workspace root; build có thể generate client, nên kiểm tra git diff generated output theo kế hoạch.

```powershell
npm --prefix apps/user-service run build
npm --prefix apps/api-gateway run build
npm --prefix apps/admin_khcn run build
npm --prefix apps/api-gateway run test -- --runInBand --testPathPatterns='modules/integration|dynamic-proxy.middleware|modules/reports/report-source'
npm --prefix apps/user-service run test -- --runInBand --testPathPatterns='integration-config|api-management'
npm --prefix apps/admin_khcn run lint -- features/api-management
```

Kiểm tra phiên bản Jest thực tế/flag trước chạy; nếu khác dùng flag có hỗ trợ và ghi command thực. Target tests mới phải tồn tại; “no tests found” không là pass. Test suite toàn auth chỉ mở rộng khi boundary session/context thay đổi hoặc baseline có failure liên quan.

Backend lint scripts hiện có `--fix`; kiểm tra read-only bằng gọi ESLint local từ workdir từng app với `npx --no-install eslint <changed paths>` và không truyền `--fix`. Type checks dùng tsconfig/package scripts hiện hữu; ghi chính xác failures mới/pre-existing. Không gọi lint sửa toàn repo trong tác vụ chỉ review.

Các test integration/gRPC/broker/browser/load mới chưa có runner contract; T002/T005/T025 phải thêm cấu hình/command đúng vào đây trước nghiệm thu. Dùng skill playwright-cli cho E2E; không cài bộ runner mới nếu môi trường đã có công cụ phù hợp mà chưa đánh giá.

## Các tình huống chạy xuyên suốt

1. **CRUD/publish/disable**: tạo connection nháp external HTTPS + GET /a + POST /b. Publish → thấy desired/active revision cả 2 gateway. GET /a và POST /b thành công; POST /a, GET /b bị deny. Đổi tên không đổi code/reference; tắt chặn request mới theo SLA.
2. **PBAC/IDOR**: đổi id connection/endpoint/preview/key/audit của organization khác; giả callerUserId/org trong REST/body và direct gRPC. Kết quả không đọc/mutate/gọi mạng; list không lộ nguồn ngoài scope. Snapshot chỉ service identity được phép.
3. **Import**: OpenAPI YAML/JSON, Swagger 2, Postman có nested folders/variables, cURL fixture; templates/query/body/auth kind unsupported có warning. Preview conflict đúng connection+method+path. Overwrite/skip thật; commit lại cùng key cùng kết quả; key payload khác hoặc version đích đổi → conflict. Script/remote `$ref` không chạy/fetch.
4. **Secret/auth**: credential binding approved/forbidden; none/basic/apiKey/Bearer/OAuth supported kinds. Không secret/token trong HTTP list/detail/test/SSR cache/outbox/audit/log. OAuth endpoint sai TLS/DNS/redirect bị chặn; token refresh đồng thời không stampede; token endpoint outage trả lỗi rõ.
5. **Test response**: fake partner trả 200/204/400/401/403/500; status/body/latency/truncation hiển thị đúng; partner 401/403 không refresh/logout Hub. Write upstream commit rồi socket timeout → UNKNOWN_OUTCOME, không tự replay.
6. **Concurrency/atomicity**: hai update cùng expectedVersion; một thành công, một conflict. Inject lỗi audit/outbox trước commit → toàn mutation rollback. Crash worker sau publish trước mark delivered → duplicate event không tạo mutation/revision trùng.
7. **Registry**: connection A version 10, B version 1; sửa B 1→2 vẫn tạo revision mới. Delete/add giữ cùng count vẫn đổi checksum/revision. Snapshot sai schema/old revision không thay bản tốt; event mất có polling converge; broadcast cập nhật cả replica. TTL vượt mức chặn module; deny/revoke không bị stale cache bỏ qua.
8. **Network/stream**: loopback/metadata/private external/IPv4-mapped IPv6/rebinding/multi DNS/redirect/port nội bộ không allowlist/path encoded traversal. Tất cả đích cấm không nhận request. Large request/response/depth/slow stream/client abort đúng limit, socket/timer cleanup. Streaming/proxy không đi qua JSON envelope.
9. **Quota/dependency failures**: đạt maxRequests đúng windowSeconds và Retry-After; Redis mất fail closed tại module. PBAC/auth state unavailable không cấp quyền. Broken upstream mở breaker/timeout đúng và phục hồi; không retry write mặc định.
10. **Frontend**: loading/empty/error/forbidden/pending; retry giữ form; query/filter/page/tab trong URL; keyboard/focus; 360/768/1280 px; test cancel; dependency trước archive; old routes/menu chuyển tiếp. Không mock success/dataset hoặc full-load client để giả phân trang.
11. **Report consumer**: định nghĩa cũ upstream name/path và định nghĩa mới ID/revision; đối chiếu dataset fixture và data scope; connection disabled/permission revoked không fetch tiếp. Migration reference tránh gọi viết upstream hoặc shadow request hai lần.
12. **Inbound nếu G-02 chốt**: issue chỉ một lần, list metadata không key, hash DB, expired/revoked/rotated deny theo SLA; partner chỉ đúng endpoint/organization/quota, không impersonate actor Hub.
13. **Migration/rollback**: dry-run/checkpoint rerun không tạo trùng; thiếu method/path pair vào quarantine; legacy organization DEFAULT không thành global. Counts/checksums/references/policy mappings khớp. Rollback safe adapter giữ deny/revoked keys và không bật TLS bypass.

## Đo tải và evidence

Mốc staging đề xuất trong kế hoạch chính: 1.000 connections × 100 endpoints, trang 50 records, concurrency 50 và soak 30 phút. Dùng fake upstream có latency cố định, capture baseline và sau thay đổi: p95 list/proxy overhead, query count, heap/CPU/socket/event lag/revision convergence. Threshold production được chốt G-05, không dùng máy dev hay mocked microbenchmark thay SLO.

Evidence cần command, fixture/version, môi trường, thời điểm, actor scope, expected/actual, reviewer và limitation; log không chứa secret. Chỉ đánh dấu AC đạt khi scenario đã chạy và artifact kiểm chứng tồn tại.

Release gate: tất cả AC theo scope đạt; migrations/restore/rollback được diễn tập; G-03/G-05 và secret/inbound gate liên quan đã chốt; không còn critical regression. Thiếu môi trường/test runner thì ghi chưa kiểm chứng và giữ gate phát hành, không biến test skipped thành pass.
