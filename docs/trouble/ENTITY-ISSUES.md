# Entity Issues

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
