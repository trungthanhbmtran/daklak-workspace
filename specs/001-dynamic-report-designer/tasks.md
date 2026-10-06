# Tasks: Trình thiết kế báo cáo động

Tasks are ordered by dependency. Detailed design, constraints and acceptance criteria are in [plan.md](plan.md), [spec.md](spec.md), and [docs/plans/dynamic-report-designer.md](../../docs/plans/dynamic-report-designer.md).

## Phase 1 — Setup and inventory

- [ ] T001 [P] Inventory report APIs, gRPC methods, Prisma models, UI imports and stored legacy template usage in `apps/report-service`, `apps/api-gateway`, `apps/admin_khcn`, `shared`.
- [ ] T002 Select pilot sources and record approved source owner, pagination, schema, field sensitivity and throughput limits in `docs/plans/dynamic-report-designer.md`.
- [ ] T003 [P] Define SLO, join caps, partial-run policy, retention, export and executor boundary in `docs/plans/dynamic-report-designer.md`.

## Phase 2 — Foundations

- [ ] T004 Define versioned report/query/source/join/run/snapshot contracts in `shared/reporting/`.
- [ ] T005 Define additive RPC contracts and compatibility window in `shared/protos/reports/report.proto`.
- [ ] T006 Add definition/version/run/snapshot schema and migration in `apps/report-service/prisma/schema/main.prisma` and `apps/report-service/prisma/migrations/`.
- [ ] T007 Add permissions and organization/field access checks to `apps/api-gateway/src/modules/reports/` and report-service read/run handlers.
- [ ] T008 Implement bounded deterministic join/transform planner in `apps/report-service/src/modules/reports/` while retaining callers from `statistics.service.ts`.
- [ ] T009 Implement registered source execution with pagination, redaction, provenance and limits at the approved integration boundary.
- [ ] T010 Implement run state machine, job queue/worker, idempotency, cancellation and chunked snapshot persistence in `apps/report-service/src/modules/reports/`.

## Phase 3 — US1: Compose multi-source report

- [ ] T011 [US1] Add source catalog and field/schema explorer APIs/hooks in `apps/api-gateway/src/modules/reports/` and `apps/admin_khcn/features/reports/`.
- [ ] T012 [US1] Build accessible drag canvas and keyboard/wizard source/join editor in `apps/admin_khcn/features/reports/components/`.
- [ ] T013 [US1] Build typed validation diagnostics, row estimate and bounded preview table in `apps/admin_khcn/features/reports/components/`.

## Phase 4 — US2: Save configuration and result snapshots

- [ ] T014 [US2] Add report definition/version CRUD and validation in `apps/report-service/src/modules/reports/` and `apps/report-service/src/modules/templates/`.
- [ ] T015 [US2] Add create/list/status/cancel/retry run and snapshot schema/page APIs in `apps/report-service/src/modules/reports/`.
- [ ] T016 [US2] Add versioned run controls, status/freshness/history UI in `apps/admin_khcn/features/reports/`.

## Phase 5 — US3: Tables, charts and export from a snapshot

- [ ] T017 [US3] Refactor `TableReportWidget.tsx`, `ReportTable.tsx`, and `ChartRenderer.tsx` to consume snapshot/run IDs in `apps/admin_khcn/features/reports/components/reports/`.
- [ ] T018 [US3] Add reusable widget/chart configuration bound to one immutable run in `apps/admin_khcn/features/reports/`.
- [ ] T019 [US3] Add authorized paginated/streaming exports at `apps/report-service/src/modules/reports/` and gateway routes.

## Phase 6 — US4: Legacy compatibility and cleanup

- [ ] T020 [US4] Dry-run migrate old templates/widgets and list unmappable records in `apps/report-service/src/modules/templates/`.
- [ ] T021 [US4] Replace production mock fallback with explicit empty/error behavior in `apps/admin_khcn/features/reports/components/reports/ReportDashboard.tsx`.
- [ ] T022 [US4] Create cleanup ledger with caller scans, route telemetry, data proof and rollback evidence in `docs/plans/dynamic-report-designer.md`.
- [ ] T023 [US4] Remove only proven-unused `mockData.ts`, legacy `ReportBuilder.tsx`/API branches/routes/models in `apps/admin_khcn/features/reports/`, `apps/api-gateway/src/modules/reports/`, `apps/report-service/`.
- [ ] T024 [US4] Keep or extract `table-engine.ts` compatibility for `statistics.service.ts`; remove code only after reference scan in `apps/report-service/src/modules/reports/`.

## Final phase — validation and operations

- [ ] T025 [P] Add contract, authorization, join semantics, job recovery, migration and cleanup evidence tests in `apps/report-service`, `apps/api-gateway`, `apps/admin_khcn`.
- [ ] T026 [P] Add runbook, metrics, alerts, retention and recovery instructions in `apps/report-service/docs/` and project docs.
- [ ] T027 Verify latency/volume SLO and rollback rehearsal; record measured results in `docs/plans/dynamic-report-designer.md`.

## Dependencies and MVP

- T001–T003 gate contract design. T004–T010 are foundations. US1 and US2 form MVP; US3 follows snapshot APIs; US4 cleanup runs only after migrations and telemetry. T025–T027 close release gates.
- Parallel after inventory: T003 with API contract discovery; frontend shell preparation after T004; operations docs after T006. Engine/storage and source executor must land before real preview/run UI.
- Independent acceptance: US1 joins a two-source fixture under approved caps; US2 reloads a persisted run without refetching sources; US3 all views use identical run ID; US4 legacy data survives and every deletion has evidence.

