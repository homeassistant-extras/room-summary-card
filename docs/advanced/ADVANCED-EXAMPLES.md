## Advanced Examples

### Complete Room with Background

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
```

### Person's Room with Dynamic Background

```yaml
type: custom:room-summary-card
area: master_bedroom
area_name: "John's Room"
background:
  image_entity: person.john
  opacity: 40
features:
  - hide_room_icon
entities:
  - light.bedroom_main
  - switch.bedroom_fan
  - climate.bedroom_ac
sensors:
  - sensor.bedroom_temperature
  - sensor.bedroom_humidity
```

### Security Room with Camera Background

```yaml
type: custom:room-summary-card
area: security_office
background:
  image_entity: camera.front_door
  opacity: 20
entities:
  - entity_id: binary_sensor.front_door
    icon: mdi:door
  - entity_id: binary_sensor.motion_detector
    icon: mdi:motion-sensor
  - entity_id: alarm_control_panel.house
    icon: mdi:shield-home
```

### Custom Colors in Card Configuration

```yaml
type: custom:room-summary-card
area: living_room
entity:
  entity_id: light.living_room_main
  on_color: amber
  off_color: disabled
entities:
  - entity_id: switch.living_room_tv
    icon: mdi:television
    on_color: blue
    off_color: grey
  - entity_id: light.living_room_lamp
    on_color: yellow
    off_color: disabled
  - entity_id: switch.living_room_fan
    on_color: teal
    off_color: grey
```

### Brand-Themed Entities

```yaml
entities:
  # Netflix theme
  - entity_id: media_player.netflix
    icon: mdi:netflix
    icon_color: '#E50914'
    on_color: red
    off_color: black

  # Philips Hue theme
  - entity_id: light.hue_bulb
    on_color: '#FF6B35' # Philips orange
    off_color: disabled

  # TP-Link theme
  - entity_id: switch.tp_link
    on_color: '#1BA3E0' # TP-Link blue
    off_color: grey
```

### Custom Colors Example

```yaml
# In customize.yaml
customize:
  light.living_room_main:
    on_color: amber
    off_color: disabled
    icon: mdi:ceiling-light

  switch.living_room_tv:
    on_color: blue
    off_color: grey
    icon_color: '#E50914' # Netflix red

  sensor.living_room_temperature:
    icon: mdi:thermometer

  sensor.living_room_humidity:
    icon: mdi:water-percent
```

### Problem Entity Setup

```yaml
# In customize.yaml - these entities should have "problem" label in UI
customize:
  binary_sensor.smoke_detector:
    icon: mdi:smoke-detector
    on_color: red

  binary_sensor.water_leak:
    icon: mdi:water-alert
    on_color: red

  sensor.low_battery_devices:
    icon: mdi:battery-alert
    on_color: orange
```

### Exclude Default Entities

```yaml
type: custom:room-summary-card
area: office
features:
  - exclude_default_entities # Don't include default light/fan
entities:
  - entity_id: light.office_desk
    icon: mdi:desk-lamp
    on_color: yellow
    off_color: disabled
  - entity_id: switch.office_computer
    icon: mdi:desktop-tower
    on_color: blue
    off_color: grey
  - entity_id: climate.office_ac
    icon: mdi:air-conditioner
    on_color: teal
    off_color: disabled
sensors:
  - sensor.office_temperature
  - sensor.office_humidity
background:
  image: /local/images/office.jpg
  opacity: 30
```

### Sensor Layout Options

```yaml
# Default layout (in label area)
type: custom:room-summary-card
area: bedroom
sensor_layout: default

# Stacked layout (vertical in label area)
type: custom:room-summary-card
area: kitchen
sensor_layout: stacked

# Bottom layout (at bottom of card)
type: custom:room-summary-card
area: living_room
sensor_layout: bottom
background:
  image: /local/images/living-room.jpg
  opacity: 25
```

![Sensor Layouts](../../assets/sensors-styles.png)

### Skip Styling Features

```yaml
type: custom:room-summary-card
area: utility_room
features:
  - skip_climate_styles # No temperature/humidity borders
  - skip_entity_styles # No card background coloring
  - hide_climate_label # No sensor display
  - hide_area_stats # No device/entity counts
  - hide_sensor_icons # No icons next to sensor values
  - hide_room_icon # Clean layout
background:
  image: /local/images/utility.jpg
  opacity: 20
```

### Custom Thresholds

```yaml
# High temperature threshold for garage
type: custom:room-summary-card
area: garage
thresholds:
  temperature: 90  # Red border above 90°F
  humidity: 80     # Blue border above 80%
background:
  image_entity: camera.garage_cam
  opacity: 15

# Low temperature threshold for wine cellar
type: custom:room-summary-card
area: wine_cellar
thresholds:
  temperature: 65  # Red border above 65°F
  humidity: 70     # Blue border above 70%

# Celsius thresholds
type: custom:room-summary-card
area: greenhouse
thresholds:
  temperature: 32  # Red border above 32°C
  humidity: 75     # Blue border above 75%
