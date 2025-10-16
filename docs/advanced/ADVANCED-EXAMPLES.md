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

### State-Based Styling with Custom CSS

Apply custom CSS styles that respond to entity states for enhanced visual feedback:

```yaml
type: custom:room-summary-card
area: laundry_room
entities:
  # Washing machine with animated states
  - entity_id: sensor.washing_machine_state
    icon: mdi:washing-machine
    states:
      - state: running
        icon_color: green
        icon: mdi:play
        styles:
          transform: scale(1.15)
          filter: brightness(1.2)
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
      - state: idle
        icon_color: grey
        icon: mdi:pause
        styles:
          opacity: '0.6'

  # Door sensor with rotation effects
  - entity_id: binary_sensor.laundry_door
    icon: mdi:door
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

  # Dryer with heat visualization
  - entity_id: sensor.dryer_state
    icon: mdi:tumble-dryer
    states:
      - state: heating
        icon_color: orange
        icon: mdi:fire
        styles:
          box-shadow: 0 0 15px rgba(255, 140, 0, 0.8)
          filter: brightness(1.3)
      - state: cooling
        icon_color: blue
        icon: mdi:snowflake
        styles:
          animation: pulse 2s ease-in-out infinite
      - state: complete
        icon_color: green
        icon: mdi:check-circle
        styles:
          border: 2px solid green
          border-radius: 50%
```

### Security System with State Styles

```yaml
type: custom:room-summary-card
area: security
entities:
  # Alarm panel with border states
  - entity_id: alarm_control_panel.home
    icon: mdi:shield
    states:
      - state: armed_away
        icon_color: red
        icon: mdi:shield-lock
        styles:
          border: 3px solid red
          border-radius: 50%
          animation: pulse 2s ease-in-out infinite
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
          filter: grayscale(50%)

  # Motion sensor with glow effect
  - entity_id: binary_sensor.motion
    icon: mdi:motion-sensor
    states:
      - state: 'on'
        icon_color: yellow
        icon: mdi:run
        styles:
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.8)
          filter: brightness(1.3)
          animation: pulse 1s ease-in-out infinite
      - state: 'off'
        icon_color: grey
        icon: mdi:motion-sensor-off
        styles:
          opacity: '0.5'

  # Camera recording indicator
  - entity_id: camera.front_door
    states:
      - state: recording
        icon_color: red
        icon: mdi:record-rec
        styles:
          animation: pulse 1.5s ease-in-out infinite
      - state: idle
        icon_color: blue
        icon: mdi:camera
```

### Smart Home Automation States

```yaml
type: custom:room-summary-card
area: home
entities:
  # Notification counter with custom keyframe animations
  - entity_id: sensor.notification_count
    icon: mdi:bell
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
          keyframes: |-
            gentle-pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.05); opacity: 0.9; }
            }
          animation: gentle-pulse 2s ease-in-out infinite
      - state: '5'
        icon_color: orange
        icon: mdi:bell-ring
        styles:
          keyframes: |-
            urgent-shake {
              0%, 100% { transform: translateX(0) scale(1.1); }
              25% { transform: translateX(-3px) scale(1.1); }
              75% { transform: translateX(3px) scale(1.1); }
            }
          animation: urgent-shake 0.8s ease-in-out infinite
      - state: '10'
        icon_color: red
        icon: mdi:bell-alert
        styles:
          keyframes: |-
            critical-alert {
              0%, 100% { transform: scale(1.2) rotate(-5deg); }
              25% { transform: scale(1.25) rotate(5deg); }
              50% { transform: scale(1.2) rotate(-5deg); }
              75% { transform: scale(1.25) rotate(5deg); }
            }
          animation: critical-alert 0.5s ease-in-out infinite
          filter: brightness(1.3)

  # Printer with operational states
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
          animation: pulse 1s ease-in-out infinite
      - state: error
        icon_color: red
        icon: mdi:alert-circle
        styles:
          animation: shake 0.5s ease-in-out infinite
      - state: offline
        icon_color: grey
        icon: mdi:power-plug-off
        styles:
          opacity: '0.5'
          filter: grayscale(100%)
```

