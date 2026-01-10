# Legacy Configuration Support

The card maintains backward compatibility with older configuration formats:

### Legacy Sensor Configuration (Deprecated)

```yaml
# Old way (still works but deprecated)
temperature_sensor: sensor.custom_temperature
humidity_sensor: sensor.custom_humidity

# New way (recommended)
sensors:
  - sensor.custom_temperature
  - sensor.custom_humidity
```

### Migration Notes

- Legacy `temperature_sensor` and `humidity_sensor` properties still work
- They will be combined with the new `sensors` array if both are present
- Plan to migrate to `sensors` array as legacy properties may be removed in future versions
