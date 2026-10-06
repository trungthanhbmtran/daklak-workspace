# Data Model: Trình thiết kế báo cáo động

> Mô hình logic đề xuất; schema vật lý cần xác nhận theo migration/volume/policy ở Phase 0.

## ReportDefinition

- `id`, `ownerId`, `organizationId`, `title`, `description`, `status` (DRAFT/ACTIVE/ARCHIVED), timestamps.
- ACL/visibility is explicit; org scope is server-controlled.
- Has many immutable `ReportDefinitionVersion` records.

## ReportDefinitionVersion

- `id`, `definitionId`, `version`, `queryPlanVersion`, typed `sourcePlan`, `joinPlan`, `transformPlan`, `outputSchema`, `createdBy`, `createdAt`, optional validation record.
- Unique `(definitionId, version)`; published versions immutable.
- Source references use opaque approved source/endpoint IDs; no credentials or arbitrary base URL.

## ReportRun

- `id`, `definitionId`, `definitionVersionId`, `organizationId`, `requestedBy`, `idempotencyKey`, `status`, `createdAt`, `startedAt`, `finishedAt`, `rowCount`, `sourceWatermarks`, `schemaHash`, `resultChecksum`, redacted error, `retentionUntil`.
- Status transitions: QUEUED → RUNNING → SUCCEEDED | FAILED | CANCELLED; PARTIAL only when approved policy explicitly allows.
- Unique scope for idempotency and indexes for definition/time, org/status, queue claim.

## DatasetSnapshotChunk

- `id`, `runId`, sequence/chunk number, row range/count, encoded typed rows, checksum, createdAt.
- Unique `(runId, chunkNumber)`; read requires run ACL/org; chunks become immutable when run succeeds.
- Storage representation, size caps and indexing are benchmark gates.

## ReportWidget

- `id`, `definitionId` or dashboard/template id, title, `chartType`, dimension/measure mapping, display config, pinned `runId` (or latest-successful selector with explicit UI label), createdAt/updatedAt.
- Query execution belongs to ReportRun, not each widget render.

## Audit and retention

- Audit records capture actor/action/target/org/time/correlation; exclude secrets/raw PII payload.
- Cleanup metadata supports approved retention, legal hold, soft archive and verified deletion; exact policy is a decision gate.

