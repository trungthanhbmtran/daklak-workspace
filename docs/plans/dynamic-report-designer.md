# Kế hoạch: Thiết kế lại trình thiết kế báo cáo động

> Trạng thái: bản kế hoạch đã phản biện, chưa triển khai. Bản handoff đang hoạt động được đồng bộ tại `IMPLEMENTATION_PLAN.md`.

## 1. Mục tiêu sản phẩm

Xây dựng một không gian làm việc báo cáo động để người dùng được phân quyền:

1. Chọn nhiều API đã đăng ký/được phép truy cập; xem metadata, phân trang, ví dụ trường và độ mới dữ liệu.
2. Kéo nguồn/field vào canvas, khai báo quan hệ JOIN giữa nguồn bằng các khóa đã chọn, kiểu JOIN, lọc, nhóm, tổng hợp và sắp xếp.
3. Xem trước kết quả dạng bảng, kiểm tra lỗi schema/khóa/ước lượng số dòng; cấu hình báo cáo được lưu thành version.
4. Chạy báo cáo và lưu **kết quả snapshot** riêng khỏi cấu hình để dữ liệu có thể mở lại, phân trang và dùng làm nguồn cho bảng/biểu đồ/export.
5. Quản lý quyền, trạng thái lần chạy, lịch sử, độ mới, lỗi và dọn dữ liệu cũ.

Không cho nhập/thực thi SQL, URL, code, header hay secret tùy ý. API nguồn phải là integration đã đăng ký, method/path được allowlist và quyền dữ liệu vẫn được kiểm tra tại nguồn.

## 2. Hiện trạng có bằng chứng

- UI: `apps/admin_khcn/features/reports/components/reports/ReportDashboard.tsx` hiện mở song song `ReportBuilder` và `TableReportBuilder`; dashboard có nhánh `mockData` khi nguồn/API thiếu. `ReportBuilder.tsx`, `mockData.ts`, `TableReportWidget.tsx`, `ReportTable.tsx`, `ChartRenderer.tsx`, `api.ts`, `table-api.ts` là các vùng hiện hữu cần inventory/cắt chuyển có kiểm soát.
- Bảng động: `TableReportBuilder.tsx` chọn một upstream + path + params; người dùng cấu hình data path, cột, filter/group/aggregate và preview/save. Contract `shared/reporting/table-contract.ts` có một `TableSource`, `TableConfig` version 1; chưa có nhiều nguồn, join graph, report run hoặc snapshot.
- Backend: `apps/api-gateway/src/modules/reports/report-source.service.ts` xác thực upstream, quyền GET, allowed path, giới hạn body 2 MB và trả dữ liệu đã lọc trường nhạy cảm theo quyền; `reports.controller.ts` fetch source rồi gọi report-service preview.
- `apps/report-service/src/modules/reports/table-engine.ts` xử lý một mảng dữ liệu, tối đa 5.000 dòng, giới hạn field/config; được dùng cả trong statistics, nên không được xóa chỉ vì làm mới UI.
- `apps/report-service/prisma/schema/main.prisma` có `ReportTemplate`, `ReportWidget`, `StatisticsSnapshot`; chưa có entity run/dataset. `TemplatesService` kiểm tra cấu hình bảng trước lưu template. `shared/protos/reports/report.proto` dùng GenericRequest JSON payload.
- Một số route legacy `/reports/tasks`, `/documents`, `/posts`, `/kpis`, `/employee-quality` và API cũ vẫn là caller có thể dùng `ReportBuilder`/`usePreviewReport`; cần phân loại người dùng và migration trước khi loại bỏ.
- Reporting skill yêu cầu tách OLTP khỏi workload báo cáo, dùng read model/aggregation, phân trang, async cho báo cáo nặng, và nêu ownership/freshness. Project frontend yêu cầu feature-first, React Query, Axios, text giao diện tiếng Việt có dấu.

## 3. Phương án kiến trúc và đánh đổi

### Phương án khuyến nghị: cấu hình truy vấn versioned + kết quả snapshot versioned

