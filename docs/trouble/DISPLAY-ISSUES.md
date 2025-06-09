## Display Issues

### Card Appears Blank

**Symptoms**: Card loads but shows no content

**Solutions**:

1. **Check area has entities**: Verify area contains devices/entities
2. **Enable debug mode**: Check browser console for errors
3. **Try minimal config**:
   ```yaml
   type: custom:room-summary-card
   area: living_room
   ```

### Icons Not Showing

**Symptoms**: Entity icons missing or showing as squares

**Solutions**:

1. **Check icon names**: Ensure MDI icon names are correct

   ```yaml
   entities:
     - entity_id: light.lamp
       icon: mdi:lamp # Must be valid MDI icon
   ```

2. **Update Home Assistant**: Newer versions have more icons
3. **Check internet connection**: Icons load from CDN

### Layout Issues

**Symptoms**: Card layout broken or overlapping elements

**Solutions**:

1. **Check container size**: Ensure card has adequate space
2. **Clear CSS cache**: Hard refresh browser
3. **Check theme compatibility**: Try with default HA theme
4. **Disable custom CSS**: Temporarily remove custom styles

### Room Icon Not Showing

**Symptoms**: Room icon missing from card

**Solutions**:

1. **Check hide_room_icon feature**:

   ```yaml
   features:
     - hide_room_icon # Remove this if icon should show
   ```

2. **Verify area icon**: Check if area has icon set in Home Assistant
3. **Check entity icon**: If using custom entity, verify it has an icon

### Problem Indicator Missing

**Symptoms**: Problem counter doesn't appear

**Solutions**:

1. **Check labels**: Ensure entities have "problem" label
2. **Verify area assignment**: Problem entities must be in same area
3. **Check entity states**: Problem entities must have active/inactive states
4. **Test with simple entity**:
   ```yaml
   # Create test binary sensor with "problem" label
   binary_sensor:
     - name: Test Problem
       state: 'on'
   ```

### Climate Borders Not Showing

**Symptoms**: Expected temperature/humidity borders missing

**Solutions**:

1. **Check thresholds configuration**:

   ```yaml
   type: custom:room-summary-card
   area: living_room
   thresholds:
     temperature: 75 # Must be configured
     humidity: 55
   ```

2. **Verify sensor device classes**: Sensors must have `device_class: temperature` or `device_class: humidity`
3. **Check threshold values**: Ensure sensor values exceed the configured thresholds
4. **Disable skip_climate_styles**: Remove this feature if climate borders should show
