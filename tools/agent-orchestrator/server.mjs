import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, mkdir, stat } from "node:fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const execFileAsync = promisify(execFile);
const serverDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(serverDir, "..", "..");
const worktreeRoot = path.join(repoRoot, ".agent-worktrees");
const configPath = path.join(repoRoot, ".agent-orchestrator.local.json");
const taskIdSchema = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{2,63}$/);
const roles = {
  backend: { agent: "backend-coder" },
  frontend: { agent: "frontend-coder" },
};

const server = new McpServer({ name: "daklak-agent-orchestrator", version: "1.0.0" });

function result(text, isError = false) {
  return { content: [{ type: "text", text }], ...(isError ? { isError: true } : {}) };
}

async function readConfig() {
  try {
    return JSON.parse(await readFile(configPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw new Error(`Cannot read ${configPath}: ${error.message}`);
  }
}

function validateConfig(config) {
  if (!config?.workers) throw new Error(`Missing local account configuration: ${configPath}`);
  if (config.accountMode !== "shared" && config.accountMode !== "isolated") {
    throw new Error(`Set accountMode to "shared" or "isolated" in ${configPath}.`);
  }
  for (const role of Object.keys(roles)) {
    const worker = config.workers[role];
    if (!worker || typeof worker.command !== "string" || !worker.command.trim()) {
      throw new Error(`No runner command configured for ${role}.`);
    }
    if (!Array.isArray(worker.args) || worker.args.some((arg) => typeof arg !== "string")) {
      throw new Error(`workers.${role}.args must be an array of strings.`);
    }
    if (typeof worker.accountLabel !== "string" || !worker.accountLabel.trim()) {
      throw new Error(`Set workers.${role}.accountLabel in ${configPath}.`);
    }
  }
  const backend = config.workers.backend;
  const frontend = config.workers.frontend;
  const sameCommand = path.resolve(backend.command).toLowerCase() === path.resolve(frontend.command).toLowerCase();
  const sameArgs = JSON.stringify(backend.args) === JSON.stringify(frontend.args);
  const sameLabel = backend.accountLabel.trim().toLowerCase() === frontend.accountLabel.trim().toLowerCase();

  if (config.accountMode === "shared") {
    if (!sameCommand || !sameArgs || !sameLabel) {
      throw new Error("Shared mode requires both lanes to use the same runner command, args, and accountLabel.");
    }
    if (config.sharedAccountConfirmed !== true) {
      throw new Error("Set sharedAccountConfirmed=true after confirming that both lanes should use the currently signed-in Antigravity account and share its quota.");
    }
  } else {
    if (sameLabel) {
      throw new Error("Isolated mode requires distinct accountLabel values; verify each runner's actual login before dispatch.");
    }
    if (sameCommand) {
      throw new Error("Isolated mode requires different account-specific runner entrypoints. A shared agy.exe path does not isolate Antigravity accounts.");
    }
    if (config.accountIsolationConfirmed !== true) {
      throw new Error("Set accountIsolationConfirmed=true only after verifying that each runner uses its assigned, separate Antigravity account.");
    }
  }
  return config;
}

function resolveWorktree(taskId, role, suppliedPath) {
  const expected = path.resolve(worktreeRoot, taskId, role);
  const actual = path.resolve(suppliedPath);
  if (actual.toLowerCase() !== expected.toLowerCase()) throw new Error(`Worktree must be exactly ${expected}`);
  return actual;
}

async function git(args, cwd = repoRoot) {
  return execFileAsync("git", args, { cwd, windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
}

async function requireWorktree(worktree) {
  const folder = await stat(worktree).catch(() => null);
  const marker = await stat(path.join(worktree, ".git")).catch(() => null);
  if (!folder?.isDirectory() || !marker) throw new Error(`Missing Git worktree ${worktree}; call prepare_agent_worktrees first.`);
}

async function runWorker(role, taskId, worktree, prompt) {
  const config = validateConfig(await readConfig());
  const worker = config.workers[role];
  const fullPrompt = [
    `You are the ${roles[role].agent} for task ${taskId}.`,
    `Work only in this isolated worktree: ${worktree}`,
    "Follow the approved plan and exact file ownership. Do not merge or edit outside your assigned lane.",
    "Before editing, inspect current code, applicable blacklist, architecture/source-of-truth notes, and relevant history named in the plan.",
    "At completion report changed files, actual checks, contract deviations, and risks. Do not include private chain-of-thought or secrets.",
    "",
    prompt,
  ].join("\n");
  const args = [
    ...worker.args,
    "--agent", roles[role].agent,
    "--mode", "accept-edits",
    "--print", "--output-format", "json", "--print-timeout", "0",
    fullPrompt,
  ];
  const timeout = Math.min(Math.max(Number(config.timeoutMs) || 3600000, 60000), 7200000);
  const run = await new Promise((resolve, reject) => {
    const child = spawn(worker.command, args, { cwd: worktree, env: process.env, windowsHide: true, shell: false, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => { child.kill(); reject(new Error(`${role} worker timed out after ${timeout}ms.`)); }, timeout);
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", (error) => { clearTimeout(timer); reject(new Error(`Could not start runner ${worker.command}: ${error.message}`)); });
    child.on("close", (code, signal) => { clearTimeout(timer); resolve({ code, signal, stdout, stderr }); });
  });
  if (run.code !== 0) throw new Error(`${role} runner exited ${run.code ?? run.signal}. ${run.stderr.slice(-6000)}\n${run.stdout.slice(-6000)}`);
  let response;
  try { response = JSON.parse(run.stdout); } catch { throw new Error(`${role} runner did not return JSON: ${run.stdout.slice(-6000)}`); }
  if (response.status !== "SUCCESS") throw new Error(`${role} Antigravity status ${response.status ?? "unknown"}: ${response.error ?? response.response ?? "No details returned"}`);
  const accountDescription = config.accountMode === "shared"
    ? `shared Antigravity account label “${worker.accountLabel}”`
    : `configured Antigravity account label “${worker.accountLabel}”`;
  return `Task ${taskId} / ${role} completed via ${accountDescription}.\n\n${response.response ?? "(No response text)"}`;
}

server.tool("agent_pipeline_status", "Check whether the backend and frontend Antigravity workers are configured for Codex orchestration.", {}, async () => {
  try {
    const config = await readConfig();
      if (!config) return result(`Not ready. Missing ${configPath}. Configure backend and frontend runners. Shared mode can use the current signed-in account; isolated mode needs two independently authenticated runners.`);
    const valid = validateConfig(config);
    return result(JSON.stringify({
      ready: true,
      accountMode: valid.accountMode,
      backendAccountLabel: valid.workers.backend.accountLabel,
      frontendAccountLabel: valid.workers.frontend.accountLabel,
      workersShareAccount: valid.accountMode === "shared",
      labelsAreDistinct: valid.accountMode === "isolated",
      quotaPoolShared: valid.accountMode === "shared",
      accountIdentityVerifiedByServer: false,
      worktreeRoot,
    }, null, 2));
  } catch (error) { return result(`Not ready: ${error.message}`); }
});

server.tool(
  "prepare_agent_worktrees",
  "Create separate backend and frontend worktrees for an approved plan. Refuses a dirty source checkout to preserve user changes.",
  { taskId: taskIdSchema },
  async ({ taskId }) => {
    try {
      const dirty = (await git(["status", "--porcelain", "--untracked-files=all"])).stdout.trim();
      if (dirty) return result(`Refused: source checkout has uncommitted user changes. Commit or otherwise preserve them first; this tool will not stash, copy, or overwrite them.\n${dirty.slice(0, 5000)}`, true);
      const targets = Object.keys(roles).map((role) => resolveWorktree(taskId, role, path.join(worktreeRoot, taskId, role)));
      for (const target of targets) {
        if (await stat(target).catch(() => null)) return result(`Refused: prior path exists at ${target}. Review or clean it before retrying.`, true);
      }
      const created = [];
      for (const target of targets) {
        await mkdir(path.dirname(target), { recursive: true });
        try {
          await git(["worktree", "add", "--detach", target, "HEAD"]);
          created.push(target);
        } catch (error) {
          for (const worktree of created.reverse()) await git(["worktree", "remove", "--force", worktree]).catch(() => {});
          throw error;
        }
      }
      return result(JSON.stringify({ taskId, worktrees: { backend: created[0], frontend: created[1] } }, null, 2));
    } catch (error) { return result(`Could not prepare worktrees: ${error.message}`, true); }
  },
);

for (const role of Object.keys(roles)) {
  server.tool(
    `run_${role}_agent`,
    `Run the ${role} Antigravity worker in its isolated worktree. Use only after plan approval and explicit file ownership.`,
    { taskId: taskIdSchema, worktree: z.string().min(1), prompt: z.string().min(1).max(30000) },
    async ({ taskId, worktree, prompt }) => {
      try {
        const resolved = resolveWorktree(taskId, role, worktree);
        await requireWorktree(resolved);
        return result(await runWorker(role, taskId, resolved, prompt));
      } catch (error) { return result(`${role} agent failed: ${error.message}`, true); }
    },
  );
}

server.tool(
  "agent_worktree_diff",
  "Read one lane's diff so Codex can review and accept it separately.",
  { taskId: taskIdSchema, role: z.enum(["backend", "frontend"]) },
  async ({ taskId, role }) => {
    try {
      const worktree = resolveWorktree(taskId, role, path.join(worktreeRoot, taskId, role));
      await requireWorktree(worktree);
      const diff = (await git(["diff", "--", "."], worktree)).stdout;
      const untracked = (await git(["ls-files", "--others", "--exclude-standard"], worktree)).stdout.trim();
      const untrackedFiles = [];
      for (const relativePath of (untracked ? untracked.split(/\r?\n/) : [])) {
        const absolutePath = path.resolve(worktree, relativePath);
        if (!absolutePath.toLowerCase().startsWith(`${path.resolve(worktree).toLowerCase()}${path.sep.toLowerCase()}`)) continue;
        const content = await readFile(absolutePath);
        untrackedFiles.push({
          path: relativePath,
          content: content.length <= 300000 && !content.includes(0) ? content.toString("utf8") : null,
          omitted: content.length > 300000 || content.includes(0),
        });
      }
      return result(JSON.stringify({ role, worktree, diff, untrackedFiles }));
    } catch (error) { return result(`Could not read ${role} diff: ${error.message}`, true); }
  },
);

server.tool(
  "cleanup_agent_worktrees",
  "Remove task worktrees only when clean; preserve any worktree that still contains changes.",
  { taskId: taskIdSchema },
  async ({ taskId }) => {
    try {
      const removed = [];
      for (const role of Object.keys(roles)) {
        const worktree = resolveWorktree(taskId, role, path.join(worktreeRoot, taskId, role));
        if (!(await stat(worktree).catch(() => null))) continue;
        const dirty = (await git(["status", "--porcelain", "--untracked-files=all"], worktree)).stdout.trim();
        if (dirty) return result(`Preserved ${worktree}; it still contains changes. Review or integrate them first.`, true);
        await git(["worktree", "remove", worktree]);
        removed.push(role);
      }
      return result(`Removed clean worktrees for ${taskId}: ${removed.join(", ") || "none"}.`);
    } catch (error) { return result(`Could not clean up worktrees: ${error.message}`, true); }
  },
);

await server.connect(new StdioServerTransport());
