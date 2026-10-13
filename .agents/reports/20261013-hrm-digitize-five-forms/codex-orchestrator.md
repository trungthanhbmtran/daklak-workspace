# Coordinator Decision Record

## Task
- Task ID: 20261013-hrm-digitize-five-forms
- Agent and role: Codex orchestrator
- Phase: PLAN / DISPATCH
- Status: PLAN_APPROVED; BACKEND_RUNNER_BLOCKED

## Request and scope
- User goal: verify XML availability for HRM MAU_01–MAU_05 and digitize/persist the five templates based on the current XML set, Hướng dẫn 05-HD/TU, and Quy định 348-QĐ/BTCTW.
- Assigned lane: Backend only; exact files are listed in .agents/current_plan.md.
- Excluded: production data mutation, frontend, gateway, proto, workflow, and unrelated dirty files.

## Evidence consulted
- Current implementation: five XML files exist; seed omits xmlContent; service falls back to disk XML; nullable xmlContent schema.
- Blacklist: no SELECT *, preserve service ownership, no duplicate source data, no incorrect gateway envelope.
- Architecture: source-of-truth/service-map, workflow-map, request-response-flow.
- Execution log: 12/10 five-template feature and 13/10 export enhancement; rechecked claims against current source.
- Git: seed history at 268afeca; existing unrelated changes preserved.
- Live check: requested URL redirected to login, preventing production DB confirmation.
- Official/primary sources: HĐND Đắk Lắk summary of Hướng dẫn 05-HD/TU and original QĐ348 PDF. QĐ348 governs inter-service data sharing and privacy; it does not define a form XML/XSD or evaluation score.

## Decision summary
- Chosen approach: seed XML from packaged files only into blank default rows, preserve non-empty custom XML, and correct references only within the confirmed legal scope.
- Reason: current fallback can make the API appear populated while the database column is empty.
- Risk: official five-form appendices were not available; do not call the current XML set an official promulgated form set.
- Runner result: the configured Antigravity runner failed before starting due CLI flag assembly. Its expected backend worktree then showed unrelated rank-quota changes; preserved without inspection or cleanup.

## Changes and verification
- Product files changed: none.
- Verification actually run: source inspection, live page redirect, pipeline status, Git status/worktree checks.
- Acceptance: technical diagnosis completed; requested implementation remains unperformed due runner blocker.
- Reviewer status: PLAN_APPROVED / BACKEND_RUNNER_BLOCKED.
