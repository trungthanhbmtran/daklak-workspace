# Kế hoạch kỹ thuật: Trình thiết kế báo cáo động

Kế hoạch chi tiết đã được rà soát nằm tại [docs/plans/dynamic-report-designer.md](../../docs/plans/dynamic-report-designer.md). Đây là bản điều phối theo cấu trúc Spec Kit.

## Technical Context

- Backend: NestJS microservices, gRPC contract trong `shared/protos`, API Gateway REST; MariaDB/MySQL qua Prisma 7.
- Frontend: Next.js, React Query, Axios, feature-first `apps/admin_khcn/features/reports`.
- Data path hiện có: integration registry → gateway `ReportSourceService` → report-service `ExecuteTable` → UI; source hiện một API, giới hạn 2MB/5.000 rows.
- Target: versioned typed query plan; report-service owns run/snapshot; integration service owns upstream network/secrets; worker async cho heavy run.
- Unknown/gates: executor boundary, pagination support, SLO/caps, classifications/retention, partial results, exports, database capacity.

## Decisions

- Lưu riêng definition version và immutable report run/snapshot.
- Typed query AST thay cho SQL generation/user code.
- MVP INNER/LEFT join, key equality/AND, bounded fanout/payload/CPU.
- API credentials and SSRF controls stay within approved integration executor.
- Keep compatibility until data and callers are migrated; cleanup requires evidence.

## Phases

1. Inventory and decisions.
2. Versioned contracts and data model.
3. Join engine, source execution, persistence, async jobs.
4. Gateway and redesigned UI.
5. Legacy migration, evidence-based cleanup, operations/rollout.

## Quality Gates

PBAC + tenant + field recheck; bounded queries; deterministic joins; snapshots consistent; contract compatibility; backup/rollback; no code removed before caller and data migration proof.

