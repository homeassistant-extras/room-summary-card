<p align="center">
    <img src="assets/room-cards.png" align="center" width="50%">
</p>
<p align="center"><h1 align="center">Room Summary Card</h1></p>
<p align="center">
  <em>Room Data at Your Fingertips</em>
</p>

![Home Assistant](https://img.shields.io/badge/home%20assistant-%2341BDF5.svg?style=for-the-badge&logo=home-assistant&logoColor=white)
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)

![GitHub Release](https://img.shields.io/github/v/release/homeassistant-extras/room-summary-card?style=for-the-badge&logo=github)
![GitHub Pre-Release](https://img.shields.io/github/v/release/homeassistant-extras/room-summary-card?include_prereleases&style=for-the-badge&logo=github&label=PRERELEASE)
![GitHub Tag](https://img.shields.io/github/v/tag/homeassistant-extras/room-summary-card?style=for-the-badge&color=yellow)
![GitHub branch status](https://img.shields.io/github/checks-status/homeassistant-extras/room-summary-card/main?style=for-the-badge)

![stars](https://img.shields.io/github/stars/homeassistant-extras/room-summary-card.svg?style=for-the-badge)
![home](https://img.shields.io/github/last-commit/homeassistant-extras/room-summary-card.svg?style=for-the-badge)
![commits](https://img.shields.io/github/commit-activity/y/homeassistant-extras/room-summary-card?style=for-the-badge)
![license](https://img.shields.io/github/license/homeassistant-extras/room-summary-card?style=for-the-badge&logo=opensourceinitiative&logoColor=white&color=0080ff)

<p align="center">Built with the tools and technologies:</p>
<p align="center">
  <img src="https://img.shields.io/badge/npm-CB3837.svg?style=for-the-badge&logo=npm&logoColor=white" alt="npm">
  <img src="https://img.shields.io/badge/Prettier-F7B93E.svg?style=for-the-badge&logo=Prettier&logoColor=black" alt="Prettier">
  <img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=for-the-badge&logo=TypeScript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/GitHub%20Actions-2088FF.svg?style=for-the-badge&logo=GitHub-Actions&logoColor=white" alt="GitHub%20Actions">
  <img src="https://img.shields.io/badge/Lit-324FFF.svg?style=for-the-badge&logo=Lit&logoColor=white" alt="Lit">
</p>
<br>

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Themes and Styling](#themes-and-styling)
- [Project Roadmap](#project-roadmap)
- [Contributing](#contributing)

## Overview

A custom card for Home Assistant that provides a comprehensive room overview, including climate information, device states, and problem indicators. The card displays room temperature, humidity, connected devices, and entity states in an organized flexible layout.

## Features

### Sensor Averaging

Automatically calculates and displays averaged sensor readings by device class:

- **Individual sensors**: Display specific sensors in your preferred order
- **Averaged sensors**: Show area-wide averages for device classes (temperature, humidity, etc.)
- **Smart grouping**: Groups sensors by unit of measurement for accurate averaging

### Climate Information

The card can display climate-related information and apply visual styling based on temperature and humidity thresholds.

#### Climate Thresholds

You can configure temperature, humidity, and mold thresholds to trigger visual indicators:

```yaml
thresholds:
  temperature: 80 # °F (default: 80)
  humidity: 60 # % (default: 60)
  mold: 50 # % (no default - shows whenever mold sensor is present)
  temperature_entity: sensor.living_room_temp # Specific sensor (optional)
  humidity_entity: sensor.living_room_humidity # Specific sensor (optional)
```

**Mold Indicator**: When mold levels exceed the threshold, an animated indicator appears in the bottom left area near problem entities with pulsing effects and warning symbols.

**Individual Sensor Support**: When you specify `temperature_entity` or `humidity_entity`, the card will look for that specific sensor in both:

1. **Individual sensors** (from `config.sensors`) - if the entity has the correct device class
2. **Averaged sensors** (from `config.sensor_classes`) - as a fallback

This allows you to use configured individual sensors for climate thresholds even when their device class isn't included in `sensor_classes`.

#### Example: Using Individual Sensors for Thresholds

```yaml
sensors:
  - sensor.living_room_temp_1 # Individual temperature sensor
  - sensor.living_room_humidity # Individual humidity sensor
sensor_classes:
  - pressure # Only pressure sensors from area
thresholds:
  temperature: 75
  humidity: 50
  temperature_entity: sensor.living_room_temp_1 # Uses individual sensor
  humidity_entity: sensor.living_room_humidity # Uses individual sensor
```

In this example, the climate thresholds will use the individual temperature and humidity sensors, even though `temperature` and `humidity` aren't in `sensor_classes`.

### Entity Status

- Color-coded icons indicating entity states
- Interactive icons with tap/hold actions
- Climate entity colors with automatic state detection
- RGB color support for accurate light representation

![Entity Icons](assets/icons.png)

### Problem Detection

- Automatically detects entities labeled as "problem" in the area
- Shows count of problem entities with color-coded indicators
- Red for active problems, green for no active problems
- **Mold Indicator**: Animated warning appears in the bottom left area when mold levels exceed thresholds

![Problem Detection](assets/problems.png)

### Occupancy Detection

- Visual indicators when rooms are occupied using motion/occupancy sensors
- Dynamic card borders and room icon colors based on occupancy status
- Support for multiple sensor types (motion, occupancy, presence, device trackers)
- Customizable colors and animation options
- Granular control over which visual effects are applied

![Occupancy](assets/occupancy.png)

### Room Statistics

- Shows total number of devices and entities in the room
- Automatic entity discovery based on area assignment
- Configurable display options

### Multiple Sensor Layouts

Choose from different sensor display options:

- **Default**: In the label area alongside room statistics
- **Stacked**: Vertically stacked in the label area
- **Bottom**: At the bottom of the card for maximum visibility

![Sensor Layouts](assets/sensors-styles.png)

### Background Images

Multiple background image sources with automatic fallbacks:

- **Area Pictures**: Automatically uses area pictures from Home Assistant
- **Custom Images**: Static image files from local storage or URLs
- **Dynamic Entities**: Live images from camera, person, or image entities
- **Opacity Control**: Customizable transparency levels
- **Icon Background**: Apply background to room icon only for subtle effects
- **Disable Option**: Complete background image control

| area picture                     | entity picture                       | background picture                         |
| -------------------------------- | ------------------------------------ | ------------------------------------------ |
| ![area](assets/area-picture.png) | ![entity](assets/entity-picture.png) | ![background](assets/background-image.png) |

📖 **See [Background Configuration](docs/configuration/BACKGROUND-CONFIGURATION.md) for detailed examples and advanced usage.**

### RGB Color Support

Direct RGB color values from entities with `rgb_color` attributes for accurate color representation.

![RGB Light Colors](assets/light-rgb.png)

### Custom Icon Color Integration

Support for the [custom-icon-color integration](https://github.com/Mariusthvdb/custom-icon-color):

- **Hex Colors**: Direct hex color specification (`#FF5733`)
- **Theme Colors**: Use theme color names (`red`, `blue`, `yellow`)
- **Color Priority**: Intelligent color precedence system
- **Cross-Theme Support**: Works with multiple theme systems

![Custom Icon Colors](assets/icon-color.png)

### Climate Entity Styling

Special styling for climate entities with automatic state detection:

- **State-Based Icons**: Automatic icons based on climate state (heat, cool, auto, etc.)
- **Color Coding**: Dynamic colors based on current operation mode
- **Border Indicators**: Visual climate threshold warnings
- **Skip Option**: Can be disabled for custom styling

### Advanced Feature Flags

Extensive customization options:

- **Hide Components**: Area stats, climate labels, room icons, sensor icons
- **Exclude Defaults**: Skip default entity discovery
- **Style Control**: Disable climate styling, entity styling
- **Layout Options**: Multiple sensor display layouts

### Custom Styling

Customize the appearance with CSS styles the way you like.

- **Custom Styling**: Apply custom CSS styles to different card areas (title, stats, sensors, card container)
- **Precise Control**: Override theme defaults with specific colors, fonts, and layout properties
- **CSS Variables**: Support for CSS custom properties for advanced customization
- **Theme Integration**: Works alongside existing themes while allowing complete visual override

![styles](assets/custom-styles.png)

### Card Editor

Visual configuration interface:

- **Drag & Drop**: Easy entity management
- **Live Preview**: Real-time configuration preview
- **Schema Validation**: Built-in configuration validation
- **Auto-Discovery**: Automatic sensor and entity detection

![Card Editor](assets/editor.png)

## Installation

### HACS (Recommended)

[![HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=homeassistant-extras&repository=room-summary-card&category=dashboard)

1. Open HACS in your Home Assistant instance
2. Click the menu icon and select "Custom repositories"
3. Add: `https://github.com/homeassistant-extras/room-summary-card`
4. Select "Dashboard" as the category
5. Click "Install"

### Manual Installation

1. Download `room-summary-card.js` from the [latest release](https://github.com/homeassistant-extras/room-summary-card/releases)
2. Copy to `www/community/room-summary-card/`
3. Add to your `configuration.yaml`:

```yaml
lovelace:
  resources:
    - url: /local/community/room-summary-card/room-summary-card.js
      type: module
```

## Quick Start

### Minimal Configuration

```yaml
type: custom:room-summary-card
area: living_room
```

### Card Editor

Use the visual editor for easy configuration:

![Card Editor Interface](assets/editor.png)

The card automatically discovers and displays:

- Room light and fan entities (based on area naming)
- Problem entities (labeled with "problem")
- Individual temperature and humidity sensors (via `sensors` config)
- Averaged sensor readings by device class (via `sensor_classes` config)
- Device and entity counts

## Documentation

📚 **Detailed Documentation:**

- **[Configuration Guide](docs/CONFIGURATION.md)** - Complete configuration options and examples
- **[Theming Guide](docs/THEMING.md)** - Theme support and color customization
- **[Advanced Usage](docs/ADVANCED.md)** - Advanced features and entity attributes
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Build](docs/BUILD.md)** - Build and Code Quality statistics

## Themes and Styling

The card supports multiple themes out of the box:

- **Default Home Assistant** themes
- **[UI Minimalist](https://ui-lovelace-minimalist.github.io/UI/)** theme
- **[iOS Themes](https://github.com/basnijholt/lovelace-ios-themes)**

### Theme Examples

| Default HA                            | UI Minimalist                                    |
| ------------------------------------- | ------------------------------------------------ |
| ![HA Dark](assets/default-dark.png)   | ![Minimalist Dark](assets/minimalist-dark.png)   |
| ![HA Light](assets/default-light.png) | ![Minimalist Light](assets/minimalist-light.png) |

See the [Theming Guide](docs/THEMING.md) for detailed color configuration and custom theme support.

## Project Roadmap

- [x] **`Initial design`**: create initial room card based on button-card template in UI minimialist theme.
- [x] **`Temperature`**: use uom from the device. - thanks @LiquidPT
- [x] **`Card Editor`**: ability to use the HA card editor. - thanks @elsilius
- [x] **`Test on other themes`**: make sure it works elsewhere. - thanks @tardis89, @avatar25pl
- [x] **`Flags`**: ability to disable features.
- [x] **`Multiple sensors`**: support for displaying multiple sensors in the label area. - thanks @fctruter, @LE-tarantino
- [x] **`Climate entity icon styling`**: climate entity will light up icon - thanks @murriano
- [x] **`Border styling for climate thresholds`**: border respects skip_climate_styles - thanks @LE-tarantino, @ma-gu-16, @wmtech-1
- [x] **`Area name display`**: use area name instead of area ID on card - thanks @LE-tarantino
- [x] **`Navigation with room entity`**: navigate now works with room entity set - thanks @LE-tarantino
- [x] **`Card container sizing`**: card respects container - thanks @frdve, @Erikkyw
- [x] **`Border styling improvements`**: border to match HA styles better - thanks @frdve
- [x] **`Theme support for iOS theme`**: for opening issue on themes - thanks @yasalmasri
- [x] **`UI Minimalist theme integration`**: add UI minimalist theme - thanks @tardis89
- [x] **`iOS themes support`**: ios themes - thanks @avatar25pl
- [x] **`Problem entities counter`**: add problem entities counter - thanks to multiple users
- [x] **`Card RGB coloring`**: RGB lights color the card - thanks @ChristopherLMiller
- [x] **`Custom names`**: **⭐ First contributor ⭐** added `area_name` - thanks @Aulos
- [x] **`Disable card styling`**: bug fixes and new skip_entity_styles feature - thanks @benjycov
- [x] **`Custom icon color integration`**: support [custom-icon-color](https://github.com/Mariusthvdb/custom-icon-color) - thanks @benjycov
- [x] **`Sensor layout options`**: flexible sensor display layouts (default, stacked, bottom) - thanks @Ltek
- [x] **`Sensor averaging by device class`**: automatic averaging like HA area card - thanks @Ltek
- [x] **`Moving away from customize.yaml`**: allowing more configuration on the card - thanks @johntdyer
- [x] **`Area, entity, and custom backgrounds`**: can setup backgrounds and customize - thanks @CalamarBicefalo, @X1pheR, @Ltek
- [x] **`Custom Styles`**: ability to apply custom CSS styles - thanks @marceloroloff, @ma-gu-16, @Ltek, @johannwilken
- [x] **`Random bugs`**: pointing out issues to improve card - thanks @rickd1994, @avijavez10, @awfulwoman
- [x] **`Occupancy Detection`**: visual indicators for room occupancy with motion/occupancy sensors - thanks @X1pheR
- [x] **`Mold Indicator`**: animated warning indicator for mold detection with threshold-based display - thanks @ma-gu-16
- [x] **`Entity Labels`**: display entity names under icons for better identification - thanks @Ltek

## Contributing

- **💬 [Join the Discussions](https://github.com/homeassistant-extras/room-summary-card/discussions)**: Share your insights, provide feedback, or ask questions.
- **🐛 [Report Issues](https://github.com/homeassistant-extras/room-summary-card/issues)**: Submit bugs found or log feature requests for the `room-summary-card` project.
- **💡 [Submit Pull Requests](https://github.com/homeassistant-extras/room-summary-card/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.
- **📣 [Check out discord](https://discord.gg/NpH4Pt8Jmr)**: Need further help, have ideas, want to chat?
- **🃏 [Check out my other cards!](https://github.com/orgs/homeassistant-extras/repositories)** Maybe you have an integration that I made cards for.

## License

This project is protected under the MIT License. For more details, refer to the [LICENSE](LICENSE) file.

## Acknowledgments

- Built using [LitElement](https://lit.dev/)
- Inspired by Home Assistant's chip design
- Button-Card and Auto-Entities were a huge inspo
- Thanks to all contributors!

[![contributors](https://contrib.rocks/image?repo=homeassistant-extras/room-summary-card)](https://github.com/homeassistant-extras/room-summary-card/graphs/contributors)

[![ko-fi](https://img.shields.io/badge/buy%20me%20a%20coffee-72A5F2?style=for-the-badge&logo=kofi&logoColor=white)](https://ko-fi.com/N4N71AQZQG)

## Build & Code Quality

Check out **[Build Documentation](docs/BUILD.md)**!
