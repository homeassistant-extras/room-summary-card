# Ignore Entity Feature

The `ignore_entity` feature flag allows you to ignore a custom entity configuration and use the default room entity instead.

## Use Case

This feature is particularly useful when using the `auto-entities` card to automatically generate room cards. It allows you to specify an entity in the auto-entities configuration for filtering or sorting purposes, while still using the default room entity for the card display.

## Example

```yaml
type: custom:auto-entities
entities:
  - entity: person.gina
    type: custom:room-summary-card
    area: dining_room
    features:
      - ignore_entity
  - entity: input_boolean.gina_mute
    type: custom:room-summary-card
    area: living_room
    features:
      - ignore_entity
sort:
  method: state
  reverse: true
```

In this example, the cards are filtered and sorted based on the specified entities (`person.gina` and `input_boolean.gina_mute`), but the card will display using the default room entity (`light.{area}_light`) instead of the specified entity.

## How It Works

When `ignore_entity` is enabled:

- The `entity` configuration is ignored
- The card uses the default room entity based on the area (`light.{area}_light`)
- The card displays with the default room icon and behavior
