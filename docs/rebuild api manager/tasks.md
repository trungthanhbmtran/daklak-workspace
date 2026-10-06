# Tác vụ triển khai theo thứ tự

Tất cả checkbox đang mở: lượt này chỉ lập kế hoạch. Các task dùng service owner/topology và gate ở [kế hoạch chính](plan.md). Không tự đổi thứ tự/mở rộng phạm vi; khi gate thiếu thông tin, dừng bước phụ thuộc và báo phần có thể tiếp tục.

Mỗi task hoàn thành phải ghi commit/file, command/test thực chạy, kết quả và limitation vào execution log. Owner là trách nhiệm công việc, không phải chỉ định model/agent. Không có yêu cầu chạy executor trong lượt này.

## P0 — Inventory, baseline và containment

- [ ] T001 — **Backend + frontend + DBA**: kiểm kê module/caller/route/seed/DB data được phép, gRPC binding, ingress/basePath, public/private endpoints và report references. Vùng: gateway integration/proxy/Prisma, user-service integration-config, shared/protos, frontend ba feature, nginx/deploy. Đầu ra: inventory có E-01..E-15 xác nhận hoặc chỉnh lại; số liệu ownership không suy đoán. AC-01/12/13. Không có dependency.
- [ ] T002 — **QA + backend**: từ T001 tạo fixture không chứa secret và baseline regression cho session, SSRF/path/header, import, report source. Chạy targeted tests hiện hữu và ghi failures pre-existing riêng. Đầu ra: có baseline tái lập và biết những test đang thiếu; không dùng benchmark mocks làm SLO. AC-02/03/07/12.
- [ ] T003 — **Backend + frontend**: từ T001/T002 chặn/remove đường Next test-auth trực tiếp, TLS bypass và output token; UI cũ thể hiện chức năng tạm không khả dụng hoặc gọi adapter an toàn đã có. Không tạo endpoint nhận arbitrary URL. Kiểm thử request không quyền/direct URL không gọi mạng; login/session không hồi quy. AC-07/08/10.

## P1 — Chốt contract và schema

- [ ] T004 — **Kiến trúc + chủ sản phẩm + ATTT/ops/DBA**: chốt G-01, G-03, G-04 và phần G-05 liên quan test/limits; ghi ADR owner/topology/secret/permission mapping. G-02 có thể chưa chốt nếu inbound chưa triển khai. T001 là dependency. Đầu ra: người chốt, scope, deny/revoke design, production gates rõ; không tự cấp quyền/global.
- [ ] T005 — **Backend contract**: từ T004 định nghĩa HTTP schema và proto v2 typed, version/presence/errors, generate toolchain và transport tests. Vùng: `shared/protos/integration/api-management.proto`, users/integration.proto adapter, gateway global-client/services, user-service main/module, public API schema. AC-01/05/10; consumer cũ không mất field/numbers.
- [ ] T006 — **Backend/DBA**: từ T004/T005 tạo migration additive cho model/index/revision/outbox/import/idempotency/credential metadata, theo Prisma config/provider/adapter hiện hữu. Tạo dry-run migration mapping/quarantine, seed policy/fixtures không secret. Vùng: user-service prisma/schema/migrations/seeds và migration tooling. AC-03/13; không chạy reset/drop; unique code/endpoint giữ invariant khi archive.

## P2 — Backend quản trị mới

