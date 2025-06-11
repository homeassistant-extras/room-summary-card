import type { CategoryType, IconResources } from '@hass/data/icon';
import type { HomeAssistant } from '@hass/types';
import memoizeOne from 'memoize-one';

/**
 * Retrieves icon resources for a specific entity component category from Home Assistant.
 *
 * This function is memoized to avoid redundant WebSocket calls for the same Home Assistant instance.
 *
 * @param hass - The Home Assistant instance used to make the WebSocket call.
 * @returns A promise that resolves to the icon resources for the specified category.
 */
export const getIconResources = memoizeOne((hass: HomeAssistant) =>
  hass.callWS<IconResources<CategoryType['entity_component']>>({
    type: 'frontend/get_icons',
    category: 'entity_component',
  }),
);
