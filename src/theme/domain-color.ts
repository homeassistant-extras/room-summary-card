/**
 * Maps Home Assistant domains to their conventional active state colors
 * Returns a color name from the standard HA_COLORS list
 *
 * @param domain - The Home Assistant domain (e.g., 'light', 'switch', 'cover')
 * @returns Color name from HA_COLORS (e.g., 'amber', 'blue')
 */
export const activeColorFromDomain = (domain: string | undefined) => {
  switch (domain) {
    // Lighting
    case 'light':
    case 'switch_as_x':
      return 'yellow';

    // Switches & Electric
    case 'switch':
    case 'input_boolean':
    case 'automation':
    case 'script':
      return 'blue';

    // Climate & Environment
    case 'climate':
    case 'fan':
      return 'teal';

    // Security & Safety
    case 'alarm_control_panel':
    case 'lock':
      return 'red';

    // Covers & Doors
    case 'cover':
    case 'garage_door':
    case 'door':
      return 'green';

    // Media
    case 'media_player':
      return 'indigo';

    // Sensors & Binary Sensors
    case 'binary_sensor':
    case 'sensor':
      return 'cyan';

    // Person & Presence
    case 'person':
    case 'device_tracker':
      return 'purple';

    // Weather & Update
    case 'weather':
    case 'update':
      return 'orange';

    // Vacuum
    case 'vacuum':
      return 'deep-purple';

    // Timer & Schedule
    case 'timer':
    case 'schedule':
      return 'pink';

    // Default for unknown domains
    default:
      return 'yellow';
  }
};
