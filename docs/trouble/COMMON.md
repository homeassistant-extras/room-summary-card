# Common Error Messages

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
