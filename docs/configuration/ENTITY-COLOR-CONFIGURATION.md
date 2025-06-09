# Entity Color Configuration

Configure entity colors using card configuration or entity attributes for complete visual customization.

## Configuration Methods

### 1. Card Configuration (Recommended)

Set colors directly in the card configuration:

```yaml
entities:
  - entity_id: light.living_room
    on_color: yellow
    off_color: grey
    icon_color: '#FFD700'
  - entity_id: switch.garage_door
    on_color: green
    off_color: red
```

### 2. Entity Attributes

Set colors using Home Assistant's customize feature:

```yaml
customize:
  light.living_room:
    on_color: yellow
    off_color: grey
    icon_color: '#FFD700'
```

## Color Types

### Theme Color Names

**UI Minimalist**: `red`, `green`, `yellow`, `blue`, `purple`, `grey`, `pink`, `theme`

**Home Assistant**: `primary`, `accent`, `red`, `pink`, `purple`, `deep-purple`, `indigo`, `blue`, `light-blue`, `cyan`, `teal`, `green`, `light-green`, `lime`, `yellow`, `amber`, `orange`, `deep-orange`, `brown`, `light-grey`, `grey`, `dark-grey`, `blue-grey`, `black`, `white`, `disabled`

### Hex Colors

Use hex colors for precise control:

```yaml
entities:
  - entity_id: media_player.plex
    icon_color: '#E5A00D' # Plex gold
  - entity_id: light.accent
    on_color: '#FF6B35' # Custom orange
    off_color: '#404040' # Dark grey
```

## Color Priority

Colors are applied in this priority order:

1. **Card config** (`entity.on_color`, `entity.off_color`, `entity.icon_color`)
2. **Entity attributes** (`customize.yaml` settings)
3. **RGB colors** (from entity's `rgb_color` attribute)
4. **Theme colors** (automatic theme-based colors)
5. **Domain colors** (default colors by entity domain)

## Examples

### Netflix Theme

```yaml
entities:
  - entity_id: media_player.netflix
    icon: mdi:netflix
    icon_color: '#E50914'
    on_color: red
    off_color: black
```

### Traffic Light System

```yaml
entities:
  - entity_id: binary_sensor.system_ok
    icon: mdi:check-circle
    on_color: green
    off_color: red
  - entity_id: binary_sensor.warning
    icon: mdi:alert-circle
    on_color: amber
    off_color: grey
```

### Custom Brand Colors

```yaml
entities:
  - entity_id: light.philips_hue
    icon: mdi:lightbulb
    on_color: '#FF6B35' # Philips orange
    off_color: disabled
  - entity_id: switch.tp_link
    icon: mdi:power-socket
    on_color: '#1BA3E0' # TP-Link blue
    off_color: grey
```

## Advanced Usage

### Mixed Configuration

Combine card config and attributes for maximum flexibility:

```yaml
# Card configuration
entities:
  - entity_id: light.accent
    on_color: amber # Override in card
    # off_color from attributes

# customize.yaml
customize:
  light.accent:
    off_color: disabled # Fallback in attributes
    icon_color: yellow # Default icon color
```

### RGB Light Integration

RGB lights automatically use their color when no overrides are set:

```yaml
entities:
  - entity_id: light.color_bulb
    # Automatically uses rgb_color attribute
  - entity_id: light.mood_light
    on_color: purple # Override RGB with theme color
```

For more examples, see [Advanced Examples](../advanced/ADVANCED-EXAMPLES.md).
