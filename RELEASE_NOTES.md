# Camera Feeds Update & Backgrounds Revamped :hamster::cake:

## Smoother, More Reliable Backgrounds

### 🖼️ Background Images No Longer Flicker

Background images (including camera feeds, `image.*` entities, and photos) are now handled the same way Home Assistant's own picture and area cards handle them. This should fix a flicker some users saw when the card updated, and camera backgrounds now refresh automatically about every 10 seconds instead of only loading once.

This is a larger change to the card's core background logic. If you notice anything odd with your background images after updating, please open an issue.

Benefits

- No random flickers (maybe the loat at first only)
- Less logic during frequent hass updates
- Camera isn't loading feed while off screen for performance

Things I tried not to break... (so many features over the years)

- Backgrounds themselves... my before & after dashboards looked solid

Things that will probably break

- Custom or unsupported CSS selectors you're using
- `card_mod` that was doing things to backgrounds

### 📸 Cameras Can Now Be Selected in the Editor

The visual editor's background image entity picker now includes camera entities, so you no longer need to type the entity ID by hand when using a camera as a background.