### Threshold-Based Styling with Custom CSS

Apply custom CSS styles that respond to numeric sensor thresholds for dynamic visual feedback:

```yaml
type: custom:room-summary-card
area: server_room
entities:
  # Server temperature with escalating warnings
  - entity_id: sensor.server_temperature
    icon: mdi:server
    thresholds:
      - threshold: 35
        icon_color: red
        icon: mdi:fire-alert
        operator: gt # Critical - above 35°C
        styles:
          animation: shake 0.5s ease-in-out infinite
          transform: scale(1.2)
          box-shadow: 0 0 20px rgba(255, 0, 0, 0.9)
      - threshold: 30
        icon_color: red
        icon: mdi:fire
        operator: gte # Warning - 30-35°C
        styles:
          animation: pulse 1s ease-in-out infinite
          filter: brightness(1.3)
      - threshold: 25
        icon_color: orange
        icon: mdi:thermometer-alert
        operator: gte # Warm - 25-30°C
        styles:
          transform: scale(1.1)
      - threshold: 20
        icon_color: green
        icon: mdi:thermometer
        operator: gte # Normal - 20-25°C
      - threshold: 20
        icon_color: blue
        icon: mdi:snowflake
        operator: lt # Cold - below 20°C
        styles:
          opacity: '0.7'
          filter: hue-rotate(180deg)

  # UPS battery with progressive urgency
  - entity_id: sensor.ups_battery_level
    icon: mdi:battery
    thresholds:
      - threshold: 75
        icon_color: green
        icon: mdi:battery-high
        operator: gte
      - threshold: 50
        icon_color: green
        icon: mdi:battery-medium
        operator: gte
      - threshold: 25
        icon_color: orange
        icon: mdi:battery-low
        operator: gte
        styles:
          animation: pulse 3s ease-in-out infinite
          transform: scale(1.05)
      - threshold: 15
        icon_color: red
        icon: mdi:battery-alert
        operator: gte
        styles:
          animation: pulse 1.5s ease-in-out infinite
          filter: brightness(1.2)
      - threshold: 15
        icon_color: red
        icon: mdi:battery-alert-variant-outline
        operator: lt # Critical
        styles:
          animation: shake 0.5s ease-in-out infinite
          transform: scale(1.2)
          border: 2px solid red
          border-radius: 50%

  # Network signal strength
  - entity_id: sensor.wifi_signal_strength
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
          filter: grayscale(50%)
```

### Environmental Monitoring with Thresholds

```yaml
type: custom:room-summary-card
area: greenhouse
entities:
  # Soil moisture with zone styling
  - entity_id: sensor.soil_moisture
    icon: mdi:water
    thresholds:
      - threshold: 80
        icon_color: blue
        icon: mdi:water-alert
        operator: gt # Over-watered
        styles:
          box-shadow: 0 0 15px rgba(0, 100, 255, 0.7)
          animation: pulse 2s ease-in-out infinite
      - threshold: 60
        icon_color: green
        icon: mdi:water-check
        operator: gte # Optimal
      - threshold: 30
        icon_color: orange
        icon: mdi:water-minus
        operator: gte # Dry
        styles:
          opacity: '0.8'
      - threshold: 30
        icon_color: red
        icon: mdi:water-off
        operator: lt # Critical - needs water
        styles:
          animation: shake 1s ease-in-out infinite
          filter: brightness(1.2)

  # Light level indicator
  - entity_id: sensor.greenhouse_light_level
    icon: mdi:white-balance-sunny
    thresholds:
      - threshold: 1000
        icon_color: yellow
        icon: mdi:weather-sunny
        operator: gte # Bright
        styles:
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.6)
          filter: brightness(1.3)
      - threshold: 500
        icon_color: orange
        icon: mdi:weather-partly-cloudy
        operator: gte # Medium
      - threshold: 500
        icon_color: grey
        icon: mdi:weather-night
        operator: lt # Low light
        styles:
          opacity: '0.6'
          filter: grayscale(40%)

  # CO2 levels
  - entity_id: sensor.greenhouse_co2
    icon: mdi:molecule-co2
    thresholds:
      - threshold: 1500
        icon_color: red
        operator: gt # Too high
        styles:
          animation: pulse 1.5s ease-in-out infinite
          transform: scale(1.1)
      - threshold: 1000
        icon_color: orange
        operator: gte # Elevated
        styles:
          filter: brightness(1.1)
      - threshold: 400
        icon_color: green
        operator: gte # Normal
      - threshold: 400
        icon_color: blue
        operator: lt # Low
        styles:
          opacity: '0.7'
```

