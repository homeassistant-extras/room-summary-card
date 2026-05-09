import type { HomeAssistant } from '@hass/types';

/**
 * WeakMap cache for DOM traversal results.
 * Maps an element to the cached hui-view-container reference (or null if not found).
 * Using WeakMap so that entries are garbage-collected when elements are removed from DOM.
 */
const viewContainerCache = new WeakMap<Element, Element | null>();

/**
 * Gets the view theme by traversing up the DOM from the given element to find hui-view-container.
 * Falls back to the global theme if no view theme is set or if no element is provided.
 *
 * The DOM traversal result is cached per element since the view container does not
 * change between renders. The theme name is still read live from the container on
 * each call, so theme switches are picked up immediately.
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

  // Check cache for the view container
  if (viewContainerCache.has(element)) {
    const cachedContainer = viewContainerCache.get(element);
    if (cachedContainer) {
      return (cachedContainer as any).theme || hass.themes?.theme;
    }
    // Cached as null = no container found previously
    return hass.themes?.theme;
  }

  // Traverse up the DOM to find hui-view-container
  let currentElement: Element | null = element;

  while (currentElement && currentElement !== document.body) {
    // Check if this is the hui-view-container
    if (currentElement.tagName === 'HUI-VIEW-CONTAINER') {
      // Cache the container reference for this element
      viewContainerCache.set(element, currentElement);
      return (currentElement as any).theme || hass.themes?.theme;
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

  // Cache null result = no container found
  viewContainerCache.set(element, null);

  // Fallback to global theme if view container not found
  return hass.themes?.theme;
};
