# Hợp đồng API dự kiến: Báo cáo động

> Logical contract. Exact REST routes/proto messages and field numbers follow inventory and additive compatibility review.

| Operation | Purpose | Key behavior |
|---|---|---|
| `listSources` | Sources and fields visible to caller | Returns opaque IDs, metadata, pagination/schema capability and sensitivity labels; never secrets. |
| `validateDefinition` | Validate query plan | Checks source/field permission, type compatibility, join graph, supported operators/caps; returns diagnostics addressed to source/node/field. |
| `previewDefinition` | Bounded preview | Uses same compiler/semantics as run; returns schema, capped rows, warnings/estimated fanout. Does not persist a successful snapshot. |
| `saveDefinitionVersion` | Save draft/version | Idempotent request; versioned query plan; authorization and org scope from verified context. |
| `createReportRun` | Enqueue or execute | Returns `runId` + QUEUED/RUNNING; idempotency key avoids duplicate active work. |
| `getReportRun` | Read run state | Includes timestamps, row count, watermark, redacted error and state; ACL checked. |
| `cancelReportRun` | Cancel queued/running work | Idempotent; records actor/audit; cancellation cannot claim rollback of already fetched sources. |
| `getSnapshotSchema` / `getSnapshotPage` | Read persisted output | Requires read ACL and org scope; stable by run ID and cursor/page. |
| `exportSnapshot` | Export selected run | Re-checks export permission; bounded streaming, audit, no live source re-fetch. |

## Common constraints

- Version all query/config and event contracts; additive proto field numbers only.
- Do not trust `actorId`, permissions, organization, source auth or policy from request payload.
- Typed errors distinguish invalid plan, forbidden source/field, source unavailable, resource limit, stale schema, run state conflict and internal failure.
- All lists/pages/exports bounded. Responses include correlation and `runId` where applicable.

