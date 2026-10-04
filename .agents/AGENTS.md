# AGENT CHARTER - DAKLAK GOVERNMENT WORKFLOW PLATFORM

This file defines the operating contract for every AI agent working in this workspace. The target is a reusable government workflow platform, not a single-purpose task application. Security, organizational scope, traceability, service ownership, and verifiable evidence take priority over delivery speed.
## Workspace planning, critique, and execution contract

- Every non-trivial plan, decision sequence, or multi-step proposal must be saved as a readable workspace file; do not leave its only copy in chat history.
- After drafting a non-trivial plan, apply `.agents/skills/plan-critique/SKILL.md` as an independent skeptical review. Check evidence, scope/owners and mutation paths, assumptions and alternatives, security/PBAC/tenant boundaries, failures/retries/idempotency, migration/rollback, acceptance criteria, and contradictions. Record severity, disposition, remaining gates, and unresolved decisions in the final plan.
- Save the reviewed final plan under `docs/plans/<descriptive-name>.md`; synchronize root `IMPLEMENTATION_PLAN.md` as the active execution/handoff copy used by `.codex/run-gemini.ps1`. Keep prior final plans as history and state absolute paths in the report.
- Agent roles and their instructions live under `.agents/agents/`; skills live under `.agents/skills/`. `.codex/config.toml` is only Codex's runtime registry and must point custom role `config_file` entries into `.agents/agents/`. Keep root `AGENTS.md` as a short bootstrap that tells Codex to read this canonical charter, since Codex discovers root/ancestor `AGENTS.md` files and does not automatically traverse the hidden `.agents` directory.
- For tasks using the configured two-role workflow, ChatGPT researches, drafts, critiques, revises, and saves the plan first; Gemini executes only that reviewed plan in order. Do not invoke Gemini or implement when the user asked only for planning. If either role/model is unavailable, report the limitation and do not claim a handoff occurred.
- Gemini must stop before any step that is unclear, impossible, unsafe, or conflicts with higher-priority instructions. It must report the issue and request a revised plan; it must not silently deviate. The handoff script uses Gemini CLI's default approval behavior and must not use `--yolo` or bypass Gemini tool approvals.


## 1. Sources of truth and conflict handling

Separate **current-state evidence** from **intended requirements**:

- Source, configuration, schemas, contracts, migrations, tests, and runtime evidence describe what is currently implemented.
- The user's approved requirement and applicable approved policy/compliance artifact define the task outcome.
- Accepted, specific ADRs define intentional architectural decisions; `docs/architecture/ARCHITECTURE_MANIFEST.md` defines the general target architecture.
- `docs/modules/README.md` and its module documents describe ownership/topology; `.agents/rules/`, context, and skills provide engineering guidance.
- `.agents/ROADMAP.md` is planning context only, never implementation or acceptance evidence.

Existing code does not override an approved target merely because it exists, and documentation must not be rewritten to make nonconforming code appear compliant. Do not silently reconcile a material conflict: record both current and intended states, use the safest reversible in-scope assumption, and ask the user when the choice changes architecture, legal scope, data ownership, or production risk.

## 2. Government-project evidence rule

- Treat internal rules as engineering policy, not as proof of legal compliance.
- Verify legal citations against an official source before relying on them.
- Never state that the system is compliant, certified, production-ready, or meets a security level without the approved scope/dossier and deployment evidence.
- Distinguish clearly between implemented code, tested behavior, proposed controls, operational configuration, and items still requiring authority review.
- Apply the approved system security-level dossier, data classification, retention schedule, account policy, and incident/continuity plans when they are provided. Do not invent them.

See `.agents/rules/11-government-compliance.md` for the mandatory review gate.

## 3. Mandatory 13-step workflow

### Required ChatGPT -> Gemini handoff

For every task, use the two-role workflow defined in `.agents/agents/chatgpt-planner.md` and `.agents/agents/gemini-executor.md`: ChatGPT researches the solution and writes the implementation plan first; Gemini then executes that approved plan. This is a workspace instruction for agents that have access to those models, not an automatic model/API configuration.

- The ChatGPT plan is the execution contract and must identify scope, ordered steps, files or boundaries, acceptance criteria, and verification.
- Gemini must follow the plan in order and must not silently omit, reorder, or expand steps. It must report progress and evidence against the plan.
- If the plan is ambiguous, impossible, conflicts with the user's request or higher-priority safety/security rules, or new evidence makes it unsafe, Gemini must stop before the affected action and ask for a revised plan or user decision. Do not guess or silently change the plan.
- If either model is unavailable in the current environment, state that limitation and do not claim the handoff occurred. The available agent may prepare a clearly labeled fallback plan, but must not represent it as ChatGPT-authored or Gemini-executed.

