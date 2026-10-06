# Checklist triển khai và rà soát

Không tick các mục implementation khi chỉ review kế hoạch. Reviewer ghi evidence và finding vào [acceptance-evidence.md](acceptance-evidence.md), [execution-log.md](execution-log.md). Mục bị gate cần ghi `chưa chốt`, người chịu trách nhiệm và bước bị chặn; không coi là pass.

## Gate trước triển khai

- [ ] Yêu cầu hiện hành cho phép implementation; đã đọc charter/blacklist/plan.
- [ ] T001 inventory có route/caller/schema/data owner/reference thật; E-01..E-15 được xác nhận hoặc sửa theo bằng chứng.
- [ ] Baseline tests có command/result; failures pre-existing được phân biệt.
- [ ] G-01 owner/topology, G-03 mapping dữ liệu và G-04 secret/trusted destinations được chốt cho bước phụ thuộc.
- [ ] G-02 phạm vi inbound được ghi rõ; G-05 có thresholds/SLA/retention/compatibility/rollback trước phát hành.

## Backend, schema và contract

- [ ] Một write owner; gateway không truy cập DB của service khác; domain import/publication không nằm trong UI/controller.
- [ ] HTTP DTO/gRPC typed/schema thống nhất; presence PATCH rõ; IDs/revision không mất precision.
- [ ] Proto additive, field numbers giữ nguyên; generated code không sửa tay; consumer compatibility test có bằng chứng.
- [ ] Method/path là operation pair; template normalization/precedence/overlap có test; HEAD/OPTIONS không tự mở quyền.
- [ ] List/filter/page và organization scope tại DB; index và query bound có bằng chứng, không full-load/N+1.
- [ ] Actor/service identity xác minh; không tin callerUserId/org từ browser; direct gRPC/snapshot được bảo vệ.
- [ ] PBAC/context/data scope authoritative ở service; frontend capabilities chỉ UX; internal manifest không tự bỏ guard/public.
- [ ] OCC kiểm tra trong mutation; audit/idempotency/outbox transaction atomic; không network trong transaction.
- [ ] Import preview/server hash/TTL/expectedVersion/resolutions đúng; commit retry idempotent; lỗi không success giả.
- [ ] Archive/dependency/alias giữ reference và audit; dữ liệu không đủ pair/owner vào quarantine, không đoán.

## Runtime và bảo mật

- [ ] Proxy/test/report dùng endpoint resolver và policy semantics chung; adapter stream và JSON riêng.
- [ ] TLS verify bật, internal CA hợp lệ; origin/basePath/domain/IP/port allowlist; DNS rebind/redirect/metadata/IPv6 có test.
- [ ] Auth kinds khớp capabilities; secret reference opaque có quyền; không arbitrary env ref; OAuth lifecycle có test khi bật.
- [ ] Không token/secret trong API list/detail/test/log/audit/outbox/cache/fixtures; route Next test-auth cũ không bypass.
- [ ] Request/response/schema/parse/depth/concurrency/deadline có limit; abort/pool/timer cleanup được đo.
- [ ] Write timeout có unknown outcome; không retry write khi upstream thiếu idempotency.
- [ ] Rate limit typed/algorithm mô tả đúng; principal/org/endpoint key; Redis/auth/PBAC failure không mở quyền tại module.
- [ ] Global revision/checksum/tombstone bền vững; mọi gateway nhận broadcast; polling reconcile và event duplicate/out-of-order an toàn.
- [ ] Snapshot validate/build/swap/drain/readiness/TTL đúng; update version thấp hoặc same count không bị bỏ sót.
- [ ] Disable/revoke đạt SLA nhiều replica; deny/revocation journal không bị stale snapshot/rollback đảo lại.
- [ ] Metrics/correlation/redaction/runbook có thật; delivered event không bị coi là applied mọi replica.

## Giao diện và consumer

- [ ] Feature thống nhất, code tiếng Anh/UI tiếng Việt; Shadcn/design system đúng cấu trúc, responsive/keyboard/focus.
- [ ] RSC/hydration có auth và private cache; query keys chứa scope/filter/page; tab ẩn không fetch dataset lớn.
- [ ] Mọi action có handler/contract thật; loading/empty/error/forbidden/pending/retry; không mock/fallback success.
- [ ] Import giữ form, diff/xung đột rõ; tester có status/latency/truncation/cancel; không render HTML/script nhận về.
- [ ] Partner 401/403 không refresh/logout Hub; interceptor envelope/status semantics được test.
- [ ] URL/menu cũ chuyển tiếp; report definitions/reference/schema/authorization giữ tương thích và disable enforcement.
- [ ] Inbound nếu bật: service principal riêng, key một lần/hash/expiry/rotate/revoke/scope/quota; không lẫn outbound credential.

## Migration, phát hành và đóng công việc

- [ ] Dry-run/checkpoint/reconciliation/backup restore có kết quả; không reset/drop; dữ liệu DEFAULT/quyền legacy được owner xác nhận.
- [ ] Một write owner qua adapter; không shadow write/network hai lần; không dual authority.
- [ ] Build/static/unit/contract/integration/E2E/fault/load/soak đạt thresholds theo scope; không test skipped thành pass.
- [ ] Rollback drill giữ deny/revoked keys và không khôi phục bypass; canary có điều kiện dừng/rollback.
- [ ] Zero legacy caller/reference được đo trong cửa sổ G-05 trước retire schema/seed/UI/adapter.
- [ ] Tài liệu/module/catalog/runbook và hồ sơ ATTT khớp thực trạng; không tự khẳng định cấp độ/production acceptance.
- [ ] FR/US/task/AC/evidence khớp; findings Blocking/Major đã xử lý hoặc gate đúng bước, không mở rộng phạm vi không được phép.
- [ ] Kế hoạch chính và các bản docs/plans/handoff đồng bộ; kết luận reviewer có owner/date/limitation.

## Kết luận reviewer

Chưa rà soát implementation. Khi thực hiện ghi: revision/commit được review, người review, phạm vi, findings còn mở, AC chưa đạt và quyết định cho phase tiếp theo. Không điền “đạt” khi chưa có diff và bằng chứng runtime tương ứng.
