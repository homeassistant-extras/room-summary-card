# AGENTS.md - Cards

This folder contains Lit-based card UI, editors, mixins, and card-specific components.

- Keep rendering logic declarative and close to the component that owns the UI state.
- Use delegates, helpers, or common utilities for business logic that can be tested without DOM rendering.
- Preserve Home Assistant custom element registration patterns used by the repo.
- Keep editor components focused on config editing and emitting config change events.
- Prefer existing local component, mixin, and style patterns before adding new abstractions.
