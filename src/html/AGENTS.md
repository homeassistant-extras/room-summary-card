# AGENTS.md - HTML Helpers

This folder contains render helpers and template-building functions.

- Keep helpers small, composable, and free of side effects.
- Return Lit templates or values expected by the surrounding card components.
- Avoid embedding business logic here; calculate data in delegates/helpers first.
- Reuse existing state-display, icon, section, and row helpers before adding new ones.
- Add tests for non-trivial conditional rendering or formatting behavior.
