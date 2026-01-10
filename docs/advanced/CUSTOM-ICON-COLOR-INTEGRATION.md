# Custom Icon Color Integration

The card supports the [custom-icon-color integration](https://github.com/Mariusthvdb/custom-icon-color) which allows setting custom colors via the `icon_color` attribute.

### Priority Order

The card uses colors in this priority order:

1. **Hex colors** (`icon_color: "#FF5733"`) - highest priority
2. **RGB colors** (from entity's `rgb_color` attribute)
3. **Theme colors** (minimalist or HA color names)
4. **Domain colors** (default colors by entity type)

### Example Usage

```yaml
customize:
  media_player.netflix:
    icon_color: '#E50914' # Netflix red hex color
    icon: mdi:netflix

  sensor.plex:
    icon_color: '#E5A00D' # Plex gold
    icon: mdi:plex
```

![Custom Icon Color](../assets/icon-color.png)

### Available Color Names

**Minimalist Theme Colors**: red, green, yellow, blue, purple, grey, pink, theme

**Home Assistant Colors**: primary, accent, red, pink, purple, deep-purple, indigo, blue, light-blue, cyan, teal, green, light-green, lime, yellow, amber, orange, deep-orange, brown, light-grey, grey, dark-grey, blue-grey, black, white, disabled
