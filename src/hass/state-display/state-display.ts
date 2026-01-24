/**
 * https://github.com/home-assistant/frontend/blob/dev/src/state-display/state-display.ts
 */

// Attributes that should not be shown if their value is 0 */
export const HIDDEN_ZERO_ATTRIBUTES_DOMAINS: Record<string, string[]> = {
  valve: ['current_position'],
  cover: ['current_position'],
  fan: ['percentage'],
  light: ['brightness'],
};

type StateContent = string | string[];

export const DEFAULT_STATE_CONTENT_DOMAINS: Record<string, StateContent> = {
  climate: ['state', 'current_temperature'],
  cover: ['state', 'current_position'],
  fan: 'percentage',
  humidifier: ['state', 'current_humidity'],
  light: 'brightness',
  timer: 'remaining_time',
  update: 'install_status',
  valve: ['state', 'current_position'],
};
