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
```

**Default values**: 80°F (26.7°C) for temperature, 60% for humidity
