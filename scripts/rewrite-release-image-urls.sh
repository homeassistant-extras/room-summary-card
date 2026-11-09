#!/usr/bin/env bash
# Rewrite GitHub release note image URLs after docs PNG/GIF → WebP migration.
# - *.png|gif|jpeg → *.webp for marketing assets
# - /assets/foo.webp → /docs/assets/foo.webp when the file only lives under docs/assets/
# - Never touches src/assets/ (runtime card art)
#
# Usage (from a card repo root):
#   ./scripts/rewrite-release-image-urls.sh           # dry-run
#   ./scripts/rewrite-release-image-urls.sh --apply   # edit releases
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

APPLY=0
if [[ "${1:-}" == "--apply" ]]; then
  APPLY=1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "error: gh CLI required" >&2
  exit 1
fi
if ! command -v python3 >/dev/null 2>&1; then
  echo "error: python3 required" >&2
  exit 1
fi

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "repo=$REPO apply=$APPLY"

python3 - "$REPO" "$APPLY" <<'PY'
import json, os, re, subprocess, sys
from pathlib import Path

repo, apply_s = sys.argv[1], sys.argv[2]
apply = apply_s == "1"
root = Path.cwd()

docs_webps = {p.name for p in (root / "docs" / "assets").glob("*.webp")} if (root / "docs" / "assets").is_dir() else set()
root_webps = {p.name for p in (root / "assets").glob("*.webp")} if (root / "assets").is_dir() else set()

print(f"docs/assets webps: {len(docs_webps)}")
print(f"assets/ webps: {len(root_webps)}")

# Match github blob / raw URLs pointing at this repo's asset images
# Groups: prefix, path_before_file, filename_stem, ext, suffix(?raw= etc)
url_re = re.compile(
    rf"(https://(?:github\.com/{re.escape(repo)}/blob/[^/\s)\"]+/|raw\.githubusercontent\.com/{re.escape(repo)}/(?:refs/heads/)?[^/\s)\"]+/))"
    rf"((?:docs/)?assets/)"
    rf"([^/\s)\"?]+)\."
    rf"(png|gif|jpe?g|webp)"
    rf"([^)\s\"]*)",
    re.IGNORECASE,
)

def rewrite_url(m: re.Match) -> str:
    prefix, folder, stem, ext, suffix = m.group(1), m.group(2), m.group(3), m.group(4), m.group(5)
    name_webp = f"{stem}.webp"
    # Prefer docs/assets when the webp lives there (handles assets/ → docs/assets/ moves)
    if name_webp in docs_webps:
        new_folder = "docs/assets/"
        new_ext = "webp"
    elif name_webp in root_webps:
        new_folder = "assets/"
        new_ext = "webp"
    else:
        # Unknown file: still flip raster ext → webp, keep folder (best effort)
        if ext.lower() in ("png", "gif", "jpg", "jpeg"):
            new_folder = folder
            new_ext = "webp"
        else:
            return m.group(0)
    return f"{prefix}{new_folder}{stem}.{new_ext}{suffix}"

tags = json.loads(
    subprocess.check_output(
        ["gh", "release", "list", "--limit", "100", "--json", "tagName"],
        text=True,
    )
)

changed_releases = 0
for item in tags:
    tag = item["tagName"]
    body = json.loads(
        subprocess.check_output(
            ["gh", "release", "view", tag, "--json", "body"],
            text=True,
        )
    )["body"] or ""

    new_body, n = url_re.subn(rewrite_url, body)
    if n == 0 or new_body == body:
        continue

    changed_releases += 1
    print(f"\n=== {tag} ({n} url rewrite(s)) ===")
    # Show only changed lines for dry-run readability
    old_urls = url_re.findall(body)
    # Print before → after for each match in original
    for m in url_re.finditer(body):
        before = m.group(0)
        after = rewrite_url(m)
        if before != after:
            print(f"  - {before}")
            print(f"  + {after}")

    if apply:
        # notes-file via stdin
        proc = subprocess.run(
            ["gh", "release", "edit", tag, "--notes-file", "-"],
            input=new_body,
            text=True,
            capture_output=True,
        )
        if proc.returncode != 0:
            print(f"FAILED {tag}: {proc.stderr}", file=sys.stderr)
            sys.exit(proc.returncode)
        print(f"  applied {tag}")

print(f"\nDone. releases_needing_update={changed_releases} apply={apply}")
if not apply and changed_releases:
    print("Re-run with --apply to write changes.")
PY