- **QueryDefinition** lưu nguồn, phiên bản schema, join graph, phép biến đổi, cột kết quả, biểu đồ và quyền/phạm vi. Cấu hình là typed JSON AST có version; backend validate đầy đủ, không biến thành SQL tùy ý.
- **ReportRun** đại diện một lần thực thi với `definitionVersion`, người chạy, phạm vi tổ chức, thời gian bắt đầu/kết thúc, trạng thái, source version/watermark, số dòng, checksum, lỗi đã redact và hạn lưu.
- **DatasetSnapshot** lưu schema output và dữ liệu kết quả theo run; UI đọc lại snapshot đã lưu, không gọi lại nguồn mỗi lần render biểu đồ. Có thể chạy lại để tạo snapshot mới; không ghi đè lịch sử một cách âm thầm.
- Với volume nhỏ/giới hạn: cân nhắc lưu chunk JSON typed có index theo report/run/org và phân trang server-side. Báo cáo vượt giới hạn preview hoặc có join fanout được đưa vào job queue, ghi chunk dần, giới hạn concurrency/quota và hỗ trợ hủy. Nếu benchmark cho thấy MySQL JSON chunk không đủ, đánh giá object storage/columnar format thành quyết định riêng trước khi code.
- Report-service sở hữu định nghĩa báo cáo, run, snapshot và execution orchestration. Integration registry/executor sở hữu kết nối upstream, secret, SSRF/network policy. Gateway xác thực actor, quyền và scope, làm BFF; không tự thực hiện JOIN/aggregate trong request handler.
- Thay dữ liệu nguồn trực tiếp đồng bộ trong request preview bằng execution API/job phía backend dùng source handles đã xác minh; không chuyển secrets/headers từ browser. Cần kiểm tra đường tích hợp service hiện hữu trước khi chốt executor placement.

### Mô hình JOIN có giới hạn

- Cho phép `INNER` và `LEFT` ở MVP; thêm kiểu khác chỉ khi có yêu cầu nghiệp vụ cụ thể.
- Khai báo cặp khóa trái/phải bằng field path đã metadata/allowlist xác nhận; kiểu dữ liệu tương thích; hỗ trợ nhiều cặp khóa với AND. MVP không hỗ trợ expression tùy ý, cross join, fuzzy join, subquery hay nhiều tầng không giới hạn.
- Compiler tạo plan có thứ tự xác định; validate source count, edge, cycle, field, cardinality/ước lượng, quyền theo từng nguồn. Có cap số nguồn, mỗi nguồn bytes/rows/pages, tổng rows/intermediate rows, thời gian CPU/wall-clock và fanout trước khi chạy; cấu hình cap cuối cùng qua benchmark/ops.
- Index join in-memory theo khóa chuẩn hóa; định nghĩa rõ null không match, duplicate key tạo fanout, kiểu số/string không ép ngầm gây sai. UI preview cảnh báo trùng khóa và ước lượng tăng dòng. Không load mọi trang nguồn vô hạn; adapter phải có pagination contract và budget.
- Filters pushdown chỉ khi upstream capability cho phép và cùng semantics; nếu không, engine lọc sau fetch trong budget. Lưu provenance/watermark theo từng source; snapshot nêu thời điểm và nguồn không đồng bộ/partial. Mặc định không publish snapshot partial nếu một source lỗi, trừ khi người có quyền chọn policy rõ ràng.

### Vì sao snapshot thay vì live join mỗi lần xem

Live join tránh lưu bản sao và dữ liệu mới tức thời nhưng mọi lần mở chart phụ thuộc đồng thời nhiều API, latency, availability và tính nhất quán nguồn. Snapshot tốn storage và cần retention nhưng cho phép mở lại kết quả ổn định, export/chart ít phụ thuộc mạng và audit được run. Vì mục tiêu người dùng yêu cầu “lưu lại để làm bảng/biểu đồ”, snapshot là lựa chọn chính; freshness được thể hiện rõ và user chủ động chạy lại.

## 4. Luồng màn hình dự kiến

1. **Danh sách báo cáo**: tìm kiếm/lọc, trạng thái, chủ sở hữu/phạm vi, lần chạy mới nhất, độ mới; tạo mới, nhân bản, mở/chỉnh sửa, chạy, export, archive/xóa theo quyền.
2. **Chọn nguồn**: catalog nguồn được cấp quyền; API/endpoint/method đã duyệt, mô tả, fields/schema, pagination, sensitivity, sample đã redact. Giao diện không nhận URL tùy ý.
3. **Canvas ghép dữ liệu**: kéo source node; nối node để khai báo join keys/type; bảng field/schema kéo vào select/group/filter/sort; thứ tự bước rõ ràng; kiểm tra join, null, cardinality và preview sample.
4. **Bảng kết quả**: schema/column reorder/rename/type, filter/group/aggregate, pagination, empty/error/loading; preview có giới hạn và chi phí ước tính.
5. **Biểu đồ**: tạo nhiều widget từ cùng snapshot, chọn chart type, dimension/measure, label, format, legend; chart luôn chỉ tới dataset/run rõ ràng, không fetch nguồn riêng.
6. **Lưu/chạy**: lưu draft/version, validate, chạy nhanh hoặc job; hiển thị queued/running/succeeded/failed/cancelled/partial theo policy, tiến độ không giả chính xác, retry tạo run mới với cùng config version.
7. **Lịch sử và export**: xem các snapshot theo thời điểm, nguồn/watermark, người chạy, row count, trạng thái; bảng phân trang; CSV/XLSX/PDF theo quyền và giới hạn streaming, audit export.
8. **Responsive/a11y**: canvas đầy đủ trên desktop; trên tablet/mobile điều khiển theo wizard/panel thay cho drag chính xác; keyboard alternative, focus, contrast, nhãn tiếng Việt, screen reader.

