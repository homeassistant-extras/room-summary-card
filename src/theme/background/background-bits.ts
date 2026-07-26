import { hasFeature } from '@homeassistant-extras/hass/common/config/feature';
import type { HassEntity } from '@homeassistant-extras/hass/ws/types';
import type { Config } from '@type/config';

/**
 * Calculates the opacity value for the background.
 *
 * Emits a single `--user-opacity` variable derived from `config.background.opacity`:
 * - When the config value is a number it's interpreted as a percentage (0-100).
 * - When the config value is a string it's treated as an entity_id; the caller
 *   should subscribe to that entity and pass its current `state` here. The
 *   sensor's range is auto-detected: states with a `%` unit_of_measurement or
 *   a value above 1 are treated as 0-100 percentages, otherwise the value is
 *   used directly as 0-1 (e.g. an occupancy probability sensor). The result
 *   is clamped defensively.
 *
 * `room-background-image` calls this and sets the vars on its own host;
 * its CSS (plus room-state-icon's routing rule) then sends the value to
 * either the card color layer or the icon fill based on which layer
 * reflects the `[icon-bg]` attribute.
 */
export const getBackgroundOpacity = (
  config: Config,
  active: boolean,
  state?: HassEntity,
) => {
  const skipStyles = hasFeature(config, 'skip_entity_styles');
  const raw = config.background?.opacity;

  let opacity: number | undefined;
  if (typeof raw === 'number' && raw) {
    opacity = raw / 100;
  } else if (typeof raw === 'string' && state) {
    const parsed = Number.parseFloat(state.state);
    if (Number.isFinite(parsed)) {
      const isPercent =
        state.attributes.unit_of_measurement === '%' || parsed > 1;
      opacity = Math.max(0, Math.min(1, isPercent ? parsed / 100 : parsed));
    }
  }

  return {
    '--user-opacity': opacity,
    '--background-opacity-card': `var(--opacity-background-${active && !skipStyles ? 'active' : 'inactive'})`,
  };
};
