# Workspace Agent Workflow

For every task in this workspace:

1. The primary ChatGPT/Codex agent researches the request and writes an ordered, evidence-based plan to `IMPLEMENTATION_PLAN.md` before implementation. Use the `chatgpt_planner` custom role declared in `.codex/config.toml` for the planning pass.
2. The plan must state scope, affected files, ordered steps, acceptance criteria, verification, risks, and unresolved decisions. Do not start implementation until it is complete.
3. After writing the plan, hand it to Gemini CLI by running `.codex/run-gemini.ps1` from the workspace root. The script includes the exact plan contents in Gemini's prompt. Gemini must execute only the approved plan, in order.
4. Gemini must stop before any step that is unclear, impossible, unsafe, or conflicts with higher-priority instructions. It must report the issue and request a revised plan; it must not silently deviate.
5. If Gemini CLI is missing or unauthenticated, do not implement as Gemini or claim the handoff happened. Report the missing setup and preserve the plan in `IMPLEMENTATION_PLAN.md`.
6. After Gemini completes, the primary agent reviews the diff and validates each acceptance criterion. Report actual evidence and any deviations.

The model handoff script uses Gemini CLI with its default approval behavior. It does not use `--yolo` or bypass Gemini's tool approvals.
