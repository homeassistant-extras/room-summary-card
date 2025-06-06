# Configuration Guide

This guide covers all configuration options for the Room Summary Card, from basic setup to advanced customization.

## Table of Contents

- [Basic Configuration](#basic-configuration)
- [Configuration Options](#configuration-options)
- [Entity Configuration](#entity-configuration)
- [Sensor Configuration](#sensor-configuration)
- [Feature Flags](#feature-flags)
- [Action Configuration](#action-configuration)
- [Entity Attributes](#entity-attributes)
- [Examples](#examples)

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

See [default entities](#default-entities)

## Configuration Options

| Name          | Type             | Default                    | Description                                                       |
| ------------- | ---------------- | -------------------------- | ----------------------------------------------------------------- |
| area          | string           | **Required**               | The area identifier for the room (e.g., 'living_room', 'kitchen') |
| area_name     | string           | area name                  | Custom area name                                                  |
| entity        | string \| object | `light.<area>_light`       | Main entity for the room                                          |
| entities      | array            | See below                  | Additional entities to display                                    |
| sensors       | array            | See below                  | Array of sensor entities to display in the card label area        |
| navigate      | string           | area name (dash-separated) | Custom navigation path when clicking the room name / icon         |
| features      | list             | See below                  | Optional flags to toggle different features                       |
| sensor_layout | string           | `default`                  | Layout for sensor display: `default`, `stacked`, or `bottom`      |

### Default Entities

By default, the card will include (if found):

- Room light by naming convention (`light.living_room_light`)
- Room fan by naming convention (`switch.living_room_fan`)
- All temperature and humidity sensors by device class
- Problem entities (labeled with "problem")
- Area statistics

## Entity Configuration

Entities can be specified in two ways:

### 1. Simple String Format

```yaml
entities:
  - light.living_room_lamp
  - switch.living_room_tv
```

### 2. Detailed Object Format

```yaml
entities:
  - entity_id: light.living_room_lamp
    icon: mdi:lamp
    tap_action:
      action: toggle
    hold_action:
      action: more-info
    double_tap_action:
      action: none
```

### Entity Configuration Options

| Name              | Type   | Default                 | Description                 |
| ----------------- | ------ | ----------------------- | --------------------------- |
| entity_id         | string | **Required**            | Entity ID in Home Assistant |
| icon              | string | entity default          | Custom MDI icon             |
| tap_action        | object | `{action: "toggle"}`    | Action on single tap        |
| hold_action       | object | `{action: "more-info"}` | Action on hold              |
| double_tap_action | object | `{action: "none"}`      | Action on double tap        |

## Sensor Configuration

The card supports configuring multiple sensors via the `sensors` array:

```yaml
sensors:
  - sensor.living_room_temperature
  - sensor.living_room_humidity
  - sensor.living_room_co2
  - sensor.living_room_pressure
sensor_layout: bottom # Optional: default, stacked, or bottom
```

### Sensor Layout Options

- **`default`**: Displays sensors in the label area alongside room statistics
- **`stacked`**: Displays sensors vertically stacked in the label area
- **`bottom`**: Displays sensors at the bottom of the card for maximum visibility

![Sensor Layouts](../assets/sensors-styles.png)

### Legacy Sensor Configuration (Deprecated)

For backward compatibility, you can still use:

```yaml
temperature_sensor: sensor.living_room_temperature
humidity_sensor: sensor.living_room_humidity
```

> **Note:** Please migrate to the `sensors` array as these legacy properties will be removed in a future version.

## Feature Flags

Use feature flags to customize card behavior:

```yaml
features:
  - hide_climate_label
  - hide_area_stats
  - hide_sensor_icons
  - exclude_default_entities
  - skip_climate_styles
  - skip_entity_styles
```

| Feature                  | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| hide_climate_label       | Hide the climate/sensor information                  |
| hide_area_stats          | Hide the area statistics (device/entity counts)      |
| hide_sensor_icons        | Hide the icons next to sensor values                 |
| exclude_default_entities | Don't include default light/fan entities             |
| skip_climate_styles      | Disable climate-based color coding & borders         |
| skip_entity_styles       | Disable card background styling based on main entity |

## Action Configuration

Available actions for `tap_action`, `hold_action`, and `double_tap_action`:

| Action    | Parameters      | Description                  |
| --------- | --------------- | ---------------------------- |
| toggle    | none            | Toggle entity state          |
| more-info | none            | Show more info dialog        |
| navigate  | navigation_path | Navigate to a different view |
| none      | none            | Disable the action           |

### Action Examples

```yaml
tap_action:
  action: navigate
  navigation_path: /lovelace/living-room

hold_action:
  action: more-info

double_tap_action:
  action: none
```

## Entity Attributes

These attributes can be added to your entities to customize functionality:

| Name                  | Type   | Default         | Description                         |
| --------------------- | ------ | --------------- | ----------------------------------- |
| on_color              | string | yellow          | Color when the entity is active     |
| off_color             | string | theme off color | Color when the entity is not active |
| temperature_threshold | number | 80              | Threshold to show red border        |
| humidity_threshold    | number | 60              | Threshold to show blue border       |
| icon                  | string | entity default  | Custom MDI icon                     |
| icon_color            | string | none            | Hex color or theme color name       |

See [Advanced Docs](ADVANCED.md) for more examples on attributes.

### Setting Entity Attributes

#### Using Customizations

```yaml
customize:
  switch.garage_opener_plug:
    on_color: green
    off_color: red

  sensor.garage_climate:
    temperature_threshold: 90
    humidity_threshold: 70
```

#### In Template Sensors

```yaml
sensor:
  - name: Printer Status
    state: "{{ not is_state('sensor.printer', 'unavailable') }}"
    icon: mdi:printer-alert
    attributes:
      on_color: blue
      off_color: grey
```

## Examples

### Basic Room

```yaml
type: custom:room-summary-card
area: living_room
```

### Custom Area Name

```yaml
type: custom:room-summary-card
area: living_room
area_name: 'Family Room'
```

### With Custom Entity

```yaml
type: custom:room-summary-card
area: living_room
entity:
  entity_id: light.living_room_main
  icon: mdi:ceiling-light
  tap_action:
    action: toggle
```

### Multiple Sensors with Bottom Layout

```yaml
type: custom:room-summary-card
area: living_room
sensors:
  - sensor.living_room_temperature
  - sensor.living_room_humidity
  - sensor.living_room_co2
  - sensor.living_room_light_level
sensor_layout: bottom
```

### Exclude Default Entities

```yaml
type: custom:room-summary-card
area: office
features:
  - exclude_default_entities
entities:
  - entity_id: light.office_desk
    icon: mdi:desk-lamp
  - entity_id: switch.office_computer
    icon: mdi:desktop-tower
```

### Full Configuration Example

```yaml
type: custom:room-summary-card
area: living_room
area_name: 'Living Room'
entity:
  entity_id: light.living_room_main
  icon: mdi:ceiling-light
  tap_action:
    action: toggle
  hold_action:
    action: more-info
entities:
  - entity_id: switch.living_room_tv
    icon: mdi:television
  - light.living_room_lamp
  - switch.living_room_fan
sensors:
  - sensor.living_room_temperature
  - sensor.living_room_humidity
  - sensor.living_room_co2
sensor_layout: bottom
navigate: /lovelace/living-room
features:
  - hide_area_stats
  - hide_sensor_icons
```

### Problem Entities Setup

To use problem detection, label entities with "problem":

1. In Home Assistant, go to Settings → Areas & Labels
2. Create or edit labels
3. Add "problem" label to relevant entities
4. The card will automatically detect and count them

![Problem Label Setup](../assets/problem-label.png)

### Climate Thresholds

For climate-based border styling:

- Temperature sensors with `device_class: temperature` and values above threshold (default: 80°F) trigger red borders
- Humidity sensors with `device_class: humidity` and values above threshold (default: 60%) trigger blue borders
- Customize thresholds using entity attributes:

```yaml
customize:
  sensor.living_room_temperature:
    temperature_threshold: 75
  sensor.living_room_humidity:
    humidity_threshold: 55
```

## Next Steps

- [Theming Guide](THEMING.md) - Learn about theme support and color customization
- [Advanced Usage](ADVANCED.md) - Explore advanced features and integrations
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions
