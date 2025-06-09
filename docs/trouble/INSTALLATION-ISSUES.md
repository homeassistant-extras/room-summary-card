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