## 5. Bảo mật, tenant và dữ liệu

- PBAC theo subject/action/report/run/source/organization scope; kiểm tra quyền mỗi API và lúc chạy/đọc/export. Không dựa vào quyền đã cache ở UI.
- Kiểm tra quyền từng upstream + path và dữ liệu từng field; server loại bỏ/ẩn field nhạy cảm trước khi lưu snapshot. Scope tổ chức được lấy từ session đã xác thực, áp dụng tới nguồn và snapshot.
- API credentials chỉ do integration service/secret provider giữ; source handles là ID opaque, không chứa secrets. Chống SSRF/redirect/DNS rebinding theo quy định integration service; không cho designer nhập hostname.
- Hạn chế PII, audit người tạo/chạy/export/sửa quyền, redact log/lỗi. Phân loại dữ liệu, retention, xóa snapshot, backup/restore và legal hold cần theo policy đã duyệt; không tự đặt thời hạn pháp lý.
- Output snapshot có owner/org ACL. Clone/share không tự cấp rộng quyền. Xóa definition không xóa run còn retention/audit bắt buộc; dùng archive/retention workflow.

## 6. Phạm vi mã và xử lý code cũ

| Vùng | Hướng xử lý |
|---|---|
| `shared/reporting/table-contract.ts` | Version contract mới `ReportDefinition`/source/join/transform/run/snapshot; giữ decoder V1 trong giai đoạn chuyển tiếp; xóa V1 sau migration caller/data có bằng chứng. |
| `apps/report-service/src/modules/reports/table-engine.ts` | Tách engine hiện tại thành transform đơn nguồn và join planner/engine có budget; giữ API hàm cần thiết cho statistics. Không xóa trước khi thay các imports ở `statistics.service.ts` và tests. |
| `apps/report-service/src/modules/reports/reports.controller.ts`, `reports.service.ts` | Typed RPC/endpoints cho source schema, validate/preview, CRUD version, run/cancel/status, snapshot page/schema/export; orchestration/job; bỏ nhận data raw tùy ý nếu đường source executor mới ổn định. |
| `apps/report-service/src/modules/templates/*`, `prisma/schema/main.prisma` | Thiết kế migration template/widget cũ sang definition/dashboard/widget versioned; thêm run/snapshot, index, quota/retention metadata. Transactional migration/reconcile trước xóa model/field cũ. |
| `shared/protos/reports/report.proto` | Contract additive/versioned; ưu tiên DTO cụ thể thay GenericRequest mới; giữ RPC legacy trong phiên chuyển tiếp và ghi deprecation. |
| `apps/api-gateway/src/modules/reports/*`, integration registry | PBAC/scope/context, source catalog handle, typed DTO, limits, error mapping; executor placement chốt sau inventory integration API. Xóa `ReportSourceService` hoặc duplicate preview only after replacement and caller scan. |
| `apps/admin_khcn/features/reports/**`, `app/services/reports/page.tsx` | Xây lại feature-first API/hooks/types/canvas/query builder/result table/chart configuration/run history. Không viết toàn bộ nghiệp vụ trong `page.tsx`; UI strings tiếng Việt có dấu. |

### Danh sách dọn mã cũ có điều kiện

