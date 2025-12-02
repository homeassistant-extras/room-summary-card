## Climate Threshold Configuration

Configure climate-based border styling thresholds and mold detection:

![Climate Borders](../../assets/climate.png)

> **Note:** This covers **climate thresholds** for card styling. For **entity threshold colors** based on individual sensor values, see [Entity Color Configuration](ENTITY-COLOR-CONFIGURATION.md#3-threshold-based-colors).

```yaml
thresholds:
  temperature:
    - value: 75 # Temperature threshold in current unit or entity (optional - defaults to 80°F)
      operator: gt # Comparison operator (optional - default: gt)
      # entity_id is optional - if omitted, uses averaged temperature sensor
  humidity:
    - value: 55 # Humidity threshold (optional - defaults to 60%)
      operator: gt # Comparison operator (optional - default: gt)
      # entity_id is optional - if omitted, uses averaged humidity sensor
  mold: 50 # Mold threshold as percentage
```

**How It Works**:

- **Temperature sensors** with values meeting the threshold condition trigger red borders (by default)
- **Humidity sensors** with values meeting the threshold condition trigger blue borders (by default)
- **Mold sensors** with values at or above the threshold display an animated indicator near problem entities (bottom left)
- Thresholds respect the current unit of measurement (°F, °C, %)
- Can be disabled with the `skip_climate_styles` feature flag
- Multiple threshold entries can be configured for each type, allowing different sensors to have different thresholds
- Each threshold entry can specify the threshold value (`value`), which entity to check (`entity_id`), the comparison operator (`operator`), and a custom border color (`color`) - all fields are optional
- If `entity_id` is omitted, the card uses the averaged sensor value for that device class (temperature or humidity)
- If `value` is omitted, defaults are used: 80°F (26.7°C) for temperature, 60% for humidity
- If `operator` is omitted, defaults to `gt` (greater than)
- If `color` is omitted, default colors are used: red (`var(--error-color)`) for temperature, blue (`var(--info-color)`) for humidity
- For advanced cases an entity can be configured as the one to trip the threshold for `value`.

### Custom Border Colors

You can customize the border color when a threshold is triggered by adding a `color` property to any threshold entry:

```yaml
thresholds:
  temperature:
    - value: 70
      operator: lt
      color: blue # Custom blue border when temp < 70°F
    - value: 85
      operator: gt
      color: red # Custom red border when temp > 85°F
  humidity:
    - value: 50
      operator: lt
      color: orange # Custom orange border when humidity < 50%
```

**Color Format**:

- Accepts any valid CSS color value (hex, rgb, named colors, CSS variables)
- Examples: `blue`, `#FF5733`, `rgb(255, 87, 51)`, `var(--warning-color)`
- If omitted, defaults to red for temperature (`var(--error-color)`) and blue for humidity (`var(--info-color)`)

**Use Cases**:

- **Different severity levels**: Use different colors for different threshold ranges (e.g., yellow for warning, red for critical)
- **Heating vs cooling**: Use blue for cold temperatures, red for hot temperatures
- **Custom branding**: Match your dashboard theme with custom colors

### Comparison Operators

You can specify how the sensor values are compared to the threshold using comparison operators:

- **`gt`** (Greater than): `value > threshold` - Default for both temperature and humidity
- **`gte`** (Greater than or equal): `value >= threshold`
- **`lt`** (Less than): `value < threshold` - Useful for heating scenarios
- **`lte`** (Less than or equal): `value <= threshold`
- **`eq`** (Equal): `value === threshold` - Exact match

**Use Cases**:

- **Cooling scenarios** (default): Use `gt` to detect when temperature is above threshold
- **Heating scenarios**: Use `lt` to detect when temperature is below threshold
- **Medical conditions**: Use `lt` for humidity to detect when it's too low
- **Exact monitoring**: Use `eq` to detect specific values

### Mold Indicator

The mold indicator provides a prominent visual warning when mold levels exceed your configured threshold:

- **Location**: Appears in the bottom left area near problem entities
- **Visual Design**: Animated red gradient background with pulsing effects
- **Components**: Shows the mold sensor icon and current value
- **Animations**: Includes pulsing, bouncing, and glowing effects to draw attention
- **Warning Symbol**: Displays a flashing warning bug mold symbol for additional emphasis
- **Hover Effects**: Scales up and intensifies animations on hover

![Moldy](../../assets/moldy.png)

**Mold Sensor Requirements**:

- Must be a sensor entity with a numeric state value
- Should represent mold level as a percentage (0-100)
- Will only display when the sensor value is at or above the configured threshold
- If no threshold is configured, the indicator will always show when a mold sensor is present

![Moldy](../../assets/moldy-editor.png)

**Examples**:

```yaml
# Minimal configuration - uses all defaults (80°F for temp, 60% for humidity, gt operator)
#thresholds:

# Simple threshold - uses averaged sensor (entity_id not needed)
# Celsius threshold
thresholds:
  temperature:
    - value: 24  # 24°C

# Fahrenheit threshold
thresholds:
  temperature:
    - value: 75  # 75°F

# Custom humidity threshold
thresholds:
  humidity:
    - value: 50  # 50%

# All thresholds together (simple form)
thresholds:
  temperature:
    - value: 78
  humidity:
    - value: 65
  mold: 50

# Specific entity threshold - when you need to check a particular sensor
thresholds:
  temperature:
    - entity_id: sensor.living_room_temp  # Check this specific sensor
      value: 75
      operator: gt

# Dynamic threshold values from entities
thresholds:
  temperature:
    - value: sensor.main_temperature # Threshold value read from entity
      # Uses averaged temperature sensor by default
  humidity:
    - value: sensor.main_humidity # Threshold value read from entity
      # Uses averaged humidity sensor by default

# Multiple threshold entries for different sensors
thresholds:
  temperature:
    - entity_id: sensor.living_room_temp
      value: 75
      operator: gt
    - entity_id: sensor.bedroom_temp
      value: 70
      operator: gt
  humidity:
    - entity_id: sensor.living_room_humidity
      value: 55
      operator: gt

# Heating scenario - detect when temperature is below threshold
thresholds:
  temperature:
    - value: 68
      operator: lt # Trigger when temperature < 68°F

# Medical condition - detect when humidity is too low
thresholds:
  humidity:
    - value: 30
      operator: lt # Trigger when humidity < 30%

# Combined heating and low humidity detection
thresholds:
  temperature:
    - value: 70
      operator: lt # Below 70°F
  humidity:
    - value: 35
      operator: lt # Below 35%

# Exact temperature monitoring
thresholds:
  temperature:
    - value: 72
      operator: eq # Trigger only when exactly 72°F

# Mix of averaged and specific sensors
thresholds:
  temperature:
    - value: 75  # Uses averaged temperature sensor
      operator: gt
    - entity_id: sensor.bedroom_temp  # Also check specific sensor
      value: 70
      operator: gt

# Custom colors for different threshold ranges
thresholds:
  temperature:
    - value: 70
      operator: lt
      color: blue  # Blue border when temp < 70°F (too cold)
    - value: 85
      operator: gt
      color: red  # Red border when temp > 85°F (too hot)
  humidity:
    - value: 30
      operator: lt
      color: orange  # Orange border when humidity < 30% (too dry)
    - value: 70
      operator: gt
      color: purple  # Purple border when humidity > 70% (too humid)

# Basement example with custom colors
thresholds:
  temperature:
    - value: 70
      operator: lt
      color: blue  # Blue alarm when basement is too cold
    - value: 85
      operator: gt
      color: red  # Red alarm when basement is too hot
```

**Default values**: 80°F (26.7°C) for temperature, 60% for humidity, no default for mold (indicator shows whenever mold sensor is present)

**Field Reference**:

| Field       | Type             | Default                     | Description                                                                   |
| ----------- | ---------------- | --------------------------- | ----------------------------------------------------------------------------- |
| `entity_id` | string           | Averaged sensor             | Entity ID to check for this threshold. If omitted, uses averaged sensor value |
| `value`     | number \| string | 80°F (temp), 60% (humidity) | Threshold value (number) or entity ID (string) to lookup threshold value      |
| `operator`  | string           | `gt`                        | Comparison operator: `gt`, `gte`, `lt`, `lte`, `eq`                           |
| `color`     | string           | Red (temp), Blue (humidity) | Custom border color when threshold is triggered. Accepts any CSS color value  |
