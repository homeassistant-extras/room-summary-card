# Entity Attributes Configuration

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
