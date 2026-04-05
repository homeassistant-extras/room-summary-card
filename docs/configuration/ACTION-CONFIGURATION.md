# Action Configuration

Actions follow the standard [Home Assistant configuration](https://www.home-assistant.io/dashboards/actions/).

## Card-level actions and split tap

The **info area** is the room name and area statistics (left/text side of the card).

The card exposes an **`actions`** block on the **root config** (not inside `entity`). Those actions apply only to the **info** region. They are merged **on top of** the main room entity’s `tap_action` / `hold_action` / `double_tap_action` for that region.

That lets you **split** behavior:

- **Info area** (title & stats): use `actions` (for example navigate to a sub-view).
- **Main room entity** (icon): use `entity.tap_action` (for example toggle a light).

Without `actions`, the info area uses the same action configuration as the main room entity.

```yaml
type: custom:room-summary-card
area: office
actions:
  tap_action:
    action: navigate
    navigation_path: /dashboard/office
entity:
  entity_id: light.office_ceiling
  icon: mdi:laptop
  tap_action:
    action: toggle
```

Configure card-level interactions in the visual editor under **Interactions** (`tap_action`, `double_tap_action`, `hold_action`). The legacy top-level **`navigate`** shortcut is not exposed there; use `actions` instead (see below).

## Deprecated navigate

The root-level **`navigate: string`** property is **deprecated** in favor of:

```yaml
actions:
  tap_action:
    action: navigate
    navigation_path: <same path as navigate>
```

Existing YAML using `navigate` **continues to work** at runtime. The editor no longer includes a field for `navigate`; new configurations should use `actions`. `navigate` may be removed in a future major version.

---

## Standard Home Assistant action types

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

Root-level **`actions`** apply here the same way they do for the room name / stats: they are merged on top of the main room entity’s action config. So with both **`features: [full_card_actions]`** and **`actions`**, taps on the overlay use the merged behavior (for example navigate from **`actions.tap_action`** while **`entity.tap_action`** still controls only the room icon).

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
