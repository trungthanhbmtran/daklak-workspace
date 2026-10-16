# CRITICAL REVIEW — Rà soát toàn dự án daklak-workspace
Ngày: 2026-10-16. Read-only, không sửa code. Mọi finding có file:line thực tế.
Phạm vi: apps/api-gateway, user, hrm, document, posts, media, chat, notification, translate, report, workflow; libs/workflow-client; shared/*; apps/admin_khcn; apps/portal-goverment; apps/*/prisma.

---

## LEDGER SỬA LỖI (cập nhật trạng thái tại đây khi fix — tick ✅ khi verified)
| # | Mức | Tóm tắt | Trạng thái | Người sửa | Ngày sửa | Bằng chứng kiểm chứng |
|---|-----|---------|-----------|-----------|----------|----------------------|
| 1 | P0 | workflow-client syntax hỏng (2 file) | ⬜ TODO | — | — | — |
| 2 | P0 | inbox-idempotency schema mismatch + ghi SUCCESS trước logic | ⬜ TODO | — | — | — |
| 3 | P0 | Prisma drift: Outbox/ProcessedCommand/binding không migration | ⬜ TODO | — | — | — |
| 4 | P0 | Migration DROP 7 bảng + NOT NULL không default + DROP+ADD snake_case | ⬜ TODO | — | — | — |
| 5 | P0 | benchmark.js truncate notificationLog | ⬜ TODO | — | — | — |
| 6 | P0 | LGSP clientId/clientSecret hardcode | ⬜ TODO | — | — | — |
| 7 | P0 | internal-secret-daklak fallback ×4 file | ⬜ TODO | — | — | — |
| 8 | P0 | SSO secret/ID hardcode + token localStorage (portal) | ⬜ TODO | — | — | — |
| 9 | P0 | DB/AMQP/MinIO credentials hardcode ×10+ file | ⬜ TODO | — | — | — |
| 10 | P0 | grpc-auth.guard impersonate systemUser khi thiếu env | ⬜ TODO | — | — | — |
| 11 | P0 | report-service `\|\| true` vô hiệu permission check | ⬜ TODO | — | — | — |
| 12 | P0 | RCE new Function + startProcess dùng version chưa PUBLISHED | ⬜ TODO | — | — | — |
| 13 | P0 | workflow gRPC không auth guard, identity từ payload | ⬜ TODO | — | — | — |
| 14 | P0 | AI Assistant không owner-scope | ⬜ TODO | — | — | — |
| 15 | P0 | media/download/:id không guard | ⬜ TODO | — | — | — |
| 16 | P0 | chat sendMessage spoofing senderId | ⬜ TODO | — | — | — |
| 17 | P0 | IDOR chat GetMessages + report run snapshot | ⬜ TODO | — | — | — |
| 18 | P0 | notification REST API không authentication | ⬜ TODO | — | — | — |
| 19 | P1 | ~70+ gRPC gateway + 7 services thiếu metadata | ⬜ TODO | — | — | — |
| 20 | P1 | document dual source of truth workflow status | ⬜ TODO | — | — | — |
| 21 | P1 | admin_khcn tự tính KPI/permission client-side | ⬜ TODO | — | — | — |
| 22 | P1 | workflow engine race/OCC/idempotency | ⬜ TODO | — | — | — |
| 23 | P1 | Fabricated KPI data (report + portal) | ⬜ TODO | — | — | — |
| 24–36 | P2 | Bug/hiệu năng (broadcast recipient array, floating promise, safeParse, N+1, unbounded query, collision HS-code, presence TTL...) | ⬜ TODO | — | — | — |
| P3 | P3 | Vệ sinh (console spam, dead code, eslint_output.json, encoding) | ⬜ TODO | — | — | — |

---


## P0 — LỖ BUILD / LỠ SECRET / LỖ HỔNG SECURITY-BYPASS ( urgency: hôm nay )

