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

Configure colors, icons, and labels that match exact entity states (perfect for non-numeric sensors):

```yaml
entities:
  - entity_id: sensor.washing_machine_state
    label: 'Washing Machine' # Fallback label
    states:
      - state: running
        icon_color: green
        icon: mdi:play
        label: "It's going" # Custom label when state is "running"
      - state: rinsing
        icon_color: orange
        icon: mdi:sync
        label: 'Splish Splash' # Custom label when state is "rinsing"
      - state: spinning
        icon_color: blue
        icon: mdi:rotate-3d-variant
        label: 'Weee' # Custom label when state is "spinning"
      - state: finished
        icon_color: purple
        icon: mdi:check-circle
        label: 'Empty Me!' # Custom label when state is "finished"
```

**State matching is case-sensitive** and works with any string state value:

```yaml
entities:
  - entity_id: person.john
    label: 'John' # Fallback label
    states:
      - state: home
        icon_color: green
      - state: work
        icon_color: blue
      - state: away
        icon_color: grey
```

**State-based custom CSS styles:**

![Entity Styles](../assets/entity-styles.gif)

📖 **See [State based CSS styling for entities](../advanced/README-EXAMPLES.md#state-based-css-styling-for-entities) for configuration details.**

You can also apply custom CSS styles to entity icons based on their state:

```yaml
entities:
  - entity_id: sensor.washing_machine_state
    states:
      - state: running
        icon_color: green
        icon: mdi:play
        styles:
          transform: scale(1.2)
          opacity: '1'
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
          box-shadow: 0 0 10px var(--primary-color)
```

The `styles` property accepts any CSS property-value pairs and applies them directly to the entity icon container.

### 4. Threshold-Based Colors and Icons

![Thresholds](../assets/thresholds.gif)

Configure dynamic colors, icons, and labels based on numeric sensor values:

```yaml
entities:
  - entity_id: sensor.battery_level
    label: 'Battery' # Fallback label
    thresholds:
      - threshold: 80
        icon_color: green
        icon: mdi:battery-high
        label: 'High' # Custom label when battery >= 80%
      - threshold: 50
        icon_color: orange
        icon: mdi:battery-medium
        label: 'Medium' # Custom label when battery >= 50%
      - threshold: 20
        icon_color: red
        icon: mdi:battery-low
        label: 'Low' # Custom label when battery >= 20%
        styles:
          animation: pulse 2s ease-in-out infinite
      - threshold: 10
        icon_color: red
        icon: mdi:battery-alert
        label: 'Critical' # Custom label when battery >= 10%
        styles:
          animation: shake 1s ease-in-out infinite
          transform: scale(1.1)
```

Like state-based styles, threshold configurations also support the `styles` property for applying custom CSS when numeric thresholds are met.

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

> **Note:** Sensors also support thresholds! See [Sensor Configuration](../configuration/SENSOR-CONFIGURATION.md#threshold-based-styling) for details on configuring thresholds for sensor entities.

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
        styles:
          opacity: '0.8'
      - threshold: 15
        icon_color: red
        icon: mdi:battery-alert
        styles:
          animation: pulse 2s ease-in-out infinite
      - threshold: 5
        icon_color: red
        icon: mdi:battery-alert-variant-outline
        styles:
          animation: shake 1s ease-in-out infinite
          filter: brightness(1.3)
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
        styles:
          filter: brightness(1.2)
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.5)
      - threshold: 20
        icon_color: green
        operator: gte # Comfortable range
      - threshold: 18
        icon_color: blue
        operator: lt # Too cold
        styles:
          filter: hue-rotate(200deg)
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
        styles:
          transform: scale(1.15)
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
      - state: idle
        icon_color: grey
        icon: mdi:pause
        styles:
          opacity: '0.6'
```

![States](../assets/states.gif)

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
        styles:
          transform: scale(1.1)
      - state: error
        icon_color: red
        icon: mdi:alert-circle
        styles:
          animation: pulse 1s ease-in-out infinite
      - state: offline
        icon_color: grey
        icon: mdi:power-plug-off
        styles:
          opacity: '0.5'
          filter: grayscale(100%)
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

### Custom CSS Styles for State-Based Entities

The `styles` property in state configurations allows you to apply any CSS to entity icons. This is perfect for creating visual effects that respond to entity states:

```yaml
entities:
  # Notification indicator with pulsing effect
  - entity_id: sensor.notification_count
    states:
      - state: '0'
        icon_color: grey
        icon: mdi:bell-outline
        styles:
          opacity: '0.5'
      - state: '1'
        icon_color: blue
        icon: mdi:bell-ring
        styles:
          animation: pulse 2s ease-in-out infinite
      - state: '5'
        icon_color: red
        icon: mdi:bell-ring
        styles:
          animation: shake 0.5s ease-in-out infinite
          transform: scale(1.2)

  # Door status with transitions
  - entity_id: binary_sensor.front_door
    states:
      - state: 'on'
        icon_color: red
        icon: mdi:door-open
        styles:
          transform: rotate(-15deg)
          transition: all 0.3s ease
      - state: 'off'
        icon_color: green
        icon: mdi:door-closed
        styles:
          transform: rotate(0deg)
          transition: all 0.3s ease

  # Motion sensor with glow effect
  - entity_id: binary_sensor.motion
    states:
      - state: 'on'
        icon_color: yellow
        icon: mdi:motion-sensor
        styles:
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.8)
          filter: brightness(1.3)
      - state: 'off'
        icon_color: grey
        icon: mdi:motion-sensor-off
        styles:
          opacity: '0.6'

  # Alarm status with borders
  - entity_id: alarm_control_panel.home
    states:
      - state: armed_away
        icon_color: red
        icon: mdi:shield-lock
        styles:
          border: 3px solid red
          border-radius: 50%
      - state: armed_home
        icon_color: orange
        icon: mdi:shield-home
        styles:
          border: 3px solid orange
          border-radius: 50%
      - state: disarmed
        icon_color: green
        icon: mdi:shield-off
        styles:
          opacity: '0.7'
