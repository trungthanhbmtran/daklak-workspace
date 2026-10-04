# Kế hoạch: Tái cấu trúc workflow-service, chịu mạng yếu và làm mới các luồng giao diện

> Trạng thái: kế hoạch đã rà soát, chưa triển khai. Kế thừa các phát hiện và thiết kế nghiệp vụ trong [kế hoạch workflow do người dùng thiết kế](workflow-user-designed-processes.md); bản này bổ sung khả năng phục hồi mạng, vận hành và toàn bộ UX liên quan.

## Mục tiêu và ranh giới

Tái cấu trúc workflow thành nền tảng quy trình dùng chung có lifecycle định nghĩa, catalog/binding, thực thi bền vững, tác vụ, audit và tích hợp nghiệp vụ. Giảm số lần gọi mạng đồng bộ và cho phép người dùng tiếp tục các thao tác an toàn khi kết nối chậm/gián đoạn; đồng bộ lại có kiểm soát khi mạng phục hồi. “Đầy đủ chức năng” được hiểu là các luồng quản trị, thiết kế, gắn quy trình, khởi tạo, xử lý tác vụ, theo dõi, lỗi và vận hành nêu dưới đây; không đồng nghĩa hỗ trợ mọi loại logic tùy ý.

Ranh giới dữ liệu giữ nguyên: workflow-service sở hữu định nghĩa, version, binding, instance, task, transition, command/audit; document/HRM/posts và các domain service khác sở hữu bản ghi và luật nghiệp vụ của mình. API Gateway xác thực và làm lớp API; domain service vẫn là nơi cuối cùng kiểm tra PBAC, tổ chức, invariant và commit thay đổi dữ liệu. UI chỉ là client không có thẩm quyền.

## Bằng chứng hiện trạng đã khảo sát

- `.agents/AGENTS.md`, `.agents/ROADMAP.md`, `.agents/workflows/00-main.md`, `.agents/agents/chatgpt-planner.md`, `.agents/agents/gemini-executor.md`; không có `.agents/BLACKLIST.md` tại vị trí đã kiểm tra. Không tìm thấy manifest kiến trúc/ADR trong `docs` bằng tên `ARCHITECTURE_MANIFEST`/`ADR-*`; kế hoạch workflow trước đó viện dẫn ADR-002 nhưng hồ sơ ADR chưa được xác minh.
- `apps/workflow-service/prisma/schema/main.prisma`: đã có ProcessType, ProcessDefinition/Version, ProcessBinding, ProcessInstance, WorkflowTask/Transition, WorkflowCommand, DomainAck, OutboxEvent, ProcessedCommand và audit binding. Instance có `stateVersion`, `correlationId`, nullable `idempotencyKey`; schema là nền tảng nhưng chưa chứng minh lifecycle consumer, retry, quyền hay hành vi mạng đã hoàn chỉnh.
- `shared/protos/workflow/workflow.proto`: có contract gRPC CRUD, runtime và các API mở rộng; cần inventory toàn bộ method/field và generator/consumers trước khi thay đổi. `libs/workflow-client` có `WorkflowCommand` với command ID và instance/version/node/type/payload.
- Gateway có REST cho catalog, binding, validate, start/action và legacy resume; nhiều controller nhận `any`; kiểm tra quyền theo method và DTO đầy đủ cần audit.
- `admin_khcn` có workflow list/detail/designer, binding list, instance list/history và dynamic action; `WorkflowBindingList` ghi chú endpoint gateway chưa map; history có mock; một số UI gọi route legacy. Đây là các vùng UX cần thống nhất, không phải chức năng đã nghiệm thu.
- Các service document, HRM, posts có adapter workflow/đường đổi trạng thái riêng; kế hoạch trước đã ghi nhận bypass trực tiếp, fallback rỗng và outbox/inbox chưa đồng nhất. Xác minh mọi điểm ghi trước khi chọn pilot.
- Frontend là Next.js/React Query/Axios theo `apps/admin_khcn/.agents/skills/enterprise-portal`; giới hạn offline, phân loại dữ liệu, thời gian lưu tại browser và yêu cầu mã hóa client chưa có bằng chứng được phê duyệt.

## Thiết kế được đề xuất

### 1. Runtime bền vững, độc lập với thời gian phản hồi mạng

- Dùng workflow control plane tập trung với published definition bất biến; instance ghim binding/version cụ thể. Không giữ DB transaction khi gọi mạng hoặc broker.
- Mọi command đổi trạng thái có `commandId`/idempotency key ổn định, actor đã xác minh, org scope, correlation/causation và `expectedStateVersion`. Ghi business state + outbox trong cùng transaction tại service sở hữu; Inbox/unique constraint chống hiệu ứng lặp. Ack bền vững cho phép retry/replay sau timeout/mất kết nối.
- REST/gRPC nhận/trả trạng thái phân biệt rõ `ACCEPTED/PENDING`, `COMPLETED`, `REJECTED`, `RETRYABLE_FAILED`/`NEEDS_RECONCILIATION`; không hứa exactly-once qua mạng. Hiệu ứng nghiệp vụ đạt “một lần” bằng xử lý idempotent và đối soát.
- Retry exponential backoff có jitter, giới hạn và dead-letter; circuit breaker/timeouts chỉ ở ranh giới thích hợp; polling có cursor/ETag hoặc incremental sync, pagination bounded. Broker chậm không chặn request của người dùng chờ đồng bộ domain ack.
- API gom dữ liệu cho màn hình (summary, current task, allowed actions, history page) để giảm round-trips; action hợp lệ vẫn được server tính. Cache chỉ dùng cho dữ liệu đọc có TTL/version rõ ràng; cache stale không quyết định quyền hay cho phép commit.

### 2. Offline-tolerant UI, không giả trạng thái commit

- Outbox cục bộ có version/schema, command ID sinh phía client, trạng thái `queued/sending/confirmed/rejected/conflict`, retry khi online/foreground và đồng bộ foreground ưu tiên. Chống bấm lặp bằng cách giữ nguyên ID khi retry. Khi phát hiện `stateVersion` lệch, không tự ghi đè; tải lại và yêu cầu người dùng xác nhận thao tác mới.
- Khi online, UI gửi action và hiển thị “đang gửi/đang đồng bộ” cho đến ack; khi offline, chỉ xếp hàng action được server cấp quyền gần nhất và trình bày rõ là “chưa gửi/chưa hoàn tất”. Không hiển thị thành công trước ack. Nếu quyền/task đã đổi, server từ chối khi đồng bộ; UI cho xem lý do và khôi phục dữ liệu nhập được.
- Cache chỉ giữ danh sách/metadata và dữ liệu chi tiết tối thiểu được chính sách dữ liệu cho phép; mặc định không cache payload hồ sơ/tài liệu nhạy cảm hoặc attachment. Không lưu token/secret trong outbox. Attachment đi qua media-service upload resumable nếu contract hiện hữu hỗ trợ; nếu chưa thì coi là gate/phạm vi riêng, không giả lập upload offline.
- Autosave bản nháp thiết kế workflow cục bộ có version và cảnh báo xung đột; server vẫn validate/publish. Dữ liệu cục bộ cần TTL, xóa khi logout/đổi tài khoản, giới hạn dung lượng và xử lý quota/private browsing. Chỉ mã hóa tại browser sau khi chốt threat model và quản lý khóa; không tự tuyên bố bảo vệ nếu khóa nằm cùng origin.
- Tối ưu payload: summary/list projections, lazy load tab/graph/history, compress response tại gateway nếu tương thích, debounce search, tránh polling dày; đo trên profile mạng giả lập (RTT, packet loss, offline) thay vì khẳng định không phụ thuộc tốc độ mạng.

### 3. Quy trình sản phẩm và UI đầy đủ

