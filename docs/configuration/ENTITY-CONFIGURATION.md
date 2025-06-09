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

| Name              | Type   | Default                 | Description                   |
| ----------------- | ------ | ----------------------- | ----------------------------- |
| entity_id         | string | **Required**            | Entity ID in Home Assistant   |
| icon              | string | entity default          | Custom MDI icon               |
| on_color          | string | domain default          | Color when entity is active   |
| off_color         | string | theme off color         | Color when entity is inactive |
| tap_action        | object | `{action: "toggle"}`    | Action on single tap          |
| hold_action       | object | `{action: "more-info"}` | Action on hold                |
| double_tap_action | object | `{action: "none"}`      | Action on double tap          |

## Color Priority

Colors are applied in this order:

1. **Entity config** (`on_color`, `off_color`)
2. **Entity attributes** (set via `customize.yaml`)
3. **Theme colors** (minimalist or HA colors)
4. **Domain defaults** (automatic colors by entity type)

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
```

For theme color names and advanced customization, see [Entity Color Configuration](ENTITY-COLOR-CONFIGURATION.md).
