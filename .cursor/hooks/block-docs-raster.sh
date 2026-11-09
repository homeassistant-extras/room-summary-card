#!/usr/bin/env bash
# Deny git add/commit/rm/mv that stages marketing PNG/GIF/JPEG under assets/ or docs/assets/.
set -euo pipefail

input=$(cat)
command=$(printf '%s' "$input" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("command",""))' 2>/dev/null || true)

# Fail open if we cannot parse
if [[ -z "$command" ]]; then
  echo '{ "permission": "allow" }'
  exit 0
fi

# Only care about git staging/commit-ish commands
if ! printf '%s' "$command" | grep -Eq '(^|[[:space:];|&])git[[:space:]]+(add|commit|rm|mv)\b'; then
  echo '{ "permission": "allow" }'
  exit 0
fi

# Look for raster paths under marketing dirs in the command string
if printf '%s' "$command" | grep -Eqi '(^|[[:space:]=])((\.\/)?(assets|docs\/assets)\/[^[:space:]]+\.(png|gif|jpe?g))\b'; then
  python3 - <<'PY'
import json
print(json.dumps({
  "permission": "deny",
  "user_message": "Blocked: do not commit PNG/GIF/JPEG under assets/ or docs/assets/. Convert with ./scripts/convert-docs-images.sh (convert-docs-images skill) and use .webp.",
  "agent_message": "Marketing docs images must be WebP. Run ./scripts/convert-docs-images.sh (see convert-docs-images skill), update refs, then stage the .webp files instead."
}))
PY
  exit 0
fi

# Also catch bare globs like `git add assets/` when staged index would include rasters — best-effort via git status if available
if printf '%s' "$command" | grep -Eq 'git[[:space:]]+commit\b'; then
  if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    staged=$(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null || true)
    if printf '%s\n' "$staged" | grep -Eqi '^(assets|docs/assets)/.+\.(png|gif|jpe?g)$'; then
      python3 - <<'PY'
import json
print(json.dumps({
  "permission": "deny",
  "user_message": "Blocked: staged PNG/GIF/JPEG under assets/ or docs/assets/. Convert with ./scripts/convert-docs-images.sh first.",
  "agent_message": "Staged marketing rasters found. Unstage them, run ./scripts/convert-docs-images.sh, stage .webp files, then commit."
}))
PY
      exit 0
    fi
  fi
fi

echo '{ "permission": "allow" }'
exit 0