1. Quản trị catalog capability/process type, version schema, action/trigger hợp lệ và mode OBSERVE/ENFORCE.
2. Designer: draft, autosave, catalog node có allowlist, validator/diagnostic theo node và field, preview, version compare, publish bất biến; không thực thi script/URL tùy ý.
3. Binding: chọn process type, org scope, trigger/criteria typed, published version; preview resolver/conflict, effective dates, audit, bật/tắt và lịch sử. Không dùng ApplyModule để sửa definition.
4. Runtime: khởi tạo theo binding và idempotency; inbox/task cá nhân/đơn vị có filter/sort/pagination; detail timeline, assignee/due date/comment/attachment theo quyền; action buttons chỉ từ allowed actions server; pending/retry/conflict/errors rõ ràng.
5. Giám sát/quản trị: instance search, command/outbox health, failed/DLQ/reconcile có quyền, audit trail, correlation tracing, dashboard tuổi queue/ack latency/retry/duplicate/conflict và runbook. Chỉ bổ sung thao tác retry/replay an toàn, có xác nhận/audit.
6. Responsive/accessibility: desktop designer tối ưu canvas; mobile/tablet tác vụ/list/detail ưu tiên, canvas có fallback thao tác; keyboard navigation, focus, nhãn trạng thái, contrast/loading/empty/error states. Kiểm tra mọi route và role phù hợp.

## Phạm vi mã dự kiến (sau inventory xác nhận)

| Boundary | Vùng chính |
|---|---|
| Workflow core/storage | `apps/workflow-service/prisma/schema/main.prisma`, migrations, `src/definition`, `src/execution`, `src/catalog`, `src/infra`, worker/consumer mới hoặc hiện hữu |
| Hợp đồng | `shared/protos/workflow/workflow.proto`, event envelope/command schemas, generator và consumer bindings |
| Gateway | `apps/api-gateway/src/modules/workflow` (DTO, auth/PBAC, pagination, aggregate/read models, errors, timeout) |
| Shared integration | `libs/workflow-client`, outbox/inbox schemas và chỉ các consumer thực tế sử dụng |
| Domain adapters | `apps/document-service`, `apps/hrm-service`, `apps/posts-service`; các service khác chỉ khi inventory xác nhận phụ thuộc |
| Frontend | `apps/admin_khcn/features/workflow`, `components/workflow`, `app/services/integration/workflows`, `app/services/integration/instances`, task inbox entry points, query/cache/offline queue và service API |
| Ops | `docker-compose*.yml`, health/readiness, metrics/logging/tracing, dashboards/alerts/runbooks; deployment theo môi trường hiện có |

## Các giai đoạn triển khai

### Giai đoạn 0 — Baseline, inventory và quyết định sản phẩm

1. Xác minh ADR/module ownership thật; lập call graph UI → gateway REST/auth/PBAC → proto/gRPC → workflow DB/queue → domain Inbox/transaction/outbox → ack/event → UI.
2. Lập ma trận mọi mutation path: document, HRM, posts (REST/gRPC/import/bulk/cron/admin/consumer), quyền, tenant, status/history, transaction và bypass. Đối chiếu seed, migrations và production config nếu có quyền truy cập; không suy diễn runtime.
3. Đo baseline call count/payload/latency/failure và xác định SLO mục tiêu có thể đo; lập profile mạng yếu/offline. Chốt pilot một processType/domain/service trước mở rộng.
4. Product/security/data owner chốt role publish/bind/reconcile, dữ liệu được cache/queue ở client, TTL/erase, yêu cầu mã hóa/khóa, UX stale task/conflict, policy thiếu binding và thời gian/độ trễ phản hồi mục tiêu. Không triển khai lưu dữ liệu nhạy cảm offline khi chưa có quyết định phân loại.

### Giai đoạn 1 — Contract và persistence an toàn

5. Chốt command/event envelopes versioned, command lifecycle, error taxonomy, idempotency scope/retention, OCC và API projections. Additive proto field numbers; contract compatibility với mọi consumer trước migration.
6. Hoàn thiện schema có unique Inbox/ProcessedCommand, transactional outbox, lease/claim, attempts/next retry/DLQ/error redacted, event/schema version, tenant/correlation, ack, state version, indexes bounded. Tránh duplicate schema drift; chỉ migrate service dùng thực tế.
7. Implement publisher/consumer có broker confirm, retry/backoff/jitter, poison-message routing, graceful shutdown, health/readiness/metrics; ghi outbox cùng transaction business; không swallow lỗi. Tách network call khỏi DB transaction.

### Giai đoạn 2 — Definition/catalog/binding lifecycle

8. Hoàn thiện typed catalog và capability allowlist; bỏ node tự thực thi script/URL thô đến khi có sandbox và SSRF/security design được duyệt.
9. Implement version draft → validate/compile → publish immutable; source graph/compiled form versioned, test graph server side (node/edge ID, start/end/reachability, dead-end, bounded cycle, variable schema, actor/task/capability).
10. Resolver xác định theo scope/trigger/criteria typed/effective window/priority, trả duy nhất một binding; 0 hoặc >1 match ở ENFORCE là lỗi an toàn. Binding version pinned, preview, conflict-check, audit và quyền phân tách design/publish/bind.

### Giai đoạn 3 — Runtime và adapter nghiệp vụ

11. Start/action idempotent, authorization theo actor/resource/org, expectedStateVersion/OCC; persist command/outbox và trạng thái pending nguyên tử; domain ack mới chốt transition. Instance luôn dùng published version đã pin.
12. Xây Inbox/handler mỗi domain: kiểm tra actor/service identity, tenant, action, invariant, expected entity version; domain state + history + outbox cùng transaction; ack dedupe. Bao phủ tất cả mutation path, không chỉ endpoint chính.
13. Pilot domain/processType đã chọn ở OBSERVE, reconcile state, bật ENFORCE theo organization bằng cấu hình server-side sau khi bypass đã loại bỏ. Mở rộng document/HRM/posts tuần tự dựa trên bằng chứng và khả năng rollback.

### Giai đoạn 4 — Gateway/API/UI online/offline-tolerant

14. API gateway DTO validation, authz granular, organization scope, rate/bounded pagination, projections để list/detail/task view ít round-trips; errors/timeout phù hợp trạng thái pending. Không tin actor/roles/org gửi từ client.
15. Chuẩn hóa route/API/client types/query keys; React Query cache stale/read-only tường minh; chuyển workflow binding placeholder, history mock và legacy routes sang contract thật.
16. Làm mới UX theo luồng: quản trị/capability → thiết kế/validate/publish → bind/preview → task inbox → xử lý action/comment/file → instance/history → lỗi/retry/conflict → audit/admin. Mỗi màn hình có loading/empty/stale/offline/queued/rejected states.
17. Thêm local queue/autosave/cache theo quyết định dữ liệu của bước 4; implement ID bền khi retry, account isolation, TTL/clear/quota, state conflict và sync wake-up. Không xếp queued local action nếu user chưa từng nhận allowed action hoặc payload không thuộc allowlist. Server vẫn kiểm tra lại toàn bộ.
18. Thiết kế responsive/accessibility; giảm tải canvas, lazy load graph/history, incremental sync; kiểm tra bằng profile mạng chậm/mất gói/mất mạng/khôi phục và đo call count/payload/latency so với baseline.

### Giai đoạn 5 — Migration, rollout và hoàn tất

19. Expand-contract: schema/contract additive, deploy consumers tương thích cũ+mới trước producers; backfill có báo cáo ambiguity/missing owner/version; không gán latest tự động. Snapshot counts/checksum và kế hoạch rollback trước production.
20. OBSERVE đo bypass, không có binding, ambiguity, command age, ack latency, duplicate, conflict, retry/DLQ, reconciliation và client queue abandon. Chốt ngưỡng với product/ops trước rollout; bật ENFORCE canary theo processType/org.
21. Rollback tắt enforcement/start mới theo feature flag có quyền, giữ lại records/outbox/instance/audit; reconcile command đã domain-commit nhưng ack thiếu; không đảo ngược mutation nghiệp vụ đã commit hoặc mở status bypass. Contract/schema destructive removal ở release riêng.
22. Cập nhật runbook, dashboard/alert, API docs, module/ownership docs, kế hoạch lưu/xóa offline và roadmap chỉ khi trạng thái dự án thực sự đổi.

## Tiêu chí nghiệm thu

- Definition có draft/validate/compile/publish bất biến; binding trỏ published version rõ ràng; resolver không chọn ngẫu nhiên và mọi quyền publish/bind được kiểm tra phía server.
- Retry command/event cùng ID không nhân đôi hiệu ứng; mất ack sau domain commit phục hồi được qua retry/reconcile; stale state bị OCC từ chối và có luồng xử lý UI.
- Domain state/history/outbox commit cùng transaction; mọi đường mutation được bao phủ bởi enforcement khi scope ở ENFORCE; quyền, actor và tenant được kiểm tra tại service sở hữu dữ liệu.
- UI có đầy đủ admin, designer, binding, task, instance/history, error/retry/reconcile và accessibility/responsive states; không còn placeholder/mock/legacy bypass trong scope đã chọn.
- Khi offline, UI không báo command hoàn tất; draft/queue được khôi phục sau reload, chống gửi trùng, thể hiện trạng thái và xử lý từ chối/conflict. Không lưu nội dung chưa được chính sách cho phép.
- Với profile mạng yếu do product chốt, số round-trip/payload/latency đạt ngưỡng baseline-target được ghi cụ thể ở Giai đoạn 0; thao tác online tiếp tục tiến triển dù domain consumer/broker chậm và có giới hạn timeout/retry.
- Có migrations/backfill/rollback rehearsal phù hợp, contract compatibility, metrics và runbook. Chỉ báo cáo đã xác minh đối với kiểm tra thực sự được chạy; không suy ra production readiness/compliance.

## Xác minh cần thực hiện trong lúc triển khai

- Unit: compiler/validator, resolver, permission, idempotency, OCC, transition/ack state machine, retry/backoff.
- Integration/contract: proto compatibility, duplicate delivery, concurrent action, process crash sau commit trước ack, broker offline, stale event, DLQ/replay, tenant isolation, direct mutation bypass, migration/backfill.
- Frontend: offline/reconnect, queued/pending/rejected/conflict, reload/account switch/expired auth/quota, no duplicate submit, screen reader/keyboard/responsive, UI không lộ trạng thái chưa commit.
- Resilience/performance: mạng mô phỏng RTT/packet loss/disconnect, broker pause/recovery, load bounded, query count/payload, p50/p95 latency và queue age; SLO định lượng do product/ops chốt trước test.
- Security/ops: PBAC/IDOR, client forged actor/org, payload minimization/redaction, SSRF/capability review, audit permissions, retention/erase, backup/recovery and rollback rehearsal. Đây là kiểm tra kỹ thuật, không phải kết luận tuân thủ pháp lý.

## Quyết định cần chốt trước bước phụ thuộc

- Product chọn pilot processType/service và ưu tiên các vai trò/màn hình; kế hoạch đề xuất một domain nhỏ có đường end-to-end và ít phụ thuộc trước.
- Product/ops đặt latency/call/payload/availability SLO và profile mạng yếu đại diện.
- Security/data owner phân loại dữ liệu được cache/queue trên thiết bị dùng chung; TTL/logout purge; có cho phép lưu offline dữ liệu hồ sơ không và cách quản lý khóa mã hóa. Mặc định an toàn trước khi chốt: chỉ metadata tối thiểu và bản nháp không nhạy cảm; cấm hồ sơ/attachment offline.
- Product chốt hành vi khi session hết hạn hoặc quyền/task đổi trong lúc offline; reconciliation roles; thiếu binding; và command/domain thất bại.
- Xác nhận ADR-002 thực tế hoặc duyệt Control Plane/Data Plane như thiết kế đích. Không giả định tài liệu viện dẫn tồn tại.
- Chốt liệu media-service hỗ trợ resumable/chunked upload và contract hiện hành; nếu không, lập phạm vi riêng cho attachment.
- Chốt processType cần ENFORCE theo từng giai đoạn; không bật enforcement đại trà chỉ vì UI đã sẵn sàng.

## Ngoài phạm vi đợt đầu

- Thực thi mã/URL tùy ý từ workflow; workflow engine làm chủ dữ liệu domain; migrate tự động instance đang chạy sang version mới.
- Cam kết hoạt động offline hoàn toàn cho hồ sơ nhạy cảm, attachments hoặc mọi quyết định cần quyền/phiên bản trực tiếp.
- Exactly-once delivery trên mạng phân tán; thay vào đó là at-least-once + idempotent effects, ack bền vững và reconcile.
- Thay mọi service có schema workflow chỉ vì schema được sao chép; chỉ đổi service được inventory chứng minh là participant.

## Phản biện sau khi lập kế hoạch

| Mức độ | Vấn đề/giả định bị phản biện | Ảnh hưởng | Điều chỉnh trong kế hoạch hoặc lý do giữ nguyên |
|---|---|---|---|
| Major | “Ít bị ảnh hưởng tốc độ mạng” có thể bị hiểu thành mọi workflow hoạt động offline, kể cả quyền và dữ liệu nhạy cảm. | Rủi ro lộ dữ liệu hoặc chấp nhận lệnh stale/không được phép. | Chỉ cache/read offline có giới hạn; queue command thể hiện pending, server re-authorize; phân loại/TTL/mã hóa là decision gate. |
| Major | Exactly-once không đảm bảo qua broker/mạng và ack có thể mất sau domain commit. | Duplicate mutation hoặc workflow/domain lệch trạng thái. | At-least-once + idempotency, ack bền vững, OCC, inbox/outbox transaction và reconcile; tiêu chí nghiệm thu bao gồm crash window. |
| Major | Scope cũ gom nhiều domain/UI nhưng pilot và SLO chưa có căn cứ sản phẩm. | Phình scope hoặc enforcement gây gián đoạn. | Thêm Giai đoạn 0 và pilot/canary; product/ops chốt SLO và rollout gate trước rollout. |
| Major | Kế hoạch cũ viện dẫn ADR-002 nhưng artifact ADR không được xác minh trong inventory. | Có thể thiết kế trái quyết định kiến trúc đã duyệt. | Xác minh ADR trước implementation; gate nếu có mâu thuẫn quyền sở hữu hoặc mô hình triển khai. |
| Major | UI có placeholder/legacy routes và quyền offline nhưng policy dữ liệu chưa biết. | UX không hoàn chỉnh hoặc lưu quá mức dữ liệu người dùng. | Inventory các route và chốt lưu client; mặc định cấm hồ sơ/attachment offline cho tới phê duyệt. |
| Minor | Attachment retry/resume phụ thuộc media contract chưa khảo sát. | Có thể không thực hiện được upload offline/resume như dự kiến. | Chỉ hỗ trợ sau khi xác minh; nếu thiếu contract thì tách phạm vi attachment, không mô tả là khả năng hiện có. |

### Kết luận phản biện

- Không còn finding blocking trong phạm vi lập kế hoạch; các Major được chuyển thành gate rõ ràng trước bước kỹ thuật/rollout tương ứng.
- Gate trước enforcement: contract/inbox idempotent; mọi mutation path đã inventory; PBAC/tenant check tại domain; binding và backfill không mơ hồ; ack loss/reconcile kiểm chứng; rollback/ops duyệt.
- Gate trước offline persistence: data owner chốt phân loại, loại dữ liệu, TTL/logout purge, thiết bị chia sẻ và threat model/key management. Cho đến lúc đó không đưa hồ sơ/attachment vào local queue/cache.
- Chưa có xác nhận triển khai được yêu cầu; đây là kế hoạch/handoff copy để xem xét, không phải tuyên bố đã thực hiện hay đã dùng Gemini handoff.
