# Per-Agent Acceptance Checklist

Use one copy of this report for each coder/worktree. The coordinator assigns the status.

## Review record

- Agent/lane:
- Worktree or branch:
- Approved plan status:
- Owned files:
- Files changed:
- Acceptance status: AGENT_ACCEPTED / AGENT_REVISION_REQUIRED

## Evidence and context

- [ ] Decision record exists and cites the relevant current files.
- [ ] Applicable blacklist entries were checked.
- [ ] Relevant architecture/source-of-truth references were checked.
- [ ] Matching execution-log incidents and relevant Git history were searched; old fixes were verified against current code.
- [ ] Existing user changes were preserved.

## Checks

- [ ] Changed files are within this agent's assigned ownership.
- [ ] Required files and acceptance criteria from the approved plan are satisfied.
- [ ] Implementation follows the frozen API/data contract.
- [ ] Applicable security, tenant, architecture, UI, migration, performance, least-data, and encoding rules pass.
- [ ] Verification commands and their actual results are recorded.
- [ ] Changed behavior has a relevant runtime smoke or focused test result with a passing result; `UNVERIFIED` is a blocker, not an acceptance substitute.
- [ ] For visible UI changes, inspect the running route at relevant viewports and check layout, keyboard operation, focus, and accessible names; if unavailable, record `UNVERIFIED` and do not accept.
- [ ] New business logic and bug fixes have a passing focused regression test using the package-configured framework; if the required harness is missing, it is added in scope or this lane remains unaccepted.
- [ ] No unresolved blocker remains for this lane.

## Findings

For each finding, record severity, file and line, evidence, and the specific correction required.

- Finding:
- Evidence:
- Required correction:

## Decision

- AGENT_ACCEPTED: this lane can be integrated.
- AGENT_REVISION_REQUIRED: keep this lane out of integration, return findings to its coder, and repeat this checklist after correction.
- A required runtime/regression check marked `UNVERIFIED` cannot receive `AGENT_ACCEPTED`; record the blocker and keep the lane out of integration.