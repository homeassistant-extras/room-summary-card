# Troubleshooting Guide

This guide helps you resolve common issues with the Room Summary Card.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Configuration Issues](#configuration-issues)
- [Background Image Issues](#background-image-issues)
- [Sensor Averaging Issues](#sensor-averaging-issues)
- [Display Issues](#display-issues)
- [Theme Issues](#theme-issues)
- [Performance Issues](#performance-issues)
- [Entity Issues](#entity-issues)
- [Getting Help](#getting-help)

## Installation Issues

### Card Not Loading

**Symptoms**: Card shows as "Custom element doesn't exist" or blank

**Solutions**:

1. **Check resource path**:

   ```yaml
   # In configuration.yaml
   lovelace:
     resources:
       - url: /local/community/room-summary-card/room-summary-card.js
         type: module
   ```

2. **Verify file location**: Ensure file is in `www/community/room-summary-card/`

3. **Clear browser cache**:

   - Hard refresh (Ctrl+F5 or Cmd+Shift+R)
   - Clear browser cache completely

4. **Check Home Assistant logs**: Look for JavaScript errors in browser console

### HACS Installation Failed

**Solutions**:

1. **Check HACS status**: Ensure HACS is properly installed
2. **Verify repository URL**: `https://github.com/homeassistant-extras/room-summary-card`
3. **Check internet connection**: HACS needs internet access
4. **Try manual installation**: Download from releases page

### Card Editor Not Working

**Symptoms**: Visual editor doesn't appear or crashes

**Solutions**:

1. **Update Home Assistant**: Ensure you're on a recent version
2. **Clear frontend cache**: Developer Tools → Service → `homeassistant.reload_config_entry`
3. **Check browser compatibility**: Use Chrome, Firefox, or Safari
4. **Fallback to YAML**: Configure manually if editor fails

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

## Background Image Issues

### Background Images Not Showing

**Symptoms**: Expected background image doesn't appear

**Solutions**:

1. **Check image path**: Verify image URL/path is correct

   ```yaml
   background:
     image: /local/images/room.jpg # Must be accessible
   ```

2. **Verify area picture**: Check if area has picture set in Home Assistant

   - Go to Settings → Areas & Labels
   - Edit your area and check if picture is uploaded

3. **Test image entity**: Ensure image entity has `entity_picture` attribute

   ```yaml
   # Check in Developer Tools → States
   person.john:
     entity_picture: /api/image/serve/123/512x512
   ```

4. **Check disable option**:
   ```yaml
   background:
     options:
       - disable # Remove this if images should show
   ```

### Background Images Too Dark/Bright

**Symptoms**: Background interferes with text readability

**Solutions**:

1. **Adjust opacity**:

   ```yaml
   background:
     image: /local/images/room.jpg
     opacity: 15 # Lower for subtle background
   ```

2. **Use different image**: Choose images with better contrast
3. **Hide room icon for cleaner look**:
   ```yaml
   features:
     - hide_room_icon
   ```

### Dynamic Image Entity Not Working

**Symptoms**: Image entity doesn't provide background

**Solutions**:

1. **Check entity picture attribute**:

   ```yaml
   # Entity must have entity_picture in attributes
   person.john:
     entity_picture: /path/to/image.jpg
   ```

2. **Verify entity domain**: Use supported domains (person, image, camera)
3. **Test with static image**: Try regular image path first
4. **Check entity availability**: Ensure entity is available and not unknown

### Image Loading Errors

**Symptoms**: Broken image icons or console errors

**Solutions**:

1. **Check file permissions**: Ensure Home Assistant can access image files
2. **Verify file format**: Use supported formats (jpg, png, gif, webp)
3. **Test image URL**: Open image URL directly in browser
4. **Check network**: Ensure external images are accessible

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

## Performance Issues

### Card Loading Slowly

**Symptoms**: Card takes long time to load or update

**Solutions**:

1. **Reduce entity count**: Limit number of displayed entities
2. **Optimize sensors**: Use fewer, more efficient sensors
3. **Check network**: Slow internet affects loading
4. **Optimize images**: Use smaller, optimized background images
5. **Disable animations**: If card has custom animations

### Background Images Causing Lag

**Symptoms**: Card becomes slow when background images are enabled

**Solutions**:

1. **Optimize image size**: Use smaller, compressed images
2. **Reduce opacity**: Lower opacity values use less resources
3. **Use static images**: Avoid dynamic image entities if performance is critical
4. **Disable backgrounds**: Use `disable` option if performance is more important

### Frequent Updates

**Symptoms**: Card updates too often, causing lag

**Solutions**:

1. **Check sensor update frequency**: Reduce polling frequency
2. **Use template sensors**: Aggregate data before display
3. **Limit real-time sensors**: Use static data where possible

### Memory Issues

**Symptoms**: Browser becomes slow or crashes

**Solutions**:

1. **Reduce card count**: Limit number of room cards
2. **Simplify configuration**: Remove unnecessary features
3. **Update browser**: Use latest browser version
4. **Close other tabs**: Free up browser memory

## Entity Issues

### Entity States Not Updating

**Symptoms**: Card shows old/stale entity states

**Solutions**:

1. **Check entity availability**: Ensure entities are responsive
2. **Restart integration**: Restart relevant integrations
3. **Check network**: Verify device connectivity
4. **Force update**: Use Developer Tools to update entities

### Automation Not Triggered

**Symptoms**: Tap/hold actions don't work

**Solutions**:

1. **Check action syntax**:

   ```yaml
   tap_action:
     action: toggle # Correct action name
     # not: turn_on        # Use 'toggle' instead
   ```

2. **Verify permissions**: Ensure user has control permissions
3. **Check entity domains**: Some actions only work with specific domains
4. **Test manually**: Try action in Developer Tools

### Custom Attributes Missing

**Symptoms**: Entity attributes like `on_color` not working

**Solutions**:

1. **Check customize location**: Attributes must be in `customize.yaml` or `configuration.yaml`
2. **Verify entity ID**: Must match exactly (case-sensitive)
3. **Restart required**: Restart HA after customize changes
4. **Check syntax**:
   ```yaml
   customize:
     light.living_room: # Exact entity ID
       on_color: yellow # Correct attribute name
   ```

## Getting Help

### Before Asking for Help

1. **Check logs**: Look at Home Assistant logs and browser console
2. **Try minimal config**: Test with simplest possible configuration
3. **Update everything**: Ensure HA, HACS, and card are up to date
4. **Search existing issues**: Check GitHub issues for similar problems

### Where to Get Help

- **📖 Documentation**: Check our [docs folder](../docs/) for guides
- **💬 GitHub Discussions**: [Ask questions](https://github.com/homeassistant-extras/room-summary-card/discussions)
- **🐛 GitHub Issues**: [Report bugs](https://github.com/homeassistant-extras/room-summary-card/issues)
- **💬 Discord**: [Join our Discord](https://discord.gg/NpH4Pt8Jmr)

### Information to Include

When asking for help, please include:

1. **Home Assistant version**
2. **Card version**
3. **Browser and version**
4. **Complete card configuration** (sanitize sensitive data)
5. **Error messages** (from HA logs and browser console)
6. **Screenshots** (if visual issue)
7. **Steps to reproduce** the problem

### Example Bug Report

```yaml
# Home Assistant Version: 2024.1.0
# Card Version: 0.23.0
# Browser: Chrome 120.0
# Issue: Background image not showing

# Configuration:
type: custom:room-summary-card
area: living_room
background:
  image: /local/images/living-room.jpg
  opacity: 30
# Error from browser console:
# Failed to load resource: /local/images/living-room.jpg 404 (Not Found)

# Steps to reproduce:
# 1. Add card to dashboard
# 2. Set background image path
# 3. Image doesn't appear, shows broken icon
```

### Emergency Workarounds

If the card is completely broken:

1. **Remove from dashboard**: Delete card temporarily
2. **Use YAML mode**: Configure manually instead of UI
3. **Revert to previous version**: Downgrade if new version has issues
4. **Use alternative cards**: Button-card or entity cards as temporary replacement

## Common Error Messages

### "Custom element doesn't exist: room-summary-card"

- **Cause**: Card not properly loaded
- **Fix**: Check resource configuration and file location

### "Area 'xyz' not found"

- **Cause**: Area doesn't exist or name mismatch
- **Fix**: Verify area exists and spelling is correct

### "Entity 'abc.xyz' not found"

- **Cause**: Entity doesn't exist or is unavailable
- **Fix**: Check entity exists and is available

### "Cannot read property 'state' of undefined"

- **Cause**: Entity state is missing or malformed
- **Fix**: Check entity has valid state and attributes

### "Failed to load resource: /local/images/..."

- **Cause**: Background image file not found or inaccessible
- **Fix**: Verify image path and file exists in www folder

### "Cannot read property 'entity_picture' of undefined"

- **Cause**: Image entity doesn't have entity_picture attribute
- **Fix**: Check entity has valid entity_picture or use different entity

### "TypeError: Cannot read property 'includes' of undefined"

- **Cause**: Array/list property is undefined
- **Fix**: Check configuration arrays are properly formatted

## Next Steps

- [Configuration Guide](CONFIGURATION.md) - Complete configuration options
- [Theming Guide](THEMING.md) - Theme support and color customization
- [Advanced Usage](ADVANCED.md) - Explore advanced features and integrations
