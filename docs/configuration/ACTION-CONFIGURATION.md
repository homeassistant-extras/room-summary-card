## Action Configuration

Available actions for `tap_action`, `hold_action`, and `double_tap_action`:

| Action    | Parameters      | Description                  |
| --------- | --------------- | ---------------------------- |
| toggle    | none            | Toggle entity state          |
| more-info | none            | Show more info dialog        |
| navigate  | navigation_path | Navigate to a different view |
| none      | none            | Disable the action           |

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
