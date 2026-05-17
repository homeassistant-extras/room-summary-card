# AGENTS.md - Localize

This folder contains localization helpers used by card code.

- Keep localization helpers deterministic and easy to test.
- Preserve fallback behavior for missing languages or keys.
- Do not hard-code translated user-facing strings in card components when a localization path exists.
- Keep helper behavior aligned with the JSON files in `src/translations/` when that folder exists.
