# AGENTS.md - Types

This folder contains TypeScript contracts for configs, entities, locale data, and Home Assistant-facing shapes.

- Keep exported types stable when they represent user config or public card APIs.
- Prefer specific types over broad `any` or unstructured records.
- Reuse Home Assistant types from `src/hass/` rather than duplicating incompatible shapes.
- Keep type-only modules free of runtime side effects.