```

**Common CSS properties for entity icons:**

- `transform`: `scale()`, `rotate()`, `translate()`
- `opacity`: `"0"` to `"1"`
- `filter`: `brightness()`, `grayscale()`, `blur()`, `hue-rotate()`
- `border`: `2px solid red`
- `border-radius`: `50%` (circular), `10px` (rounded)
- `box-shadow`: `0 0 10px rgba(255,0,0,0.5)`
- `animation`: Custom animations (see below for defining keyframes)
- `transition`: `all 0.3s ease` (smooth state changes)

**Note:** Styles are applied to the icon container element, so layout properties like `display`, `flex`, and positioning work as expected.

### Defining Custom Animations with Keyframes

You can define custom CSS animations using the special `keyframes` property in your styles object:

```yaml
entities:
  - entity_id: binary_sensor.motion
    states:
      - state: 'on'
        icon_color: yellow
        icon: mdi:motion-sensor
        styles:
          keyframes: |-
            breathing {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.2); opacity: 0.7; }
            }
          animation: breathing 2s ease-in-out infinite
      - state: 'off'
        icon_color: grey
        icon: mdi:motion-sensor-off

  - entity_id: sensor.washing_machine_state
    states:
      - state: spinning
        icon_color: blue
        icon: mdi:rotate-3d-variant
        styles:
          keyframes: |-
            spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          animation: spin 2s linear infinite
```

**Multiple animations:**

You can define multiple keyframe animations in a single state by listing them all in the `keyframes` property:

```yaml
entities:
  - entity_id: alarm_control_panel.home
    states:
      - state: triggered
        icon_color: red
        icon: mdi:alarm-light
        styles:
          keyframes: |-
            flash {
              0%, 50%, 100% { opacity: 1; }
              25%, 75% { opacity: 0.3; }
            }
            shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-5px); }
              75% { transform: translateX(5px); }
            }
          animation: flash 0.5s infinite, shake 0.5s infinite