### A. Build & Data loss
1. `libs/workflow-client/src/services/transactional-outbox.service.ts:19,23` + `inbox-idempotency.service.ts:23-24` — **syntax hỏng** (mất quote/dollar trong template). Lib không importable → mọi service dùng workflow-client break build.
2. `libs/workflow-client/src/services/inbox-idempotency.service.ts:18-35` — schema mismatch (`processedCommand.commandId` không tồn tại trong schema) + ghi SUCCESS TRƯỚC khi business logic chạy → retry hợp lệ bị chặn vĩnh viễn.
3. Prisma migration drift: 8 model workflow (ProcessType, ProcessBinding, WorkflowCommand, OutboxEvent, ProcessedCommand…) không migration nào tạo; Outbox khai báo ở TOÀN BỘ service nhưng không bảng nào có migration + runtime đang ghi thật (document/document.service.ts:54,143,165). DB mới deploy → P2021.
4. `workflow-service/prisma/migrations/20260720062432…` DROP 7 bảng + NOT NULL không default; `20260720073000…` đổi camelCase→snake bằng DROP+ADD (~8 bảng) — mất data. Vi phạm Additive Migration (Hiến chương §5).
5. `notification_service/benchmark.js:13,38` — script debug có `prisma.notificationLog.deleteMany({})` → chạy nhầm mất log kiểm toán.

### B. Secrets hardcode (phải ROTATE key)
6. `document-service/src/modules/lgsp/lgsp.config.ts:20-21` — clientId/clientSecret trục LGSP chính government trong source.
7. Fallback chuỗi `'internal-secret-daklak'` (internal auth token) lặp ở: api-gateway `registry.service.ts:36-39`, `executor.service.ts:271-274`, report-service `statistics.service.ts:215(-983)`, shared `grpc-auth.guard.ts:28` — nếu thiếu env, mọi caller có token công khai này qua mặt xác thực nội bộ.
8. `apps/portal-goverment/app/api/auth/sso/exchange/route.ts:13` — SSO_CLIENT_SECRET hardcode; `providers/auth-provider.tsx:43-44` — SSO_CLIENT_ID/AUTH_URL fallback + token lưu localStorage (nguy cơ XSS).
9. Credentials DB/AMQP/MinIO hardcode: notification_service server.js:16, worker/consumer.js:12, seed.js:5, benchmark.js:3 (mysql root) ; AMQP ở document/posts/notification/report `main.ts` + modules (admin:admin123) ; chat main.ts:52 ; media minio `minio.service.ts:26-27` (minioadmin/minioadmin); `translate_service/.env` committed; `posts-service/src/main.ts:89` log full URL có password.
10. `shared/grpc-auth.guard.ts:28-35` — fallback token cho phép impersonate `systemUser` với `permissionsFlatten:['*']`.

### C. Authorization bypass
11. `report-service/reports.service.ts:1382-1391` — permission check bị `|| true` đè chết → mọi user nạp được API catalog liên thông.
12. **RCE**: `workflow-service/execution/execution.service.ts:391-403` — `new Function('context','with(context){…}')` chạy script từ graph thô; validator chỉ chạy lúc publish, còn `startProcess` lấy version mới nhất bất kể status (:41-49). Escape: `variables.constructor.constructor("return process")()`.
13. **workflow-service gRPC KHÔNG auth guard nào** — identity `actorId/createdBy/initiatorId` đọc từ payload client tự khai (grpc.controller.ts:34,117,207; execution.service.ts:147,155).
14. **AI Assistant không owner-scope**: user-service `ai-assistant.service.ts:66-156` — get/update/delete/knowledge-source chỉ `where:{id}`; gateway `ai-assistant.controller.ts` chỉ JwtAuthGuard → user bất kỳ CRUD assistant của người khác.
15. `GET admin/media/download/:id` không guard — `api-gateway/media/media.controller.ts:35-43` (public un-authenticated qua nginx).
16. Chat `sendMessage` spoofing — `api-gateway/chat/chat.controller.ts:130-136` chỉ gán senderId từ req.user khi client không gửi.
17. IDOR: chat `GetMessages(conversationId)` không verify participant (message.controller.ts:17-29); report `getReportRunStatus/getDatasetSnapshot` by runId không scope org (reports.service.ts:701-705,738-741).
18. `notification_service/server.js:48-92` — REST quản lý channel (bot-token/SMTP creds) không authentication middleware.

