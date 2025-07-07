# Configuration Guide

This guide covers all configuration options for the Room Summary Card, from basic setup to advanced customization.

## Table of Contents

Some of these go to their own documents - so use this ToC as a guide.

- [Basic Configuration](#basic-configuration)
- [Configuration Options](#configuration-options)
- [Feature Flags](#feature-flags)
- [Background Configuration](configuration/BACKGROUND-CONFIGURATION.md)
- [Entity Configuration](configuration/ENTITY-CONFIGURATION.md)
- [Entity Color Configuration](configuration/ENTITY-COLOR-CONFIGURATION.md)
- [Sensor Configuration](configuration/SENSOR-CONFIGURATION.md)
- [Threshold Configuration](configuration/THRESHOLD-CONFIGURATION.md)
- [Occupancy Configuration](configuration/OCCUPANCY-CONFIGURATION.md)
- [Action Configuration](configuration/ACTION-CONFIGURATION.md)
- [Entity Attributes](configuration/ENTITY-ATTRIBUTES.md)
- [Setting Up Area Pictures](configuration/AREA-PICTURES.md)
- [Examples](configuration/EXAMPLES.md)
- [Custom Styles Configuration](configuration/CUSTOM-STYLES.md)

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

| Name           | Type             | Default                    | Description                                                  |
| -------------- | ---------------- | -------------------------- | ------------------------------------------------------------ |
| area           | string           | **Required**               | The area identifier for the room (e.g., 'shed', 'kitchen')   |
| area_name      | string           | area name                  | Custom area name                                             |
| entity         | string \| object | `light.<area>_light`       | Main entity for the room                                     |
| entities       | array            | See below                  | Additional entities to display                               |
| sensors        | array            | See below                  | Array of sensor entities to display in the card label area   |
| navigate       | string           | area name (dash-separated) | Custom navigation path when clicking the room name / icon    |
| background     | object           | See below                  | Background image configuration                               |
| occupancy      | object           | See below                  | Occupancy detection configuration                            |
| features       | list             | See below                  | Optional flags to toggle different features                  |
| sensor_layout  | string           | `default`                  | Layout for sensor display: `default`, `stacked`, or `bottom` |
| sensor_classes | array            | See below                  | Device classes to average and display sensor readings for    |
| thresholds     | object           | `80° / 60%`                | Temperature, humidity, and mold thresholds                   |
| styles         | object           | `{}`                       | Custom CSS styles for card areas                             |

### Default Entities

By default, the card will include (if found):

- Room light by naming convention (`light.living_room_light`)
- Room fan by naming convention (`switch.living_room_fan`)
- All temperature and humidity sensors by device class
- Problem entities (labeled with "problem")
- Mold sensors (with animated indicators when thresholds are exceeded)
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
| show_entity_labels       | Show entity labels under each entity icon            |

## Sensor Classes

By default these sensor classes will be averaged.

- temperature
- humidity'
- illuminance

See [sensor configuration](configuration/SENSOR-CONFIGURATION.md) for more information.

## Color Configuration

Entity colors can now be configured directly in the card:

```yaml
entities:
  - entity_id: light.living_room
    on_color: yellow
    off_color: grey
    icon_color: '#FFD700'
  - entity_id: switch.fan
    on_color: blue
    off_color: disabled
```

## Custom Styles

Apply custom CSS styles to different areas of the card:

```yaml
type: custom:room-summary-card
area: living_room
styles:
  card:
    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)'
    border-radius: 15px
  title:
    color: white
    font-size: 2em
  entities:
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr 1fr;
  entity_icon:
    width: 50%; # change icon size
    background: red;
  stats:
    color: yellow
    opacity: 1
  sensors:
    color: red
    '--user-sensor-icon-size': 24px
```

- See [Custom Styles Configuration](configuration/CUSTOM-STYLES.md) for style information.
- See [Entity Color Configuration](configuration/ENTITY-COLOR-CONFIGURATION.md) for complete color options.

## Occupancy Detection

The card supports occupancy detection using motion, occupancy, or presence sensors to provide visual feedback when rooms are occupied:

```yaml
type: custom:room-summary-card
area: living_room
occupancy:
  entities:
    - binary_sensor.living_room_motion
    - binary_sensor.living_room_occupancy
  card_border_color: '#4CAF50' # Green border when occupied
  icon_color: '#FF9800' # Orange icon background when occupied
```

**Features:**

- Visual indicators (card borders, icon colors) when occupied
- Support for multiple sensor types (motion, occupancy, presence)
- Customizable styling options

See [Occupancy Configuration](configuration/OCCUPANCY-CONFIGURATION.md) for complete documentation and examples.

## Next Steps

- [Background Configuration](configuration/BACKGROUND-CONFIGURATION.md) - Customize the background with images, camera feeds, etc.
- [Theming Guide](THEMING.md) - Learn about theme support and color customization
- [Advanced Usage](ADVANCED.md) - Explore advanced features and integrations
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions
