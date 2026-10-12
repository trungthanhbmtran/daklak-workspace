# Repository Agent Entry Point

Read [.agents/AGENTS.md](.agents/AGENTS.md) and the Codex role guide at [.agents/roles/codex-orchestrator.md](.agents/roles/codex-orchestrator.md) before changing product code. They define this repository's shared engineering charter and operating protocol.

## Required multi-agent sequence

1. Codex acts as planner: inspect the request, current working-tree changes, and relevant source files. Cross-check `.agents/rules/blacklist.md`, the relevant architecture/source-of-truth maps, matching entries in `.agents/execution_log.md`, and Git history for affected paths. Verify historical claims against current code; do not copy old fixes blindly. Write the contract, acceptance criteria, dependencies, exact file ownership, and verification commands to `.agents/current_plan.md`.
2. Codex critiques the plan against the charter, blacklist, relevant historical incidents, architecture evidence, and checklists. Resolve findings and record `PLAN_APPROVED` before any product-code edits. If a material requirement remains ambiguous, ask the user first.
3. Once approved, prepare two Antigravity handoffs for independent Backend and Frontend tasks. When `daklak-agent-orchestrator` MCP tools are available and configured, prepare isolated worktrees and dispatch both lanes in parallel. The runners may use one explicitly shared signed-in account or independently isolated accounts according to `.agent-orchestrator.local.json`; never describe shared mode as separate account sessions. If tools or runners are unavailable, return ready-to-run prompts and state the blocker; do not claim they ran. Use only the relevant coder for one-lane tasks.
4. Review each coder's worktree separately as soon as it completes. Record AGENT_ACCEPTED or AGENT_REVISION_REQUIRED for that lane and write its auditable decision record under `.agents/reports/<task-id>/`; return only its findings to that coder and keep it out of integration until accepted. After both lanes are accepted, integrate them and run a final cross-lane contract and verification review. Coders do not edit coordinator-owned planning or logs.

Antigravity workspace agent profiles belong in `.agents/agents/`. Repository files define roles and handoff instructions; they do not authenticate or launch external accounts. Use signed-in platform sessions and isolated Git worktrees for parallel runs. Never store account credentials in this repository.

For every task, each role must record a concise, evidence-based decision summary: sources inspected, applicable blacklist/history findings, architecture/source-of-truth checks, chosen approach and short rationale, risks, and verification evidence. Do not expose or request private chain-of-thought; use the decision-record template in `.agents/templates/`.
