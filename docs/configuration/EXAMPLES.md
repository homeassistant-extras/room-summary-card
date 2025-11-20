## Examples

### Basic Room

```yaml
type: custom:room-summary-card
area: living_room
```

### Custom Area Name

```yaml
type: custom:room-summary-card
area: living_room
area_name: 'Family Room'
```

### With Background Image

```yaml
type: custom:room-summary-card
area: living_room
background:
  image: /local/images/living-room.jpg
  opacity: 30
```

### With Dynamic Background

```yaml
type: custom:room-summary-card
area: bedroom
background:
  image_entity: person.john
  opacity: 40
```

### With Custom Entity

```yaml
type: custom:room-summary-card
area: living_room
entity:
  entity_id: light.living_room_main
  icon: mdi:ceiling-light
  tap_action:
    action: toggle
```

### Multiple Sensors with Bottom Layout

```yaml
type: custom:room-summary-card
area: living_room
sensors:
  - sensor.living_room_temperature
  - sensor.living_room_humidity
  - sensor.living_room_co2
  - sensor.living_room_light_level
sensor_layout: bottom
```

Sensors can also be specified using object format:

```yaml
type: custom:room-summary-card
area: living_room
sensors:
  - entity_id: sensor.living_room_temperature
  - entity_id: sensor.living_room_humidity
  - entity_id: sensor.living_room_co2
sensor_layout: bottom
```

#### Sensors with State-Based Styling

Sensors can be configured with state-based styling to change icons and styles based on sensor state:

```yaml
type: custom:room-summary-card
area: living_room
sensors:
  - entity_id: sensor.door_sensor
    states:
      - state: 'on'
        icon: mdi:door-open
        icon_color: red
        title_color: red
        styles:
          background-color: rgba(255, 0, 0, 0.2)
      - state: 'off'
        icon: mdi:door-closed
        icon_color: green
        title_color: green
sensor_layout: bottom
```

### With Custom Thresholds

```yaml
type: custom:room-summary-card
area: garage
thresholds:
  temperature: 85 # Red border above 85°F
  humidity: 70 # Blue border above 70%
  mold: 50 # Animated mold indicator above 50%
```

### With Mold Detection

```yaml
type: custom:room-summary-card
area: basement
thresholds:
  mold: 45 # Shows animated mold warning when levels exceed 45%
  temperature: 65 # Lower temperature threshold for basement
  humidity: 60
```

### Exclude Default Entities

```yaml
type: custom:room-summary-card
area: office
features:
  - exclude_default_entities
entities:
  - entity_id: light.office_desk
    icon: mdi:desk-lamp
  - entity_id: switch.office_computer
    icon: mdi:desktop-tower
```

### Hide Room Icon

```yaml
type: custom:room-summary-card
area: bathroom
features:
  - hide_room_icon
background:
  image: /local/images/bathroom.jpg
  opacity: 35
```

### Sticky Entities

Keep entity positions stable even when their state is unavailable or if they don't exist. This prevents UI layout shifts and makes it easier to tap entities on touch dashboards:

```yaml
type: custom:room-summary-card
area: living_room
features:
  - sticky_entities
entities:
  - placeholder
  - switch.living_room_fan
  - entity.fake
  - switch.living_room_speakers
```

![sticky](../../assets/sticky.png)

**Benefits:**

- Keeps icon positions stable across states → easier and faster to tap, especially on touch dashboards
- Reduces mistakes when entities appear/disappear or change availability
- Entities with unavailable state will still display in their configured position

### Occupancy Detection

```yaml
type: custom:room-summary-card
area: living_room
occupancy:
  entities:
    - binary_sensor.living_room_motion
    - binary_sensor.living_room_occupancy
  card_border_color: '#4CAF50' # Green border when occupied
  icon_color: '#FF9800' # Orange icon background when occupied
```

### Smoke Detection

```yaml
type: custom:room-summary-card
area: kitchen
smoke:
  entities:
    - binary_sensor.kitchen_smoke_detector
    - binary_sensor.kitchen_smoke_alarm
  card_border_color: '#F44336' # Red border when smoke detected
  icon_color: '#FF1744' # Red icon background when smoke detected
```

### Combined Occupancy and Smoke Detection

```yaml
type: custom:room-summary-card
area: bedroom
occupancy:
  entities:
    - binary_sensor.bedroom_motion
  card_border_color: '#4CAF50' # Green when occupied
  icon_color: '#8BC34A'
smoke:
  entities:
    - binary_sensor.bedroom_smoke_detector
  card_border_color: '#F44336' # Red when smoke detected (takes priority)
  icon_color: '#FF1744'
```

