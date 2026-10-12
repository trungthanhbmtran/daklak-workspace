# Command: implement

## Gate

Do not start product-code implementation until Codex has written and self-critiqued .agents/current_plan.md, resolved findings, and recorded PLAN_APPROVED.

## Parallel work

When the approved plan contains independent Backend and Frontend tasks:
- Prepare separate handoffs for backend-coder and frontend-coder, each in an isolated Git worktree. Dispatch automatically only when a cross-platform Antigravity connector is configured; otherwise provide both prompts for the user to launch.
- Give both agents the same approved plan and contract, plus distinct exact owned-file lists.
- Backend owns only assigned backend files; Frontend owns only assigned frontend files.
- Shared files have one explicit owner. The other agent may read them but must not edit them.
- Neither coder edits .agents/current_plan.md, .agents/execution_log.md, roadmap.md, or merges its own worktree.

If only one lane is affected, dispatch only its coder. If a task depends on an unfinished contract or a file boundary is unclear, return to planning instead of guessing.

## Per-agent acceptance gates

As soon as either coder finishes, Codex reviews that worktree on its own:
- Check only that agent's changed files against its ownership list, approved plan, contract, constraints, and acceptance criteria.
- Inspect its verification evidence and run the approved lane-specific checks.
- Record AGENT_ACCEPTED or AGENT_REVISION_REQUIRED using checklists/agent-acceptance.md.
- If revision is required, send the findings only to that coder and keep its changes out of integration. Re-review that lane after the correction.
- The other lane may continue while this review or correction is in progress.

## Final integration gate

Only after every required lane is AGENT_ACCEPTED:
- Integrate the isolated worktrees.
- Check the combined diff for overlapping ownership, contract drift, and cross-lane behavior.
- Run the plan's integration verification and report the actual command results.
- Only Codex updates shared plan/log/roadmap files.

## Platform note

Repository instructions do not log into or launch Antigravity accounts from Codex. Without a configured cross-platform connector, provide ready-to-run prompts for the two Antigravity sessions and state that the user must launch them. Never put credentials in repository files.