- `features/reports/components/reports/mockData.ts`: dashboard hiện import làm fallback. Xóa sau khi dashboard chuyển sang empty/error state có thật và `rg` xác nhận không còn import.
- `ReportBuilder.tsx` cùng `api.ts`/`usePreviewReport`: có thể là luồng chart legacy còn được dashboard dùng. Thay bằng editor mới hoặc adapter tương thích, migrate widget cũ, tìm toàn repo caller trước khi xóa; không xóa trước.
- `TableReportBuilder.tsx`, `table-api.ts`, `TableReportWidget.tsx`, `ReportTable.tsx`: không xóa đồng loạt; tái sử dụng table renderer/hook cần thiết, thay builder một nguồn bằng canvas multi-source và chuyển widget sang dataset/run ID.
- `ChartRenderer.tsx`: giữ nếu được editor/dashboard mới dùng; chỉ xóa nếu component thay thế và toàn bộ callers/types/styles đã chuyển.
- `table-engine.ts`: giữ utility có kiểm thử cho Statistics; loại bỏ path legacy riêng chỉ khi không còn caller và kết quả mới parity.
- RPC/report routes/statistics `EMPLOYEE_QUALITY` legacy: xác định tiêu thụ ngoài dashboard; version/deprecate, metric caller, migration guide, gỡ ở release riêng sau thời hạn tương thích được chốt.
- Dead code/generated files: generated Prisma client không xóa thủ công; regenerate theo schema. Không xóa file dựa trên tên hoặc vì “cũ”; mỗi removal phải có `rg`/dependency graph, route/RPC usage, data migration proof, review diff và rollback window.

## 7. Giai đoạn và thứ tự thực hiện

### Phase 0 — Product/data/integration inventory

1. Xác định user roles, báo cáo hiện dùng, API sources/endpoints, pagination contract, sensitive fields, data owners, external consumers, export, retention and SLO.
2. Lập dependency map toàn repo: route→gateway→RPC/service→Prisma; tất cả import/callers của builder/api/mock/chart/table-engine; đếm và phân loại stored `ReportTemplate`/`ReportWidget` theo version.
3. Chọn pilot report 2 API có quyền join rõ và data volume vừa; duyệt semantics JOIN, giới hạn nguồn/rows/bytes/fanout/time, freshness, partial policy, refresh schedule, preview sync threshold, retention/export format. Những giá trị cần đo được chốt tại đây, không tùy ý mặc định.
4. Chốt executor boundary: integration-service expose safe batched/paginated execution hay report-service orchestration qua capability nội bộ. Không để gateway trở thành join engine; không tạo đường SSRF mới.

### Phase 1 — Spec, contracts, data model và compatibility

5. Hoàn thiện feature spec/user stories/acceptance, decision record, versioned query AST, API/RPC request-response, error/run states, snapshot row/schema access and export contract.
6. Data model gồm definition/version, source bindings, join/transform plan, dashboard/widget, run, dataset schema/chunks, ACL/org, audit, retention. Rà unique/index/size/partitioning; migration từ template cũ có dry-run report.
7. Viết compatibility plan giữ legacy read/render, dual-read/adapter khi cần; tạo metrics deprecation callers. Contract mới không phá proto field numbers.

### Phase 2 — Engine và persistence

8. Implement validator/compiler (allowlisted sources/fields/operators, DAG no cycles, compatible key types, caps); deterministic typed JOIN/filter/group/aggregate/sort; unit/contract tests với null/duplicate/fanout/mixed schema/oversize/timeouts.
9. Implement source executor hợp lệ: credential isolation, authorization per source/field/org, bounded pagination, retries per source, redaction, provenance and source watermark.
10. Implement preview bounded; run sync cho workload nhỏ, queue job cho heavy runs; state machine, cancellation/retry, progress, idempotency, locking/concurrency/quota.
11. Persist output snapshot in chunks plus schema/metadata atomically per chunk; `SUCCEEDED` only after all chunks/checksum complete. Partial results visible only under explicit policy. Server-side pagination and streaming export. Add retention cleanup after approved policy.

### Phase 3 — API/UI builder mới

12. Thêm gateway auth/PBAC DTO/schema/source catalog/run endpoints and report gRPC adapters; typed errors/correlation/rate limits. No arbitrary SQL or raw URL.
13. Tạo report feature types/API/query hooks and new report workspace; migrate list/create/edit/detail flow.
14. Implement source field explorer, drag canvas + keyboard/wizard alternative, JOIN mapping, transformations, validation and table preview/error diagnostics.
15. Implement save version/run controls, status/history/freshness, snapshot table paging and multiple charts/export against immutable snapshot. Ensure charts do not refetch source APIs.
16. Responsive/a11y, Vietnamese UI, empty/error/offline/stale/loading states and authorization denial states.

### Phase 4 — Migration and code cleanup

