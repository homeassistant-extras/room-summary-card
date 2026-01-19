import type { BadgeConfig } from '@type/config/entity';

/**
 * Generates a unique key for a badge item in a list
 */
export function getKey(item: BadgeConfig, index: number): string {
  return `badge-${index}`;
}

/**
 * Recursively removes empty string values from an object
 */
export function cleanEmptyStrings(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip empty strings
    if (value === '') continue;
    // Recursively clean nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const cleanedValue = cleanEmptyStrings(value);
      if (Object.keys(cleanedValue).length > 0) {
        cleaned[key] = cleanedValue;
      }
    } else if (Array.isArray(value)) {
      const cleanedArray = value
        .map((item) => cleanEmptyStrings(item))
        .filter((item) => item !== '');
      if (cleanedArray.length > 0) {
        cleaned[key] = cleanedArray;
      }
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Generates a display title for a badge based on its configuration
 */
export function getBadgeTitle(badge: BadgeConfig): string {
  if (badge.mode === 'show_always') {
    return `Show Always (${badge.position || 'top_right'})`;
  }
  if (badge.mode === 'if_match') {
    return `If Match (${badge.position || 'top_right'})`;
  }
  if (badge.mode === 'homeassistant') {
    return `Home Assistant (${badge.position || 'top_right'})`;
  }
  if (badge.states && badge.states.length > 0) {
    return `States (${badge.states.length}) - ${badge.position || 'top_right'}`;
  }
  return `Badge ${badge.position || 'top_right'}`;
}
