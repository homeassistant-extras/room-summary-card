import { createComputeLabel } from '@homeassistant-extras/hass/localize/ha-form';
import { localize } from '@localize/localize';

/** Pre-configured ha-form `computeLabel` callback using card translations. */
export const computeLabel = createComputeLabel(localize);
