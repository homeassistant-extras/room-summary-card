# AGENTS.md - Config

This folder contains feature flags, config schemas, defaults, and config-related helpers.

- Preserve backwards compatibility for shipped dashboard config unless the user explicitly asks for a breaking change.
- Keep config defaults and validation behavior close together when possible.
- Update editor schemas and tests when adding or changing user-facing config options.
- Avoid silently changing persisted config shape without a migration or cleanup path.
