# Troubleshooting Guide

This guide helps you resolve common issues with the Room Summary Card.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Configuration Issues](#configuration-issues)
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

1. **Check sensor names**:

   ```yaml
   # Default expected sensors:
   sensor.{area}_climate_air_temperature
   sensor.{area}_climate_humidity
   ```

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
4. **Disable animations**: If card has custom animations

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
# Card Version: 0.19.0
# Browser: Chrome 120.0
# Issue: Card shows blank

# Configuration:
type: custom:room-summary-card
area: living_room
entities:
  - light.living_room_light
  - switch.living_room_fan
# Error from browser console:
# TypeError: Cannot read property 'state' of undefined

# Steps to reproduce:
# 1. Add card to dashboard
# 2. Set area to 'living_room'
# 3. Card appears blank
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

### "TypeError: Cannot read property 'includes' of undefined"

- **Cause**: Array/list property is undefined
- **Fix**: Check configuration arrays are properly formatted

## Next Steps

- [Configuration Guide](CONFIGURATION.md) - Complete configuration options
- [Theming Guide](THEMING.md) - Theme support and color customization
- [Advanced Usage](ADVANCED.md) - Explore advanced features and integrations
