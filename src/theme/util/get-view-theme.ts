import type { HomeAssistant } from '@hass/types';

/**
 * Module-level cache mapping a calling element to its resolved
 * `hui-view-container`. Keyed weakly so entries vanish when cards are GC'd.
 * On a stale entry (container detached), we fall back to a fresh walk.
 */
const containerCache = new WeakMap<Element, Element>();

/**
 * Walks one step up the DOM, crossing shadow root boundaries via `host`.
 */
const stepUp = (element: Element): Element | null => {
  if (element.parentElement) return element.parentElement;
  if (
    typeof element.getRootNode === 'function' &&
    typeof ShadowRoot !== 'undefined'
  ) {
    const root = element.getRootNode();
    return root instanceof ShadowRoot ? root.host : null;
  }
  return null;
};

/**
 * Walks up from `element` until a `hui-view-container` is found, or the walk
 * runs off the top of the document.
 */
const findViewContainer = (element: Element): Element | null => {
  let current: Element | null = element;
  while (current && current !== document.body) {
    if (current.tagName === 'HUI-VIEW-CONTAINER') return current;
    current = stepUp(current);
  }
  return null;
};

/**
 * Gets the view theme by traversing up the DOM from the given element to find hui-view-container.
 * Falls back to the global theme if no view theme is set or if no element is provided.
 *
 * Subsequent calls for the same element reuse the cached container reference, avoiding the
 * walk. The container's `.theme` property is read live, so HA mutating it in place when the
 * user changes the view's theme is reflected without invalidation.
 *
 * @param element - The DOM element to start traversing from. If null/undefined, returns global theme.
 * @param hass - The Home Assistant instance
 * @returns The view theme name, or undefined if not found
 */
export const getViewTheme = (
  element: Element | null | undefined,
  hass: HomeAssistant,
): string | undefined => {
  if (!element) return hass.themes?.theme;

  let container = containerCache.get(element);
  if (!container?.isConnected) {
    container = findViewContainer(element) ?? undefined;
    if (container) containerCache.set(element, container);
    else containerCache.delete(element);
  }

  if (!container) return hass.themes?.theme;
  return (container as any).theme || hass.themes?.theme;
};
