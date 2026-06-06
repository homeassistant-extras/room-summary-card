import { hasFeature } from '@homeassistant-extras/hass/common/config/feature';
import type { Config } from '@type/config';
import type { EntityState } from '@type/room';

/**
 * Calculates the opacity value for the background.
 *
 * Emits a single `--user-opacity` variable derived from `config.background.opacity`:
 * - When the config value is a number it's interpreted as a percentage (0-100).
 * - When the config value is a string it's treated as an entity_id; the caller
 *   should subscribe to that entity and pass its current `state` here. The
 *   entity's state is expected to already be in the [0, 1] range (e.g. an
 *   occupancy probability sensor) and is clamped defensively.
 *
 * CSS in `src/theme/styles.ts` and the room-state-icon styles routes this value
 * to either the card background or the icon background based on whether the
 * main room icon has the `[icon-bg]` attribute set.
 */
export const getBackgroundOpacity = (
  config: Config,
  active: boolean,
  state?: EntityState,
) => {
  const skipStyles = hasFeature(config, 'skip_entity_styles');
  const raw = config.background?.opacity;

  let opacity: number | undefined;
  if (typeof raw === 'number' && raw) {
    opacity = raw / 100;
  } else if (typeof raw === 'string' && state) {
    const parsed = Number.parseFloat(state.state);
    if (Number.isFinite(parsed)) {
      opacity = Math.max(0, Math.min(1, parsed));
    }
  }

  return {
    '--user-opacity': opacity,
    '--background-opacity-card': `var(--opacity-background-${active && !skipStyles ? 'active' : 'inactive'})`,
  };
};
