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

### With Custom Thresholds

```yaml
type: custom:room-summary-card
area: garage
thresholds:
  temperature: 85 # Red border above 85°F
  humidity: 70 # Blue border above 70%
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
thresholds:
  temperature: 75
  humidity: 55
navigate: /lovelace/living-room
features:
  - hide_area_stats
  - hide_sensor_icons
```

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
