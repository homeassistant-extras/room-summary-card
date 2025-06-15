## Threshold Configuration

Configure climate-based border styling thresholds:

```yaml
thresholds:
  temperature: 75 # Temperature threshold in current unit
  humidity: 55 # Humidity threshold as percentage
```

**How It Works**:

- Temperature sensors with values above the threshold trigger red borders
- Humidity sensors with values above the threshold trigger blue borders
- Thresholds respect the current unit of measurement (°F, °C, %)
- Can be disabled with the `skip_climate_styles` feature flag
- For advanced cases an entity can be configured as the one to trip the threshold.

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

# Both thresholds
thresholds:
  temperature: 78
  humidity: 65

# specific entities trigger the threshold, not average
# this is not needed in most scenarios
thresholds:
  temperature: 75
  humidity: 55
  temperature_entity: sensor.living_room_temperature # Specific entity for temperature threshold
  humidity_entity: sensor.living_room_humidity # Specific entity for humidity threshold
```

**Default values**: 80°F (26.7°C) for temperature, 60% for humidity
