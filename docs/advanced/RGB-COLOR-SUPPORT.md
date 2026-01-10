# RGB Color Support

The card automatically uses RGB values from entities with `rgb_color` attributes for accurate color representation.

### How It Works

```yaml
# Entity with RGB color attribute
light.color_bulb:
  rgb_color: [255, 120, 50] # Orange color
```

The card will use this RGB value for:

- Icon coloring
- Background effects
- Theme overrides

![RGB Light](../assets/light-rgb.png)

### RGB Priority Rules

RGB colors are used when:

- Entity has valid `rgb_color` attribute (array of 3 numbers 0-255)
- No `on_color` is set for active entities
- No `off_color` is set for inactive entities
- No `icon_color` is set (which has highest priority)
