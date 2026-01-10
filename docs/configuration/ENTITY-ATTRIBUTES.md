# Entity Attributes

> [!CAUTION]
> The UI editor has issues displaying advanced entities. It's recommended to configure these completely via `yaml`.

These attributes can be added to your entities to customize functionality:

| Name       | Type   | Default         | Description                         |
| ---------- | ------ | --------------- | ----------------------------------- |
| on_color   | string | yellow          | Color when the entity is active     |
| off_color  | string | theme off color | Color when the entity is not active |
| icon       | string | entity default  | Custom MDI icon                     |
| icon_color | string | none            | Hex color or theme color name       |

**Note**: Colors can now be configured directly in the card configuration. See [Entity Color Configuration](ENTITY-COLOR-CONFIGURATION.md) for complete options.

### Setting Entity Attributes

#### Using Card Configuration (Recommended)

```yaml
entities:
  - entity_id: switch.garage_opener_plug
    on_color: green
    off_color: red
    icon: mdi:garage
```

#### Using Customizations (Legacy)

```yaml
customize:
  switch.garage_opener_plug:
    on_color: green
    off_color: red
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

See [Advanced Docs](../ADVANCED.md) for more examples on attributes.
