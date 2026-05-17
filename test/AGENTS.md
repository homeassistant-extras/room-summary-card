# AGENTS.md - Tests

This is a Yarn project. Use `yarn`, not `npm`.

```bash
yarn test            # full suite
yarn test:coverage   # with NYC coverage
yarn test:watch      # watch mode
```

## Single Test Execution

To run a specific test file, prefer the repo's Mocha setup and test TypeScript config:

```bash
TS_NODE_PROJECT='./tsconfig.test.json' npx mocha test/path/to/specific.spec.ts
```

## `yarn test` failing with `ERR_MODULE_NOT_FOUND`

If `yarn test` fails with an error like:

```text
Error: Cannot find package '@cards/...' imported from test/.../foo.spec.ts
code: 'ERR_MODULE_NOT_FOUND'
```

It is usually not a module-resolution problem. The path aliases (`@cards/*`, `@hass/*`, `@delegates/*`, and similar aliases) are configured in `tsconfig.json` and registered at runtime by the test setup.

The common cause is a TypeScript compilation error somewhere in the imported file or its transitive imports. `ts-node` can surface those as a misleading module-resolution error.

To diagnose, run:

```bash
npx tsc -p tsconfig.test.json --noEmit
```

Fix the type errors it reports, then rerun `yarn test`. Do not investigate path aliases, test config, or stash changes to compare against `main` until the typecheck is clean.

## Other Commands

- Format with `yarn format`.
- Build with `yarn build`.
- Check `CLAUDE.md` for repo-specific architecture, directory layout, and aliases.
