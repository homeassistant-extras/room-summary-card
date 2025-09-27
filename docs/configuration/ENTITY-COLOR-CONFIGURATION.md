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

### 3. State-Based Colors and Icons

Configure colors and icons that match exact entity states (perfect for non-numeric sensors):

```yaml
entities:
  - entity_id: sensor.washing_machine_state
    states:
      - state: running
        icon_color: green
        icon: mdi:play
      - state: rinsing
        icon_color: orange
        icon: mdi:sync
      - state: spinning
        icon_color: blue
        icon: mdi:rotate-3d-variant
      - state: finished
        icon_color: purple
        icon: mdi:check-circle
```

**State matching is case-sensitive** and works with any string state value:

```yaml
entities:
  - entity_id: person.john
    states:
      - state: home
        icon_color: green
      - state: work
        icon_color: blue
      - state: away
        icon_color: grey
```

### 4. Threshold-Based Colors and Icons

![Thresholds](../../assets/thresholds.gif)

Configure dynamic colors and icons based on numeric sensor values:

```yaml
entities:
  - entity_id: sensor.battery_level
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
```

**Advanced operators:**

```yaml
entities:
  - entity_id: sensor.temperature
    thresholds:
      - threshold: 25
        icon_color: red
        operator: gt # above 25°C
      - threshold: 15
        icon_color: green
        operator: gte # 15-25°C
      - threshold: 15
        icon_color: blue
        operator: lt # below 15°C
```

**Supported operators:** `gt` (>), `gte` (>=), `lt` (<), `lte` (<=), `eq` (=). Default is `gte`.

## Color Priority

Colors are applied in this priority order:

1. **State-based colors** (exact state matches)
2. **Threshold colors** (based on sensor values)
3. **Card config** (`entity.on_color`, `entity.off_color`, `entity.icon_color`)
4. **Entity attributes** (`customize.yaml` settings)
5. **RGB colors** (from entity's `rgb_color` attribute)
6. **Theme colors** (automatic theme-based colors)
7. **Domain colors** (default colors by entity domain)

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

### Battery Level Indicators

```yaml
entities:
  - entity_id: sensor.phone_battery
    icon: mdi:battery
    thresholds:
      - threshold: 80
        icon_color: green
        icon: mdi:battery-high
      - threshold: 50
        icon_color: orange
        icon: mdi:battery-medium
      - threshold: 30
        icon_color: amber
        icon: mdi:battery-low
      - threshold: 15
        icon_color: red
        icon: mdi:battery-alert
```

### Temperature Zones

```yaml
entities:
  - entity_id: sensor.living_room_temperature
    icon: mdi:thermometer
    thresholds:
      - threshold: 24
        icon_color: red
        operator: gt # Too hot
      - threshold: 20
        icon_color: green
        operator: gte # Comfortable range
      - threshold: 18
        icon_color: blue
        operator: lt # Too cold
```

### Humidity Control

```yaml
entities:
  - entity_id: sensor.bathroom_humidity
    icon: mdi:water-percent
    thresholds:
      - threshold: 70
        icon_color: red
        operator: gt # High humidity
      - threshold: 40
        icon_color: green
        operator: gte # Normal range
      - threshold: 30
        icon_color: orange
        operator: lt # Low humidity
```

### State-Based Examples

**Washing Machine States:**

```yaml
entities:
  - entity_id: sensor.washing_machine_state
    icon: mdi:washing-machine
    states:
      - state: running
        icon_color: green
        icon: mdi:play
      - state: rinsing
        icon_color: orange
        icon: mdi:sync
      - state: spinning
        icon_color: blue
        icon: mdi:rotate-3d-variant
      - state: finished
        icon_color: purple
        icon: mdi:check-circle
      - state: idle
        icon_color: grey
        icon: mdi:pause
```

![States](../../assets/states.gif)

**Person Location Tracking:**

```yaml
entities:
  - entity_id: person.john
    icon: mdi:account
    states:
      - state: home
        icon_color: green
        icon: mdi:home
      - state: work
        icon_color: blue
        icon: mdi:briefcase
      - state: gym
        icon_color: orange
        icon: mdi:dumbbell
      - state: vacation
        icon_color: purple
        icon: mdi:palm-tree
```

**Device Status Monitoring:**

```yaml
entities:
  - entity_id: sensor.printer_status
    icon: mdi:printer
    states:
      - state: ready
        icon_color: green
        icon: mdi:check-circle
      - state: printing
        icon_color: blue
        icon: mdi:printer-3d
      - state: error
        icon_color: red
        icon: mdi:alert-circle
      - state: offline
        icon_color: grey
        icon: mdi:power-plug-off
```

**Combining States and Thresholds:**

```yaml
entities:
  # Non-numeric entity with states
  - entity_id: sensor.washing_machine
    states:
      - state: running
        icon_color: green

  # Numeric sensor with thresholds
  - entity_id: sensor.temperature
    thresholds:
      - threshold: 25
        icon_color: red
        operator: gt
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
