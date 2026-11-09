#!/usr/bin/env bash
# Convert marketing/docs PNG/JPG/GIF under assets/ and docs/assets/ to WebP,
# rewrite refs in markdown/yml/html, and remove originals.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v cwebp >/dev/null 2>&1; then
  echo "error: cwebp not found (install webp / brew install webp)" >&2
  exit 1
fi
if ! command -v gif2webp >/dev/null 2>&1; then
  echo "error: gif2webp not found (install webp / brew install webp)" >&2
  exit 1
fi

DRY_RUN=0
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=1
fi

DIRS=""
[[ -d assets ]] && DIRS="$DIRS assets"
[[ -d docs/assets ]] && DIRS="$DIRS docs/assets"

if [[ -z "$DIRS" ]]; then
  echo "No assets/ or docs/assets/ directory found; nothing to do."
  exit 0
fi

# shellcheck disable=SC2086
IMAGES=$(find $DIRS \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.gif' \) \
  ! -path '*/coverage/*' ! -path '*/test-results/*' ! -path '*/node_modules/*' ! -path '*/dist/*' \
  -type f | sort)

if [[ -z "$IMAGES" ]]; then
  echo "No PNG/JPG/GIF under assets/ or docs/assets/; nothing to do."
  exit 0
fi

before_bytes=0
after_bytes=0
converted=0
skipped=0

rewrite_refs() {
  local basename_no_ext="$1"
  local old_ext="$2"

  find . \( -name '*.md' -o -name '*.yml' -o -name '*.yaml' -o -name '*.html' \) \
    ! -path '*/node_modules/*' ! -path '*/coverage/*' ! -path '*/dist/*' ! -path '*/.git/*' \
    -type f -print0 2>/dev/null |
  while IFS= read -r -d '' f; do
    if grep -qE "${basename_no_ext}\\.${old_ext}" "$f" 2>/dev/null; then
      if [[ $DRY_RUN -eq 1 ]]; then
        echo "  would rewrite refs in $f"
      else
        perl -i -pe "s/${basename_no_ext}\\.${old_ext}/${basename_no_ext}.webp/gi" "$f"
        echo "  rewrote refs in $f"
      fi
    fi
  done
}

human() {
  local b=$1
  if [[ $b -ge 1048576 ]]; then
    awk -v b="$b" 'BEGIN { printf "%.1f MB", b/1048576 }'
  elif [[ $b -ge 1024 ]]; then
    awk -v b="$b" 'BEGIN { printf "%.1f KB", b/1024 }'
  else
    echo "${b} B"
  fi
}

while IFS= read -r src; do
  [[ -z "$src" ]] && continue
  ext="${src##*.}"
  ext_lc=$(printf '%s' "$ext" | tr '[:upper:]' '[:lower:]')
  dest="${src%.*}.webp"
  base=$(basename "$src")
  base_no_ext="${base%.*}"
  size_src=$(stat -f%z "$src" 2>/dev/null || stat -c%s "$src")
  before_bytes=$((before_bytes + size_src))

  size_dest=0
  if [[ -f "$dest" && "$dest" -nt "$src" ]]; then
    echo "reuse existing: $dest"
    skipped=$((skipped + 1))
    size_dest=$(stat -f%z "$dest" 2>/dev/null || stat -c%s "$dest")
  else
    echo "convert: $src -> $dest"
    if [[ $DRY_RUN -eq 1 ]]; then
      rewrite_refs "$base_no_ext" "$ext_lc"
      converted=$((converted + 1))
      continue
    fi

    case "$ext_lc" in
      gif)
        # -mt multithread; -m 4 is much faster than 6 on large animated GIFs
        gif2webp -q 80 -m 4 -mt -mixed "$src" -o "$dest" >/dev/null 2>&1
        ;;
      png|jpg|jpeg)
        cwebp -near_lossless 40 -metadata icc -m 6 "$src" -o "$dest" >/dev/null 2>&1
        ;;
      *)
        echo "  unsupported extension: $ext_lc" >&2
        continue
        ;;
    esac
    size_dest=$(stat -f%z "$dest" 2>/dev/null || stat -c%s "$dest")
    converted=$((converted + 1))
  fi

  after_bytes=$((after_bytes + size_dest))

  if [[ $DRY_RUN -eq 1 ]]; then
    continue
  fi

  rewrite_refs "$base_no_ext" "$ext_lc"

  remaining=$(
    grep -rE --include='*.md' --include='*.yml' --include='*.yaml' --include='*.html' \
      -l "${base_no_ext}\\.${ext_lc}" . 2>/dev/null |
      grep -v node_modules | grep -v coverage | grep -v '/\.git/' || true
  )
  if [[ -z "$remaining" ]]; then
    rm -f "$src"
    echo "  removed $src"
  else
    echo "  kept $src (still referenced):"
    echo "$remaining" | sed 's/^/    /'
  fi
done <<< "$IMAGES"

echo
echo "Done. converted=$converted skipped=$skipped dry_run=$DRY_RUN"
if [[ $DRY_RUN -eq 0 ]]; then
  echo "Size: $(human "$before_bytes") -> $(human "$after_bytes")"
  if [[ $before_bytes -gt 0 ]]; then
    saved=$((before_bytes - after_bytes))
    pct=$(awk -v s="$saved" -v b="$before_bytes" 'BEGIN { printf "%.0f", (s/b)*100 }')
    echo "Saved: $(human "$saved") (${pct}%)"
  fi
fi
