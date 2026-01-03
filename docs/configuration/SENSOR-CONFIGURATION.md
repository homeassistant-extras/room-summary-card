## Sensor Configuration

The card supports two types of sensor display:

### Individual Sensors (`sensors`)

Display specific sensor entities in your preferred order. Sensors can be specified in two ways:

#### Simple String Format

```yaml
sensors:
  - sensor.living_room_temperature_main # Specific sensor
  - sensor.living_room_humidity_main # Specific sensor
  - sensor.living_room_co2 # Additional sensor
```

#### Object Format

```yaml
sensors:
  - entity_id: sensor.living_room_temperature_main
  - entity_id: sensor.living_room_humidity_main
  - entity_id: sensor.living_room_co2
```

#### Object Format with Custom Icon

You can configure a custom icon for sensors without requiring state-based matching:

```yaml
sensors:
  - entity_id: sensor.bwt_perla_regenerativ_level
    icon: phu:water-softener
  - entity_id: sensor.temperature
    icon: mdi:thermometer
```

The configured icon takes priority over state-based icons and the default entity icon.

#### Object Format with State-Based Styling and Labels

You can configure sensors with state-based styling and custom labels, similar to entity configuration:

```yaml
sensors:
  - entity_id: sensor.door_sensor
    label: 'Door' # Fallback label
    states:
      - state: 'on'
        icon_color: red
        icon: mdi:door-open
        label: 'Open' # Displayed instead of state value when state is "on"
        styles:
          background-color: rgba(255, 0, 0, 0.2)
          border: 1px solid red
      - state: 'off'
        icon_color: green
        icon: mdi:door-closed
        label: 'Closed' # Displayed instead of state value when state is "off"
        styles:
          background-color: rgba(0, 255, 0, 0.2)
  - entity_id: sensor.temperature
    label: 'Temperature' # Fallback label
    states:
      - state: '75'
        icon_color: orange
        icon: mdi:thermometer-alert
        label: 'Hot' # Displayed instead of state value when state is "75"
        styles:
          padding: 4px
          border-radius: 4px
```

#### Displaying Entity Attributes Instead of State

You can configure sensors to display a specific attribute value instead of the entity state:

```yaml
sensors:
  # Display the 'temperature' attribute instead of the state value
  - entity_id: sensor.weather_station
    attribute: temperature

  # Display a formatted attribute value
  - entity_id: sensor.air_quality
    attribute: aqi # Shows the AQI value instead of the state

  # Attribute with label fallback
  - entity_id: sensor.weather
    label: 'Weather'
    attribute: condition # Shows weather condition attribute instead of state
```

When an `attribute` is specified, the sensor will display the formatted attribute value using Home Assistant's attribute display formatting. This is useful when you want to show a specific attribute (like `temperature`, `humidity`, `battery_level`, etc.) instead of the entity's primary state value.

When the sensor state matches a configured state, the card will:

- Display the custom icon (e.g., `mdi:door-open` when state is "on")
- Apply the custom icon color
- Display the custom label (if configured) instead of the sensor's state value
- Apply any CSS styles defined in the `styles` property

#### Labels for Sensors

Sensors can have custom labels configured at multiple levels:

1. **State label** (highest priority) - Displayed when a matching state configuration has a `label` property
2. **Entity-level label** - Displayed when the sensor has a `label` property configured
3. **Attribute value** - Displayed when an `attribute` property is configured (replaces state display)
4. **Sensor state value** (fallback) - Displayed when no label or attribute is configured (e.g., "75°F", "50%", "450 ppm")

```yaml
sensors:
  # Sensor with state-based labels
  - entity_id: sensor.door_sensor
    label: 'Door Sensor' # Fallback label
    states:
      - state: 'on'
        icon_color: red
        icon: mdi:door-open
        label: 'Open' # Displayed instead of "on" when state matches
      - state: 'off'
        icon_color: green
        icon: mdi:door-closed
        label: 'Closed' # Displayed instead of "off" when state matches

  # Sensor with only entity-level label
  - entity_id: sensor.humidity
    label: 'Humidity' # Always displayed instead of state value

  # Sensor with no label (displays state value normally)
  - entity_id: sensor.co2
    # No label configured - will display sensor state value (e.g., "450 ppm")

  # Sensor displaying an attribute instead of state
  - entity_id: sensor.weather_station
    attribute: temperature # Displays temperature attribute instead of state value

  # Sensor with attribute and label fallback
  - entity_id: sensor.battery_monitor
    label: 'Battery'
    attribute: battery_level # Shows battery level attribute, falls back to label if attribute missing

  # Sensor with custom icon
  - entity_id: sensor.bwt_perla_regenerativ_level
    icon: phu:water-softener
```