```

## Custom Styles with Complex Configurations

### Complete Styled Gaming Room

```yaml
type: custom:room-summary-card
area: gaming_room
area_name: 'Gaming Den'
entity:
  entity_id: light.gaming_room_led_strip
  icon: mdi:led-strip-variant
entities:
  - entity_id: switch.gaming_pc
    icon: mdi:desktop-tower
    on_color: blue
  - entity_id: media_player.gaming_speakers
    icon: mdi:speaker
  - entity_id: climate.gaming_room_ac
    icon: mdi:air-conditioner
sensors:
  - sensor.gaming_room_temperature
  - sensor.gaming_room_humidity
  - sensor.pc_cpu_temperature
background:
  image: /local/images/gaming-setup.jpg
  opacity: 30
sensor_layout: bottom
features:
  - hide_area_stats
styles:
  card:
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    border: '2px solid #00ff41'
    border-radius: 15px
    box-shadow: '0 0 30px rgba(0, 255, 65, 0.3)'
  title:
    color: '#00ff41'
    font-size: 2.5em
    font-weight: bold
    text-transform: uppercase
    text-shadow: '0 0 15px rgba(0, 255, 65, 0.8)'
  sensors:
    color: '#00ff41'
    font-family: 'monospace'
    font-weight: bold
    '--user-icon-size': 24px
```

### Minimalist Bedroom with Custom Styling

```yaml
type: custom:room-summary-card
area: master_bedroom
area_name: 'Master Suite'
entity:
  entity_id: light.bedroom_ceiling
  on_color: warm_white
entities:
  - entity_id: switch.bedroom_fan
    icon: mdi:ceiling-fan
  - entity_id: climate.bedroom_thermostat
    icon: mdi:thermostat
  - entity_id: media_player.bedroom_tv
    icon: mdi:television
background:
  image_entity: person.john
  opacity: 15
sensor_classes:
  - temperature
  - humidity
sensor_layout: stacked
thresholds:
  temperature: 72
  humidity: 50
features:
  - hide_room_icon
styles:
  card:
    background: 'rgba(255, 255, 255, 0.05)'
    border: '1px solid rgba(255, 255, 255, 0.1)'
    border-radius: 25px
    backdrop-filter: 'blur(15px)'
  title:
    color: '#ffffff'
    font-size: 2em
    font-weight: 200
    letter-spacing: 3px
  sensors:
    color: 'rgba(255, 255, 255, 0.9)'
    font-size: 16px
    '--user-icon-size': 18px
```

### Industrial Workshop Theme

```yaml
type: custom:room-summary-card
area: workshop
area_name: 'Workshop'
entity:
  entity_id: light.workshop_overhead
  icon: mdi:ceiling-light-multiple
entities:
  - entity_id: switch.workshop_ventilation
    icon: mdi:fan
    on_color: blue
  - entity_id: binary_sensor.workshop_door
    icon: mdi:door
  - entity_id: switch.workshop_compressor
    icon: mdi:air-compressor
    on_color: orange
sensors:
  - sensor.workshop_temperature
  - sensor.workshop_humidity
  - sensor.workshop_dust_level
problem_entities:
  - binary_sensor.workshop_smoke_detector
  - binary_sensor.workshop_motion
sensor_layout: default
features:
  - hide_area_stats
styles:
  card:
    background: 'linear-gradient(45deg, #2c3e50, #34495e)'
    border: '3px solid #e67e22'
    border-radius: 8px
    box-shadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
  title:
    color: '#e67e22'
    font-family: 'monospace'
    font-size: 2.2em
    font-weight: bold
    text-transform: uppercase
    text-shadow: '2px 2px 4px rgba(0,0,0,0.8)'
  sensors:
    color: '#ecf0f1'
    font-family: 'monospace'
    font-weight: bold
    '--user-icon-size': 20px
```

### Luxury Kitchen Style

```yaml
type: custom:room-summary-card
area: kitchen
area_name: "Chef's Kitchen"
entity:
  entity_id: light.kitchen_pendants
  icon: mdi:ceiling-light-multiple-outline
  on_color: warm_white
entities:
  - entity_id: switch.kitchen_island_power
    icon: mdi:power-socket-us
  - entity_id: switch.kitchen_exhaust_fan
    icon: mdi:fan
  - entity_id: switch.coffee_maker
    icon: mdi:coffee-maker
    on_color: brown
  - entity_id: switch.dishwasher
    icon: mdi:dishwasher
sensors:
  - sensor.kitchen_temperature
  - sensor.kitchen_humidity
background:
  image: /local/images/luxury-kitchen.jpg
  opacity: 20
sensor_layout: bottom
styles:
  card:
    border: '2px solid #d4af37'
    border-radius: 12px
    box-shadow: '0 8px 32px rgba(212, 175, 55, 0.2)'
  title:
    color: '#d4af37'
    font-size: 2.3em
    font-weight: 600
    text-shadow: '0 2px 4px rgba(0,0,0,0.3)'
  sensors:
    color: '#f8f9fa'
    font-size: 18px
    font-weight: 500
    background: 'rgba(0,0,0,0.4)'
    padding: '8px 12px'
    border-radius: 8px
    '--user-icon-size': 22px
```
