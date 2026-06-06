# AGENTS.md

Project instructions for AI coding agents (Claude Code, Cursor, Codex, etc.). All agents working in this repo should read this file. For deeper architecture and conventions, see [CLAUDE.md](./CLAUDE.md).

Run `yarn pass` (format + typecheck + lint + test) before shipping changes. Use `yarn lint:fix` for import/type-import cleanups.

## Scoped Guidance

Read the nearest `AGENTS.md` before changing files in a subdirectory. Scoped files exist under `test/`, `src/cards/`, `src/config/`, `src/delegates/`, `src/editor/`, `src/html/`, `src/localize/`, `src/theme/`, `src/translations/`, `src/types/`, and `src/util/`.