```

**Tips for keyframe animations:**

- Use the `|-` YAML multiline string syntax for readability
- Define the keyframes first, then reference them in the `animation` property
- Multiple animations can be comma-separated in the `animation` property
- Animation timing functions: `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`
- Use `infinite` for continuous animations or specify a count (e.g., `3` for 3 times)

### Custom CSS Styles for Threshold-Based Entities

Just like state-based entities, threshold configurations also support the `styles` property for applying custom CSS when numeric conditions are met:

```yaml
entities:
  # Temperature sensor with visual feedback
  - entity_id: sensor.server_room_temperature
    icon: mdi:thermometer
    thresholds:
      - threshold: 30
        icon_color: red
        icon: mdi:fire
        operator: gt # Above 30°C - critical
        styles:
          animation: pulse 1s ease-in-out infinite
          box-shadow: 0 0 15px rgba(255, 0, 0, 0.8)
          transform: scale(1.15)
      - threshold: 25
        icon_color: orange
        operator: gte # 25-30°C - warning
        styles:
          filter: brightness(1.2)
      - threshold: 20
        icon_color: green
        operator: gte # 20-25°C - normal
      - threshold: 15
        icon_color: blue
        operator: lt # Below 15°C - cold
        styles:
          opacity: '0.8'
          filter: hue-rotate(180deg)

  # Battery with progressive urgency
  - entity_id: sensor.ups_battery
    icon: mdi:battery
    thresholds:
      - threshold: 50
        icon_color: green
        icon: mdi:battery-high
        operator: gte
      - threshold: 30
        icon_color: orange
        icon: mdi:battery-medium
        operator: gte
        styles:
          transform: scale(1.05)
      - threshold: 20
        icon_color: amber
        icon: mdi:battery-low
        operator: gte
        styles:
          animation: pulse 3s ease-in-out infinite
      - threshold: 10
        icon_color: red
        icon: mdi:battery-alert
        operator: gte
        styles:
          animation: pulse 1.5s ease-in-out infinite
          filter: brightness(1.2)
      - threshold: 10
        icon_color: red
        icon: mdi:battery-alert-variant-outline
        operator: lt # Critical - below 10%
        styles:
          animation: shake 0.5s ease-in-out infinite
          transform: scale(1.2)
          border: 2px solid red
          border-radius: 50%

  # Humidity with zone-based styling
  - entity_id: sensor.bathroom_humidity
    icon: mdi:water-percent
    thresholds:
      - threshold: 70
        icon_color: red
        operator: gt # Too humid
        styles:
          box-shadow: 0 0 10px rgba(0, 0, 255, 0.6)
          animation: pulse 2s ease-in-out infinite
      - threshold: 40
        icon_color: green
        operator: gte # Normal range
      - threshold: 30
        icon_color: orange
        operator: lt # Too dry
        styles:
          opacity: '0.7'
          filter: grayscale(30%)

  # Signal strength indicator
  - entity_id: sensor.wifi_signal
    icon: mdi:wifi
    thresholds:
      - threshold: -50
        icon_color: green
        icon: mdi:wifi-strength-4
        operator: gte # Excellent
        styles:
          filter: brightness(1.2)
      - threshold: -60
        icon_color: green
        icon: mdi:wifi-strength-3
        operator: gte # Good
      - threshold: -70
        icon_color: orange
        icon: mdi:wifi-strength-2
        operator: gte # Fair
        styles:
          opacity: '0.8'
      - threshold: -70
        icon_color: red
        icon: mdi:wifi-strength-1
        operator: lt # Poor
        styles:
          animation: pulse 2s ease-in-out infinite
          opacity: '0.6'
```

**Combining thresholds with states:**

You can use both threshold and state configurations on the same entity. State-based matches take priority over threshold-based matches:

```yaml
entities:
  - entity_id: sensor.smart_sensor
    thresholds:
      # Numeric thresholds for normal operation
      - threshold: 25
        icon_color: red
        operator: gt
      - threshold: 15
        icon_color: green
        operator: gte
    states:
      # State-based overrides for special conditions
      - state: 'unavailable'
        icon_color: grey
        icon: mdi:alert-circle
        styles:
          opacity: '0.5'
          filter: grayscale(100%)
      - state: 'unknown'
        icon_color: orange
        icon: mdi:help-circle
        styles:
          animation: pulse 2s ease-in-out infinite
```

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
