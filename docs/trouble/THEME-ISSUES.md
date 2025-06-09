## Theme Issues

### Colors Not Applying

**Symptoms**: Custom colors not showing on entities

**Solutions**:

1. **Check attribute syntax**:

   ```yaml
   customize:
     light.living_room:
       on_color: yellow # Correct
       # not: onColor     # Incorrect
   ```

2. **Verify color names**: Use supported color names
3. **Clear cache**: Restart Home Assistant after customize changes
4. **Check theme support**: Ensure theme supports custom colors

### Dark Mode Issues

**Symptoms**: Card doesn't adapt to dark mode

**Solutions**:

1. **Check HA theme**: Ensure dark mode is properly enabled
2. **Update card**: Newer versions have better dark mode support
3. **Clear theme cache**: Switch themes and back

### RGB Colors Not Working

**Symptoms**: RGB lights don't show correct colors

**Solutions**:

1. **Check attribute format**:

   ```yaml
   # Correct format in entity state:
   rgb_color: [255, 120, 50] # Array of 3 numbers
   ```

2. **Verify entity support**: Not all entities support RGB
3. **Check precedence**: `icon_color` overrides RGB colors
