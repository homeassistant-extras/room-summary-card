<p align="center">
    <img src="docs/assets/room-cards.png" align="center" width="50%">
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

## Overview

A custom card for Home Assistant that provides a comprehensive room overview, including climate information, device states, and problem indicators. The card displays room temperature, humidity, connected devices, and entity states in an organized flexible layout.

## Documentation

**Full documentation is available at: [homeassistant-extras.github.io/room-summary-card](https://homeassistant-extras.github.io/room-summary-card/)**

## Quick Start

```yaml
type: custom:room-summary-card
area: living_room
```

The card automatically discovers and displays room entities, sensors, and device counts based on your area configuration.

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

## Contributing

- [Join the Discussions](https://github.com/homeassistant-extras/room-summary-card/discussions) - Share your insights, provide feedback, or ask questions
- [Report Issues](https://github.com/homeassistant-extras/room-summary-card/issues) - Submit bugs or feature requests
- [Submit Pull Requests](https://github.com/homeassistant-extras/room-summary-card/blob/main/CONTRIBUTING.md) - Review open PRs and submit your own
- [Check out Discord](https://discord.gg/NpH4Pt8Jmr) - Need further help, have ideas, want to chat?
- [Check out my other cards!](https://github.com/orgs/homeassistant-extras/repositories)

## License

This project is protected under the MIT License. For more details, refer to the [LICENSE](LICENSE) file.

## Acknowledgments

- Built using [LitElement](https://lit.dev/)
- Inspired by Home Assistant's chip design
- Button-Card and Auto-Entities were a huge inspo
- Thanks to all contributors!

[![contributors](https://contrib.rocks/image?repo=homeassistant-extras/room-summary-card)](https://github.com/homeassistant-extras/room-summary-card/graphs/contributors)

[![ko-fi](https://img.shields.io/badge/buy%20me%20a%20coffee-72A5F2?style=for-the-badge&logo=kofi&logoColor=white)](https://ko-fi.com/N4N71AQZQG)

## Project Roadmap and community appreciation

- [x] **`Initial design`**: create initial room card based on button-card template in UI minimialist theme.
- [x] **`Temperature`**: use uom from the device. - thanks @LiquidPT
- [x] **`Card Editor`**: ability to use the HA card editor. - thanks @elsilius
- [x] **`Test on other themes`**: make sure it works elsewhere. - thanks @tardis89, @avatar25pl, @massaquah
- [x] **`Flags`**: ability to disable features.
- [x] **`Multiple sensors`**: support for displaying multiple sensors in the label area. - thanks @fctruter, @LE-tarantino, @zoic21
- [x] **`Climate entity icon styling`**: climate entity will light up icon - thanks @murriano, @robex2005
- [x] **`Climate Threshold tweaks & improvements`**: making this feature better and better - thanks @LE-tarantino, @ma-gu-16, @wmtech-1, @snotgun
- [x] **`Area name display`**: use area name instead of area ID on card - thanks @LE-tarantino
- [x] **`Navigation with room entity`**: navigate now works with room entity set - thanks @LE-tarantino
- [x] **`Card container sizing`**: card respects container - thanks @frdve, @Erikkyw
- [x] **`Border styling improvements`**: border to match HA styles better - thanks @frdve
- [x] **`Theme support for iOS theme`**: for opening issue on themes - thanks @yasalmasri
- [x] **`UI Minimalist theme integration`**: add UI minimalist theme - thanks @tardis89
- [x] **`iOS themes support`**: ios themes - thanks @avatar25pl
- [x] **`Problem entities counter`**: add problem entities counter - thanks to multiple users, @eTron, @MelleD
- [x] **`Card RGB coloring`**: RGB lights color the card - thanks @ChristopherLMiller
- [x] **`Custom names`**: **⭐ First contributor ⭐** added `area_name` - thanks @Aulos
- [x] **`Disable card styling`**: bug fixes and new skip_entity_styles feature - thanks @benjycov
- [x] **`Custom icon color integration`**: support [custom-icon-color](https://github.com/Mariusthvdb/custom-icon-color) - thanks @benjycov
- [x] **`Sensor layout options`**: flexible sensor display layouts (default, stacked, bottom) - thanks @Ltek, @zoic21
- [x] **`Sensor averaging by device class`**: automatic averaging like HA area card - thanks @Ltek
- [x] **`Moving away from customize.yaml`**: allowing more configuration on the card - thanks @johntdyer
- [x] **`Area, entity, and custom backgrounds`**: can setup backgrounds and customize - thanks @CalamarBicefalo, @X1pheR, @Ltek, @felippepuhle, @devkaiwang
- [x] **`Custom Styles`**: apply custom CSS styles - thanks @marceloroloff, @ma-gu-16, @Ltek, @johannwilken, @Sturby, @viprapp, @CaptainSteubing, @devkaiwang
- [x] **`Random bugs`**: pointing out issues to improve card - thanks @rickd1994, @avijavez10, @awfulwoman, @anandv85
- [x] **`Occupancy Detection`**: visual indicators for room occupancy with motion/occupancy sensors - thanks @X1pheR
- [x] **`Mold Indicator`**: animated warning indicator for mold detection with threshold-based display - thanks @ma-gu-16
- [x] **`Entity Labels`**: display entity names under icons for better identification - thanks @Ltek
- [x] **`Clickable Sensors`**: individual sensors in info section open more info dialog - thanks @enrico-semrau
- [x] **`Threshold-Based Icon Coloring`**: dynamic icon colors based on sensor values with configurable thresholds and operators - thanks @fusionstream, @marcokreeft87, @a0365d9b
- [x] **`State-Based Icon Coloring`**: exact state & attribute matching for sensors like washing machines, device trackers, and status indicators - thanks @marcokreeft87, @zoic21, and @sebashi!
- [x] **`Multi-Light Background`**: card background lights up when any light entity in the room is on - thanks @joshkay, @ojm88, @fonix232
- [x] **`Entity Picture Display`**: automatic display of entity pictures with optional override - thanks @Zipp0KMS, @pheitman
- [x] **`Custom Labels`**: entity and sensor labels with state/threshold-based overrides - thanks @ojm88
- [x] **`Smoke, Gas, Water Detection`**: visual indicators for alarm states - thanks @Arjan-21, @robex2005
- [x] **`Entity-Based Threshold Values`**: **⭐ Contributor ⭐** dynamic threshold based on entity - thanks @Micky2149
- [x] **`Full Card Actions`**: make entire card clickable with larger touch targets for mobile-friendly navigation - thanks @devkaiwang
- [x] **`Frosted Glass Theme Support`**: automatic detection and styling for Frosted Glass themes with transparent blurred card effects - thanks @devkaiwang
- [x] **`Sensor Improvements`**: feature requests to make sensors awesome - thanks @MelleD
- [x] **`Brightness Slider`**: entity transforms into slider - thanks @tmaihoff, @hfalk
- [x] **`Entity Badges`**: dynamic badge overlays- thanks @ojm88