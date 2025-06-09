## Entity Attributes

These attributes can be added to your entities to customize functionality:

| Name       | Type   | Default         | Description                         |
| ---------- | ------ | --------------- | ----------------------------------- |
| on_color   | string | yellow          | Color when the entity is active     |
| off_color  | string | theme off color | Color when the entity is not active |
| icon       | string | entity default  | Custom MDI icon                     |
| icon_color | string | none            | Hex color or theme color name       |

See [Advanced Docs](ADVANCED.md) for more examples on attributes.

### Setting Entity Attributes

#### Using Customizations

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
