## Climate Entity Styling

Climate entities receive special treatment with automatic icon and color changes based on their state.

### Climate State Icons

```yaml
# Automatic icons based on climate state:
auto: mdi:autorenew
cool: mdi:snowflake
heat: mdi:fire
dry: mdi:water
heat_cool: mdi:sun-snowflake
fan_only: mdi:fan
off: mdi:snowflake-off
```

### Climate Border Styling

The card shows colored borders based on sensor thresholds:

- **Red border**: Temperature above threshold (configurable)
- **Blue border**: Humidity above threshold (configurable)

![Climate Borders](../../assets/climate.png)

### Requirements for Climate Styling

1. **Device class**: Sensors must have proper `device_class`

   ```yaml
   sensor.temperature:
     device_class: temperature

   sensor.humidity:
     device_class: humidity
   ```

2. **Thresholds**: Configure in card configuration

   ```yaml
   type: custom:room-summary-card
   area: living_room
   thresholds:
     temperature: 75 # Custom temperature threshold
     humidity: 55 # Custom humidity threshold
     humidity_entity: sensor.living_room_humidity # Specific entity for humidity threshold (advanced)
   ```

3. **Skip feature**: Can be disabled with feature flag
   ```yaml
   features:
     - skip_climate_styles # Disables climate borders and colors
   ```