1. **Read charter and scope**: Read this file, the current user request, and `.agents/ROADMAP.md`. Preserve unrelated user work.
2. **Review Error Blacklist**: Before proceeding, ALWAYS review previous mistakes (e.g., in `.agents/BLACKLIST.md` or similar knowledge bases) to ensure they are not repeated. Log new mistakes to the blacklist when they occur.
3. **Read relevant guidance**: Read only the applicable rules, module docs, skills, ADRs, and recent evidence.
4. **Classify the task**: Bug fix, feature, refactor, security/compliance review, documentation/configuration, or investigation.
5. **Discovery**: Trace the real integration path, service owner, contract, authorization boundary, data store, and deployment configuration. Do not guess from filenames.
6. **Solution analysis**: Evaluate realistic alternatives and risks relevant to the change: data exposure, PBAC scope, auditability, failure modes, compatibility, OOM/N+1/complexity, and operations.
7. **Planning**: Create and explicitly document a step-by-step plan BEFORE executing any implementation. For large tasks, break them down into smaller, atomic steps. Ensure each part works before moving to the next to avoid massive, hard-to-debug changes.
8. **Decision**: Define the minimal safe change, affected contracts, acceptance criteria, migration/rollback needs, and explicit out-of-scope items.
9. **Implementation**: Keep domain logic in the owning service, keep the frontend non-authoritative, update canonical contracts first, and avoid unrelated refactors.
10. **Test Execution & Self-Correction**: ALWAYS run the code after implementation to verify it works (e.g., using `run_command` to execute build, or start the app). If errors occur here or in Step 11, DO NOT just report the error to the user. You MUST self-diagnose and loop back to fix the issues until the code runs successfully.
11. **Validation**: Run static checks (e.g. linting, type checks) and broader checks in proportion to risk. Benchmark only changed performance-sensitive paths.
12. **Architectural and government review**: Check service/data ownership, PBAC and organization scope, client trust, integration/SSRF, audit/redaction, records lifecycle, secrets, availability, and deployment assumptions.
13. **Senior quality gate and report**: Review DRY, naming, type safety, bounded queries, error mapping, observability, compatibility, and documentation. Clean up unused imports, variables, and debug logs. Ensure code formatting is correct and add comments/JSDoc for complex logic. Update the roadmap only when the task actually changes project status or reveals actionable work.

Documentation-only tasks may mark implementation or runtime checks as not applicable, but must still provide concrete consistency, link, encoding, and source validation.

## 4. Non-negotiable architecture boundaries

- **Domain first**: Frameworks do not define the business model.
- **Generic workflow core**: Workflow orchestrates generic definitions and instances; domain services own domain data and business rules.
- **Service data sovereignty**: A service must not access another service's database directly.
- **Contract first**: `shared/protos` is the canonical internal gRPC contract source. Version public and event contracts compatibly.
- **Smart backend / non-authoritative frontend**: The server validates input, permissions, organization/data scope, and business rules. Client-side checks are UX only.
- **PBAC**: Evaluate subject, action, resource, organization/data scope, and context. Do not infer permission from role names.
- **Safe distributed changes**: Use idempotency, bounded retries, correlation IDs, and transactional outbox/inbox where database state and events must remain consistent.
- **Least data**: Query, return, log, and retain only fields justified by the use case and approved policy.
- **UI/UX Preservation**: Do not arbitrarily remove or change styling/CSS classes unless fully understanding the impact. Any UI changes must preserve the project's aesthetics, accessibility, and responsiveness.

## 5. Required completion evidence

For a material change, the final response must contain this section with truthful evidence:

```markdown
## Báo cáo Thực thi 13 Bước
- **Plan & Blacklist Check:** [Confirm plan was made and blacklist checked]
- **Step 5 - Discovery:** [files, contracts, services, and runtime path inspected]
- **Step 6 - Analysis:** [options, security, data, failure, and performance findings]
- **Step 10 - Test Execution & Self-Correction:** [commands run to test the code and any self-corrections made]
- **Step 11 - Validation:** [static checks run and exact result, or justified limitation]
- **Step 12 - Architecture & Government Review:** [PBAC, trust boundaries, audit, integration, records, operations]
- **Step 13 - Quality Gate:** [scope, DRY, types, compatibility, docs/roadmap status]
```

Never fabricate a test result, benchmark, deployment check, legal conclusion, or roadmap completion state.


