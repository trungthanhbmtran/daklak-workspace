# Local Codex to Antigravity orchestrator

This MCP server exposes worktree preparation, separate backend/frontend Antigravity dispatch, and per-lane diff retrieval to a Codex chat. Codex remains the planner, plan critic, acceptance reviewer, integrator, and final reviewer.

## Account mode

The installed Antigravity CLI has been verified with a harmless headless run under the currently signed-in account. The CLI uses cached credentials and does not expose a supported per-command account selector. The simplest setup is `shared` mode: both workers use that same signed-in account, while their code changes remain isolated in separate Git worktrees. They share its model quota and credits.

Create `.agent-orchestrator.local.json` at the repository root for shared mode:

```json
{
  "timeoutMs": 3600000,
  "accountMode": "shared",
  "sharedAccountConfirmed": true,
  "workers": {
    "backend": {
      "accountLabel": "antigravity-current-account",
      "command": "C:/Users/Admin/AppData/Local/agy/bin/agy.exe",
      "args": []
    },
    "frontend": {
      "accountLabel": "antigravity-current-account",
      "command": "C:/Users/Admin/AppData/Local/agy/bin/agy.exe",
      "args": []
    }
  }
}
```

Both lanes must use the same command, args, and account label in shared mode. `sharedAccountConfirmed` records that you accept the shared sign-in and quota. For two independently authenticated accounts, use `accountMode: "isolated"`, distinct account-specific runner entrypoints and labels, and set `accountIsolationConfirmed` only after verifying both sessions. Account labels and confirmation flags are operator assertions; the MCP server cannot independently prove the Google identity behind a runner. Never put passwords, OAuth tokens, or API keys in this file. It is gitignored.

## Register the local MCP server with Codex

From the repository root, run once:

```powershell
codex mcp add daklak-agent-orchestrator -- node tools/agent-orchestrator/server.mjs
```

Restart the Codex chat after registration. If `node` is not on Codex's PATH, replace it with the absolute Node executable path. The `@modelcontextprotocol/sdk` dependency is already present in the repository.

## Automatic task sequence

1. Codex reads the request and repository context, then writes and self-critiques the plan.
2. It displays the plan and proceeds when the plan gate passes and no material ambiguity remains.
3. Codex checks `agent_pipeline_status`, then calls `prepare_agent_worktrees`.
4. Codex calls `run_backend_agent` and `run_frontend_agent` in parallel with the same contract and disjoint file ownership.
5. Codex retrieves and accepts/rejects each diff independently. A rejected lane gets a targeted revision; the accepted lane stays unchanged.
6. Codex integrates accepted changes, reviews the combined diff, runs plan-approved checks, then removes only clean worktrees.

Worktree preparation refuses a dirty source checkout rather than dropping, stashing, or copying pre-existing edits. The tool does not disable all permission checks, push, deploy, or delete a non-clean worktree.