17. Dry-run map existing templates/widgets to new definition versions; preserve IDs where safe, migrate mappings/config, snapshot not fabricated for old live queries. Present unmappable records for review.
18. Deploy additive schema/contracts, dual read, new builder behind role/scope feature flag; monitor old/new parity and failures. Roll forward by report cohort.
19. Remove mocks, legacy builder/preview/API/contracts/models/routes in explicit order only after caller metrics reach zero, DB migration reconciles, owner approval and rollback window. Remove unused imports/styles/dependencies after static dependency scan. Keep shared table engine used by statistics.
20. Update docs/runbook, permissions, report catalog, data dictionary, retention jobs, dashboards/alerts. Drop old columns/tables in a separate release after backup/restore verification.

## 8. Acceptance and verification

- User can compose ≥2 registered sources, configure supported JOIN keys/type and transforms, get actionable validation, preview a bounded result, save a version, run and reopen a persisted snapshot.
- Reopening chart/table/export reads the same run snapshot without refetching APIs; rerun creates a new auditable version with source watermark and row count.
- Unauthorized source/path/field/org read/export is rejected both before fetch and before snapshot read. Secrets never reach browser/log/snapshot.
- Excessive source pages/bytes/rows/fanout/time is stopped with clear error and does not publish a successful partial snapshot. Failed/cancelled runs remain inspectable and cannot be mistaken for complete.
- Query evaluation deterministic for documented inner/left/null/duplicate semantics. Repeated run requests with same idempotency key do not create duplicate active jobs; job workers recover after restart.
- Legacy reports remain readable during migration; unmappable configs are listed, not silently dropped. Removal evidence for every deleted module includes caller scan, route/RPC telemetry, data migration validation, and rollback plan.
- Measure preview p95, run p95/queue age by size tier, source calls, output rows/storage, chart-open latency and export time under representative volume. Numerical targets agreed in Phase 0; no performance claim before benchmark.
- Security validation: PBAC/IDOR/tenant, SSRF, injection/path traversal, secret redaction, limits, export authorization, audit, retention and backup/restore.

## 9. Phản biện sau khi lập kế hoạch

| Mức độ | Vấn đề/giả định bị phản biện | Ảnh hưởng | Điều chỉnh |
|---|---|---|---|
| Major | JOIN nhiều API có thể nhân bản số dòng theo duplicate keys hoặc tạo cross join vô tình. | Sai số báo cáo, memory/CPU exhaustion. | Chỉ allowlisted inner/left, join planner typed, no cross join/cycle, cardinality preview, hard caps and benchmarks. |
| Major | “Lưu kết quả” có thể chỉ bị hiểu là lưu cấu hình chart/widget. | Khi mở lại dữ liệu thay đổi hoặc API hỏng, kết quả cũ không còn. | Mô hình riêng definition/version và run/snapshot; chart/export pin immutable run. |
| Major | Gateway hiện fetch một nguồn raw và report-service nhận JSON; mở rộng fetch nhiều API ở gateway có thể biến BFF thành join engine hoặc tăng bề mặt SSRF. | Coupling và bypass ownership/security. | Giữ integration registry/executor sở hữu outbound credentials/network; report-service giữ planner/aggregation. Chốt interface tại Phase 0. |
| Major | Data snapshot có thể chứa PII/đơn vị khác; quyền lúc run khác quyền lúc đọc. | Rò dữ liệu tồn lưu và IDOR. | Apply field/org policy trước lưu, ACL re-check khi read/export, audit and approved retention/erase. |
| Major | Xóa builder cũ sớm có thể phá báo cáo đã lưu/caller legacy. | Mất chức năng/dữ liệu production. | Compatibility phase, template inventory/migration, caller telemetry, zero-use window and separate destructive migration. |
| Minor | Table engine được dùng bởi statistics ngoài dynamic report. | Xóa engine làm hỏng endpoint khác. | Kế hoạch giữ/reuse tested core; chỉ rút legacy-specific branch sau dependency proof. |

### Kết luận phản biện

- Không còn blocking trong kế hoạch; Major được giải quyết bằng giới hạn kỹ thuật hoặc gate trước implementation/removal.
- Trước triển khai phải chốt: source executor boundary, pilot, JOIN semantics/caps, data classification/retention, scope/ACL, performance SLO, policy partial result và export format.
- Trước xóa code phải chứng minh không còn import/caller qua search + telemetry, dữ liệu cũ đã reconcile, migration/rollback đã được duyệt. Đây là điều kiện nghiệm thu dọn code, không phải tùy chọn.
