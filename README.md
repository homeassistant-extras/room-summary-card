# Room Summary Card

![Home Assistant](https://img.shields.io/badge/home%20assistant-%2341BDF5.svg?style=for-the-badge&logo=home-assistant&logoColor=white)
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)

![GitHub Release](https://img.shields.io/github/v/release/homeassistant-extras/room-summary-card?style=for-the-badge&logo=github)
![GitHub Pre-Release](https://img.shields.io/github/v/release/homeassistant-extras/room-summary-card?include_prereleases&style=for-the-badge&logo=github&label=PRERELEASE)
![GitHub Tag](https://img.shields.io/github/v/tag/homeassistant-extras/room-summary-card?style=for-the-badge&color=yellow)
![GitHub branch status](https://img.shields.io/github/checks-status/homeassistant-extras/room-summary-card/main?style=for-the-badge)

![stars](https://img.shields.io/github/stars/homeassistant-extras/room-summary-card.svg?style=for-the-badge)
![home](https://img.shields.io/github/last-commit/homeassistant-extras/room-summary-card.svg?style=for-the-badge)
![commits](https://img.shields.io/github/commit-activity/y/homeassistant-extras/room-summary-card?style=for-the-badge)

A custom card for Home Assistant that displays status chips in the toolbar for entities labeled with "status". The chips automatically update based on entity states and are positioned at the top of your dashboard.

This card is slightly opinionated in how you need to setup things for it to work. Feel free to make a PR if you need more flexibility.

| ![Status Chips](assets/status-patch-chips.png) |
| :--------------------------------------------: |
|    _Roll-up all status chips on home page_     |

|   ![Area Chips](assets/area-status.png)   |
| :---------------------------------------: |
| _Have status chips by area automatically_ |

|         ![Status Chips](assets/mobile-bottom-nav.PNG)         |
| :-----------------------------------------------------------: |
| _Mobile will add a padding automatically for bottom nav use._ |

## Features

- Displays entity states as chips in the toolbar
- Automatically filters entities with the "status" label
- Area-aware filtering based on the current url matching the area
- Mobile-responsive with automatic margin adjustments
- Real-time updates when entity states change
- Works with these type of entities
  - `binary_sensor`
  - `sensor` which returns a count
  - any sensor if you customize the `on_state` attribute of it

## Installation

### Prerequisites

> [!WARNING]  
> Before using this card, please ensure you have the [button-card](https://github.com/custom-cards/button-card) custom component installed in your Home Assistant instance.

### HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Click the menu icon in the top right and select "Custom repositories"
3. Add this repository URL and select "Dashboard" as the category
   - `https://github.com/homeassistant-extras/room-summary-card`
4. Click "Install"

### Manual Installation

1. Download the `room-summary-card.js` file from the latest release in the Releases tab.
2. Copy it to your `www/community/room-summary-card/` folder
3. Add the following to your `configuration.yaml` (or add as a resource in dashboards menu)

```yaml
lovelace:
  resources:
    - url: /local/community/room-summary-card/room-summary-card.js
      type: module
```

## Configuration

### Card Configuration

### Entity Configuration

## Usage

## Options

### Card Configuration

### Entity Configuration

ses 'more-info' by default |

## Troubleshooting

Common issues and solutions:

1

## Contributing

This project follows the standard GitHub workflow:

1. Fork the repository
2. Create a feature branch
3. Submit a Pull Request

## Support

- [Report a bug][issues]
- [Request a feature][issues]
- [Ask for help in HA Community][forum]

## License

MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

- Built using [LitElement](https://lit.dev/)
- Inspired by Home Assistant's chip design
- Thanks to all contributors!

[releases-shield]: https://img.shields.io/github/release/custom-cards/room-summary-card.svg
[releases]: https://github.com/custom-cards/room-summary-card/releases
[license-shield]: https://img.shields.io/github/license/custom-cards/room-summary-card.svg
[issues]: https://github.com/custom-cards/room-summary-card/issues
[forum]: https://community.home-assistant.io/

## Build Status

### Main

[![Bump & Tag](https://github.com/homeassistant-extras/room-summary-card/actions/workflows/push.yml/badge.svg?branch=main)](https://github.com/homeassistant-extras/room-summary-card/actions/workflows/push.yml)
[![Fast Forward Check](https://github.com/homeassistant-extras/room-summary-card/actions/workflows/pull_request.yaml/badge.svg?branch=main)](https://github.com/homeassistant-extras/room-summary-card/actions/workflows/pull_request.yaml)

### Release

[![Bump & Tag](https://github.com/homeassistant-extras/room-summary-card/actions/workflows/push.yml/badge.svg?branch=release)](https://github.com/homeassistant-extras/room-summary-card/actions/workflows/push.yml)
[![Merge](https://github.com/homeassistant-extras/room-summary-card/actions/workflows/merge.yaml/badge.svg)](https://github.com/homeassistant-extras/room-summary-card/actions/workflows/merge.yaml)
