# Command: analyze

**Owner:** Codex Orchestrator
**Mode:** Read-only against product code

## Purpose

Build the evidence base for the plan. Preserve existing user work and do not edit product files.

## Analysis steps

1. Summarize the user goal, expected behavior, and unresolved requirements.
2. Inspect git status and current diffs. Identify dirty files that must be preserved and note any planned path overlap.
3. Trace the relevant code path across UI, API Gateway, gRPC/proto, service, database/schema, and tests.
4. Identify the source-of-truth service for every entity or policy involved. Check service-map.md, source-of-truth.md, dependency-map.md, workflow-map.md, and request-response-flow.md as applicable.
5. Search .agents/rules/blacklist.md for applicable anti-patterns.
6. Search `.agents/execution_log.md`, the relevant lane logs under `.agents/execution_logs/`, and prior reports by feature/error keywords; read only relevant incidents. Inspect Git history for affected paths. Treat history as context and verify claims/fixes against current source, schema, and tests.
7. Record evidence with file paths and line/section references. Separate current verified behavior, historical information, assumptions, and documentation conflicts.

## Output

Write a concise context digest in .agents/current_plan.md for Codex plan critique and the applicable Code 1, Code 2, and/or Code 3 coder. Include the likely file ownership boundaries and any risks that block safe parallel work. Write a decision record under .agents/reports/<task-id>/codex-orchestrator.md using .agents/templates/decision-record.md.

Do not include private chain-of-thought, credentials, internal tokens, or security bypass values in the report.
