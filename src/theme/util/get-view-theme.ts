import type { HomeAssistant } from '@hass/types';

/**
 * Gets the view theme by traversing up the DOM from the given element to find hui-view-container.
 * Falls back to the global theme if no view theme is set or if no element is provided.
 *
 * @param element - The DOM element to start traversing from. If null/undefined, returns global theme.
 * @param hass - The Home Assistant instance
 * @returns The view theme name, or undefined if not found
 */
export const getViewTheme = (
  element: Element | null | undefined,
  hass: HomeAssistant,
): string | undefined => {
  // If no element provided, fall back to global theme
  if (!element) {
    return hass.themes?.theme;
  }

  // Traverse up the DOM to find hui-view-container
  let currentElement: Element | null = element;

  while (currentElement && currentElement !== document.body) {
    // Check if this is the hui-view-container
    if (currentElement.tagName === 'HUI-VIEW-CONTAINER') {
      const viewContainer = currentElement as any;
      // Return the view theme if set, otherwise fall back to global theme
      return viewContainer.theme || hass.themes?.theme;
    }

    // Move up the DOM tree, handling shadow DOM boundaries
    if (currentElement.parentElement) {
      currentElement = currentElement.parentElement;
    } else if (
      typeof currentElement.getRootNode === 'function' &&
      typeof ShadowRoot !== 'undefined'
    ) {
      const root = currentElement.getRootNode();
      currentElement = root instanceof ShadowRoot ? root.host : null;
    } else {
      // No parent and can't traverse shadow DOM, stop here
      currentElement = null;
    }
  }

  // Fallback to global theme if view container not found
  return hass.themes?.theme;
};
