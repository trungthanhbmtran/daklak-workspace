---
name: plan-critique
description: Critically review implementation plans before they are finalized. Use after drafting any non-trivial plan and before saving it as final, handing it to an executor, or starting implementation.
---

# Plan Critique

## Purpose

Act as an independent skeptical reviewer of a drafted plan. Improve its correctness, completeness, safety, and executability before it becomes the binding plan. Critique the plan, not the author. Do not start implementation during this review.

## Workflow

1. Read the user request, draft plan, relevant repository instructions, architecture decisions, and evidence cited by the plan. Verify material claims against source/config/contracts rather than trusting the draft.
2. Restate the intended outcome and boundaries. Identify unstated assumptions, ambiguities, user-visible behavior, owners, and unresolved product decisions. Do not invent answers to decisions that materially affect architecture, data ownership, permissions, or production behavior.
3. Challenge the proposed approach. Compare at least one credible alternative when the choice is consequential; explain why the proposed choice is safer or more suitable for the evidence and constraints.
4. Trace end-to-end execution and ownership: entry points, API/gRPC/events, data mutation, auth/PBAC and organization scope, persistence, consumers, UI, operations, and deployment. Look for bypass paths and impacts on adjacent services.
5. Probe failure and recovery: retries, duplicate delivery, idempotency, concurrency/OCC, partial commits, timeouts, ordering, degraded dependencies, observability, replay/reconciliation, migration and rollback.
6. Check security and data handling: untrusted client inputs, privilege boundaries, tenant isolation, secrets, injection/SSRF, least-data payloads/logs, audit, and retention where relevant.
7. Check that each ordered step is atomic, dependencies are explicit, scope is bounded, acceptance criteria are measurable, and validation covers success, failure, compatibility, and security cases. Flag claims of validation that have not actually been run.
8. Record findings by severity: **Blocking** (plan cannot safely or correctly execute), **Major** (material gap or risk), **Minor** (clarity or efficiency). Tie each finding to the section or step and state the consequence.
9. Revise the plan to resolve blocking and major findings. Keep minor issues when they are not worth expanding scope, but note the decision. If a finding depends on unknown information, add a clear decision gate or ask the user before dependent implementation.
10. Save the final plan under the project’s durable `docs/` plan location, preserve the critique and dispositions in that file, and synchronize any required executor/handoff copy. Do not invoke an executor until the final reviewed plan is complete and the user has authorized implementation where required.

## Required critique record

Include this section in each non-trivial final plan:

```markdown
## Phản biện sau khi lập kế hoạch

| Mức độ | Vấn đề/giả định bị phản biện | Ảnh hưởng | Điều chỉnh trong kế hoạch hoặc lý do giữ nguyên |
|---|---|---|---|
| Blocking/Major/Minor | ... | ... | ... |

### Kết luận phản biện
- Các gate cần đạt trước khi triển khai: ...
- Quyết định còn mở và ai cần chốt: ...
```

If no material issue is found, do not fabricate findings. State what areas were challenged, the repository evidence reviewed, and why the plan remains sound. Critique notes are not approval to expand scope or contradict the user’s request.

## Quality gate

A plan is ready only when:

- Its requirements and service/data ownership match the user request and repository evidence.
- No blocking findings remain; major findings are resolved or explicitly gated on a decision.
- Security, authorization, failure behavior, migration/rollback, and verification are addressed in proportion to risk.
- Steps are ordered and executable without relying on unstated assumptions.
- The final durable plan and execution copy are synchronized, and the saved path is reported.
