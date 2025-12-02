import type { Config } from '@type/config';
import type { EntityState } from '@type/room';

/**
 * Checks if the mold indicator should be shown based on threshold
 *
 * @param {EntityState} mold - The mold sensor state
 * @param {Config} config - The configuration object
 * @returns {boolean} Whether the mold indicator should be shown
 */
export const shouldShowMoldIndicator = (
  mold: EntityState,
  config: Config,
): boolean => {
  const moldThreshold = config.thresholds?.mold;

  // If no threshold is set, always show the mold indicator
  if (moldThreshold === undefined) {
    return true;
  }

  // Parse the mold state value as a number
  const moldValue = Number(mold.state);

  // If the value is not a valid number, don't show the indicator
  if (Number.isNaN(moldValue)) {
    return false;
  }

  // Show the indicator only if the mold value is at or above the threshold
  return moldValue >= moldThreshold;
};