---

## P1 — VI PHẠM KIẾN TRÚC HÀN CHƯƠNG QUY MÔ HỆ THỐNG

19. **gRPC Metadata Delegation (Hiến chương §113)**: ~70+ call-site ở api-gateway thiếu `getGrpcMetadata(req)` (xác minh: không có interceptor global — app.module.ts, main.ts, global-client.module.ts; chỉ 8 file tuân thủ). Service-to-service cũng 0 match `getGrpcMetadata|GatewayContextToken` trong 7 domain services: document `workflow.service.ts:54-65,215-220` (TriggerWorkflow/ResumeWorkflow), posts `workflow.service.ts:42-48,58-63` (ValidateAction — chính là phân quyền bài viết).
20. **Dual source of truth workflow**: document-service `document.service.ts:219-238` — `update()` nhận `status/PUBLISHED` thẳng từ client, bypass workflow-service, actor lấy từ `data.userId/data.userName` không verify; `processDocument/finalizeDocument` là dead code.
21. **Frontend tự quyết nghiệp vụ (vi phạm "Frontend là dumb client")**: admin_khcn `TaskEvaluateClient.tsx:70-152` — client tự tính weights KPI (0.25/0.4/0.2/0.15), timeliness scoring, rankGrade A/B/C/D và submit score; backend `hrm tasks.service.ts:1116-1134` lưu verbatim không recompute. `usePermissions.ts:40-73` — hardcode `username === "admin" || employeeCode === "ADMIN001"` + role string-match tiếng Việt. `useHrmPermissions.ts:38-49,100-113` — client tự tính quyền theo supervisor/assigner thay vì dùng `allowedActions` backend. feedback-page.tsx:76/80 — `status:"approved"` hardcode client.
22. **workflow engine race/OCC** (execution.service.ts): idempotency check-then-create ngoài tx (:55-65,:121-126); transition không claim theo `stateVersion` (:204-240); ghi `node.code` đọc theo `node.id` (:320/:359) — state machine corrupt khi code≠id; ACK duplicate P2002 (:274-277).
23. **Fabricated data**: report-service `getSampleRowsForApi` (reports.service.ts:58-137,517-522) + statistics.service.ts:1023-1117,1289-1291 — KPI bịa vào snapshot/export; portal footer visit-counter bịa, poll cứng 45/35/15/5%, form "SENT" không call API, nút tải/nộp hồ sơ là `alert()`, news-page toàn mock (news-page.tsx:15-199, news-detail-page.tsx:74-204).

---

## P2 — BUG CHẠY THẬT & HIỆU NĂNG

