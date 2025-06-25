## Sensor Averaging

The card can automatically calculate and display averaged sensor readings by device class, using the same logic as Home Assistant's area card.

By default these sensor classes will be averaged.

- temperature
- humidity'
- illuminance

### How Averaging Works

1. **Discovery**: Finds all sensors in the area with specified device classes
2. **Filtering**: Only includes numeric sensors with valid states
3. **Grouping**: Groups sensors by unit of measurement within each device class
4. **Calculation**: Calculates simple average for each group
5. **Display**: Shows averaged value with appropriate formatting

### Averaging Examples

#### Temperature Sensors

```yaml
# Area has these temperature sensors:
# sensor.room_temp_1: 72.5°F
# sensor.room_temp_2: 71.8°F
# sensor.room_temp_3: 73.1°F

sensor_classes:
  - temperature
# Displays: "72.5°F" (average of the three sensors)
```

#### Mixed Units

```yaml
# Area has temperature sensors with different units:
# sensor.temp_celsius: 22.5°C
# sensor.temp_fahrenheit_1: 72°F
# sensor.temp_fahrenheit_2: 74°F

sensor_classes:
  - temperature
# Displays:
# "22.5°C" (single Celsius sensor)
# "73°F" (average of Fahrenheit sensors)
```

### Advanced Configuration

```yaml
# Complete sensor configuration
sensors:
  - sensor.special_co2_sensor # Individual sensor (shown first)
  - sensor.important_pressure # Individual sensor (shown first)
sensor_classes:
  - temperature # Averaged (shown after individual)
  - humidity # Averaged (shown after individual)
  - illuminance # Averaged (shown after individual)
  - battery
  - voltage
sensor_layout: bottom # Display location
```

### Numeric Device Classes

The following device classes are supported for averaging (must be numeric sensors):

- `temperature`, `humidity`, `pressure`, `illuminance`, `co2`, `pm25`, `pm10`, `aqi`, `battery`, `energy`, `power`, `voltage`, `current`, and more.

**Reference**: See [Home Assistant's area card documentation](https://www.home-assistant.io/dashboards/area) for the complete list.

### Climate Thresholds Integration

Individual sensors can also be used for climate thresholds, even when their device class isn't included in `sensor_classes`. This is useful when you want to:

1. **Use specific sensors** for climate calculations while excluding others
2. **Configure thresholds** without including all sensors of that device class in averaging

#### Example: Selective Climate Thresholds

```yaml
sensors:
  - sensor.living_room_temp_1 # Individual temperature sensor
  - sensor.basement_temp # Different temperature sensor
sensor_classes:
  - pressure # Only pressure sensors from area
thresholds:
  temperature: 75
  temperature_entity: sensor.living_room_temp_1 # Uses living room temp only
```

In this configuration:

- `sensor.living_room_temp_1` is used for climate thresholds (if it has `device_class: temperature`)
- `sensor.basement_temp` is shown individually but not used for thresholds
- No temperature averaging occurs since `temperature` isn't in `sensor_classes`
- Pressure sensors from the area are averaged as usual

#### Threshold Lookup Priority

When `temperature_entity` or `humidity_entity` is specified, the system looks for the sensor in this order:

1. **Individual sensors** (from `config.sensors`) - if the entity has the correct device class
2. **Averaged sensors** (from `config.sensor_classes`) - as a fallback

This ensures that configured individual sensors take priority over area-wide averages for climate calculations.
