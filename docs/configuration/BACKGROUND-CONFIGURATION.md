## Background Configuration

Customize the card's background appearance with images and effects:

```yaml
background:
  image: /local/images/living-room.jpg # Custom image path/URL
  image_entity: image.living_room_camera # Dynamic image from entity
  opacity: 30 # Opacity percentage (0-100)
  options:
    - disable # Disable background images entirely
```

### Background Options

| Name         | Type   | Default | Description                                                   |
| ------------ | ------ | ------- | ------------------------------------------------------------- |
| image        | string | none    | URL or path to background image                               |
| image_entity | string | none    | Entity ID for dynamic background (image, person, camera)      |
| opacity      | number | auto    | Background opacity percentage (0-100)                         |
| options      | array  | none    | Array with 'disable' to turn off background images completely |

### Background Priority

The card uses background images in this priority order:

1. **image_entity**: Dynamic image from specified entity's `entity_picture`
2. **image**: Custom image URL or path
3. **area picture**: Area's picture attribute (automatic fallback)

### Background Examples

#### Custom Background Image

```yaml
type: custom:room-summary-card
area: living_room
background:
  image: /local/images/living-room.jpg
  opacity: 25
```

#### Dynamic Background from Person Entity

```yaml
type: custom:room-summary-card
area: bedroom
background:
  image_entity: person.john
  opacity: 40
```

#### Using Camera Feed as Background

```yaml
type: custom:room-summary-card
area: garage
background:
  image_entity: camera.garage_cam
  opacity: 20
```

#### Disable Background Images

```yaml
type: custom:room-summary-card
area: office
background:
  options:
    - disable
```
