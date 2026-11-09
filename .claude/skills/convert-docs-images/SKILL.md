---
name: convert-docs-images
description: >-
  Convert marketing/docs PNG/JPG/GIF under assets/ or docs/assets/ to WebP,
  rewrite markdown/yml/html refs, and remove originals. Use when adding or
  updating README/docs screenshots, or when a hook blocked a png/gif commit.
---

# Convert docs images to WebP

Cross-agent policy also lives in root [`AGENTS.md`](../../../AGENTS.md) (Claude Code + Cursor). This skill is mirrored under `.claude/skills/convert-docs-images/` and `.cursor/skills/convert-docs-images/`.

Enforcement hooks (block committing PNG/GIF under marketing asset dirs):
- Cursor: `.cursor/hooks.json` + `.cursor/hooks/block-docs-raster.sh`
- Claude Code: `.claude/settings.json` + `.claude/hooks/block-docs-raster.sh`

## When to use

- Adding or replacing screenshots in `assets/` or `docs/assets/`
- A Cursor hook blocked `git add`/`git commit` of `.png`/`.gif` under those dirs
- Migrating leftover rasters after a docs update

## Do not convert

- Runtime card art under `src/assets/` (e.g. Whisker AVIF litter robots)
- `coverage/`, `test-results/`, `node_modules/`, `dist/`

## Steps

1. Prefer writing new screenshots as `.webp` directly when the capture tool allows it.
2. If you only have PNG/JPG/GIF, put them under `assets/` or `docs/assets/`, then run from the **repo root**:

```bash
./scripts/convert-docs-images.sh
```

Dry-run:

```bash
./scripts/convert-docs-images.sh --dry-run
```

3. Requires `cwebp` and `gif2webp` (`brew install webp`).
4. Confirm refs in `README.md`, `docs/**`, and `mkdocs.yml` point at `.webp`.
5. Do not leave the original `.png`/`.gif` in the tree under marketing asset dirs.

## Defaults

| Source | Encoder | Flags |
|--------|---------|-------|
| PNG/JPG | `cwebp` | `-near_lossless 40 -metadata icc -m 6` |
| GIF | `gif2webp` | `-q 80 -m 4 -mt -mixed` (animated WebP) |
