## Threshold Configuration

Configure climate-based border styling thresholds and mold detection:

```yaml
thresholds:
  temperature: 75 # Temperature threshold in current unit
  humidity: 55 # Humidity threshold as percentage
  mold: 50 # Mold threshold as percentage
```

**How It Works**:

- **Temperature sensors** with values above the threshold trigger red borders
- **Humidity sensors** with values above the threshold trigger blue borders
- **Mold sensors** with values at or above the threshold display an animated indicator near problem entities (bottom left)
- Thresholds respect the current unit of measurement (°F, °C, %)
- Can be disabled with the `skip_climate_styles` feature flag
- For advanced cases an entity can be configured as the one to trip the threshold.

### Mold Indicator

The mold indicator provides a prominent visual warning when mold levels exceed your configured threshold:

- **Location**: Appears in the bottom left area near problem entities
- **Visual Design**: Animated red gradient background with pulsing effects
- **Components**: Shows the mold sensor icon and current value
- **Animations**: Includes pulsing, bouncing, and glowing effects to draw attention
- **Warning Symbol**: Displays a flashing warning triangle (⚠) for additional emphasis
- **Hover Effects**: Scales up and intensifies animations on hover

**Mold Sensor Requirements**:

- Must be a sensor entity with a numeric state value
- Should represent mold level as a percentage (0-100)
- Will only display when the sensor value is at or above the configured threshold
- If no threshold is configured, the indicator will always show when a mold sensor is present

![Moldy](../../assets/moldy-editor.png)

**Examples**:

```yaml
# Celsius threshold
thresholds:
  temperature: 24  # 24°C

# Fahrenheit threshold
thresholds:
  temperature: 75  # 75°F

# Custom humidity threshold
thresholds:
  humidity: 50  # 50%

# Mold threshold
thresholds:
  mold: 45  # 45% mold level

# All thresholds together
thresholds:
  temperature: 78
  humidity: 65
  mold: 50

# specific entities trigger the threshold, not average
# this is not needed in most scenarios
thresholds:
  temperature: 75
  humidity: 55
  mold: 50
  temperature_entity: sensor.living_room_temperature # Specific entity for temperature threshold
  humidity_entity: sensor.living_room_humidity # Specific entity for humidity threshold
```

**Default values**: 80°F (26.7°C) for temperature, 60% for humidity, no default for mold (indicator shows whenever mold sensor is present)
