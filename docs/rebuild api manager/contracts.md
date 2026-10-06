# Contract mục tiêu

Trạng thái: thiết kế cho P1, không phải các endpoint đang tồn tại. Authority nội bộ là proto dưới shared/protos; HTTP schema được sinh/đối chiếu contract, không handwrite gRPC interfaces trùng lặp.

## HTTP quản trị

Prefix: `/api/v1/admin/api-management`. Backend phải kiểm tra actor/policy/scope với mọi route.

| Method/path tương đối | Use case | Action domain |
|---|---|---|
| GET /overview | Số liệu/cảnh báo có scope, không đếm bằng full list trên client | view |
| GET /connections | Search/filter/order/page/pageSize server-side | view |
| POST /connections | Tạo draft | create |
| GET /connections/:id | Chi tiết đã redact, capabilities, dependency summary | view |
| PATCH /connections/:id | Sửa draft với expectedVersion, field presence rõ | update |
| POST /connections/:id/validate | Validate config, schema/auth/scope/network policy | validate |
| POST /connections/:id/publish | Publish immutable version + revision | publish |
| POST /connections/:id/disable | Tắt traffic + deny/revision, lý do audit | disable |
| DELETE /connections/:id | Archive sau dependency check, expectedVersion | delete |
| GET/POST /connections/:id/endpoints | List phân trang/tạo endpoint draft | view/create |
| GET/PATCH/DELETE /endpoints/:id | Chi tiết/sửa/archive endpoint với version | view/update/delete |
| GET /auth-capabilities | Kinds/features thực sự được deploy | view |
| GET /credential-bindings | References đã được phép sử dụng, không secretLocator | manage-credentials |
| PUT /connections/:id/credential-binding | Bind/rotate opaque reference có quyền | manage-credentials |
| POST /imports/preview | Parse/normalize/diff, không gọi upstream | import |
| GET /imports/:previewId | Preview của actor cùng scope | import |
| POST /imports/:previewId/commit | Server validate resolution/version; commit draft atomic | import |
| POST /endpoints/:id/test | Execute endpoint với params/query/body, không raw URL/secret | test |
| POST /connections/:id/test-auth | Test auth đã bind, kết quả che token | test-auth |
| GET /internal-operations | Route manifest/policy coverage đã kiểm kê | view-internal-catalog |
| GET /connections/:id/dependencies | Caller/report reference đúng scope | view |
| GET /audit | Phân trang/filter audit, quyền riêng | view-audit |
| GET /runtime-status | Desired/active revision và gateway health đã lọc | view-runtime |
| POST/GET /consumers; POST /consumers/:id/keys (G-02) | Quản lý principal/issue key một lần | manage-consumers/manage-keys |
| GET /consumers/:id/keys; POST /keys/:id/rotate hoặc /revoke (G-02) | Metadata, rotation/revocation; không GET raw key | manage-keys |

Action code cuối cùng phải align action enum/evaluator PBAC hiện hữu tại P1. Không chỉ thêm string decorator mà chưa có policy evaluator/support trong owner service.

List envelope: `{ success: true, data: [...], meta: { pagination: { page, pageSize, total, totalPages } }, timestamp }`. Detail giữ `{ success, data, meta, timestamp }`. Error gồm stable `errorCode`, message đã lọc, correlationId; HTTP 400/401/403/404/409/413/422/429/502/503/504 có semantics rõ. Không dựa interceptor suy đoán list để chuyển detail thành array; kiểm thử schema đường đi thật qua TransformInterceptor.

Trong module dùng typed transport adapter đọc envelope một lần. Không thay response interceptor toàn ứng dụng chỉ để sửa test API. APIClient hiện unwrapping response.data cần được khai báo type đúng hoặc adapter riêng, không trả AxiosResponse giả.

## Import

Preview request: target connection hoặc draft mới, expected target version nếu có, format, file/text. Server cắt/loại auth secrets khỏi dữ liệu normalized và ghi warning khi field không hỗ trợ; có limit trước và sau parse.

Preview response: previewId, expiresAt, inputHash, targetVersion, operations `{ candidateId, method, pathTemplate, diffStatus, issues }`. Conflict identity connection+method+normalized template; không so sánh path giữa mọi upstream như cùng một namespace.

