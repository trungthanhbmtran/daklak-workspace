# Command: plan

**Owner:** Codex Orchestrator
**Mode:** Read-only against product code

## Goal

Inspect the request and relevant repository files, then produce a reviewable implementation plan. Do not implement product-code changes in this phase.

## Required context research

Follow .agents/roles/agent-operations.md. Inspect the current diff; consult the relevant blacklist entries, architecture/source-of-truth maps, matching execution-log incidents, and Git history for affected paths. Search the large execution log by keywords and read only relevant sections. Verify history against current implementation and label historical facts or assumptions.

## Required plan contents

1. Scope: files to create, modify, and leave untouched.
2. Contract: API routes/methods/DTOs, data shapes, proto or event changes, as applicable.
3. Ownership: exact files assigned to Backend, Frontend, or the coordinator. No file may have two writers.
4. Dependencies and ordering: identify any decisions that must be frozen before parallel coding.
5. Acceptance criteria and verification commands.
6. Relevant risks and applicable checklists, including security and data boundaries.

Write the plan and a short context/history digest to .agents/current_plan.md. Include source references and a decision summary. Save the Codex decision record to .agents/reports/<task-id>/codex-orchestrator.md using .agents/templates/decision-record.md. Do not include private chain-of-thought or secrets. Then run the self-critique described in commands/review.md. Revise and re-check until the plan is safe. Record PLAN_APPROVED only when no blocking issue remains. If a material requirement cannot be inferred safely, ask the user before approving.

After approval, prepare lane prompts through .agents/commands/code1.md and/or .agents/commands/code2.md, using the same frozen contract and disjoint ownership. Launch only applicable lanes in isolated worktrees when orchestration is available; otherwise provide ready-to-run prompts and state the blocker. Do not claim a coder ran unless the runtime confirms it.
