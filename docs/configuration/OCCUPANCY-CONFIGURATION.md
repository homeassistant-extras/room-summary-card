# Alarm Configuration (Occupancy, Smoke, Gas & Water Detection)

The Room Summary Card supports alarm detection to provide visual feedback when rooms are occupied, when smoke is detected, when gas is detected, or when water is detected. This feature uses motion, occupancy, presence, smoke, gas, or moisture sensors to dynamically change the card's appearance based on room status.

![Occupancy](../../assets/occupancy.png)

## Overview

Alarm detection allows you to:

- **Visual Indicators**: Change card borders and room icon colors when alarms are detected
- **Multiple Sensors**: Combine multiple sensors for reliable detection
- **Customizable Styling**: Control which visual effects are applied
- **Priority System**: Smoke > Gas > Water > Occupancy (higher priority alarms suppress lower priority ones)

## Basic Configuration

### Simple Occupancy Detection

```yaml
type: custom:room-summary-card
area: living_room
occupancy:
  entities:
    - binary_sensor.living_room_motion
    - binary_sensor.living_room_occupancy
```

This configuration will:

- Monitor the specified sensors for occupancy
- Apply default visual indicators when any sensor detects occupancy
- Use theme-appropriate colors for the indicators (default: green/success color)

### Simple Smoke Detection

```yaml
type: custom:room-summary-card
area: kitchen
smoke:
  entities:
    - binary_sensor.kitchen_smoke_detector
    - binary_sensor.kitchen_smoke_alarm
```

This configuration will:

- Monitor the specified smoke detectors
- Apply visual indicators when smoke is detected
- Use error color by default (typically red)
- **Take priority over all other alarms** - if smoke is detected, all other alarm indicators are suppressed

### Simple Gas Detection

```yaml
type: custom:room-summary-card
area: basement
gas:
  entities:
    - binary_sensor.basement_gas_detector
    - binary_sensor.basement_gas_alarm
```

This configuration will:

- Monitor the specified gas sensors
- Apply visual indicators when gas is detected
- Use orange color by default (`#FF9800`)
- **Take priority over water and occupancy** - if gas is detected, water and occupancy indicators are suppressed

### Simple Water Detection

```yaml
type: custom:room-summary-card
area: bathroom
water:
  entities:
    - binary_sensor.bathroom_water_leak
    - binary_sensor.bathroom_moisture_sensor
```

This configuration will:

- Monitor the specified water sensors
- Apply visual indicators when water is detected
- Use blue color by default (`#2196F3`)
- **Take priority over occupancy** - if water is detected, occupancy indicators are suppressed

### Combined Occupancy and Smoke Detection

```yaml
type: custom:room-summary-card
area: bedroom
occupancy:
  entities:
    - binary_sensor.bedroom_motion
    - binary_sensor.bedroom_presence
  card_border_color: '#4CAF50' # Green border when occupied
  icon_color: '#FF9800' # Orange icon background when occupied
smoke:
  entities:
    - binary_sensor.bedroom_smoke_detector
  card_border_color: '#F44336' # Red border when smoke detected
  icon_color: '#FF1744' # Red icon background when smoke detected
```

**Important**: When multiple alarms are configured, the priority system applies: Smoke > Gas > Water > Occupancy. Higher priority alarms suppress lower priority ones.

### With Custom Colors

```yaml
type: custom:room-summary-card
area: bedroom
occupancy:
  entities:
    - binary_sensor.bedroom_motion
    - binary_sensor.bedroom_presence
  card_border_color: '#4CAF50' # Green border when occupied
  icon_color: '#FF9800' # Orange icon background when occupied
```

## Configuration Options

Both `occupancy` and `smoke` configurations use the same options:

| Option              | Type   | Default (Occupancy) | Default (Smoke)   | Description                                                                           |
| ------------------- | ------ | ------------------- | ----------------- | ------------------------------------------------------------------------------------- |
| `entities`          | array  | **Required**        | **Required**      | Array of sensor entity IDs (motion/occupancy/presence for occupancy, smoke for smoke) |
| `card_border_color` | string | Theme success color | Theme error color | Color for card border when alarm is triggered                                         |
| `icon_color`        | string | Theme success color | Theme error color | Color for room icon background when alarm is triggered                                |
| `options`           | array  | `[]`                | `[]`              | Array of features to disable (see below)                                              |

**Note**: Smoke detection uses error color (typically red) by default, while occupancy uses success color (typically green) by default.

## Visual Effects

### Card Border Styling

When occupancy is detected, the card border changes to indicate the room is occupied:

```yaml
type: custom:room-summary-card
area: kitchen
occupancy:
  entities:
    - binary_sensor.kitchen_motion
  card_border_color: '#2196F3' # Blue border
```

**Default Behavior**: Uses your theme's success color (typically green)

### Room Icon Styling

The room icon background changes color when occupied:

```yaml
type: custom:room-summary-card
area: office
occupancy:
  entities:
    - binary_sensor.office_occupancy
  icon_color: '#FF5722' # Orange icon background
```

## Disable Specific Features

Use the `options` array to disable specific visual effects:

```yaml
type: custom:room-summary-card
area: bedroom
occupancy:
  entities:
    - binary_sensor.bedroom_motion
  options:
    - disabled_card_styles # Disable card border changes
    - disable_icon_styles # Disable icon background changes
    - disabled_card_styles_animation # Disable card border animation
    - disable_icon_animation # Disable icon animation
```

### Available Options

| Option                           | Description                                |
| -------------------------------- | ------------------------------------------ |
| `disabled_card_styles`           | Disable card border color changes          |
| `disabled_card_styles_animation` | Disable card border pulsing animation      |
| `disable_icon_styles`            | Disable room icon background color changes |
| `disable_icon_animation`         | Disable room icon animation                |

## Advanced Examples

### Multiple Sensor Types

Combine different types of occupancy sensors for reliable detection:

```yaml
type: custom:room-summary-card
area: living_room
occupancy:
  entities:
    - binary_sensor.living_room_motion # Motion sensor
    - binary_sensor.living_room_occupancy # Occupancy sensor
    - binary_sensor.living_room_presence # Presence sensor
    - device_tracker.living_room_phone # Phone location
  card_border_color: '#4CAF50'
  icon_color: '#8BC34A'
```

### Smoke Detection with Custom Colors

Configure smoke detection with custom colors:

```yaml
type: custom:room-summary-card
area: kitchen
smoke:
  entities:
    - binary_sensor.kitchen_smoke_detector
    - binary_sensor.kitchen_smoke_alarm
  card_border_color: '#FF5722' # Deep orange border
  icon_color: '#F44336' # Red icon background
```

### Combined Occupancy and Smoke

Use both occupancy and smoke detection together:

```yaml
type: custom:room-summary-card
area: bedroom
occupancy:
  entities:
    - binary_sensor.bedroom_motion
  card_border_color: '#4CAF50' # Green when occupied
  icon_color: '#8BC34A'
smoke:
  entities:
    - binary_sensor.bedroom_smoke_detector
  card_border_color: '#F44336' # Red when smoke detected (takes priority)
  icon_color: '#FF1744'
```

**Priority**: When smoke is detected, it takes priority over occupancy. The smoke colors and styles will be used, and occupancy indicators will be suppressed.

### Combined All Alarms

Use all alarm types together:

```yaml
type: custom:room-summary-card
area: basement
occupancy:
  entities:
    - binary_sensor.basement_motion
  card_border_color: '#4CAF50' # Green when occupied
smoke:
  entities:
    - binary_sensor.basement_smoke_detector
  card_border_color: '#F44336' # Red when smoke detected (highest priority)
gas:
  entities:
    - binary_sensor.basement_gas_detector
  card_border_color: '#FF9800' # Orange when gas detected (second priority)
water:
  entities:
    - binary_sensor.basement_water_leak
  card_border_color: '#2196F3' # Blue when water detected (third priority)
```

**Priority**: Smoke > Gas > Water > Occupancy. Higher priority alarms suppress lower priority ones.

### Minimal Visual Feedback

Only change the icon color without border effects:

```yaml
type: custom:room-summary-card
area: bathroom
occupancy:
  entities:
    - binary_sensor.bathroom_motion
  options:
    - disabled_card_styles
    - disabled_card_styles_animation
    - disable_icon_animation
  icon_color: '#FF9800'
```

### Border Only

Use only the card border effect without icon changes:

```yaml
type: custom:room-summary-card
area: study
occupancy:
  entities:
    - binary_sensor.study_motion
  options:
    - disable_icon_styles
    - disable_icon_animation
  card_border_color: '#2196F3'
```

### Complete Custom Styling

Combine occupancy detection with custom styles:

```yaml
type: custom:room-summary-card
area: master_bedroom
occupancy:
  entities:
    - binary_sensor.master_bedroom_motion
    - binary_sensor.master_bedroom_presence
  card_border_color: '#E91E63'
  icon_color: '#9C27B0'
styles:
  card:
    border-radius: 15px
    transition: all 0.3s ease
  title:
    font-weight: bold
```

## Supported Sensor Types

### Occupancy Detection

The occupancy detection works with any binary sensor that has one of these device classes:

- **`motion`**: Motion sensors (e.g., `binary_sensor.living_room_motion`)
- **`occupancy`**: Occupancy sensors (e.g., `binary_sensor.bedroom_occupancy`)
- **`presence`**: Presence sensors (e.g., `binary_sensor.office_presence`)

### Smoke Detection

The smoke detection works with binary sensors that have the `smoke` device class:

- **`smoke`**: Smoke detectors (e.g., `binary_sensor.kitchen_smoke_detector`)

### Gas Detection

The gas detection works with binary sensors that have the `gas` device class:

- **`gas`**: Gas sensors (e.g., `binary_sensor.basement_gas_detector`)

### Water Detection

The water detection works with binary sensors that have the `moisture` device class:

- **`moisture`**: Water/moisture sensors (e.g., `binary_sensor.bathroom_water_leak`)

### Device Tracker Integration

You can also use device trackers for presence detection:

```yaml
type: custom:room-summary-card
area: home_office
occupancy:
  entities:
    - device_tracker.phone_john
    - device_tracker.phone_jane
    - binary_sensor.office_motion
```

## Troubleshooting

### No Visual Changes

1. **Check Sensor States**: Ensure your sensors are actually changing state when motion/occupancy is detected
2. **Verify Entity IDs**: Double-check that all entity IDs are correct and exist in your Home Assistant instance
3. **Theme Compatibility**: Some themes may override occupancy styling - try disabling theme-specific options

### Unwanted Visual Effects

Use the `options` array to disable specific effects:

```yaml
occupancy:
  entities:
    - binary_sensor.room_motion
  options:
    - disabled_card_styles # Disable border changes
    - disable_icon_styles # Disable icon changes
```

### Performance Considerations

- **Multiple Sensors**: Using many sensors may impact performance slightly
- **Frequent Updates**: Sensors that update very frequently may cause excessive re-renders

## Integration with Other Features

### With Background Images

```yaml
type: custom:room-summary-card
area: living_room
occupancy:
  entities:
    - binary_sensor.living_room_motion
  card_border_color: '#4CAF50'
background:
  image: /local/images/living-room.jpg
  opacity: 30
```

### With Custom Thresholds

```yaml
type: custom:room-summary-card
area: kitchen
occupancy:
  entities:
    - binary_sensor.kitchen_motion
thresholds:
  temperature:
    - value: 75
  humidity:
    - value: 60
```

### With Feature Flags

```yaml
type: custom:room-summary-card
area: bedroom
occupancy:
  entities:
    - binary_sensor.bedroom_motion
  icon_color: '#FF9800'
features:
  - hide_area_stats
  - hide_sensor_labels # Show sensor icons only for minimal display
sensor_layout: bottom
```

## Best Practices

1. **Use Multiple Sensors**: Combine different sensor types for more reliable detection
2. **Choose Appropriate Colors**: Use colors that complement your theme and are easily distinguishable
3. **Test Sensor Reliability**: Ensure your sensors provide accurate occupancy detection
4. **Theme Compatibility**: Test with your specific theme to ensure visual effects work as expected

## Related Documentation

- [Configuration Guide](../CONFIGURATION.md) - Complete configuration options
- [Custom Styles Configuration](CUSTOM-STYLES.md) - Advanced styling options
- [Entity Configuration](ENTITY-CONFIGURATION.md) - Entity-specific settings
- [Examples](EXAMPLES.md) - More configuration examples
