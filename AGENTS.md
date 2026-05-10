# AGENTS.md

Project instructions for AI coding agents (Claude Code, Cursor, Codex, etc.). All agents working in this repo should read this file. For deeper architecture and conventions, see [CLAUDE.md](./CLAUDE.md).

## Running tests

This is a Yarn project — use `yarn`, not `npm`.

```bash
yarn test            # full suite
yarn test:coverage   # with NYC coverage
yarn test:watch      # watch mode
```

### `yarn test` failing with `ERR_MODULE_NOT_FOUND` — read this first

If `yarn test` fails with an error like:

```
Error: Cannot find package '@cards/...' imported from test/.../foo.spec.ts
code: 'ERR_MODULE_NOT_FOUND'
```

**It is not a module-resolution problem.** The path aliases (`@cards/*`, `@hass/*`, `@delegates/*`, …) are configured correctly in [tsconfig.json](./tsconfig.json) and registered at runtime via `tsconfig-paths/register` in [.mocharc.json](./.mocharc.json).

The real cause is a **TypeScript compilation error** somewhere in the imported file or its transitive imports. `ts-node` surfaces those as a misleading module-resolution error.

**To diagnose, always run:**

```bash
npx tsc -p tsconfig.test.json --noEmit
```

Fix the type errors it reports, then rerun `yarn test`. Do not investigate `tsconfig` paths, the test config, or stash changes to compare against `main` — that is wasted effort.

## Other conventions

- Prettier formatting: `yarn format`
- Build: `yarn build` (Parcel)
- See [CLAUDE.md](./CLAUDE.md) for architecture, directory layout, and TypeScript path aliases.
