# Command: review

## Mode 1: Plan self-critique (Codex, read-only against product code)

After commands/plan.md has drafted .agents/current_plan.md, act as a strict red-team reviewer of that plan before any implementation begins.

Check:
- Whether the planner consulted the applicable blacklist, architecture/source-of-truth maps, relevant execution-log incidents, and Git history; whether historical claims were verified against current source.
- Requirements coverage and contract completeness.
- Exact file ownership with no overlap between assigned writers; when Backend/Frontend are split, verify their scopes do not overlap.
- Service boundaries, PBAC, tenant scope, gRPC delegation, and least-data handling.
- Additive database changes, migration and data-loss risks, query performance, and N+1 risks.
- Frontend routing/BaseURL, App Router, responsive layout, and Sheet versus Dialog rules.
- Verification steps and acceptance criteria.

Record one of:
- PLAN_APPROVED: no blocking findings; the applicable coder lane or lanes in the approved plan may start.
- PLAN_REVISE: list each finding, required plan correction, and risk.

If PLAN_REVISE, update the plan, then critique the revised plan again. Do not edit product code during plan critique.

## Mode 2: Per-agent result critique (Codex, one worktree at a time)

As soon as one coder completes, review that coder's worktree independently. Do not wait for the other coder to finish before giving this lane its result. Do not combine the two lanes during this review.

For this lane only:
1. Read the lane decision record and context digest. Confirm relevant blacklist, architecture, execution-history, and current-code evidence was consulted.
2. Compare changed files with the exact ownership list in .agents/current_plan.md. Flag edits outside scope and missing required files.
3. Review each changed file against the approved plan, contract, applicable architecture/security/UI rules, and edge cases.
4. Check the coder's command evidence. Run only the scoped verification commands approved for this task; do not infer a pass from an unrun command.
5. Report file/line findings with severity and concrete corrections.
6. Record exactly one status:
   - AGENT_ACCEPTED: scope, acceptance criteria, and required checks pass; lane may be integrated. A required runtime/regression check marked `UNVERIFIED` blocks this status.
   - AGENT_REVISION_REQUIRED: list blockers and return only this lane to its assigned coder. Keep its worktree out of integration until re-reviewed and accepted. If the blocker is a missing test/runtime environment, state the exact dependency needed; do not relabel it as passing.

Use the report format in checklists/agent-acceptance.md. The coordinator, not the coder, assigns the acceptance status.

## Mode 3: Combined integration critique

Only after all required lanes have AGENT_ACCEPTED, review the integrated diff for cross-lane contract drift, duplicate behavior, file overlap, and regressions. Run the approved integration checks. Report PASSED or FAILED with command evidence and findings.

Do not edit product code during review. Return fixes to the appropriate coder or coordinator.
