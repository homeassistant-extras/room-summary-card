# AGENTS.md

Project instructions for AI coding agents (Claude Code, Cursor, Codex, etc.). All agents working in this repo should read this file. For deeper architecture and conventions, see [CLAUDE.md](./CLAUDE.md).

Run `yarn pass` (format + typecheck + lint + test) before shipping changes. Use `yarn lint:fix` for import/type-import cleanups.

## Scoped Guidance

Read the nearest `AGENTS.md` before changing files in a subdirectory. Scoped files exist under `test/`, `src/cards/`, `src/config/`, `src/delegates/`, `src/editor/`, `src/html/`, `src/localize/`, `src/theme/`, `src/translations/`, `src/types/`, and `src/util/`.

## Docs images (WebP)

Marketing/docs screenshots live under `assets/` and `docs/assets/`. Store them as **`.webp` only** (animated WebP for former GIFs). Do not add `.png` / `.gif` / `.jpg` there. Runtime card art under `src/assets/` is exempt (e.g. Whisker AVIF).

If you only have a PNG/GIF, run `./scripts/convert-docs-images.sh` from the repo root (needs `cwebp` / `gif2webp` from `brew install webp`). See `.claude/skills/convert-docs-images/SKILL.md` and `.cursor/skills/convert-docs-images/SKILL.md`.

