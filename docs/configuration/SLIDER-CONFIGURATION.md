# Slider Configuration

The slider feature displays the first entity as a draggable vertical slider, allowing you to control brightness by dragging the entity icon up and down. This is particularly useful for light entities where you want quick brightness adjustment without opening a more-info dialog.

![slider](../../assets/slider.gif)

## Basic Setup

Enable the slider feature and optionally configure the track style:

```yaml
type: custom:room-summary-card
area: living_room
features:
  - slider
slider_style: minimalist
entity: light.living_room_main
```

## Features

- **Drag to Control**: Drag the entity icon (or bar) vertically to adjust brightness (0-255)
- **Visual Feedback**: Icon position or bar fill reflects current brightness level
- **Touch Support**: Works with both mouse and touch interactions
- **Multiple Styles**: Choose from 13 different track visual styles
- **Automatic Entity Selection**: Uses the first entity from your entity list
- **Color-Aware Bar Style**: Bar style automatically uses the light's color for visual feedback

## How It Works

When the `slider` feature is enabled:

1. The card displays only the **first entity** as a draggable slider
2. The entity icon can be dragged vertically along a track
3. Dragging up increases brightness, dragging down decreases it
4. The icon position reflects the current brightness level
5. Other entities in the area are not displayed (only the slider entity)

**Note**: The slider works best with light entities that support brightness control. The brightness value (0-255) is mapped to the vertical position (0-100%).

## Slider Styles

The `slider_style` option controls the visual appearance of the track. Choose from these options:

### `minimalist` (Default)

Clean, minimal track with no visible elements:

```yaml
slider_style: minimalist
```

### `track`

Sunken track with depth and shadow effects:

```yaml
slider_style: track
```

### `line`

Thin vertical line for a subtle appearance:

```yaml
slider_style: line
```

### `filled`

Progress bar style that shows the current brightness level:

```yaml
slider_style: filled
```

The filled area grows from bottom to top as brightness increases.

### `gradient`

Gradient line effect with smooth color transitions:

```yaml
slider_style: gradient
```

### `dual-rail`

Two parallel lines for a modern look:

```yaml
slider_style: dual-rail
```

### `dots`

Dotted track with ticks at regular intervals:

```yaml
slider_style: dots
```

### `notched`

Track with notches/indents for tactile feedback:

```yaml
slider_style: notched
```

### `grid`

Grid pattern with horizontal lines for precise visual feedback:

```yaml
slider_style: grid
```

### `glow`

Glowing line effect using the primary color:

```yaml
slider_style: glow
```

### `shadow-trail`

Shadow that follows the icon position:

```yaml
slider_style: shadow-trail
```

### `outlined`

Outlined track border with transparent fill:

```yaml
slider_style: outlined
```

### `bar`

Outlined bar filled with the light's color based on brightness level. The icon is hidden, and the entire bar is draggable. The fill color automatically matches the light's current color (RGB color, on_color, or theme color):

```yaml
slider_style: bar
```

The bar fills from bottom to top as brightness increases, using the entity's color for visual feedback.

## Configuration Options

| Option         | Type    | Default      | Description                                 |
| -------------- | ------- | ------------ | ------------------------------------------- |
| `slider`       | feature | Not enabled  | Enable slider mode (add to `features` list) |
| `slider_style` | string  | `minimalist` | Visual style of the slider track            |

## Examples

### Basic Slider

Simple slider with default minimalist style:

```yaml
type: custom:room-summary-card
area: living_room
features:
  - slider
entity: light.living_room_main
```

### Slider with Filled Track

Progress bar style showing brightness level:

```yaml
type: custom:room-summary-card
area: bedroom
features:
  - slider
slider_style: filled
entity: light.bedroom_ceiling
```

### Slider with Glow Effect

Modern glowing track style:

```yaml
type: custom:room-summary-card
area: office
features:
  - slider
slider_style: glow
entity: light.office_desk
```

### Slider with Bar Style (No Icon)

Bar style with color fill - perfect for a clean, modern look:

```yaml
type: custom:room-summary-card
area: living_room
features:
  - slider
slider_style: bar
entity: light.living_room_main
```

The bar automatically uses the light's color (RGB color, on_color, or theme color) for the fill.

### Slider with Custom Entity Configuration

Configure the slider entity with custom icon and colors:

```yaml
type: custom:room-summary-card
area: living_room
features:
  - slider
slider_style: gradient
entity:
  entity_id: light.living_room_main
  icon: mdi:ceiling-light
  on_color: warm_white
  off_color: grey
```

### Slider with Background Image

Combine slider with background images:

```yaml
type: custom:room-summary-card
area: bedroom
features:
  - slider
slider_style: filled
entity: light.bedroom_ceiling
background:
  image: /local/images/bedroom.jpg
  opacity: 30
```

### Slider with Occupancy Detection

Combine slider with occupancy detection:

```yaml
type: custom:room-summary-card
area: living_room
features:
  - slider
slider_style: shadow-trail
entity: light.living_room_main
occupancy:
  entities:
    - binary_sensor.living_room_motion
  card_border_color: '#4CAF50'
```

## Entity Selection

The slider feature uses the **first entity** from your entity list. The entity selection follows this priority:

1. **Explicit `entity` configuration** - If you specify an `entity`, it will be used
2. **First entity from `entities` array** - If you have an `entities` array, the first one is used
3. **Auto-discovered room light** - Falls back to the default room light entity

**Important**: When slider is enabled, only the first entity is displayed. Other entities in the area are not shown.

## Interaction

### Mouse/Trackpad

- **Click and drag** the entity icon up or down
- Release to set the brightness level
- The icon position updates in real-time as you drag

### Touch

- **Touch and drag** the entity icon up or down
- Lift finger to set the brightness level
- Works on mobile devices and tablets

## Brightness Mapping

The slider maps brightness values as follows:

- **Top position (0%)** = Maximum brightness (255)
- **Bottom position (100%)** = Minimum brightness (0)
- **Middle position (50%)** = Medium brightness (~128)

The icon position automatically updates when the entity brightness changes externally (e.g., from another control or automation).

## Troubleshooting

### Slider Not Appearing

If the slider doesn't appear:

1. Verify `slider` is in the `features` list
2. Check that you have at least one entity configured or auto-discovered
3. Ensure the entity supports brightness control (light entities)

### Brightness Not Changing

If dragging doesn't change brightness:

1. Verify the entity supports brightness control
2. Check that the entity is not in a locked or unavailable state
3. Ensure you have proper permissions to control the entity

### Wrong Entity Displayed

If the wrong entity is shown:

1. Specify the desired entity explicitly using the `entity` configuration
2. Ensure it's the first entity in your `entities` array if using multiple entities
3. Use `exclude_default_entities` if you want to prevent auto-discovery

### Style Not Applying

If the slider style doesn't change:

1. Verify `slider_style` is spelled correctly (use hyphens, e.g., `shadow-trail`)
2. Check that the `slider` feature is enabled
3. Try refreshing the card or restarting Home Assistant

## Best Practices

1. **Use with Light Entities**: The slider works best with light entities that support brightness
2. **Choose Appropriate Style**: Select a track style that matches your dashboard theme
3. **Combine with Other Features**: Slider works well with background images and occupancy detection
4. **Consider Touch Users**: The slider is great for touch dashboards where quick brightness control is needed
5. **Single Entity Focus**: Remember that only one entity is displayed when slider is enabled

## Limitations

- Only displays the first entity (other entities are hidden)
- Works best with light entities that support brightness
- Requires entities with brightness attribute (0-255 range)
- Touch interactions may be less precise on very small screens
