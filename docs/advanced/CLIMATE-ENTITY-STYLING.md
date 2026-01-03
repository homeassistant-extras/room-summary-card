## Climate Entity Styling

Climate entities receive special treatment with automatic icon and color changes based on their state and action.

### Climate Icon Determination

Icons are determined by **HVAC action** (what the system is currently doing) rather than just the mode:

1. **Primary**: Uses `hvac_action` attribute when available:
   - `heating` → `mdi:fire`
   - `cooling` → `mdi:snowflake`
   - `drying` → `mdi:water-percent`
   - `fan` → `mdi:fan`
   - `idle` → `mdi:power`
   - `off` → `mdi:power`
   - `preheating` → `mdi:fire`
   - `defrosting` → `mdi:fire`

2. **Fallback**: Uses `state` value (hvac_mode) when `hvac_action` is not available:
   - `auto` → `mdi:thermostat-auto`
   - `cool` → `mdi:snowflake`
   - `heat` → `mdi:fire`
   - `dry` → `mdi:water-percent`
   - `heat_cool` → `mdi:sun-snowflake-variant`
   - `fan_only` → `mdi:fan`
   - `off` → `mdi:power`

This provides more accurate visual feedback - for example, a thermostat in `heat` mode that's currently `idle` will show the power icon rather than the fire icon, indicating it's not actively heating.

### Climate Border Styling

The card shows colored borders based on sensor thresholds:

- **Red border** (default): Temperature above threshold
- **Blue border** (default): Humidity above threshold
- **Custom colors**: You can customize border colors for each threshold entry

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
     temperature:
       - value: 75 # Custom temperature threshold
     humidity:
       - entity_id: sensor.living_room_humidity
         value: 55 # Custom humidity threshold
   ```

   **Custom threshold colors**:

   ```yaml
   type: custom:room-summary-card
   area: basement
   thresholds:
     temperature:
       - value: 70
         operator: lt
         color: blue # Blue border when temp < 70°F
       - value: 85
         operator: gt
         color: red # Red border when temp > 85°F
     humidity:
       - value: 50
         operator: lt
         color: orange # Orange border when humidity < 50%
   ```

3. **Skip feature**: Can be disabled with feature flag
   ```yaml
   features:
     - skip_climate_styles # Disables climate borders and colors
   ```
