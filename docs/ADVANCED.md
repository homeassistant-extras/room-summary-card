# Advanced Usage Guide

This guide covers advanced features and customization options that are actually implemented in the Room Summary Card.

## Table of Contents

- [Background Images](#background-images)
- [Problem Entity Detection](#problem-entity-detection)
- [Entity Attributes Configuration](#entity-attributes-configuration)
- [Custom Icon Color Integration](#custom-icon-color-integration)
- [RGB Color Support](#rgb-color-support)
- [Sensor Averaging](#sensor-averaging)
- [Climate Entity Styling](#climate-entity-styling)
- [Advanced Examples](#advanced-examples)

## Background Images

The card supports multiple background image sources with automatic fallbacks and full customization control.

### Automatic Area Pictures

When areas have pictures set in Home Assistant, the card automatically uses them as backgrounds:

```yaml
# No configuration needed - automatic if area has picture
type: custom:room-summary-card
area: living_room
```

### Custom Background Images

Override area pictures with custom images:

```yaml
type: custom:room-summary-card
area: living_room
background:
  image: /local/images/living-room.jpg
  opacity: 30 # 30% opacity
```

### Dynamic Image Entities

Use image entities for dynamic backgrounds that change based on entity state:

```yaml
type: custom:room-summary-card
area: bedroom
background:
  image_entity: person.john # Person's picture
  opacity: 40
```

```yaml
type: custom:room-summary-card
area: security_room
background:
  image_entity: camera.front_door # Live camera feed
  opacity: 25
```

### Background Priority System

The card uses images in this priority order:

1. **image_entity**: Dynamic image from entity's `entity_picture` attribute
2. **image**: Custom image URL/path from configuration
3. **area.picture**: Area's picture attribute (automatic fallback)

### Background Opacity Control

Control background transparency with automatic or manual opacity:

```yaml
background:
  image: /local/images/room.jpg
  opacity: 50 # 50% opacity (0-100 scale)
```

If no opacity is specified, the card uses theme-aware automatic opacity:

- Light mode: Uses standard opacity values
- Dark mode: Adjusts opacity based on entity state

### Disabling Background Images

Completely disable background images:

```yaml
background:
  options:
    - disable
```

Or use the feature flag:

```yaml
features:
  - hide_room_icon # Hide room icon for cleaner look
background:
  options:
    - disable
```

### Image Entity Examples

#### Person Entity Background

```yaml
type: custom:room-summary-card
area: master_bedroom
background:
  image_entity: person.john
  opacity: 35
features:
  - hide_room_icon # Clean look with person background
```

#### Camera Feed Background

```yaml
type: custom:room-summary-card
area: garage
background:
  image_entity: camera.garage_cam
  opacity: 20
```

#### Image Entity with Fallback

```yaml
type: custom:room-summary-card
area: living_room
background:
  image_entity: image.room_photo # Primary choice
  image: /local/images/fallback.jpg # Fallback if entity unavailable
  opacity: 30
```

## Problem Entity Detection

The card can automatically detect and monitor "problem" entities in your areas using Home Assistant labels.

### Setting Up Problem Detection

1. **Label entities** with "problem" in Home Assistant:

   - Go to Settings → Areas & Labels
   - Create or edit labels
   - Add "problem" label to relevant entities

2. **Area assignment**: Problem entities must be in the same area as the card, either:
   - Directly assigned to the area
   - Belong to a device assigned to the area

![Problem Label Setup](../assets/problem-label.png)

### How It Works

The card automatically:

- Finds entities with "problem" label in the specified area
- Checks if any are currently active using `stateActive()` function
- Displays a counter with the total number of problem entities
- Shows green indicator if no problems are active
- Shows red indicator if any problems are active

![Problem Indicator](../assets/problems.png)

### Example Problem Entities

Common entities to label as "problem":

- Smoke detectors (`binary_sensor.smoke_detector`)
- Water leak sensors (`binary_sensor.water_leak`)
- Door/window sensors (`binary_sensor.front_door`)
- Low battery sensors (`sensor.device_battery`)
- Offline device indicators

## Entity Attributes Configuration

You can add custom attributes to entities to control their appearance and behavior in the card.

### Color Attributes

```yaml
customize:
  switch.garage_opener_plug:
    on_color: green
    off_color: red

  switch.water_softener_plug:
    on_color: green
    off_color: red
```

### Icon Attributes

```yaml
customize:
  light.living_room:
    icon: mdi:ceiling-light
    icon_color: yellow
```

### Available Attributes

| Name       | Type   | Default         | Description                         |
| ---------- | ------ | --------------- | ----------------------------------- |
| on_color   | string | yellow          | Color when the entity is active     |
| off_color  | string | theme off color | Color when the entity is not active |
| icon       | string | entity default  | Custom MDI icon                     |
| icon_color | string | none            | Hex color or theme color name       |

## Custom Icon Color Integration

The card supports the [custom-icon-color integration](https://github.com/Mariusthvdb/custom-icon-color) which allows setting custom colors via the `icon_color` attribute.

### Priority Order

The card uses colors in this priority order:

1. **Hex colors** (`icon_color: "#FF5733"`) - highest priority
2. **RGB colors** (from entity's `rgb_color` attribute)
3. **Theme colors** (minimalist or HA color names)
4. **Domain colors** (default colors by entity type)

### Example Usage

```yaml
customize:
  media_player.netflix:
    icon_color: '#E50914' # Netflix red hex color
    icon: mdi:netflix

  sensor.plex:
    icon_color: '#E5A00D' # Plex gold
    icon: mdi:plex
```

![Custom Icon Color](../assets/icon-color.png)

### Available Color Names

**Minimalist Theme Colors**: red, green, yellow, blue, purple, grey, pink, theme

**Home Assistant Colors**: primary, accent, red, pink, purple, deep-purple, indigo, blue, light-blue, cyan, teal, green, light-green, lime, yellow, amber, orange, deep-orange, brown, light-grey, grey, dark-grey, blue-grey, black, white, disabled

## RGB Color Support

The card automatically uses RGB values from entities with `rgb_color` attributes for accurate color representation.

### How It Works

```yaml
# Entity with RGB color attribute
light.color_bulb:
  rgb_color: [255, 120, 50] # Orange color
```

The card will use this RGB value for:

- Icon coloring
- Background effects
- Theme overrides

![RGB Light](../assets/light-rgb.png)

### RGB Priority Rules

RGB colors are used when:

- Entity has valid `rgb_color` attribute (array of 3 numbers 0-255)
- No `on_color` is set for active entities
- No `off_color` is set for inactive entities
- No `icon_color` is set (which has highest priority)

## Sensor Averaging

The card can automatically calculate and display averaged sensor readings by device class, using the same logic as Home Assistant's area card.

### How Averaging Works

1. **Discovery**: Finds all sensors in the area with specified device classes
2. **Filtering**: Only includes numeric sensors with valid states
3. **Grouping**: Groups sensors by unit of measurement within each device class
4. **Calculation**: Calculates simple average for each group
5. **Display**: Shows averaged value with appropriate formatting

### Averaging Examples

#### Temperature Sensors

```yaml
# Area has these temperature sensors:
# sensor.room_temp_1: 72.5°F
# sensor.room_temp_2: 71.8°F
# sensor.room_temp_3: 73.1°F

sensor_classes:
  - temperature
# Displays: "72.5°F" (average of the three sensors)
```

#### Mixed Units

```yaml
# Area has temperature sensors with different units:
# sensor.temp_celsius: 22.5°C
# sensor.temp_fahrenheit_1: 72°F
# sensor.temp_fahrenheit_2: 74°F

sensor_classes:
  - temperature
# Displays:
# "22.5°C" (single Celsius sensor)
# "73°F" (average of Fahrenheit sensors)
```

### Advanced Configuration

```yaml
# Complete sensor configuration
sensors:
  - sensor.special_co2_sensor # Individual sensor (shown first)
  - sensor.important_pressure # Individual sensor (shown first)
sensor_classes:
  - temperature # Averaged (shown after individual)
  - humidity # Averaged (shown after individual)
  - illuminance # Averaged (shown after individual)
sensor_layout: bottom # Display location
```

### Numeric Device Classes

The following device classes are supported for averaging (must be numeric sensors):

- `temperature`, `humidity`, `pressure`, `illuminance`, `co2`, `pm25`, `pm10`, `aqi`, `battery`, `energy`, `power`, `voltage`, `current`, and more.

**Reference**: See [Home Assistant's area card documentation](https://www.home-assistant.io/dashboards/area) for the complete list.

## Climate Entity Styling

Climate entities receive special treatment with automatic icon and color changes based on their state.

### Climate State Icons

```yaml
# Automatic icons based on climate state:
auto: mdi:autorenew
cool: mdi:snowflake
heat: mdi:fire
dry: mdi:water
heat_cool: mdi:sun-snowflake
fan_only: mdi:fan
off: mdi:snowflake-off
```

### Climate Border Styling

The card shows colored borders based on sensor thresholds:

- **Red border**: Temperature above threshold (configurable)
- **Blue border**: Humidity above threshold (configurable)

![Climate Borders](../assets/climate.png)

### Requirements for Climate Styling

1. **Device class**: Sensors must have proper `device_class`

   ```yaml
   sensor.temperature:
     device_class: temperature

   sensor.humidity:
     device_class: humidity
   ```

2. **Thresholds**: Configure in card configuration

   ```yaml
   type: custom:room-summary-card
   area: living_room
   thresholds:
     temperature: 75 # Custom temperature threshold
     humidity: 55 # Custom humidity threshold
   ```

3. **Skip feature**: Can be disabled with feature flag
   ```yaml
   features:
     - skip_climate_styles # Disables climate borders and colors
   ```

## Advanced Examples

### Complete Room with Background

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
background:
  image: /local/images/living-room.jpg
  opacity: 25
thresholds:
  temperature: 75
  humidity: 55
navigate: /lovelace/living-room
features:
  - hide_area_stats
```

### Person's Room with Dynamic Background

```yaml
type: custom:room-summary-card
area: master_bedroom
area_name: "John's Room"
background:
  image_entity: person.john
  opacity: 40
features:
  - hide_room_icon
entities:
  - light.bedroom_main
  - switch.bedroom_fan
  - climate.bedroom_ac
sensors:
  - sensor.bedroom_temperature
  - sensor.bedroom_humidity
```

### Security Room with Camera Background

```yaml
type: custom:room-summary-card
area: security_office
background:
  image_entity: camera.front_door
  opacity: 20
entities:
  - entity_id: binary_sensor.front_door
    icon: mdi:door
  - entity_id: binary_sensor.motion_detector
    icon: mdi:motion-sensor
  - entity_id: alarm_control_panel.house
    icon: mdi:shield-home
```

### Custom Colors Example

```yaml
# In customize.yaml
customize:
  light.living_room_main:
    on_color: amber
    off_color: disabled
    icon: mdi:ceiling-light

  switch.living_room_tv:
    on_color: blue
    off_color: grey
    icon_color: '#E50914' # Netflix red

  sensor.living_room_temperature:
    icon: mdi:thermometer

  sensor.living_room_humidity:
    icon: mdi:water-percent
```

### Problem Entity Setup

```yaml
# In customize.yaml - these entities should have "problem" label in UI
customize:
  binary_sensor.smoke_detector:
    icon: mdi:smoke-detector
    on_color: red

  binary_sensor.water_leak:
    icon: mdi:water-alert
    on_color: red

  sensor.low_battery_devices:
    icon: mdi:battery-alert
    on_color: orange
```

### Exclude Default Entities

```yaml
type: custom:room-summary-card
area: office
features:
  - exclude_default_entities # Don't include default light/fan
entities:
  - entity_id: light.office_desk
    icon: mdi:desk-lamp
  - entity_id: switch.office_computer
    icon: mdi:desktop-tower
  - entity_id: climate.office_ac
    icon: mdi:air-conditioner
sensors:
  - sensor.office_temperature
  - sensor.office_humidity
background:
  image: /local/images/office.jpg
  opacity: 30
```

### Sensor Layout Options

```yaml
# Default layout (in label area)
type: custom:room-summary-card
area: bedroom
sensor_layout: default

# Stacked layout (vertical in label area)
type: custom:room-summary-card
area: kitchen
sensor_layout: stacked

# Bottom layout (at bottom of card)
type: custom:room-summary-card
area: living_room
sensor_layout: bottom
background:
  image: /local/images/living-room.jpg
  opacity: 25
```

![Sensor Layouts](../assets/sensors-styles.png)

### Skip Styling Features

```yaml
type: custom:room-summary-card
area: utility_room
features:
  - skip_climate_styles # No temperature/humidity borders
  - skip_entity_styles # No card background coloring
  - hide_climate_label # No sensor display
  - hide_area_stats # No device/entity counts
  - hide_sensor_icons # No icons next to sensor values
  - hide_room_icon # Clean layout
background:
  image: /local/images/utility.jpg
  opacity: 20
```

### Custom Thresholds

```yaml
# High temperature threshold for garage
type: custom:room-summary-card
area: garage
thresholds:
  temperature: 90  # Red border above 90°F
  humidity: 80     # Blue border above 80%
background:
  image_entity: camera.garage_cam
  opacity: 15

# Low temperature threshold for wine cellar
type: custom:room-summary-card
area: wine_cellar
thresholds:
  temperature: 65  # Red border above 65°F
  humidity: 70     # Blue border above 70%

# Celsius thresholds
type: custom:room-summary-card
area: greenhouse
thresholds:
  temperature: 32  # Red border above 32°C
  humidity: 75     # Blue border above 75%
```

## Legacy Configuration Support

The card maintains backward compatibility with older configuration formats:

### Legacy Sensor Configuration (Deprecated)

```yaml
# Old way (still works but deprecated)
temperature_sensor: sensor.custom_temperature
humidity_sensor: sensor.custom_humidity

# New way (recommended)
sensors:
  - sensor.custom_temperature
  - sensor.custom_humidity
```

### Migration Notes

- Legacy `temperature_sensor` and `humidity_sensor` properties still work
- They will be combined with the new `sensors` array if both are present
- Plan to migrate to `sensors` array as legacy properties may be removed in future versions

## Next Steps

- [Configuration Guide](CONFIGURATION.md) - Complete configuration options
- [Theming Guide](THEMING.md) - Theme support and color customization
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions
