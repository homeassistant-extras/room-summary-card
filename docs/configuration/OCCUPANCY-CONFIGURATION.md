# Occupancy Configuration

The Room Summary Card supports occupancy detection to provide visual feedback when rooms are occupied. This feature uses motion, occupancy, or presence sensors to dynamically change the card's appearance based on room occupancy status.

![Occupancy](assets/occupancy.png)

## Overview

Occupancy detection allows you to:

- **Visual Indicators**: Change card borders and room icon colors when occupied
- **Multiple Sensors**: Combine multiple motion/occupancy sensors for reliable detection
- **Customizable Styling**: Control which visual effects are applied

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
- Use theme-appropriate colors for the indicators

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

| Option              | Type   | Default             | Description                                          |
| ------------------- | ------ | ------------------- | ---------------------------------------------------- |
| `entities`          | array  | **Required**        | Array of motion/occupancy/presence sensor entity IDs |
| `card_border_color` | string | Theme success color | Color for card border when occupied                  |
| `icon_color`        | string | Theme success color | Color for room icon background when occupied         |
| `options`           | array  | `[]`                | Array of features to disable (see below)             |

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

The occupancy detection works with any binary sensor that has one of these device classes:

- **`motion`**: Motion sensors (e.g., `binary_sensor.living_room_motion`)
- **`occupancy`**: Occupancy sensors (e.g., `binary_sensor.bedroom_occupancy`)
- **`presence`**: Presence sensors (e.g., `binary_sensor.office_presence`)

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
  temperature: 75
  humidity: 60
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
  - hide_sensor_icons
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
