# Kế hoạch: Workflow do người dùng thiết kế và bắt buộc trong nghiệp vụ

> Bản lưu đã qua phản biện: [`docs/plans/workflow-user-designed-processes.md`](docs/plans/workflow-user-designed-processes.md). File này là bản thực thi/handoff ở thư mục gốc và phải đồng bộ với bản lưu đó.

## Mục tiêu

Cho phép người dùng có quyền tạo/chỉnh sửa bản nháp quy trình, kiểm tra và publish thành phiên bản bất biến, rồi gắn phiên bản đó vào một loại quy trình nghiệp vụ cụ thể. Khi nghiệp vụ phát sinh, hệ thống tự resolve binding phù hợp theo phạm vi và sự kiện, tạo instance đúng phiên bản; mọi hành động làm thay đổi trạng thái nghiệp vụ bắt buộc qua workflow và được kiểm tra ở backend. Người dùng không thể vượt luồng bằng cách gọi API/gRPC trực tiếp.

Đây là kế hoạch thực hiện, chưa phải thay đổi mã. Thiết kế tuân theo ADR-002: Workflow Control Plane tập trung, Data Plane phân tán tại service nghiệp vụ, đồng bộ bằng Outbox/Inbox và OCC; không giữ transaction mở qua mạng.

## Phạm vi và ranh giới sở hữu

- `workflow-service`: catalog loại quy trình, phiên bản định nghĩa, binding, runtime instance/task/transition, resolver, validation, authorization context, command/event và audit.
- Service nghiệp vụ tiếp tục sở hữu entity, dữ liệu và invariant của nghiệp vụ. Workflow quyết định bước/hành động được phép; domain service là nơi cuối cùng áp dụng lệnh lên dữ liệu của mình.
- `api-gateway`: xác thực người dùng, kiểm tra quyền coarse-grained, cung cấp API cho UI; không thay thế kiểm tra quyền/invariant trong service nghiệp vụ.
- `admin_khcn`: designer, binding manager, màn hình instance/task và action được phép. React Flow chỉ là trải nghiệm biên tập, không phải định dạng runtime tin cậy.
- Proto/event contract dùng chung phải tương thích ngược và được sinh lại cho mọi consumer.

## Phát hiện hiện trạng

- Schema `workflow-service` đã có ProcessDefinition/ProcessVersion/ProcessInstance/WorkflowTask/WorkflowTransition và WorkflowBinding, nhưng binding hiện chỉ khóa `entityType + eventTrigger`, không có phạm vi tổ chức, điều kiện, thứ tự ưu tiên hay ghim version.
- `DefinitionService` lưu graph thô; publish chưa compile/validate đầy đủ; phiên bản published có thể bị sửa; runtime có đường chọn phiên bản mới nhất kể cả draft. `ApplyModule` sửa code định nghĩa thay vì tạo binding độc lập.
- Workflow UI đã có React Flow, các màn hình designer và danh sách binding, nhưng form thêm binding còn placeholder; API gateway chưa lộ đủ API binding. Một số node hiện cho cấu hình script/tích hợp tùy ý.
- `document-service` khởi tạo workflow sau khi tạo bản ghi bằng gRPC không bắt lỗi theo kiểu fail-closed; `processDocument`/`finalizeDocument` cập nhật status trực tiếp; API update cho phép sửa status; service còn tiêu thụ workflow event để cập nhật dữ liệu domain.
- `hrm-service` có `TaskWorkflowService` trả workflow code/instance null và cho phép transition; một số cập nhật status, assign, accept/reject thực hiện trực tiếp. Outbox worker hiện đánh dấu event processed nhưng chưa publish trigger.
- `posts-service` dùng workflow ID/node/status hard-code; cập nhật status và phát trigger không cùng transaction; một số RPC lỗi được chuyển thành kết quả rỗng.
- `libs/workflow-client` có nền tảng Outbox/Inbox nhưng cần kiểm tra/chuẩn hóa schema và lifecycle idempotency; Prisma extension hiện ghi outbox sau mutation, nuốt lỗi và tạo payload rộng nên không đủ cho enforcement.
- Proto Workflow hiện có CRUD/publish/start/action cơ bản nhưng thiếu API catalog/binding/version resolution và hợp đồng domain command/ack đầy đủ.
- Các schema workflow hạ tầng được sao chép ở vài service khác; chỉ sửa các service thực sự dùng workflow hoặc cần contract mới, tránh migration diện rộng không cần thiết.

