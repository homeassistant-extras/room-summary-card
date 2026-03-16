# Action Configuration

Actions follow the standard [Home Assistant configuration](https://www.home-assistant.io/dashboards/actions/). Available actions for `tap_action`, `hold_action`, and `double_tap_action`:

| Action         | Parameters                   | Description                         |
| -------------- | ---------------------------- | ----------------------------------- |
| none           | none                         | No action (default for hold/double) |
| more-info      | none                         | Show more info dialog               |
| toggle         | none                         | Toggle entity state                 |
| navigate       | navigation_path              | Navigate to a different view        |
| url            | url_path                     | Open a URL                          |
| perform-action | perform_action, data, target | Call a service                      |
| assist         | pipeline_id, start_listening | Open voice assistant                |

### Action Examples

```yaml
tap_action:
  action: navigate
  navigation_path: /lovelace/living-room

hold_action:
  action: more-info

double_tap_action:
  action: none
```

```yaml
# Open a URL
tap_action:
  action: url
  url_path: https://example.com

# Call a service
tap_action:
  action: perform-action
  perform_action: light.turn_on
  target:
    entity_id: light.living_room

# Open voice assistant
tap_action:
  action: assist
```

## Full Card Actions

The `full_card_actions` feature allows you to make the entire card clickable, creating a larger touch target for your configured actions. When enabled, an invisible overlay covers the entire card, making it easier to interact with on mobile devices or when quickly navigating your dashboard.

### Enabling Full Card Actions

To enable full card actions, add the `full_card_actions` feature to your configuration:

```yaml
type: custom:room-summary-card
area: living_room
features:
  - full_card_actions
entity:
  entity_id: light.living_room
  tap_action:
    action: navigate
    navigation_path: /lovelace/living-room
  hold_action:
    action: more-info
```

With this configuration, tapping anywhere on the card will navigate to `/lovelace/living-room`, and holding will show the more-info dialog for the room entity.

### Use Cases

- **Navigation cards**: Make entire cards clickable for easy room navigation and disable the smaller entities
- **Mobile-friendly**: Larger touch targets improve usability on phones and tablets
- **Dashboard shortcuts**: Quick access to room-specific views or controls