24. Notification broadcast bug: `worker/consumer.js:89-94` + Telegram/Facebook adapter — truyền mảng recipients làm `recipient` → Telegram 400, mất cả channel. SmtpAdapter nhầm `passwordRef`.
25. `api-gateway/notifications.controller.ts:80-96` — markRead floating promise, endpoint luôn `{}`; :99-110 — sequential await từng recipient (broadcast toàn đơn vị).
26. JSON.parse nguyên thủy thay `safeParse` (grep safeParse/metadataJson/schemaJson toàn repo = 0 implement): pbac.service.ts:31,156 (trong $transaction), users.service.ts:1134, translate.service.ts:79, hrm tasks.service.ts:715, grpc.controller.ts:157-369, posts.service.ts:234, statistics.controller.ts:96-97, python mq_consumer.py:24 → crash worker.
27. Catch nuốt lỗi: serviceTask workflow (:451-453) instance kẹt RUNNING vĩnh viễn; lgsp edxml.util.ts:110, dossiers.service.ts:44 catch{}; posts workflow catch→null.
28. axios hot path không timeout: `workflow-service/sdk/sdk.service.ts:29-36`; RMQ emit fire-and-forget (rabbitmq.service.ts:13-15).
29. `dossiers.service.ts:51,88` — mã hồ sơ `HS-${year}-${Math.random()*9000}` collision sau ~100 hồ sơ/năm.
30. Chat presence không TTL (`presence.service.ts:31-33`) → stuck ONLINE sau crash.
31. Least Data: ListUsers({take:500}) full bản ghi nhạy cảm (cccd/phone) chỉ để gán tên (hrm tasks.service.ts:117, master-plans.service.ts:93); gateway config findMany include full trả apiKey hiệu lực; document list trả content richtext; notificationChannel trả full config token.
32. N+1: translator.py:174-176 per-row query; LGSP per-packet HTTP+DB tuần tự; getAllowedActionsBatch per-request redis+SQL (execution.service.ts:571-574); portal-config Promise.all upsert không transaction.
33. Unbounded query: listInstances take không clamp (execution.service.ts:503-509); dossiers un-paged; posts findBySlug include translations không take; portal-menu findMany full mỗi render; report engine tự dùng `new PrismaClient` (dual pool).
34. Error mapping: RpcException code số gRPC (5→404) không map → INTERNAL_ERROR (shared all-exceptions.filter.ts:40-49); 8 RPC proto không implement.
35. Frontend: query-key collision `["public-banners"]` 2 shape khác nhau (portal header/home vs DynamicPageRenderer); `dangerouslySetInnerHTML` không sanitize; customCss chèn raw (appearance-provider.tsx:175); mega-fetch 6 query khi mount (DynamicPageRenderer.tsx:913-992); api-manager detail mega-object `endpoints[].schema` fallback object cha (ApiConnectionDetail.tsx:89); ReactQueryDevtools vào prod bundle.
36. Workflow StartWorkflow map sai contract: `organizationId = businessType || 'DEFAULT'` (grpc.controller.ts:259), `organizationId = data.entity` (:630); priority=0 bị falsy (:185).

---

## P3 — VỆ SINH MÃ NGUỒN (Hiến chương §7 — Clean-up Gate)
- console.error thay Nest Logger ~100 điểm (gateway, hrm kpi-evaluations.service.ts:112,130); console.log/print đầy đủ ở notification_service (17 match), translate_service (grpc_server.py:24, mq_consumer.py:34-90, translator.py:53-187), benchmark.js; `libs/workflow-client/prisma-outbox-extension.ts:44,77` console.error.
- 44 file admin_khcn chứa console.error/warn; dead component FinanceUploadModal.tsx (không được import).
- eslint_output.json được git track (workflow-service); comment double-encoded UTF-8 mỗi file; Service name `'MASTER_PLAN_PACKAGE'` inject string hardcode (master-plans.service.ts:41) lệch chuẩn MICROSERVICES.*.
- Duplicated getCookie copy-paste 7 file portal; unwrap fallback `.data?.data || .data` rải rác (admin_khcn organization/api.ts:108,116) — cần chuẩn hoá 1 helper.

## Nơi đã tuân thủ tốt
- user-service organizations tree (cache + updateMany + groupBy), hrm employees tenant-scope, outbox-publisher (CAS claim + backoff + DLX), sso auth flow, 82/82 page.tsx là Server Component, admin_khcn không double-/admin prefix (normalizeUrl interceptor), rejected negative: không cross-service DB query, không data sovereignty violation.

---
## Kết luận
Không có lỗi typecheck trực tiếp kế lược, nhưng hệ thống đang mang 10 secret/credential hardcode, 2 bypass quyền (`|| true`, token fallback), 1 RCE, 1 service không auth (workflow), 1 owner-scope miss (AI Assistant), 1 route public (media download), cùng 1 frontend tự tính KPI — trong đó đang có -> vĩnh viễn được chụp khi audit git. Cần rotate toàn bộ key trong P0 trước khi fix code.
