# Mô hình dữ liệu mục tiêu

Đây là thiết kế cần triển khai/migration, chưa phải schema hiện tại. DB owner mặc định: user-service, PrismaMariaDb/MySQL theo cấu hình hiện hữu; không đổi provider/adapter trong đợt này. Dùng tên model/code tiếng Anh, table/column map snake_case và datasource URL ở prisma.config.ts.

## Entity và invariant

| Entity | Dữ liệu chính | Invariant/index |
|---|---|---|
| IntegrationConnection | id UUID, code stable, displayName, description, organizationId, networkZone, protocol, origin, basePath, configVersion, publishedVersion, lifecycle, deletedAt, createdBy/updatedBy, timestamps | Code/alias route giữ duy nhất toàn registry nếu URL chỉ dùng code; không tái dùng code đã archive; index organization/status/updatedAt/id |
| IntegrationEndpoint | id UUID, connectionId, organizationId, method, pathTemplate, operationId, summary, parametersSchema, requestSchema, responseSchemas, schemaVersion, status, expectedVersion, deletedAt | Unique connection+method+normalized path; organization phải khớp connection; index connection/status/method/id; template trùng semantics bị từ chối |
| CredentialBinding | id opaque, connectionId, organizationId, authKind, secretLocator nội bộ, credentialVersion, metadata đã redact, enabled | Không lưu raw credential trong JSON public; secretLocator chỉ server nhìn thấy; reference có quyền binding, không arbitrary env name |
| ConnectionAccessScope | connectionId, owner organization, allowed organization IDs hoặc global marker | Global phải được policy riêng cho phép; scope server-derived; no DEFAULT fallback |
| IntegrationRevision | registryScope, revision int64, checksum, contractVersion, immutable published config payload, createdAt, actor | Unique scope+revision; revision monotonic tăng trong transaction; payload chỉ approved metadata/reference, không raw secret |
| RegistryRevisionCounter | registryScope, next/current revision | Tăng atomic trong transaction publish/disable/tombstone; không tính MAX configVersion |
| IntegrationImportSession | id, actorId, organizationId, inputHash, normalized operations, target connection/version, status, expiresAt, validationIssues | Bounded bytes/operations/TTL; previewId chỉ actor có quyền đọc; không giữ raw tokens từ Postman/cURL |
| IntegrationCommandResult | idempotencyKey, actor, organization, operation, requestHash, result metadata, expiry | Unique scope+actor+operation+key; cùng key khác payload phải conflict; retention chốt G-05 |
| IntegrationAudit | id, actor/service identity, organization, targetId, action, before/after version, redacted diff, correlationId, createdAt | Append-only theo quyền DB/API; index org/target/time/id; không cascade delete khi xóa connection |
| IntegrationOutbox | id, eventType, registryScope, revision, targetId, redacted payload, attempts, nextAttemptAt, status, lease | Ghi cùng mutation; eventId ổn định; concurrency lease/OCC; bounded retry/dead-letter, không credential/token |
| InternalApiOperation | stable operation ID, serviceCode, method, normalized route, resource/action metadata, public marker, manifestVersion/hash | Authority route là code/build manifest; unique service+method+route; thiếu policy không tự thành public |
| ApiConsumer (G-02) | principalId, partner identity, owner organization, active, endpoint scopes | Service principal riêng; không impersonate browser user |
| ApiAccessKey (G-02) | keyId/prefix, consumerId, secure hash, issuedAt/expiresAt/revokedAt, scopeVersion, lastUsedAt | Random entropy đủ; key raw trả một lần qua TLS; DB không lưu plaintext; index keyId/consumer/status |

Secret storage lựa chọn tại G-04; nếu environment refs thì không tạo giao diện giả “lưu mật khẩu”. Nếu quản lý secret qua UI, phải có write-only channel, mã hóa/rotation và audit riêng trước khi bật.

## Chuyển trạng thái

- Connection: draft → validated draft → published; publish chỉ khi cấu hình/endpoint/auth/scope đều đạt. Sửa bản published tạo draft mới; traffic tiếp tục dùng version published.
- Connection: published → disabled; disable cập nhật deny và revision, hiển thị dependency/correlation. Re-enable là publish hợp lệ mới, không mở lại snapshot cũ âm thầm.
- Archived dùng deletedAt/tombstone; audit/revision còn theo retention được duyệt. Delete bị chặn khi consumer còn reference, trừ quy trình migration dependency cụ thể.
- Import: previewed → committed hoặc expired/invalidated. Commit có idempotency, expectedVersion; toàn lô trong giới hạn là atomic; không báo một nửa thành công.
- Outbox: pending → leased → delivered; lỗi retry bounded → dead-letter. Delivery không đồng nghĩa mọi replica đã apply; active revision được theo dõi riêng.
- Key inbound: active → rotated/revoked/expired; grace period rotation theo G-02/G-05; thu hồi không bị rollback config đảo lại.

## Validation

Network zone chỉ internal/external, protocol MVP HTTP. Origin có scheme/host/port, không query/hash/credential; basePath được chuẩn hóa riêng, tránh nối URL tạo traversal. Template chỉ segment literal hoặc `{parameter}`, precedence literal > template; không dùng regex tùy ý/catch-all mặc định. HEAD/OPTIONS phải khai báo semantics rõ, không suy diễn quyền.

Nested schema/parameter/query/body được giới hạn bytes/depth/property/operation counts và dialect được hỗ trợ; không compile script hoặc fetch `$ref` ngoài. ExpectedVersion là optimistic lock trong WHERE/updateMany và kiểm tra affected rows; không chỉ đọc rồi tăng version.

Snapshot revision dùng int64 string ở JS để không vượt Number precision; checksum bao gồm mọi config/publication/tombstone có hiệu lực. Quyền actor hiện hành vẫn kiểm tra tại execute, không đóng băng quyền trong snapshot.

## Migration mapping

IntegrationUpstream UUID giữ làm connectionId; name trở thành alias tạm, code chuẩn do tool đề xuất và chủ module xác nhận nếu không hợp lệ. `_uiConfig`/metadata được tách field có validation; `_parsedEndpoints` là candidate cặp operation, phải reconcile với tài liệu nguồn. Không có cặp đáng tin → quarantine.

`roles` cũ chỉ có ở adapter đọc/migration; không đưa vào model/contract mới. Mapping sang PBAC phải được chủ quyền xác nhận, không tự cấp MANAGE/global. Raw auth config và ApiKey plaintext cần provision/rotate có kiểm soát, không log/export ra fixture.
