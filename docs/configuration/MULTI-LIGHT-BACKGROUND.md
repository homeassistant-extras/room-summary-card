# Multi-Light Background Configuration

The multi-light background feature allows the card background to light up when any light entity in the room is on, instead of only when the main room entity is on. This is particularly useful for rooms with multiple lights where you want the background to reflect the actual lighting state of the room.

![Multi-Light](../../assets/multi-light.gif)

📖 **See [Multi-Light Background Example](../advanced/README-EXAMPLES.md#multi-light-background) for configuration details.**

## Basic Setup

```yaml
type: custom:room-summary-card
area: kitchen
features:
  - multi_light_background
```

## Features

- **Automatic Discovery**: Automatically finds all light entities in the specified area
- **Mixed Entity Support**: Can track any entity type (light, switch, binary_sensor, etc.) that reports on/off state
- **Manual Override**: Specify exactly which entities to track with the `lights` configuration
- **Smart Background**: Shows lit background when ANY tracked light is on

## Automatic Light Discovery

By default, when `multi_light_background` is enabled, the card automatically finds all entities in the area with the `light.` domain:

```yaml
type: custom:room-summary-card
area: kitchen
features:
  - multi_light_background
# Automatically tracks: light.kitchen_main, light.kitchen_under_cabinet, etc.
```

## Manual Light Configuration

You can override the automatic discovery by specifying which entities to track:

```yaml
type: custom:room-summary-card
area: kitchen
features:
  - multi_light_background
lights:
  - light.kitchen_main
  - light.kitchen_under_cabinet
  - switch.kitchen_pendant # Can include non-light entities
```

**Note:** The `lights` configuration accepts any entity type (light, switch, binary_sensor, etc.) that reports an on/off state.

## Ambient Lights

Ambient lights are a special type of light that only affect the card background, not the main icon or title. This is useful when you have RGB LED strips or accent lighting that should color the background while a main ceiling light colors the icon.

![Ambient-Light](../../assets/ambient.gif)

### Ambient Light Configuration

To mark a light as ambient, use the extended object format with `type: ambient`:

```yaml
type: custom:room-summary-card
area: living_room
features:
  - multi_light_background
lights:
  - light.living_room_ceiling # Regular light - affects icon AND background
  - entity_id: light.living_room_led_strip
    type: ambient # Ambient light - affects background ONLY
```

### How It Works

- **Regular lights** (string format or object without `type`): Affect both the card background AND the main icon/title styling when on
- **Ambient lights** (`type: ambient`): Only affect the card background styling when on, the icon/title remain unaffected

This allows for scenarios like:

- Red LED strips coloring the background
- Yellow ceiling light coloring the icon
- Both can be on simultaneously with distinct visual effects

### Ambient Light Example

```yaml
type: custom:room-summary-card
area: bedroom
features:
  - multi_light_background
lights:
  - light.bedroom_ceiling # Main light - yellow icon when on
  - entity_id: light.bedroom_rgb_strip
    type: ambient # LED strip - red background, icon stays yellow
  - entity_id: light.bedroom_nightlight
    type: ambient # Another ambient light
```

## Examples

### Basic Multi-Light Setup

```yaml
type: custom:room-summary-card
area: living_room
features:
  - multi_light_background
```

### Mixed Entity Types

```yaml
type: custom:room-summary-card
area: bedroom
features:
  - multi_light_background
lights:
  - light.bedroom_ceiling
  - light.bedroom_bedside_left
  - light.bedroom_bedside_right
  - switch.bedroom_accent_lighting
```

### Kitchen with Under-Cabinet Lighting

```yaml
type: custom:room-summary-card
area: kitchen
features:
  - multi_light_background
lights:
  - light.kitchen_main
  - light.kitchen_under_cabinet
  - light.kitchen_island
```

### Office with Smart Switches

```yaml
type: custom:room-summary-card
area: office
features:
  - multi_light_background
lights:
  - light.office_desk_lamp
  - switch.office_overhead
  - switch.office_accent_lights
  - binary_sensor.office_monitor_backlight
```

## Implementation Details

The multi-light background feature seamlessly integrates with existing functionality:

- **Backwards Compatible**: Existing configurations continue to work unchanged
- **Performance Optimized**: Light entities are tracked efficiently without impacting card performance
- **Theme Aware**: Respects dark mode settings and maintains existing styling behavior
- **Consistent**: Uses the same state checking logic as other card features

This enhancement makes the card more responsive to the actual lighting conditions in multi-light rooms, providing better visual feedback and a more intuitive user experience.

## Troubleshooting

### No Lights Detected Automatically

If automatic discovery isn't finding your lights:

1. Verify the entities are in the correct Home Assistant area
2. Check that entities use the `light.` domain
3. Use manual configuration with the `lights` option

### Background Not Lighting Up

If the background isn't showing when lights are on:

1. Verify the light entities are actually reporting "on" state
2. Check that `multi_light_background` is in the `features` list
3. Use the `skip_entity_styles` feature flag if you want to disable background color styling

### Performance Issues

If you notice performance problems:

1. Limit the number of tracked entities using manual `lights` configuration
2. Avoid tracking entities that change state very frequently
3. Consider using groups or scenes instead of individual entities
