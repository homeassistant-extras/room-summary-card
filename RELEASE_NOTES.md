## What's New

In addition to configuring colors for entity states and thresholds, you can now also specify custom icons that will be applied when those conditions are met.

### State-Based Icons

```yaml
entities:
  - entity_id: sensor.washing_machine_state
    states:
      - state: running
        icon_color: green
        icon: mdi:play
      - state: finished
        icon_color: purple
        icon: mdi:check-circle
```

![States](https://raw.githubusercontent.com/homeassistant-extras/room-summary-card/main/assets/states.gif)

### Threshold-Based Icons

```yaml
entities:
  - entity_id: sensor.phone_battery
    thresholds:
      - threshold: 80
        icon_color: green
        icon: mdi:battery-high
      - threshold: 20
        icon_color: red
        icon: mdi:battery-low
```

## Documentation

See [Entity Configuration](https://github.com/homeassistant-extras/room-summary-card/docs/configuration/ENTITY-CONFIGURATION.md) for complete examples and usage patterns.
