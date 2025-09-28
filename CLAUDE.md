# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

This is a **Yarn project**. Use `yarn` commands instead of `npm` for consistency.

## Development Commands

### Build and Development

- `yarn build` - Build the project using Parcel (outputs to dist/)
- `yarn watch` - Watch mode for development (rebuilds on changes)
- `yarn format` - Format code using Prettier
- `yarn update` - Update dependencies with npm-check-updates

### Testing

- `yarn test` - Run tests using Mocha with TypeScript
- `yarn test:coverage` - Run tests with NYC coverage reporting
- `yarn test:watch` - Run tests in watch mode for development

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

- **`src/cards/`**: Lit-based UI components (main card, editor, sub-components)
- **`src/delegates/`**: Business logic separated from UI (retrievers, checks, utilities)
- **`src/theme/`**: Theming system, CSS generation, color management
- **`src/hass/`**: Home Assistant integration, types, and API wrappers
- **`src/types/`**: TypeScript type definitions for config, sensors, etc.
- **`src/html/`**: HTML template functions for UI rendering

### TypeScript Path Aliases

The project uses path aliases defined in `tsconfig.json`:

- `@cards/*` → `./src/cards/*`
- `@delegates/*` → `./src/delegates/*`
- `@theme/*` → `./src/theme/*`
- `@hass/*` → `./src/hass/*`
- `@type/*` → `./src/types/*`
- `@config/*` → `./src/config/*`
- `@html/*` → `./src/html/*`
- `@util/*` → `./src/util/*`

### Component Registration

The card registers multiple custom elements:

- `room-summary-card` - Main card component
- `room-summary-card-editor` - Visual configuration editor
- `sensor-collection`, `entity-collection`, `room-state-icon` - Sub-components

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

- **Framework**: Mocha + Chai + Sinon
- **TypeScript**: Tests use separate `tsconfig.test.json`
- **DOM Testing**: Uses JSDOM for component testing
- **Coverage**: NYC with Istanbul for coverage reporting
- **Setup**: `mocha.setup.ts` provides test environment configuration

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
