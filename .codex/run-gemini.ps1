$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$planPath = Join-Path $repoRoot 'IMPLEMENTATION_PLAN.md'

if (-not (Get-Command gemini -ErrorAction SilentlyContinue)) {
    throw 'Gemini CLI is not installed or not on PATH. Install and authenticate Gemini CLI, then rerun this script. The plan is preserved in IMPLEMENTATION_PLAN.md.'
}
if (-not (Test-Path -LiteralPath $planPath -PathType Leaf)) {
    throw 'IMPLEMENTATION_PLAN.md is missing. Have the ChatGPT planner create the approved plan before running Gemini.'
}

$plan = Get-Content -LiteralPath $planPath -Raw
if ($plan -match '(?m)^> The ChatGPT/Codex planner must replace this template') {
    throw 'IMPLEMENTATION_PLAN.md still contains the template. Do not invoke Gemini until ChatGPT has written the complete plan.'
}
if ([string]::IsNullOrWhiteSpace($plan)) {
    throw 'IMPLEMENTATION_PLAN.md is empty. Do not invoke Gemini until ChatGPT has written the complete plan.'
}

$prompt = @"
Read GEMINI.md and the repository's applicable instructions. Execute the approved plan below exactly in order. The plan is the binding scope. If anything is unclear, impossible, unsafe, or conflicts with a higher-priority instruction, stop before that action and report the issue; do not silently change the plan. Preserve unrelated user changes and report exact validation evidence.

<approved_implementation_plan>
$plan
</approved_implementation_plan>
"@

Push-Location $repoRoot
try {
    & gemini --prompt $prompt
    if ($LASTEXITCODE -ne 0) {
        throw "Gemini CLI exited with code $LASTEXITCODE. The implementation may be incomplete; inspect the workspace and Gemini output before continuing."
    }
}
finally {
    Pop-Location
}
