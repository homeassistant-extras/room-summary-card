## Background Images

The card supports multiple background image sources with automatic fallbacks and full customization control.

![Background Image](../../assets/background-image.png)

### Automatic Area Pictures

When areas have pictures set in Home Assistant, the card automatically uses them as backgrounds:

```yaml
# No configuration needed - automatic if area has picture
type: custom:room-summary-card
area: living_room
```

### Custom Background Images

Override area pictures with custom images:

```yaml
type: custom:room-summary-card
area: living_room
background:
  image: /local/images/living-room.jpg
  opacity: 30 # 30% opacity
```

### Dynamic Image Entities

Use image entities for dynamic backgrounds that change based on entity state:

```yaml
type: custom:room-summary-card
area: bedroom
background:
  image_entity: person.john # Person's picture
  opacity: 40
```

```yaml
type: custom:room-summary-card
area: security_room
background:
  image_entity: camera.front_door # Live camera feed
  opacity: 25
```

### Background Priority System

The card uses images in this priority order:

1. **image_entity**: Dynamic image from entity's `entity_picture` attribute
2. **image**: Custom image URL/path from configuration
3. **area.picture**: Area's picture attribute (automatic fallback)

### Background Opacity Control

Control background transparency with automatic or manual opacity:

```yaml
background:
  image: /local/images/room.jpg
  opacity: 50 # 50% opacity (0-100 scale)
```

If no opacity is specified, the card uses theme-aware automatic opacity:

- Light mode: Adjusts opacity based on entity state
- Dark mode: Adjusts opacity based on entity state

### Disabling Background Images

Completely disable background images:

```yaml
background:
  options:
    - disable
```

Or use the feature flag:

```yaml
features:
  - hide_room_icon # Hide room icon for cleaner look
background:
  options:
    - disable
```

### Icon-Only Background

Apply background images only to the room icon area for a more subtle effect:

```yaml
background:
  image: /local/images/room.jpg
  opacity: 50
  options:
    - icon_background
```

![Icon BG](../../assets/icon-bg.png)

This creates a focused background effect where the image appears behind the room icon while keeping the rest of the card clean and readable.

#### Icon Background with Dynamic Images

```yaml
background:
  image_entity: person.family_member
  opacity: 60
  options:
    - icon_background
```

#### Icon Background with Camera Feeds

```yaml
background:
  image_entity: camera.living_room
  opacity: 40
  options:
    - icon_background
```

### Background Options

The card supports three background options:

- **`disable`**: Completely disables background images
- **`icon_background`**: Applies background only to the room icon area
- **`hide_icon_only`**: Hides only the icon content while keeping the icon container visible

You can combine these options for different effects:

````yaml
# Full card background (default)
background:
  image: /local/images/room.jpg
  opacity: 30

# Icon-only background
background:
  image: /local/images/room.jpg
  opacity: 50
  options:
    - icon_background

# No background
background:
  options:
    - disable

# Hide icon content only for camera feed (keeps icon container)
background:
  image_entity: camera.living_room
  opacity: 40
  options:
    - hide_icon_only

### Image Entity Examples

#### Person Entity Background

```yaml
type: custom:room-summary-card
area: master_bedroom
background:
  image_entity: person.john
  opacity: 35
features:
  - hide_room_icon # Clean look with person background
````

#### Camera Feed Background

```yaml
type: custom:room-summary-card
area: garage
background:
  image_entity: camera.garage_cam
  opacity: 20
```

#### Image Entity with Fallback

```yaml
type: custom:room-summary-card
area: living_room
background:
  image_entity: image.room_photo # Primary choice
  image: /local/images/fallback.jpg # Fallback if entity unavailable
  opacity: 30
```