Commit request: previewId, expectedVersion, resolutions theo candidateId (`CREATE`, `OVERWRITE`, `SKIP` trong phạm vi được cho phép), idempotency key. Server sử dụng dữ liệu đã validate, không tin operations từ browser. Transaction tạo/sửa draft + audit + command result; publish là bước riêng. Stale preview/conflict = 409; lỗi atomic không trả success. Lô vượt cap bị từ chối trước khi giữ transaction lâu; batching lớn là thiết kế khác có job/result contract rõ.

## Test và proxy

Test request chỉ có endpointId (path), expected published/schema version, pathParameters/query/allowed headers/body và test mode. URL/network zone/credential/actor/scope do backend resolve. Draft test chỉ cho actor có quyền riêng, cùng executor policy; không làm draft tự thành published traffic.

Test result envelope có `executionStatus` (`COMPLETED`, `FAILED`, `CANCELLED`, `UNKNOWN_OUTCOME`), `upstreamStatus`, durationMs, safe headers, redacted body, truncated, correlationId và errorCode. Partner 401/403 nằm trong upstreamStatus; Hub auth failure mới dùng HTTP 401. Abort browser phải được truyền vào executor, giới hạn timeout/concurrency và cleanup.

Proxy compatibility `/api/v1/admin/gw/:connectionCode/*` trong kỳ migration giữ HTTP body/status/stream; không wrap JSON tùy tiện. Endpoint resolver phải kiểm tra đúng method+path template, published revision và quyền trước forwarding. Query/body/header runtime có limit/validation. Inbound partner không dùng browser cookie route; có biên `/api/v1/partner/...` riêng chỉ khi G-02 được chốt.

## gRPC v2

Thêm package/service typed tại `shared/protos/integration/api-management.proto`, cấu hình loader/generate tại gateway/user-service. Không đổi field number hoặc xóa message cũ trong users/integration.proto. Với contract cũ cần retire, reserve numbers/names sau khi migration hoàn tất.

RPC families: List/Get/Create/Update/ArchiveConnection; List/Create/Update/ArchiveEndpoint; Validate/Publish/DisableConnection; Preview/Get/CommitImport; List/BindCredential; ListInternalOperations; GetAudit/GetDependencies; GetPublishedSnapshot. Inbound family chỉ thêm sau G-02. Không expose mỗi internal helper thành RPC.

Snapshot request: registryScope service-authorized + lastRevision + contractVersion; response typed revision/checksum/configVersion/connections/endpoints/tombstones, không raw secrets. Snapshot lớn có byte cap/chunk protocol/checksum theo P3 nếu số liệu cần; không JSON parse không giới hạn.

Actor/context gắn qua metadata xác minh; service identity có audience/capability cho snapshot/worker. CallerUserId trong legacy body không thể override actor. OrganizationId query là selector trong phạm vi đã xác thực, không là authority.

Proto cập nhật dùng optional/oneof hoặc field mask có presence; expectedVersion required theo use case. IDs string, revision int64 string runtime; enum network zone/protocol/auth/method rõ. Domain errors map gRPC UNAUTHENTICATED/PERMISSION_DENIED/NOT_FOUND/ALREADY_EXISTS/INVALID_ARGUMENT/FAILED_PRECONDITION/ABORTED/RESOURCE_EXHAUSTED/UNAVAILABLE/DEADLINE_EXCEEDED, rồi HTTP ổn định.

## Event

`integration.registry.changed.v2`: eventId, schemaVersion, registryScope, revision, changeType, targetId, correlationId, occurredAt. Không chứa secret/auth token/body. Event chỉ gợi ý refresh; snapshot authoritative.

Mutation + audit + outbox atomic; worker publish có confirm/retry, consumer idempotent và check revision. Mỗi gateway có subscription broadcast; không dùng shared competing queue như cơ chế bảo đảm đồng bộ mọi replica. Snapshot polling reconcile khi event mất. Runtime metrics/ack theo replica không thay mutation authority.

## Compatibility

Adapter legacy giữ name/path alias và response semantics đã test, chuyển command vào owner v2. UI cũ không được mở lại auth test bypass; unavailable capability trả lỗi rõ. Report source definition cũ vẫn đọc qua adapter nhưng không bypass v2 endpoint/scope checks. Schema match phải có consumer test trước khi bỏ bất kỳ field/RPC/URL nào.