- [ ] T007 — **Backend**: từ T005/T006 triển khai actor/service-context validation và PBAC/scope tại REST/gRPC owner, paginated list/detail/capabilities, filter DB theo tổ chức. Vùng: integration-config/api-management module, gateway controller/DTO. AC-02; spoof callerUserId/organization/direct gRPC đều bị từ chối.
- [ ] T008 — **Backend**: từ T007 triển khai CRUD draft connection/endpoint, validation schema/path/enum và OCC, archive/dependency rule. Mutation + audit + idempotency result transaction atomic, redact. AC-01/03/05; test update race, transaction rollback, IDOR. Không network trong transaction.
- [ ] T009 — **Backend**: từ T008 triển khai validate/publish/disable, immutable revision/counter, tombstone và deny/revocation journal bền vững. Revision không giảm khi rollback; emergency deny có transport/freshness enforce rõ. AC-05/06/13; disable không bỏ lọt request mới quá SLA.
- [ ] T010 — **Backend**: từ T008/T009 triển khai importer server trong owner module và gateway upload adapter; version/format support matrix, parser budget, preview session/hash/diff/resolutions, atomic commit/idempotency/expiry. Vùng: import service/DTO/controller cũ và use cases mới. AC-04/07/08; OVERWRITE/SKIP thật; không chạy scripts hoặc fetch remote refs; lỗi giữ success=false/status phù hợp.
- [ ] T011 — **Backend + ops**: từ T004/T007/T008 triển khai credential binding approved/opaque, least-data DTO/audit, provenance và rotation semantics. Không cho tham chiếu env arbitrary. Raw secret UI chỉ có khi secret backend/write-only flow được chốt và test. AC-08; list/detail/log/cache không có secret.
- [ ] T012 — **Backend + QA**: từ T005/T007 tạo internal-operation manifest/coverage từ route đang deploy, stable ID/resource/action/public markers và list có scope. Vùng: route discovery/build tooling, gateway decorators/controllers metadata thuộc module, PBAC resource/action registry. AC-01/02; cấu hình metadata không bỏ guard. Permission mapping dynamic nếu cần phải có ADR/guard runtime và test riêng trước bật.

## P3 — Đồng bộ và runtime

- [ ] T013 — **Backend + ops**: từ T009 tạo outbox worker publish confirm/retry/lease/dead-letter, broadcast mỗi gateway replica, snapshot typed revision/checksum và reconcile polling. Vùng: user-service worker/module, gateway registry/event controller, RabbitMQ deploy config. AC-05/06; test crash/duplicate/out-of-order/lost event. Event transport phải thử thật, không chỉ mocks.
- [ ] T014 — **Gateway backend**: từ T013 triển khai registry validate/build/swap, TTL/degraded/readiness đúng, deny lookup/freshness, pool drain/concurrency/global socket budget, timer/shutdown. AC-06/09; test maxVersion collision, snapshot parse/build fail, disable nhiều replica, slow request đang drain. Snapshot lớn bounded/chunk khi cần theo benchmark.
- [ ] T015 — **Gateway backend**: từ T007/T011/T014 xây shared HTTP executor, endpoint template resolver exact method/path/precedence, origin/basePath, allowlist domain/IP/port, DNS/TLS/redirect/header/body limit/abort/deadline. Vùng: integration executor/upstream-network/upstream-access và middleware. AC-02/03/07/09; internal cũng phải approved destination, không arbitrary private IP.
- [ ] T016 — **Gateway backend**: từ T015 auth adapters none/basic/apiKey/Bearer và OAuth client credentials khi G-04 yêu cầu; token cache TTL/single-flight/clock skew, no token output/log. mTLS có gate cert/CA lifecycle. Chuẩn quota fixed window typed, module fail-closed Redis; cache tắt default. AC-08/09; dependency failure không mở quyền/retry write.
- [ ] T017 — **Gateway + report backend**: từ T015/T016 đưa proxy, endpoint test, auth test và report-source vào chung executor/authorization semantics; giữ adapter stream/test JSON riêng. Vùng: dynamic-proxy, integration controller/service, report-source và report/table contracts consumer. AC-02/09/10/12; test partner 401 không làm expired Hub; write timeout UNKNOWN_OUTCOME.
- [ ] T018 — **Ops + backend**: từ T013..T017 instrument runtime status/metrics/audit endpoints, correlation và redaction, active/desired revision theo replica, outbox lag/breaker/quota; viết runbook ban đầu. AC-06/08/09; không label metrics chứa raw URL/token/user data; không coi delivered event là applied mọi replica.

## P4 — Giao diện và compatibility

