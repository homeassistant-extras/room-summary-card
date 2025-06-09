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
  - entity_id: switch.office_computer
    icon: mdi:desktop-tower
  - entity_id: climate.office_ac
    icon: mdi:air-conditioner
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
