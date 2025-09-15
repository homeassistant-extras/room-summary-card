# Entity Configuration

Entities can be specified in two ways, with full color customization options:

## Simple String Format

```yaml
entities:
  - light.living_room_lamp
  - switch.living_room_tv
```

## Detailed Object Format

```yaml
entities:
  - entity_id: light.living_room_lamp
    icon: mdi:lamp
    on_color: yellow
    off_color: grey
    tap_action:
      action: toggle
  - entity_id: switch.living_room_tv
    icon: mdi:television
    on_color: blue
    off_color: disabled
```

## Entity Configuration Options

| Name              | Type   | Default                 | Description                           |
| ----------------- | ------ | ----------------------- | ------------------------------------- |
| entity_id         | string | **Required**            | Entity ID in Home Assistant           |
| icon              | string | entity default          | Custom MDI icon                       |
| on_color          | string | domain default          | Color when entity is active           |
| off_color         | string | theme off color         | Color when entity is inactive         |
| thresholds        | array  | none                    | Dynamic colors based on sensor values |
| states            | array  | none                    | Colors based on exact entity states  |
| tap_action        | object | `{action: "toggle"}`    | Action on single tap                  |
| hold_action       | object | `{action: "more-info"}` | Action on hold                        |
| double_tap_action | object | `{action: "none"}`      | Action on double tap                  |

## Color Priority

Colors are applied in this order:

1. **State-based colors** (exact state matches)
2. **Threshold colors** (based on sensor values)
3. **Entity config** (`on_color`, `off_color`)
4. **Entity attributes** (set via `customize.yaml`)
5. **Theme colors** (minimalist or HA colors)
6. **Domain defaults** (automatic colors by entity type)

## Color Examples

```yaml
entities:
  # Netflix-themed media player
  - entity_id: media_player.netflix
    icon: mdi:netflix

  # Traffic light system
  - entity_id: switch.system_status
    icon: mdi:traffic-light
    on_color: green
    off_color: red

  # Garage door with custom colors
  - entity_id: cover.garage_door
    icon: mdi:garage
    on_color: amber
    off_color: grey

  # Battery sensor with threshold-based colors
  - entity_id: sensor.phone_battery
    icon: mdi:battery
    thresholds:
      - threshold: 80
        icon_color: green
      - threshold: 50
        icon_color: orange
      - threshold: 20
        icon_color: red

  # Washing machine with state-based colors
  - entity_id: sensor.washing_machine_state
    icon: mdi:washing-machine
    states:
      - state: running
        icon_color: green
      - state: rinsing
        icon_color: orange
      - state: spinning
        icon_color: blue
      - state: finished
        icon_color: purple
```

For theme color names and advanced customization, see [Entity Color Configuration](ENTITY-COLOR-CONFIGURATION.md).

## Entity Labels

The `show_entity_labels` feature flag displays entity names under each entity icon:

```yaml
type: custom:room-summary-card
area: living_room
features:
  - show_entity_labels
```

**Note**: Entity names are based on Home Assistant's entity naming logic and are not configurable through the card. To change the displayed name, update the entity's friendly name in Home Assistant's UI.

### Example with Entity Labels

```yaml
type: custom:room-summary-card
area: living_room
features:
  - show_entity_labels
entities:
  - entity_id: light.living_room_lamp
    icon: mdi:lamp
  - entity_id: switch.living_room_tv
    icon: mdi:television
```

This will display the friendly names of "Living Room Lamp" and "Living Room TV" under their respective icons.
