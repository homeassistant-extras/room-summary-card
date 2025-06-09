## Configuration Issues

### "Area is required" Error

**Symptoms**: Card shows error about missing area

**Solutions**:

1. **Verify area exists**:

   ```yaml
   type: custom:room-summary-card
   area: living_room # Must match existing area ID
   ```

2. **Check area spelling**: Area IDs are case-sensitive
3. **List available areas**: Go to Settings → Areas & Labels

### Entities Not Showing

**Symptoms**: Expected entities don't appear on card

**Solutions**:

1. **Check entity names**: Verify entities follow naming convention

   ```yaml
   # Expected default entities:
   light.{area}_light       # e.g., light.living_room_light
   switch.{area}_fan        # e.g., switch.living_room_fan
   ```

2. **Check area assignment**: Ensure entities are assigned to correct area

3. **Verify entity states**: Entities must exist and have valid states

4. **Use explicit configuration**:
   ```yaml
   entities:
     - light.my_custom_light # Explicitly specify entities
     - switch.my_custom_fan
   ```

### Sensors Not Displaying

**Symptoms**: Climate/sensor information missing

**Solutions**:

1. **Check sensor device classes**:

In dev tools they should have an attribute device_class of `humidity` or `temperature`

2. **Specify custom sensors**:

   ```yaml
   sensors:
     - sensor.my_temperature
     - sensor.my_humidity
   ```

3. **Check `hide_climate_label` feature**:
   ```yaml
   features:
     - hide_climate_label # Remove this if sensors should show
   ```
