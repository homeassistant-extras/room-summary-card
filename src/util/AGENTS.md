# AGENTS.md - Util

This folder contains miscellaneous utilities that do not fit a more specific domain folder.

- Prefer moving broadly shared utilities to `src/common/` when they are used across domains.
- Keep utility functions small, deterministic, and easy to test.
- Avoid adding catch-all modules that mix unrelated concerns.
- Add tests for behavior that affects rendering, config, or Home Assistant state handling.
