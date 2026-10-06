# Quickstart validation guide: Báo cáo động

> Validation plan, not executed yet. It requires approved pilot APIs and seeded data.

## Prerequisites

- Test environment with API Gateway, report-service, Prisma DB and approved integration registry/executor.
- Two test APIs with stable, non-sensitive join keys, pagination metadata and controlled duplicate/null cases.
- Test identities for allowed report designer, read-only viewer and denied organization/field.

## Scenarios

1. Discover two sources; confirm source IDs/schema appear and auth headers/secrets do not.
2. Build INNER JOIN on unique keys and compare preview to fixture expected rows.
3. Build LEFT JOIN including unmatched left rows; verify null and duplicate-key/fanout semantics.
4. Submit invalid field/type/cycle/oversize plan; confirm actionable diagnostics and no run/snapshot marked successful.
5. Save a definition version, enqueue run, restart worker during chunk persistence, recover and verify one complete run/checksum.
6. Read table and render chart/export from one `runId`; verify none re-calls source APIs.
7. Deny unauthorized org/source/field on preview, run, snapshot read and export; verify audit/redaction.
8. Migrate legacy templates in dry-run, compare counts/IDs/config mappings, retain unmappable examples, and rehearse rollback.

## Required measurements

Record source request counts, payload bytes, rows/intermediate rows, preview latency, run duration/queue age, snapshot storage, chart open latency and export throughput by approved size tiers. Set pass/fail thresholds at Phase 0; do not infer SLO success without those targets.