## Kiến trúc đích và quyết định thiết kế

1. **Catalog quy trình có chủ sở hữu**: domain service đăng ký `processType` ổn định cùng schema context, trigger/sự kiện hợp lệ, danh mục action/command và trạng thái bắt buộc hay tùy chọn. Catalog không cho designer tự khai báo URL/RPC tùy ý. Workflow UI chỉ cho chọn capability đã đăng ký.
2. **Binding độc lập với definition**: binding ánh xạ `(organization/scope, processType, trigger/criteria)` tới `definitionId + publishedVersionId`, có status, thời hạn hiệu lực, người tạo/duyệt, lý do và audit. Resolver có quy tắc ưu tiên xác định; nếu nghiệp vụ bắt buộc mà không có hoặc có nhiều binding hợp lệ thì fail-closed, không tự chọn latest.
3. **Draft → validate/compile → publish**: nhận graph từ UI, kiểm tra schema, node/edge IDs, start/end, reachability, dead-end, action/assignee, giới hạn chu kỳ/độ sâu, context schema và capability allowlist; compile thành canonical execution definition. Published version bất biến. Chỉnh sửa sau publish tạo version mới. Instance đang chạy luôn ghim version cũ; đổi binding chỉ ảnh hưởng instance mới. Chưa hỗ trợ migrate instance đang chạy.
4. **Instance xác định và idempotent**: lưu `processType`, `businessType/businessId`, `organizationId`, `bindingId`, `definitionVersionId`, `correlationId`, `idempotencyKey`, actor đã xác thực và stateVersion. Unique constraint ngăn tạo trùng khi retry; replay trả lại kết quả đã tạo. Context chỉ chứa trường allowlist tối thiểu, có version schema.
5. **Giao thức thay đổi dữ liệu domain**: người dùng gửi action kèm actor/tenant/correlation và expected workflow version. Workflow kiểm tra action được phép và quyền trên task/node, tạo command có ID ổn định. Domain consumer Inbox xử lý đúng một lần về hiệu ứng: kiểm tra lại PBAC, tenant, invariant và OCC; cập nhật entity + lịch sử + domain outbox trong cùng transaction; sau đó phát ack/event có version. Workflow chỉ chốt transition khi nhận ack thành công. UI biểu diễn trạng thái `PENDING` cho đến khi ack; lỗi có retry/DLQ và thao tác reconcile. Không dùng RPC validate riêng rồi tự cập nhật status như bảo đảm enforcement.
6. **Fail-closed theo processType**: với loại đã bật `workflowRequired`, không được tạo/duyệt/chuyển trạng thái nếu chưa tìm được binding và khởi tạo workflow thành công/được xác nhận. Với chuyển đổi triển khai, từng loại nghiệp vụ có mode `OBSERVE` rồi `ENFORCE`, được giới hạn theo organization; không để mode tùy ý do request client truyền.
7. **Bảo mật**: Gateway bảo vệ API quản trị; domain service kiểm tra actor/action/resource/org ở mỗi command. Không tin `roles`, `permissions`, `organizationId` hay actor do client tự gửi; lấy từ JWT/service identity đã xác minh. PBAC theo nguyên tắc quyền tối thiểu. Node script tùy ý, URL tùy ý, header/secret do designer nhập, truy cập nội mạng/SSRF đều không được thực thi; tích hợp phải là capability/plugin được quản trị allowlist, có timeout, credential vault, network policy và audit.
8. **Events và vận hành**: event envelope có `eventId`, `eventType`, `schemaVersion`, `occurredAt`, `tenant/org`, `processType`, `businessId`, `workflowInstanceId`, `definitionVersionId`, `commandId`, `correlationId`, `causationId`, actor/service và payload allowlist. Retry có backoff, giới hạn lần thử, DLQ/replay có quyền; không log/publish toàn bộ entity hoặc dữ liệu cá nhân.

## Service và vùng mã cần thay đổi

| Khu vực | Thay đổi dự kiến |
|---|---|
| `apps/workflow-service/prisma/schema/main.prisma`, migrations | Catalog, binding/version pinning, instance metadata/idempotency, command/ack/event outbox-inbox, audit và index/constraint; giữ migration expand-contract. |
| `apps/workflow-service/src/definition`, `execution`, controllers/consumers | Draft/version service, compiler-validator, resolver, runtime chỉ đọc compiled published version, command orchestration, inbox/outbox, authorization và event retry. Loại bỏ ApplyModule kiểu sửa code. |
| `shared/protos/workflow/workflow.proto` và proto/event consumers | API catalog/binding/validate-publish/start-by-process-type/submit-action/get-instance; command/ack/event envelope additive, field number không tái sử dụng; regen client/server stub theo quy trình repo. |
| `apps/api-gateway/src/modules/workflow` | API catalog, binding, publish validation, list/version/instance/action; quyền riêng cho thiết kế, publish, bind, unbind và tác nghiệp; tenant scope và DTO validation. |
| `apps/admin_khcn/components/workflow`, `features/workflow/api` | Designer lấy catalog node/capability, preview lỗi validate; binding editor thật (process type/scope/version/criteria/enable); runtime task/action theo allowed actions và trạng thái pending. Không gửi cấu hình code/URL thực thi thô. |
| `apps/document-service` | Bỏ đường tạo/cập nhật status vòng qua workflow event hoặc gRPC best-effort; transactional outbox, inbox nhận command; status mutation chỉ qua command workflow cho loại enforced; mapping trạng thái/nút là adapter domain. |
| `apps/hrm-service/src/modules/tasks`, `prisma` | Thay resolver/validator giả; bao phủ create/assign/accept/reject/start/complete/status/subtask và mutation trực tiếp; sửa outbox worker để publish/retry; idempotent command handler và OCC. |
| `apps/posts-service` | Bỏ workflow ID/node/status hard-code và trigger không bền; map command/action sang enum status ở domain handler; chặn endpoint cập nhật status trực tiếp khi process enforced. |
| `libs/workflow-client` và schema `workflow_infrastructure.prisma` tại consumer | API Outbox/Inbox hẹp, transaction-aware, idempotency nhất quán, payload allowlist, retries/metrics; đồng bộ schema chỉ ở service dùng thực tế. Không dùng Prisma extension hậu-mutation làm nền enforcement. |
| Notification/reporting và tài liệu kiến trúc | Rà consumer hiện có; chỉ đổi projection/notification khi event contract đổi; cập nhật module docs, API mapping, shared-libs và task-workflow, đánh dấu mô tả cũ sai. |

## Các bước thực hiện theo thứ tự

### Giai đoạn 0 — Chốt domain contract và inventory

1. Lập ma trận cho từng nghiệp vụ: processType, trigger, entity owner, org scope, trạng thái hiện có, action/command, permission, điểm tạo entity, API mutation, consumer/event và yêu cầu bắt buộc.
2. Chốt pilot đầu tiên theo đường đi đầy đủ; đề xuất tài liệu (`DOC_RECEIVED`), HRM task và bài viết (`POST_SUBMIT`) là các adapter đích, nhưng đối chiếu seed/production config trước khi đặt mã processType. Quyết định vai trò được tạo/publish/bind theo PBAC hiện hành.
3. Định nghĩa status mapping và invariant cho từng domain; phân biệt workflow task và business task HRM. Xác định policy nghiệp vụ khi binding chưa có: trong `OBSERVE` ghi metric/cảnh báo; trong `ENFORCE` chặn thao tác và hướng dẫn cấu hình binding.
4. Kiểm kê mọi endpoint, gRPC handler, consumer, cron, bulk/import/admin update có thể đổi status; không chỉ sửa nút UI. Rà notification/report projection và các consumer workflow khác để biết chính xác phạm vi migration.

### Giai đoạn 1 — Hợp đồng catalog, binding và quyền

5. Thiết kế proto/event contract có version; thêm catalog registration/query, validate-publish, binding CRUD/preview, resolve/start-by-processType, submit-action/ack và query runtime. Bảo toàn field số cũ; tạo test compatibility cho consumer hiện hữu.
6. Thêm schema catalog + binding version/scope/criteria/effective window/priority/audit; constraint ngăn binding mơ hồ cho cùng scope và điều kiện trùng nếu có thể kiểm soát bằng dữ liệu. Tạo migration expand trước, backfill binding hiện tại thành scope global/version đã publish sau khi kiểm chứng; unresolved binding phải được báo cáo, không tự gán latest.
7. Định nghĩa PBAC permissions riêng: workflow definition read/create/update, validate, publish, binding manage, instance read và task action. Áp dụng tại Gateway và lặp lại kiểm tra tenant/actor trong service.

### Giai đoạn 2 — Definition lifecycle và binding UI

8. Tách API create/update draft khỏi publish; sau published tạo draft version mới. Compiler phía server chuyển React Flow graph sang canonical format và lưu cả source/revision cần audit. Runtime chỉ đọc canonical compiled version.
9. Triển khai validator với lỗi có đường dẫn node/field để UI hiển thị. Chỉ cho phép nodes/capabilities đăng ký; vô hiệu hóa thực thi script tự do, URL tuỳ ý và node không được engine hỗ trợ. Thêm giới hạn tài nguyên và validate schema biến.
10. Viết resolver binding xác định theo scope (organization → phạm vi rộng hơn), processType, trigger/criteria và thời hạn. Từ chối zero/multiple match ở ENFORCE; log lý do và audit. `ApplyModule` được thay bằng thao tác bind rõ ràng, publish và bind là hai quyền/hành động riêng.
11. Hoàn thiện BindingList placeholder, chọn process catalog, scope, version published, tiêu chí được hỗ trợ, xem trước resolver, bật/tắt và lịch sử; UX không cho kích hoạt binding nếu validate/publish chưa đạt.

### Giai đoạn 3 — Runtime bền vững và thực thi command

12. Migrate ProcessInstance để ghim processType, business identity, organization, binding/version, idempotency/correlation; unique idempotency; mọi start chỉ nhận compiled published version từ resolver, không lấy “latest”.
13. Thay `ValidateAction` dạng kiểm tra cạnh đơn thuần bằng submit action có OCC, quyền, task assignment và audit. Tạo command/outbox bền vững cùng cập nhật runtime; domain ack mới xác nhận trạng thái hoàn tất. Nếu command thất bại thì giữ instance ở trạng thái chờ/lỗi có thể retry, không giả vờ thành công.
14. Làm lại Outbox/Inbox shared lib: ghi outbox trong cùng transaction với mutation nghiệp vụ bằng API transaction-scoped; publisher claim/retry/backoff; inbox unique command/event, lease/status/error; commit Inbox + domain changes cùng transaction. Không swallow lỗi ghi outbox; không đặt `workflowInstanceId='auto-binding'`; sửa lệch giữa model chung và `ProcessedCommand` trong workflow schema.
15. Chuẩn hóa correlation, tenant, event schema, payload allowlist, retries/DLQ/replay, metrics và reconciliation job. Đảm bảo event handler idempotent khi gửi lặp và chống event cũ bằng `expectedVersion/stateVersion`.

### Giai đoạn 4 — Adapter và enforcement từng service

16. **Document**: tạo document + outbox start/resolve trong một transaction. Đưa thao tác `process/finalize/status update` qua typed workflow command; domain consumer kiểm tra luật hồ sơ, cập nhật document/history/status và ack nguyên tử. Thay best-effort empty instance và consumer tự sửa domain status bằng command acknowledgement có version.
17. **HRM task**: đăng ký catalog action cho tạo/assign/accept/reject/start/complete/return/coordinate; bỏ resolver/transition cho phép giả. Chuyển tất cả đường đổi status trong task controller/service, participant/assignee handlers, subtask và worker sang command handler có PBAC/OCC. Outbox worker thật sự publish, chỉ đánh processed sau broker confirm; kiểm tra các `tx.task.update` trực tiếp.
18. **Posts**: thay `POST_WORKFLOW_ID`, mapping node hard-code và trigger `POST_SUBMIT` sau mutation bằng processType + binding resolver. Các lệnh submit/review/reject/approve/publish/unpublish map qua domain command, chặn API sửa status trực tiếp cho instance enforced; giữ status history và outbox trong transaction.
19. Cập nhật notification/report consumers theo event contract version mới sau inventory; projection chỉ cập nhật từ event domain đã commit. Các service khác chỉ được migrate nếu inventory xác nhận đang chạy workflow hoặc tiêu thụ schema/event bị thay đổi.
20. Cập nhật client screens để hiển thị workflow instance/task, action được phép từ server, trạng thái pending/error/retry; không dựa vào status list hard-code để quyết định quyền.

### Giai đoạn 5 — rollout, xác minh và hoàn tất

21. Triển khai theo expand-contract: thêm schema/contract tương thích, deploy consumer chịu event cũ/mới, backfill/đối soát, bật publisher mới, sau đó chuyển producer; chỉ xóa trường/consumer cũ ở release riêng sau khi hết sử dụng.
22. Chạy `OBSERVE` theo từng processType/organization: đối chiếu action domain với resolver/allowed actions; đo tỉ lệ không có binding, binding mơ hồ, command lỗi, trễ ack, duplicate, retry/DLQ và cập nhật status đi vòng. Không bật ENFORCE khi còn đường bypass hoặc dữ liệu binding chưa sạch.
23. Pilot một organization/processType; bật ENFORCE có feature flag cấu hình server-side, theo dõi dashboard và reconcile; mở rộng dần tài liệu → HRM → posts sau khi đạt ngưỡng chấp nhận do product/ops chốt.
24. Sau mỗi service, cập nhật runbook, API docs, sơ đồ ownership, module docs và lịch sử quyết định; xóa dần hard-code/fallback chỉ sau khi chứng minh không còn caller.

## Tiêu chí hoàn thành

- Người được phân quyền có thể tạo draft, nhận lỗi validation cụ thể, publish version bất biến và bind version đó vào processType/scope hợp lệ; binding được audit và resolver trả duy nhất một kết quả xác định.
- Tạo entity có workflow bắt buộc sẽ tạo/resolve instance đúng binding/version một cách idempotent; không có binding/instance trong ENFORCE thì thao tác bị từ chối an toàn.
- Mọi action hiện hành của document, HRM task và post đều lấy allowed action từ instance; trực tiếp sửa trạng thái qua REST/gRPC/import/consumer không thể vượt luồng khi ENFORCE.
- Domain service kiểm tra lại permission, tổ chức, invariant và expected version; workflow chỉ ghi transition thành công sau domain ack. Retry/replay không nhân đôi cập nhật.
- Published version không bị sửa; instance cũ giữ version đã ghim khi đổi binding; binding mới chỉ ảnh hưởng instance mới.
- Không thực thi script tự do/endpoint tự khai báo; payload/event tối thiểu và không rò secret/PII; có audit, retry/DLQ, metric, reconcile và runbook.
- Proto consumers compile tương thích; migration chạy được trên bản sao dữ liệu đại diện; có hướng rollback đã diễn tập cho từng giai đoạn rollout.

## Kế hoạch kiểm chứng cho giai đoạn triển khai

Không chạy test trong lượt lập kế hoạch. Khi implement, yêu cầu bổ sung và chạy:

- Unit tests: compiler/validator (graph hợp lệ, unreachable, dead-end, vòng lặp, node không hỗ trợ), resolver precedence/missing/ambiguous/effective date, PBAC, idempotency và OCC.
- Integration tests DB + broker: published version pinning; duplicate start/action/event; crash trước/sau publish; retry/DLQ/replay; command/ack; transaction rollback đảm bảo domain update và outbox cùng thành công/thất bại.
- Contract tests: proto field compatibility, schemaVersion event, old/new consumer coexistence; generated code không drift.
- E2E mỗi domain: document receive/process/finalize; task assign/accept/start/return/complete; post submit/review/reject/approve/publish. Bao gồm thiếu binding, user sai tổ chức/quyền, gọi API status trực tiếp, command lỗi và event trùng.
- Security tests: binding cross-tenant, actor giả, quyền publish/bind, arbitrary script/URL/SSRF, payload chứa secret/PII.
- Migration/reconcile: snapshot DB đại diện, backfill version/binding, đếm bản ghi orphan/ambiguous, đối soát status hiện tại với instance và chạy thử rollback.
- Load/resilience: burst trigger, broker downtime, consumer restart, version conflict và queue backlog; xác nhận retry không tạo lặp và cảnh báo hoạt động.

## Migration, rollout và rollback

- **Expand**: thêm bảng/cột nullable và index, event contract additive, consumer nhận cả format cũ/mới; backfill và báo cáo dữ liệu không suy ra được binding/version.
- **Observe**: gửi/resolve workflow song song để đo lệch nhưng không thay đổi quyết định status; không chạy command tạo side effect hai lần.
- **Enforce theo scope**: bật một processType + organization sau khi binding và toàn bộ mutation path đã được chứng minh; feature flag chỉ do cấu hình có quyền quản trị.
- **Rollback**: tắt enforcement flag để ngăn start/action workflow mới tại scope bị lỗi, giữ nguyên instance/audit/outbox; xử lý/replay pending command có kiểm soát và idempotent. Không xóa published version hoặc đảo ngược các domain command đã commit. Có adapter tương thích để domain tiếp tục xử lý theo policy rollback đã được product phê duyệt; không cho đường cập nhật status âm thầm bypass khi ENFORCE.
- **Contract**: rollback app theo thứ tự consumer trước producer; migration destructive/field removal chỉ sau cửa sổ quan sát và release riêng. Lưu snapshot, migration checksum, counts và danh sách binding/version trước rollout.

## Rủi ro/phụ thuộc và quyết định cần chủ sản phẩm chốt

- Chốt ai được thiết kế, publish và bind theo toàn hệ thống hay theo organization; mặc định đề xuất: design trong org được ủy quyền, publish/bind theo permission riêng, binding có thể cần người duyệt thứ hai.
- Chốt tập processType bắt buộc trong đợt đầu, mapping trạng thái legacy, tiêu chí binding được phép biểu đạt và hành vi khi nghiệp vụ đã có dữ liệu nhưng thiếu instance.
- Chốt UX khi workflow command bất đồng bộ: response `PENDING`, thời gian chờ tối đa, cách hiển thị lỗi/retry và vai trò được reconcile thủ công.
- Dữ liệu cũ thiếu `organizationId`, instance, binding version hoặc lịch sử action có thể không backfill an toàn; phải phân loại và xử lý thủ công thay vì suy đoán.
- Shared Prisma schema và generated proto có nhiều consumer; cần khóa thứ tự release và xác minh script sinh code thật của repo trước khi giao implement.
- Node editor có các loại script/integration/proxy nhưng executor/capability registry và giới hạn network hiện chưa được chứng minh; không bật các node đó cho user workflow cho đến khi có sandbox/allowlist và review bảo mật.

## Ngoài phạm vi đợt đầu

