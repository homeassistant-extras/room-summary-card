# Background Image Issues

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
