## Sensor Averaging Issues

### Averaged Sensors Not Showing

**Symptoms**: No averaged sensors appear despite `sensor_classes` configuration

**Solutions**:

1. **Check sensor device classes**:
   ```yaml
   # Sensors must have proper device_class in attributes
   sensor.temperature:
     device_class: temperature # Required for averaging
   ```
2. **Verify numeric values**: Only sensors with numeric states are averaged
3. **Check area assignment**: Sensors must be assigned to the correct area
4. **Verify device classes exist**: Check if any sensors in the area have the specified device classes

### Unexpected Averaging Results

**Symptoms**: Averaged values seem incorrect

**Solutions**:

1. **Check units**: Sensors with different units are averaged separately
2. **Verify all sensors**: Check that all expected sensors are included in averaging
3. **Check sensor states**: Ensure all sensors have valid numeric states

### Individual vs Averaged Confusion

**Symptoms**: Don't understand which sensors are shown

**Solutions**:

1. **Display order**: Individual sensors (from `sensors`) show first, then averaged sensors
2. **Avoid duplication**: Don't include sensors in both `sensors` and `sensor_classes`
3. **Use sensor_layout**: Try `bottom` layout to see all sensors clearly

### Missing Device Classes

**Symptoms**: Expected device classes don't appear in editor

**Solutions**:

1. **Check area sensors**: Only device classes present in the area are shown
2. **Verify sensor setup**: Ensure sensors have proper `device_class` attributes
3. **Try custom values**: You can type custom device class names in the editor