**Note**: When smoke is detected, it takes priority over occupancy detection. The smoke colors and styles will be used, and occupancy indicators will be suppressed.

### Advanced Occupancy with Multiple Sensors

```yaml
type: custom:room-summary-card
area: master_bedroom
occupancy:
  entities:
    - binary_sensor.master_bedroom_motion
    - binary_sensor.master_bedroom_presence
    - device_tracker.phone_john
    - device_tracker.phone_jane
  card_border_color: '#E91E63' # Pink border
  icon_color: '#9C27B0' # Purple icon background
background:
  image: /local/images/bedroom.jpg
  opacity: 25
```

### Occupancy with Custom Styling

```yaml
type: custom:room-summary-card
area: home_office
occupancy:
  entities:
    - binary_sensor.office_motion
    - binary_sensor.office_occupancy
  card_border_color: '#2196F3' # Blue border
  icon_color: '#03A9F4' # Light blue icon
styles:
  card:
    border-radius: 12px
    transition: all 0.3s ease
  title:
    font-weight: 600
    color: '#1976D2'
```

### Occupancy with Minimal Effects

```yaml
type: custom:room-summary-card
area: bathroom
occupancy:
  entities:
    - binary_sensor.bathroom_motion
  options:
    - disabled_card_styles # Disable border changes
    - disabled_card_styles_animation # Disable border animation
  icon_color: '#FF5722' # Only change icon color
```

### Full Configuration Example

```yaml
type: custom:room-summary-card
area: living_room
area_name: 'Living Room'
entity:
  entity_id: light.living_room_main
  icon: mdi:ceiling-light
  tap_action:
    action: toggle
  hold_action:
    action: more-info
entities:
  - entity_id: switch.living_room_tv
    icon: mdi:television
  - light.living_room_lamp
  - switch.living_room_fan
sensors:
  - sensor.living_room_temperature
  - sensor.living_room_humidity
  - sensor.living_room_co2
sensor_layout: bottom
background:
  image: /local/images/living-room.jpg
  opacity: 25
occupancy:
  entities:
    - binary_sensor.living_room_motion
    - binary_sensor.living_room_occupancy
  card_border_color: '#4CAF50'
  icon_color: '#8BC34A'
thresholds:
  temperature: 75
  humidity: 55
  mold: 50
  temperature_entity: sensor.specific_temp_sensor
  humidity_entity: sensor.specific_humidity_sensor
navigate: /lovelace/living-room
features:
  - hide_area_stats
  - hide_sensor_icons
```

### Minimal Sensor Display (Icons Only)

```yaml
type: custom:room-summary-card
area: living_room
features:
  - hide_sensor_labels
sensor_layout: bottom
sensors:
  - sensor.living_room_temperature
  - sensor.living_room_humidity
  - sensor.living_room_co2
```

This configuration shows only sensor icons without text labels, creating a minimal and clean appearance.

### Entity Labels with Clean Icons

```yaml
type: custom:room-summary-card
area: living_room
features:
  - show_entity_labels
styles:
  entity_icon:
    '--opacity-icon-fill-inactive': 0
    '--opacity-icon-fill-active': 0
```

This configuration shows entity labels under each icon while hiding the icon backgrounds for a cleaner look.

### Entity Labels with Custom Styling

```yaml
type: custom:room-summary-card
area: office
features:
  - show_entity_labels
entities:
  - entity_id: light.office_desk
    icon: mdi:desk-lamp
  - entity_id: switch.office_computer
    icon: mdi:desktop-tower
  - entity_id: climate.office_hvac
    icon: mdi:air-conditioner
styles:
  entity_icon:
    '--opacity-icon-fill-inactive': 0.3
    '--opacity-icon-fill-active': 0.8
    filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.2))'
```

This example shows entity labels with custom icon styling and opacity levels.

### Problem Entities Setup

To use problem detection, label entities with "problem":

1. In Home Assistant, go to Settings → Areas & Labels
2. Create or edit labels
3. Add "problem" label to relevant entities
4. The card will automatically detect and count them

![Problem Label Setup](../../assets/problem-label.png)

### Climate Thresholds

For climate-based border styling:

- Temperature sensors with `device_class: temperature` and values above threshold trigger red borders
- Humidity sensors with `device_class: humidity` and values above threshold trigger blue borders
- Configure thresholds in the card configuration:

```yaml
type: custom:room-summary-card
area: living_room
thresholds:
  temperature: 75 # Custom temperature threshold
  humidity: 55 # Custom humidity threshold
```

## Custom Styling Examples

### Basic Custom Colors

```yaml
type: custom:room-summary-card
area: living_room
styles:
  title:
    color: '#4CAF50'
    font-weight: bold
  entities:
    background: blue
  stats:
    color: '#FFC107'
  sensors:
    color: '#2196F3'
```

### Modern Glass Card

```yaml
type: custom:room-summary-card
area: bedroom
styles:
  card:
    background: 'rgba(255, 255, 255, 0.1)'
    border: '1px solid rgba(255, 255, 255, 0.2)'
    border-radius: 20px
    backdrop-filter: 'blur(10px)'
  title:
    color: '#ffffff'
    font-weight: 300
    letter-spacing: 2px
  stats:
    color: 'rgba(255, 255, 255, 0.7)'
  sensors:
    color: 'rgba(255, 255, 255, 0.8)'
```

## Multi-Light Background Examples

### Basic Multi-Light Setup

```yaml
type: custom:room-summary-card
area: kitchen
features:
  - multi_light_background
```

This automatically tracks all light entities in the kitchen area and shows a lit background when any are on.

### Kitchen with Multiple Light Types

```yaml
type: custom:room-summary-card
area: kitchen
features:
  - multi_light_background
lights:
  - light.kitchen_main
  - light.kitchen_under_cabinet
  - light.kitchen_island
  - switch.kitchen_pendant
```

### Bedroom with Mixed Entities

```yaml
type: custom:room-summary-card
area: bedroom
features:
  - multi_light_background
lights:
  - light.bedroom_ceiling
  - light.bedroom_bedside_left
  - light.bedroom_bedside_right
  - switch.bedroom_accent_lighting
background:
  image: /local/images/bedroom.jpg
  opacity: 25
```

### Living Room with Background Image

```yaml
type: custom:room-summary-card
area: living_room
features:
  - multi_light_background
lights:
  - light.living_room_main
  - light.living_room_lamp
  - light.living_room_accent
background:
  image: /local/images/living-room.jpg
  opacity: 30
occupancy:
  entities:
    - binary_sensor.living_room_motion
  card_border_color: '#4CAF50'
```

### Office with Auto-Discovery

```yaml
type: custom:room-summary-card
area: office
features:
  - multi_light_background
  - hide_area_stats
entity:
  entity_id: light.office_main
  icon: mdi:ceiling-light
entities:
  - switch.office_computer
  - light.office_desk_lamp
```

This example uses automatic light discovery while still displaying specific entities in the card.

## Slider Control Examples

![slider](../../assets/slider.gif)

### Basic Slider

Display the first entity as a draggable slider for brightness control:

```yaml
type: custom:room-summary-card
area: living_room
features:
  - slider
entity: light.living_room_main
```

### Slider with Filled Track Style

Use a progress bar style that shows the current brightness level:

```yaml
type: custom:room-summary-card
area: bedroom
features:
  - slider
slider_style: filled
entity: light.bedroom_ceiling
```

### Slider with Track Style

Use a sunken track style for a more tactile appearance:

```yaml
type: custom:room-summary-card
area: kitchen
features:
  - slider
slider_style: track
entity: light.kitchen_main
```

### Slider with Glow Effect

Use a glowing track style for a modern look:

```yaml
type: custom:room-summary-card
area: office
features:
  - slider
slider_style: glow
entity: light.office_desk
```

### Slider with Shadow Trail

Use a shadow trail that follows the icon position:

```yaml
type: custom:room-summary-card
area: living_room
features:
  - slider
slider_style: shadow-trail
entity: light.living_room_lamp
```

### Slider with Grid Pattern

Use a grid pattern track for precise visual feedback:

```yaml
type: custom:room-summary-card
area: bathroom
features:
  - slider
slider_style: grid
entity: light.bathroom_vanity
```

### Slider with Multiple Entities

When using slider, only the first entity is displayed as the slider. Other entities are ignored:

```yaml
type: custom:room-summary-card
area: living_room
features:
  - slider
slider_style: minimalist
entity: light.living_room_main
# Only light.living_room_main will be displayed as a slider
# Other entities in the area are not shown when slider is enabled
```

### Slider with Background Image

Combine slider with background images for a rich visual experience:

```yaml
type: custom:room-summary-card
area: bedroom
features:
  - slider
slider_style: filled
entity: light.bedroom_ceiling
background:
  image: /local/images/bedroom.jpg
  opacity: 30
```

### Slider with Custom Entity Configuration

Configure the slider entity with custom icon and colors:

```yaml
type: custom:room-summary-card
area: living_room
features:
  - slider
slider_style: gradient
entity:
  entity_id: light.living_room_main
  icon: mdi:ceiling-light
  on_color: warm_white
  off_color: grey
```
