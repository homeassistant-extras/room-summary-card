# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Cross-agent instructions (including the rule for diagnosing `yarn test` failures) live in [AGENTS.md](./AGENTS.md). Read that first.

## Package Manager

This is a **Yarn project**. Use `yarn` commands instead of `npm` for consistency.

## Lint / typecheck

- `yarn lint` / `yarn lint:fix` — ESLint flat config (`eslint.config.mjs`); Lit + WC rules on card/html files; `e2e/**` is ignored.
- `yarn typecheck` — production `tsconfig.json` (`include`: `src/**/*.ts` only) plus test `tsconfig.test.json`.
- `yarn pass` — format, typecheck, lint, and test in one shot.

If `yarn test` fails with `ERR_MODULE_NOT_FOUND` on an `@cards/*`/`@homeassistant-extras/hass/*`/etc. import, **don't chase path-alias config**. It's almost always a TypeScript compile error in the imported file or a transitive import. Run `yarn typecheck` (or `npx tsc -p tsconfig.test.json --noEmit`) and fix what it reports.

## Development Commands

### Build and Development

- `yarn build` - Build the project using Parcel (outputs to dist/)
- `yarn watch` - Watch mode for development (rebuilds on changes)
- `yarn format` - Format code using Prettier
- `yarn lint` - ESLint (TypeScript + Lit + web component best practices)
- `yarn lint:fix` - ESLint with auto-fix where safe
- `yarn typecheck` - `tsc` against `tsconfig.json` and `tsconfig.test.json`
- `yarn pass` - format + typecheck + lint + test (run before shipping)
- `yarn update` - Update dependencies with npm-check-updates

### Testing

- `yarn test` - Run unit tests using Mocha with TypeScript
- `yarn test:coverage` - Run tests with NYC coverage reporting
- `yarn test:watch` - Run tests in watch mode for development
- `yarn test:e2e` - Run Playwright end-to-end tests against a live Home Assistant instance
- `yarn test:e2e:auth` - Capture a Playwright storage state for authenticated e2e runs (requires `.env` with `PLAYWRIGHT_HA_ORIGIN` and `PLAYWRIGHT_HA_STORAGE_STATE`)

### Single Test Execution

To run a specific test file:

```bash
TS_NODE_PROJECT='./tsconfig.test.json' npx mocha test/path/to/specific.spec.ts
```

## Project Architecture

This is a **Home Assistant custom card** built with **LitElement/Lit** that displays room summaries with climate data, entity states, and visual indicators.

### Core Architecture Layers

1. **Entry Point (`src/index.ts`)**: Registers custom elements and card with Home Assistant
2. **Card Component (`src/cards/card.ts`)**: Main Lit-based card component
3. **Sub-components**: Modular Lit components for different UI sections
4. **Delegates**: Business logic handlers for data processing and state management
5. **Theme System**: Comprehensive styling and theming support
6. **HASS Integration**: Home Assistant API and type definitions

### Key Directory Structure

- **`src/cards/`**: Lit-based UI components (main card, sub-components, badges, sliders)
- **`src/config/`**: Configuration parsing, defaults, and schema helpers
- **`src/delegates/`**: Business logic separated from UI (retrievers, checks, utilities)
- **`src/editor/`**: Visual configuration editor and its row/sub-element editors
- **`src/html/`**: HTML template functions for UI rendering
- **`src/localize/`**: Localization helpers consuming `src/translations/`
- **`src/theme/`**: Theming system, CSS generation, color management
- **`src/translations/`**: JSON translation bundles
- **`src/types/`**: TypeScript type definitions for config, sensors, etc.
- **`src/util/`**: Generic utility helpers shared across layers

### TypeScript Path Aliases

The project uses path aliases defined in `tsconfig.json`:

- `@cards/*` → `./src/cards/*`
- `@config/*` → `./src/config/*`
- `@delegates/*` → `./src/delegates/*`
- `@editor/*` → `./src/editor/*`
- `@homeassistant-extras/hass/*` → shared package (vendored HA frontend helpers, types, mixins, etc.)
- `@html/*` → `./src/html/*`
- `@localize/*` → `./src/localize/*`
- `@theme/*` → `./src/theme/*`
- `@type/*` → `./src/types/*`
- `@util/*` → `./src/util/*`
- `@test/*` → `./test/*`
- `@/*` → `./src/*`

### Component Registration

The card registers multiple custom elements (see `src/index.ts`):

- `room-summary-card` - Main card component
- `room-summary-card-editor` - Visual configuration editor
- `sensor-collection`, `entity-collection`, `entity-slider`, `room-state-icon`, `room-badge` - Sub-components
- `room-summary-entity-detail-editor`, `room-summary-entities-row-editor`, `room-summary-states-row-editor`, `room-summary-thresholds-row-editor`, `room-summary-badge-row-editor`, `room-summary-sub-element-editor` - Editor row/sub-element components

Additional `@customElement`-decorated components are registered inline under `src/cards/components/` (e.g. `area-statistics`, `problem-entity-row`, `problem-entity-list`, `problem-dialog`, `horizontal-slider`, `room-sensor-label`, `room-entity-label`, `room-badge-label`).

### Data Flow Pattern

1. **Configuration**: Card receives config from Home Assistant dashboard
2. **Delegates**: Process config and fetch/calculate required data
3. **State Management**: Components update based on HASS state changes
4. **Rendering**: Lit components render UI with calculated data and theme styles

### Key Features Architecture

- **Sensor Averaging**: Delegates calculate averages by device class (temperature, humidity)
- **Entity Discovery**: Automatic area-based entity discovery with manual overrides
- **Theme Integration**: Multi-theme support (Default HA, UI Minimalist, iOS themes)
- **Climate Thresholds**: Configurable thresholds with visual indicators
- **Background Images**: Support for area pictures, custom images, and entity-based images

### Testing Setup

- **Framework**: Mocha + Chai + Sinon for unit tests
- **TypeScript**: Tests use separate `tsconfig.test.json`
- **DOM Testing**: Uses JSDOM (+ `@open-wc/testing`, `@testing-library/dom`) for component testing
- **Coverage**: NYC with Istanbul for coverage reporting
- **Setup**: `mocha.setup.ts` provides test environment configuration
- **End-to-end**: Playwright tests run against a live Home Assistant instance via `yarn test:e2e`; auth state is captured with `yarn test:e2e:auth`

### Build System

- **Bundler**: Parcel 2.x for module bundling
- **Target**: Single JS file for Home Assistant integration
- **TypeScript**: Strict mode with experimental decorators for Lit
- **Code Quality**: Prettier with import sorting plugins

### Home Assistant Integration

The card integrates deeply with Home Assistant's:

- **Area Registry**: For automatic entity discovery
- **Entity Registry**: For entity metadata and relationships
- **Device Registry**: For device information
- **State Management**: Real-time state updates via WebSocket
- **Action System**: Tap/hold actions on entities
- **Custom Card Registry**: Registration for dashboard usage
