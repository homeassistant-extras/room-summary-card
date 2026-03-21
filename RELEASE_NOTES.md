# Skip Mold Styles 🎛️

## 🎛️ Skip Mold Styles

Added `skip_mold_styles`: keeps the mold indicator when over threshold but disables pulse/bounce/glow animations to save CPU on weak devices.

Add to your card's features:

```yaml
type: custom:room-summary-card
area: living_room
features:
  - skip_mold_styles
thresholds:
  mold: 85
```
