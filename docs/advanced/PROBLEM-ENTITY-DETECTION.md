## Problem Entity Detection

The card can automatically detect and monitor "problem" entities in your areas using Home Assistant labels.

### Setting Up Problem Detection

1. **Label entities** with "problem" in Home Assistant:
   - Go to Settings → Areas & Labels
   - Create or edit labels
   - Add "problem" label to relevant entities

2. **Area assignment**: Problem entities must be in the same area as the card, either:
   - Directly assigned to the area
   - Belong to a device assigned to the area

![Problem Label Setup](../../assets/problem-label.png)

### How It Works

The card automatically:

- Finds entities with "problem" label in the specified area
- Checks if any are currently active using `stateActive()` function
- Displays a counter with the total number of problem entities
- Shows green indicator if no problems are active
- Shows red indicator if any problems are active

![Problem Indicator](../../assets/problems.png)

### Example Problem Entities

Common entities to label as "problem":

- Smoke detectors (`binary_sensor.smoke_detector`)
- Water leak sensors (`binary_sensor.water_leak`)
- Door/window sensors (`binary_sensor.front_door`)
- Low battery sensors (`sensor.device_battery`)
- Offline device indicators