**Note**: When labels are configured for sensors, they replace the sensor's state display. When an `attribute` is specified, it displays the formatted attribute value instead of the state. When labels are not configured, sensors display their normal state values.

#### Icon Priority

Icons are determined in the following priority order:
1. **Configured icon** (`icon` property) - highest priority
2. **State-based icon** (from `states` configuration when state matches)
3. **Default entity icon** (from Home Assistant)

This allows you to set a default icon for a sensor while still allowing state-based icons to override it when specific conditions are met.

#### Mixed Format

You can mix both formats in the same configuration:

```yaml
sensors:
  - sensor.living_room_temperature_main # String format
  - entity_id: sensor.living_room_humidity_main # Object format
  - sensor.living_room_co2 # String format
```

### Averaged Sensors (`sensor_classes`)

Display averaged readings for device classes across the area:

```yaml
sensor_classes:
  - temperature # Average of all temperature sensors
  - humidity # Average of all humidity sensors
  - pressure # Average of all pressure sensors
```

### Combined Configuration

You can use both together - individual sensors display first, then averages:

```yaml
sensors:
  - sensor.living_room_co2 # Shown first
  - entity_id: sensor.living_room_pressure # Object format also supported
sensor_classes:
  - temperature # Averaged, shown after individual
  - humidity # Averaged, shown after individual
```

### How It Works

The card automatically:

1. Finds all sensors in the area with the specified device classes
2. Groups them by unit of measurement (°F, °C, %, etc.)
3. Calculates averages for each group
4. Displays the averaged values

### Default Behavior

```yaml
# Default configuration (automatic)
sensor_classes:
  - temperature
  - humidity
  - illuminance
```

### Custom Device Classes

```yaml
# Custom sensor classes
sensor_classes:
  - temperature
  - humidity
  - pressure
  - illuminance
  - co2
```

**Reference**: This uses similar logic as [Home Assistant's area card](https://www.home-assistant.io/dashboards/area).

### Display Priority

Sensors are displayed in this order:

1. **Individual sensors** (from `sensors` config) - in specified order
2. **Averaged sensors** (from `sensor_classes`) - grouped by device class

### Relationship with Individual Sensors

- If using `sensor_classes`, you don't need to manually include those entities in `sensors`
- Individual sensors in `sensors` will always display first
- Averaged sensors appear after individual sensors

### Sensor Layout Options

- **`default`**: Displays sensors in the label area alongside room statistics
- **`stacked`**: Displays sensors vertically stacked in the label area
- **`bottom`**: Displays sensors at the bottom of the card for maximum visibility

![Sensor Layouts](../../assets/sensors-styles.png)

### Interactive Sensors

Sensors in the info section now support interactive behavior:

#### Clickable Individual Sensors

Individual sensors (configured via `sensors`) are clickable and will open the Home Assistant "more info" dialog when tapped:

```yaml
sensors:
  - sensor.living_room_temperature # Clickable - opens more info dialog
  - sensor.living_room_humidity # Clickable - opens more info dialog
```

This allows you to quickly access detailed sensor information, history, and controls directly from the card.

#### Non-Interactive Averaged Sensors

Averaged sensors (from `sensor_classes`) are **not clickable** as they represent calculated values from multiple sensors:

```yaml
sensor_classes:
  - temperature # Not clickable - calculated average
  - humidity # Not clickable - calculated average
```

This design choice prevents confusion since averaged sensors don't represent a single entity that can be interacted with.

### Sensor Display Options

You can customize how sensor information is displayed using feature flags:

#### Hide Sensor Icons

Hide the icons next to sensor values while keeping the text labels:

```yaml
features:
  - hide_sensor_icons
sensors:
  - sensor.living_room_temperature # Shows: "72°F" (no icon)
```

#### Hide Sensor Labels

Hide the text labels next to sensor icons (opposite of `hide_sensor_icons`):

```yaml
features:
  - hide_sensor_labels
sensors:
  - sensor.living_room_temperature # Shows: 🌡️ (icon only, no text)
```

#### Icons Only Display

For a minimal icon-only display:

```yaml
features:
  - hide_sensor_labels
sensor_layout: bottom
sensors:
  - sensor.living_room_temperature
  - sensor.living_room_humidity
```

This is useful for compact layouts where you want visual indicators without text.

![Sensor Icons](../../assets/sensor-icons.png)

### Legacy Sensor Configuration (Deprecated)

For backward compatibility, you can still use:

```yaml
temperature_sensor: sensor.living_room_temperature
humidity_sensor: sensor.living_room_humidity
```

> **Note:** Please migrate to the `sensors` array as these legacy properties will be removed in a future version.
