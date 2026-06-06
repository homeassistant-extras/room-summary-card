# AGENTS.md - Types

This folder contains TypeScript contracts for configs, entities, and Home Assistant-facing shapes.

- Keep exported types stable when they represent user config or public card APIs.
- Prefer specific types over broad `any` or unstructured records.
- Reuse Home Assistant types from `@homeassistant-extras/hass` rather than duplicating incompatible shapes.
- Keep type-only modules free of runtime side effects.