### Custom Keyframe Animations

Define custom CSS animations using the `keyframes` property for completely unique visual effects:

```yaml
type: custom:room-summary-card
area: living_room
entities:
  # Breathing effect for motion sensor
  - entity_id: binary_sensor.motion_sensor
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

  # Spinning wash cycle
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

  # Multiple animations combined (flash + shake for alarm)
  - entity_id: binary_sensor.smoke_alarm
    states:
      - state: 'on'
        icon_color: red
        icon: mdi:fire-alert
        styles:
          keyframes: |-
            flash {
              0%, 50%, 100% { opacity: 1; }
              25%, 75% { opacity: 0.3; }
            }
            shake {
              0%, 100% { transform: translateX(0); }
              10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
              20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
          animation: flash 0.5s infinite, shake 0.5s infinite

  # Glow effect for active devices
  - entity_id: light.rgb_bulb
    states:
      - state: 'on'
        icon_color: var(--primary-color)
        styles:
          keyframes: |-
            glow {
              0%, 100% {
                box-shadow: 0 0 5px currentColor;
                filter: brightness(1);
              }
              50% {
                box-shadow: 0 0 20px currentColor;
                filter: brightness(1.5);
              }
            }
          animation: glow 2s ease-in-out infinite

  # Bounce effect for notifications
  - entity_id: sensor.unread_messages
    states:
      - state: '1'
        icon_color: blue
        icon: mdi:message
        styles:
          keyframes: |-
            bounce {
              0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-10px); }
              60% { transform: translateY(-5px); }
            }
          animation: bounce 2s ease-in-out infinite

  # Wiggle effect for door sensor
  - entity_id: binary_sensor.front_door
    states:
      - state: 'on'
        icon_color: red
        icon: mdi:door-open
        styles:
          keyframes: |-
            wiggle {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(-10deg); }
              75% { transform: rotate(10deg); }
            }
          animation: wiggle 0.8s ease-in-out infinite
```

**Advanced keyframe techniques:**

```yaml
entities:
  # Color cycling effect
  - entity_id: light.mood_light
    states:
      - state: 'on'
        styles:
          keyframes: |-
            color-cycle {
              0% { filter: hue-rotate(0deg); }
              100% { filter: hue-rotate(360deg); }
            }
          animation: color-cycle 10s linear infinite

  # Heartbeat effect
  - entity_id: binary_sensor.person_home
    states:
      - state: 'on'
        icon_color: red
        icon: mdi:heart
        styles:
          keyframes: |-
            heartbeat {
              0%, 100% { transform: scale(1); }
              10% { transform: scale(1.2); }
              20% { transform: scale(1); }
              30% { transform: scale(1.2); }
              40% { transform: scale(1); }
            }
          animation: heartbeat 2s ease-in-out infinite

  # Fade in-out with scale
  - entity_id: sensor.signal_strength
    thresholds:
      - threshold: -70
        icon_color: red
        operator: lt # Weak signal
        styles:
          keyframes: |-
            fade-pulse {
              0%, 100% {
                opacity: 0.4;
                transform: scale(0.9);
              }
              50% {
                opacity: 1;
                transform: scale(1);
              }
            }
          animation: fade-pulse 1.5s ease-in-out infinite
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
    '--user-sensor-icon-size': 24px
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
    '--user-sensor-icon-size': 18px
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
    '--user-sensor-icon-size': 20px
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
    '--user-sensor-icon-size': 22px
```
