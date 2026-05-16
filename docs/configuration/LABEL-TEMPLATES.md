# Label templates (Jinja)

Entity icons, climate sensors, and badges can show a **label**. Labels are usually plain text, but any `label` field—including on **entities**, **sensors**, **badges**, **states**, and **thresholds**—can use [Home Assistant Jinja2 templates](https://www.home-assistant.io/docs/configuration/templating/) when the value contains `{{` or `{%`.

The card evaluates templates on the server via the `render_template` websocket API and updates the label when referenced entities or time change.

## Where templates work

| Location          | YAML path                                                         | When it is shown                                        |
| ----------------- | ----------------------------------------------------------------- | ------------------------------------------------------- |
| Entity icon       | `entities[].label`                                                | `show_entity_labels` is enabled                         |
| Sensor row        | `sensors[].label`                                                 | Sensor labels are not hidden (`hide_sensor_labels` off) |
| Badge             | `entities[].badges[].label`                                       | When the badge is shown                                 |
| Badge state match | `entities[].badges[].states[].label`                              | When that badge state row matches                       |
| State match       | `entities[].states[].label` or `sensors[].states[].label`         | When that state row matches                             |
| Threshold match   | `entities[].thresholds[].label` or `sensors[].thresholds[].label` | When that threshold row matches                         |

**Priority** (same as static labels):

1. Matching **state** or **threshold** `label` (highest)
2. Entity/sensor **`label`**
3. **`attribute`** display (if configured)
4. **Entity name** (icons only) or **formatted state** (sensors)

If the winning label contains template syntax, it is rendered as Jinja; otherwise it is shown as plain text.

Badge labels use a similar priority inside the badge: matching badge state `label`, then the badge-level `label`, then the normal badge icon.

## Plain text (no template)

You do not need special syntax for a fixed caption:

```yaml
entities:
  - entity_id: light.kitchen
    label: Kitchen
```

## Entity label from another sensor

Show a related value under a light or switch (requires `show_entity_labels`):

```yaml
type: custom:room-summary-card
area: bedroom
features:
  - show_entity_labels
entities:
  - entity_id: light.bedroom
    label: "{{ states('sensor.bedroom_temperature') | round(1) }}°"
```

## Sensor label with template

Templates replace the sensor’s normal state text when they win the label priority:

```yaml
sensors:
  - entity_id: sensor.bedroom_temperature
    label: "{{ states('sensor.bedroom_humidity') | int }}% RH"
```

## Badge label with template

Show a short related value directly on an entity badge:

```yaml
entities:
  - entity_id: light.bedroom
    badges:
      - entity_id: sensor.bedroom_temperature
        position: top_right
        mode: show_always
        label: "{{ states('sensor.bedroom_temperature') | round(0) }}°"
```

Keep badge labels short because they sit over a corner of the entity icon.

## State-based template label

Use a different template per state (icons or sensors):

```yaml
entities:
  - entity_id: binary_sensor.window
    label: Window
    states:
      - state: 'on'
        icon_color: orange
        label: "Open · {{ states('sensor.outdoor_temperature') }}°"
      - state: 'off'
        icon_color: green
        label: Closed
```

## Threshold-based template label

Numeric thresholds can also use templates for the label that appears when the row matches:

```yaml
entities:
  - entity_id: sensor.living_room_temperature
    label: Temp
    thresholds:
      - threshold: 75
        operator: gte
        icon_color: red
        label: "Hot {{ states('sensor.living_room_temperature') | round(0) }}°"
      - threshold: 60
        operator: gte
        icon_color: green
        label: "OK {{ states('sensor.living_room_temperature') | round(0) }}°"
```

## Tips

- **Detection**: Only strings containing `{{` or `{%` are sent to the template engine. Plain text is never parsed as Jinja.
- **Context**: Templates use the row’s `entity_id` as template context (same as many HA cards).
- **Badges**: Badge templates use the badge entity, which defaults to the parent entity unless `badges[].entity_id` is set.
- **Editor**: In the UI editor, the label field uses the template selector with optional preview.
- **Performance**: Each templated label holds one `render_template` subscription. Use templates where they add value; static labels are cheaper.
- **Errors**: Invalid templates are logged in the browser console; the label may stay empty until the template is fixed.

## Related documentation

- [Entity labels](ENTITY-CONFIGURATION.md#entity-labels) — feature flag, priority, attributes
- [Sensor labels](SENSOR-CONFIGURATION.md#labels-for-sensors) — sensor-specific behavior
- [Badge labels](BADGE-CONFIGURATION.md#badge-text) — text badges and template examples
- [State-based styling](ENTITY-COLOR-CONFIGURATION.md#3-state-based-colors-and-icons) — colors, icons, and labels per state
- [Threshold styling](ENTITY-COLOR-CONFIGURATION.md#4-threshold-based-colors-and-icons) — numeric thresholds and labels
