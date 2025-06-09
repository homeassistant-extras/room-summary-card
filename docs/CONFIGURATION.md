# Configuration Guide

This guide covers all configuration options for the Room Summary Card, from basic setup to advanced customization.

## Table of Contents

Some of these go to their own documents - so use this ToC as a guide.

- [Basic Configuration](#basic-configuration)
- [Configuration Options](#configuration-options)
- [Feature Flags](#feature-flags)
- [Background Configuration](configuration/BACKGROUND-CONFIGURATION.md)
- [Entity Configuration](configuration/ENTITY-CONFIGURATION.md)
- [Sensor Configuration](configuration/SENSOR-CONFIGURATION.md)
- [Threshold Configuration](configuration/THRESHOLD-CONFIGURATION.md)
- [Action Configuration](configuration/ACTION-CONFIGURATION.md)
- [Entity Attributes](configuration/ENTITY-ATTRIBUTES.md)
- [Setting Up Area Pictures](configuration/AREA-PICTURES.md)
- [Examples](configuration/EXAMPLES.md)

## Basic Configuration

The most minimal configuration requires only the area:

```yaml
type: custom:room-summary-card
area: living_room
```

With no additional configuration the card automatically discovers and displays:

- Room light - also the main entity for card coloring
- Room fan
- Temperature sensors
- Humidity sensors
- Area background image (if set)

See [default entities](#default-entities)

## Configuration Options

| Name           | Type             | Default                           | Description                                                       |
| -------------- | ---------------- | --------------------------------- | ----------------------------------------------------------------- |
| area           | string           | **Required**                      | The area identifier for the room (e.g., 'living_room', 'kitchen') |
| area_name      | string           | area name                         | Custom area name                                                  |
| entity         | string \| object | `light.<area>_light`              | Main entity for the room                                          |
| entities       | array            | See below                         | Additional entities to display                                    |
| sensors        | array            | See below                         | Array of sensor entities to display in the card label area        |
| navigate       | string           | area name (dash-separated)        | Custom navigation path when clicking the room name / icon         |
| background     | object           | See below                         | Background image configuration                                    |
| features       | list             | See below                         | Optional flags to toggle different features                       |
| sensor_layout  | string           | `default`                         | Layout for sensor display: `default`, `stacked`, or `bottom`      |
| sensor_classes | array            | `['temperature', 'humidity']`     | Device classes to average and display sensor readings for         |
| thresholds     | object           | `{temperature: 80, humidity: 60}` | Temperature and humidity thresholds                               |

### Default Entities

By default, the card will include (if found):

- Room light by naming convention (`light.living_room_light`)
- Room fan by naming convention (`switch.living_room_fan`)
- All temperature and humidity sensors by device class
- Problem entities (labeled with "problem")
- Area statistics
- Area background image (if picture attribute is set)

## Feature Flags

Use feature flags to customize card behavior:

```yaml
features:
  - hide_climate_label
  - hide_area_stats
  - hide_room_icon
  - hide_sensor_icons
  - exclude_default_entities
  - skip_climate_styles
  - skip_entity_styles
```

| Feature                  | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| hide_climate_label       | Hide the climate/sensor information                  |
| hide_area_stats          | Hide the area statistics (device/entity counts)      |
| hide_room_icon           | Hide the room icon (for cleaner layouts)             |
| hide_sensor_icons        | Hide the icons next to sensor values                 |
| exclude_default_entities | Don't include default light/fan entities             |
| skip_climate_styles      | Disable climate-based color coding & borders         |
| skip_entity_styles       | Disable card background styling based on main entity |

## Next Steps

- [Theming Guide](THEMING.md) - Learn about theme support and color customization
- [Advanced Usage](ADVANCED.md) - Explore advanced features and integrations
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions
