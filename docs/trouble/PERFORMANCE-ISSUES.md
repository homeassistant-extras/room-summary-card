# Performance Issues

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
