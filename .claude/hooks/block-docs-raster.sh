#!/usr/bin/env bash
# Claude Code PreToolUse hook: deny Bash git add/commit/rm/mv of marketing PNG/GIF/JPEG
# under assets/ or docs/assets/. Twin of .cursor/hooks/block-docs-raster.sh.
set -euo pipefail

input=$(cat)
command=$(
  printf '%s' "$input" | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
except Exception:
    print("")
    raise SystemExit(0)
# PreToolUse payload: tool_input.command for Bash
tool_input = data.get("tool_input") or {}
print(tool_input.get("command") or data.get("command") or "")
' 2>/dev/null || true
)

# Fail open if we cannot parse
if [[ -z "$command" ]]; then
  exit 0
fi

deny() {
  local reason="$1"
  python3 -c "
import json
print(json.dumps({
  'hookSpecificOutput': {
    'hookEventName': 'PreToolUse',
    'permissionDecision': 'deny',
    'permissionDecisionReason': '''$reason'''
  }
}))
"
  exit 0
}

# Only care about git staging/commit-ish commands
if ! printf '%s' "$command" | grep -Eq '(^|[[:space:];|&])git[[:space:]]+(add|commit|rm|mv)\b'; then
  exit 0
fi

# Look for raster paths under marketing dirs in the command string
if printf '%s' "$command" | grep -Eqi '(^|[[:space:]=])((\.\/)?(assets|docs\/assets)\/[^[:space:]]+\.(png|gif|jpe?g))\b'; then
  deny 'Marketing docs images must be WebP. Do not commit PNG/GIF/JPEG under assets/ or docs/assets/. Run ./scripts/convert-docs-images.sh (convert-docs-images skill), update refs, then stage .webp files.'
fi

# Catch git commit when staged index already has marketing rasters
if printf '%s' "$command" | grep -Eq 'git[[:space:]]+commit\b'; then
  if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    staged=$(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null || true)
    if printf '%s\n' "$staged" | grep -Eqi '^(assets|docs/assets)/.+\.(png|gif|jpe?g)$'; then
      deny 'Staged PNG/GIF/JPEG under assets/ or docs/assets/. Unstage them, run ./scripts/convert-docs-images.sh, stage .webp files, then commit.'
    fi
  fi
fi

exit 0
