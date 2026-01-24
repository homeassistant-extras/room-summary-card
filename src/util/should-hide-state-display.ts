import { ensureArray } from '@hass/common/array/ensure-array';
import {
  DEFAULT_STATE_CONTENT_DOMAINS,
  HIDDEN_ZERO_ATTRIBUTES_DOMAINS,
} from '@hass/state-display/state-display';
import type { EntityState } from '@type/room';

/**
 * Determines if the state display should be hidden when the entity is in an inactive state
 * and all zero-attribute domains in the content are 0 or null.
 *
 * This mirrors Home Assistant's state-display component behavior: it processes all content
 * items and filters out zero-attribute domains with zero values. If all such attributes
 * are filtered out and the entity is inactive, we hide the display to prevent redundant
 * "off" or "closed" text when the icon already indicates the state visually.
 *
 * @param {EntityState} state - The entity state to check
 * @returns {boolean} True if the state display should be hidden, false otherwise
 */
export function shouldHideStateDisplayWhenInactive(
  state: EntityState,
): boolean {
  const { domain, state: entityState, attributes } = state;

  // Only apply to domains that have zero-attribute hiding logic
  const hiddenZeroAttributes = HIDDEN_ZERO_ATTRIBUTES_DOMAINS[domain];
  if (!hiddenZeroAttributes) {
    return false;
  }

  // Get the default content for this domain
  const defaultContent = DEFAULT_STATE_CONTENT_DOMAINS[domain];
  if (!defaultContent) {
    return false;
  }

  // Handle array content (e.g., cover: ["state", "current_position"])
  const contentArray = ensureArray(defaultContent);

  // Find all attributes in the content array that are in the hidden zero attributes list
  // These are the attributes that would be filtered out if they're 0/null
  const zeroAttributesInContent = contentArray.filter((attr) =>
    hiddenZeroAttributes.includes(attr),
  );

  // If no zero-attribute domains are in the content, we can't determine if we should hide
  if (zeroAttributesInContent.length === 0) {
    return false;
  }

  // Check if ALL zero-attribute domains in content would be filtered out
  // Per Home Assistant's logic: returns undefined if attribute == null OR
  // (attribute is in HIDDEN_ZERO_ATTRIBUTES_DOMAINS and !attribute)
  const allZeroAttributesFiltered = zeroAttributesInContent.every((attr) => {
    const attributeValue = attributes[attr];
    // Matches Home Assistant's condition: attribute == null || (!attribute for hidden domains)
    return attributeValue == null || !attributeValue;
  });

  if (!allZeroAttributesFiltered) {
    // Some zero-attribute domains have non-zero values, so they would be shown
    return false;
  }

  // All zero-attribute domains are filtered out
  // Home Assistant would either show "state" (if in content) or fall back to state
  // In both cases, if entity is inactive, we want to hide to avoid redundant "off"/"closed"
  const isInactive =
    (domain === 'light' || domain === 'fan') && entityState === 'off';
  const isClosed =
    (domain === 'cover' || domain === 'valve') && entityState === 'closed';

  return isInactive || isClosed;
}
