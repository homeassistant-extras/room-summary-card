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

| Name              | Type   | Default                 | Description                                 |
| ----------------- | ------ | ----------------------- | ------------------------------------------- |
| entity_id         | string | **Required**            | Entity ID in Home Assistant                 |
| icon              | string | entity default          | Custom MDI icon                             |
| on_color          | string | domain default          | Color when entity is active                 |
| off_color         | string | theme off color         | Color when entity is inactive               |
| thresholds        | array  | none                    | Dynamic colors/icons based on sensor values |
| states            | array  | none                    | Colors/icons based on exact entity states   |
| features          | array  | none                    | Feature flags for this entity               |
| tap_action        | object | `{action: "toggle"}`    | Action on single tap                        |
| hold_action       | object | `{action: "more-info"}` | Action on hold                              |
| double_tap_action | object | `{action: "none"}`      | Action on double tap                        |

### Threshold Configuration Options

| Name       | Type   | Default      | Description                                         |
| ---------- | ------ | ------------ | --------------------------------------------------- |
| threshold  | number | **Required** | Threshold value to compare against entity state     |
| icon_color | string | **Required** | Color to use when this threshold condition is met   |
| icon       | string | none         | Icon to use when this threshold condition is met    |
| operator   | string | `gte`        | Comparison operator: `gt`, `gte`, `lt`, `lte`, `eq` |
| styles     | object | none         | Custom CSS styles to apply to entity icon           |

### State Configuration Options

| Name       | Type   | Default      | Description                               |
| ---------- | ------ | ------------ | ----------------------------------------- |
| state      | string | **Required** | Entity state value to match exactly       |
| icon_color | string | **Required** | Color to use when this state is active    |
| icon       | string | none         | Icon to use when this state is active     |
| styles     | object | none         | Custom CSS styles to apply to entity icon |

### Entity Features

The `features` array allows you to enable specific behaviors for individual entities:

| Feature         | Description                                     |
| --------------- | ----------------------------------------------- |
| use_entity_icon | Display entity icon instead of `entity_picture` |

### Action Configuration

For `tap_action`, `hold_action`, and `double_tap_action` configuration options, see the [Home Assistant Actions Documentation](https://www.home-assistant.io/dashboards/actions/).

## Entity Picture Display

By default, entities will display their `entity_picture` attribute (if available) instead of an icon. This is particularly useful for media players that have service-specific icons (Netflix, Hulu, Spotify, etc.).

![Entity Styles](../../assets/entity-picture-attributes.png)

📖 **See [State based CSS styling for entities](../advanced/README-EXAMPLES.md#entity-picture-attributes) for configuration details.**

### Disabling Entity Pictures

To force an entity to use its icon instead of its entity picture, add the `use_entity_icon` feature:

````yaml
entities:
  # Display entity picture (default behavior)
  - entity_id: media_player.tv

  # Force icon display even if entity_picture exists
  - entity_id: media_player.second_tv
    features:
      - use_entity_icon
```
## Color Priority

Colors are applied in this order:

1. **State-based colors** (exact state matches)
2. **Threshold colors** (based on sensor values)
3. **Entity config** (`on_color`, `off_color`)
4. **Entity attributes** (set via `customize.yaml`)
5. **Theme colors** (minimalist or HA colors)
6. **Domain defaults** (automatic colors by entity type)

## Color & Icon Examples

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

  # Battery sensor with threshold-based colors and icons
  - entity_id: sensor.phone_battery
    icon: mdi:battery
    thresholds:
      - threshold: 80
        icon_color: green
        icon: mdi:battery-high
      - threshold: 50
        icon_color: orange
        icon: mdi:battery-medium
      - threshold: 20
        icon_color: red
        icon: mdi:battery-low
        styles:
          animation: pulse 2s ease-in-out infinite
      - threshold: 10
        icon_color: red
        icon: mdi:battery-alert
        styles:
          animation: shake 1s ease-in-out infinite
          transform: scale(1.1)

  # Washing machine with state-based colors and icons
  - entity_id: sensor.washing_machine_state
    icon: mdi:washing-machine
    states:
      - state: running
        icon_color: green
        icon: mdi:play
        styles:
          transform: scale(1.1)
      - state: rinsing
        icon_color: orange
        icon: mdi:sync
      - state: spinning
        icon_color: blue
        icon: mdi:rotate-3d-variant
        styles:
          animation: spin 2s linear infinite
      - state: finished
        icon_color: purple
        icon: mdi:check-circle
        styles:
          border: 2px solid var(--primary-color)
          border-radius: 50%
````

For theme color names and advanced customization, see [Entity Color Configuration](ENTITY-COLOR-CONFIGURATION.md).

![States](../../assets/states.gif)

![Entity Styles](../../assets/entity-styles.gif)

📖 **See [State based CSS styling for entities](../advanced/README-EXAMPLES.md#state-based-css-styling-for-entities) for configuration details.**

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