- Tự động chuyển instance đang chạy sang version mới.
- Cho người dùng viết mã tùy ý hoặc gọi endpoint bên ngoài từ workflow.
- Xây ngôn ngữ biểu thức tổng quát/Turing-complete; chỉ hỗ trợ điều kiện declarative có schema và giới hạn.
- Thay domain service làm chủ dữ liệu nghiệp vụ hoặc chuyển tất cả microservice sang một schema workflow dùng chung.
- AI tự thiết kế/publish quy trình mà không có người có quyền validate và bind.

## Phản biện sau khi lập kế hoạch

| Mức độ | Vấn đề/giả định bị phản biện | Ảnh hưởng | Điều chỉnh trong kế hoạch hoặc lý do giữ nguyên |
|---|---|---|---|
| Major | Catalog do domain service đăng ký có thể thành nơi đăng ký quy trình tùy ý, yếu kiểm soát quản trị. | Capability nguy hiểm hoặc không được duyệt có thể đi vào quy trình người dùng. | Catalog phải là contract/capability quản trị và version hóa; processType mới cần review quyền, contract và deployment của service sở hữu. |
| Major | Criteria tùy ý/JSON không thể đảm bảo không giao nhau chỉ bằng unique constraint. | Resolver có thể chọn workflow ngẫu nhiên hoặc gán nhầm quy trình. | Hạn chế criteria typed, schema hữu hạn; resolver đánh giá toàn bộ binding và từ chối nhiều kết quả; preview/test và kiểm tra xung đột khi bind. |
| Major | Domain đã commit command nhưng ack bị mất có thể làm lệch runtime workflow. | UI và hai service báo trạng thái khác nhau; retry có thể gây cập nhật lặp. | Command ID ổn định, Inbox idempotent, ack bền vững, workflow chờ ack; thêm test crash sau domain commit và reconcile/replay. |
| Major | Import, cron, bulk/admin, participant/subtask hoặc consumer có thể đổi status ngoài API chính. | Enforcement chỉ ở giao diện tạo cảm giác an toàn nhưng vẫn bị bypass. | Inventory mọi mutation path, gate ENFORCE trên mọi đường ghi và kiểm thử gọi trực tiếp endpoint/handler. |
| Major | Fail-closed trước khi backfill sạch có thể chặn nghiệp vụ đang chạy. | Gián đoạn vận hành production. | Triển khai OBSERVE rồi ENFORCE theo processType + organization, đối soát trước pilot; product/ops phải duyệt policy fallback và rollback. |
| Major | Allowed action của workflow không đồng nghĩa với quyền truy cập entity hoặc invariant domain. | Actor có thể thực hiện hành động sai tổ chức hoặc trái quy tắc nghiệp vụ. | Domain service kiểm tra lại actor đã xác thực, PBAC, org scope, invariant và OCC trước khi commit. |
| Minor | Migrate mọi service có schema workflow sao chép sẽ làm scope phình to. | Tăng số migration/consumer cần phối hợp mà không có lợi ích đã xác nhận. | Chỉ migrate document, HRM, posts và consumer được inventory xác nhận là phụ thuộc. |

### Kết luận phản biện

- **Gate trước triển khai**: resolver phải duy nhất; domain ack phải chịu được mất/lặp; mọi đường mutation nằm trong enforcement; kiểm soát tenant/PBAC ở domain; backfill và policy rollback được ops duyệt; capability nguy hiểm bị chặn.
- **Quyết định còn mở**: vai trò nào được publish/bind, processType bắt buộc đợt đầu, mapping status legacy, tiêu chí binding hỗ trợ và UX/reconcile cho command bất đồng bộ. Chủ sản phẩm và ops chốt trước khi bật ENFORCE.
- Giữ Control Plane + Data Plane theo ADR-002 vì phù hợp quyền sở hữu dữ liệu và failure handling hiện có; không còn phát hiện blocking sau khi các gate trên được thêm vào kế hoạch.
