# AGENTS.md - Home Assistant Code

This folder contains copied or adapted Home Assistant frontend types, helpers, and integration glue.

- Treat these files as upstream Home Assistant frontend code unless clearly documented otherwise.
- Keep copied files matching upstream 100% when they are vendored from Home Assistant.
- If a local change is unavoidable, document why it diverges from upstream.
- Prefer copying the smallest needed upstream surface instead of inventing parallel types.
- Be careful with import paths so shared HASS helpers stay portable across card repos.