- [ ] T019 — **Frontend**: từ T005/T007 tạo `features/api-management` typed API client/query keys/forms/capability models; server fetch/hydration có actor context, private cache, error semantics. Vùng: feature mới, page/layout, module transport adapter. AC-01/02/10; response envelope một lần, không res.status giả.
- [ ] T020 — **Frontend**: từ T008/T009/T012/T018/T019 xây tổng quan/list/detail/tabs/endpoints/internal catalog/runtime/audit, server pagination/filter URL, draft/published/dependency UX. AC-01/11; action guards dựa backend capabilities; errors không giả empty/success/zero.
- [ ] T021 — **Frontend**: từ T010/T011/T017/T019 xây import wizard, credential binding và endpoint tester; auth capabilities thật, schema-driven fields, abort/truncation/unknown outcome/unsaved changes, keyboard/mobile. AC-04/08/10/11; không nested dialogs, không secret/token local cache.
- [ ] T022 — **Frontend + backend**: từ T017/T020/T021 migrate menu/resource routes, redirect trang integration/gateway/endpoints cũ; legacy command adapter vào owner v2; report stable-ID aliases/reference migration. Vùng: ba feature cũ, API ENDPOINT docs, report sources/shared reporting; không sửa unrelated domain. AC-01/12; tiêu chí: các URL/reference cũ có kết quả đúng hoặc thông báo migration rõ, không 404 ngầm/bypass.

## P5 — Inbound có điều kiện

- [ ] T023 — **Chủ sản phẩm + chủ dữ liệu + ATTT/ops**: chốt G-02 endpoint/data scope/partner identity, quota, expiry/rotation/revoke SLA và ownership. Nếu inbound không thuộc baseline, ghi rõ chưa triển khai, không tick task vì UI bị ẩn. Dependency T004, trước T024.
- [ ] T024 — **Backend + frontend**: chỉ sau T023 và T015..T022, triển khai partner principal/hashed one-time key/issue/list metadata/rotate/revoke/scoped authentication và UI thực. Biên partner riêng, không cookie/browser impersonation. AC-14/02/08/09; retire plaintext legacy key sau plan rotation có xác nhận.

## P6 — Rehearsal và phát hành

- [ ] T025 — **QA + backend + frontend + ops**: từ T003..T022 và T024 nếu inbound thuộc release, chạy [quickstart.md](quickstart.md): build/static/unit/contract/integration/E2E/security/fault/load/soak. G-05 chốt thresholds trước đánh giá pass. AC-01..AC-14 theo scope; failures phải xử lý và test lại phần liên quan.
- [ ] T026 — **DBA + backend + ops**: từ T006/T022/T025 chạy migration dry-run/reconcile/quarantine trên bản sao dữ liệu được phép; kiểm chứng backup restore và rollback drill. Chặn khi G-03 chưa xác nhận ownership/cặp endpoint. AC-13; counts/checksums/dependency/policy không mở rộng; rollback giữ deny.
- [ ] T027 — **Ops + chủ module + QA**: từ T025/T026 thực hiện canary/staged cutover theo môi trường được duyệt; một write owner, giám sát SLO/revision/deny/report compatibility; feature flag rollback đã thử. Đầu ra release evidence, người chấp nhận và limitation; không deploy production chỉ vì unit test pass.

## P7 — Dọn legacy và đóng công việc

- [ ] T028 — **Backend + frontend + DBA**: sau T027 và hết compatibility window G-05, chứng minh zero legacy traffic/reference; archive rồi retire adapter/ba feature cũ/Gateway schemas/seed nếu không có consumer. Không xóa bảng/field trước dependency audit. AC-01/12/13; generated artifacts chỉ regenerate, không sửa tay.
- [ ] T029 — **Kiến trúc + ops + ATTT + chủ module**: từ T028 cập nhật docs/modules, API catalog, deployment/backup/incident/rotation runbook và hồ sơ ATTT theo skill/phạm vi được duyệt, sơ đồ reflecting thực trạng. Handover review, retention/replay procedure và evidence matrix; không tuyên bố cấp độ pháp lý. Roadmap chỉ cập nhật theo bằng chứng thật.

## Dependency và cách chia lô

Đường chính: T001 → T002/T003 → T004 → T005/T006 → T007 → T008/T009 → T013/T014 → T015/T016 → T017 → T019..T022 → T025 → T026 → T027 → T028/T029.

T010/T011/T012 theo dependency nêu ở từng task; T018 theo sau runtime. T023/T024 là nhánh inbound có gate, không được tự đánh dấu “hoàn thành” nếu chưa chọn. Mỗi task giữ thành commit/PR review được, migration/schema/proto đi trước consumer theo compatibility. Không gọi agent/executor tự động từ danh sách này.
