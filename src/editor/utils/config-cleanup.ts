/**
 * Utility functions for cleaning up configuration objects
 */

/**
 * Removes empty arrays from a configuration object
 * @param config - The configuration object to clean
 * @param key - The key to check for empty arrays
 */
export function cleanEmptyArrays<T extends Record<string, any>>(
  config: T,
  key: keyof T,
): void {
  const arr = config[key];
  if (Array.isArray(arr) && !arr.length) delete config[key];
}

/**
 * Removes empty properties and nested empty arrays from a configuration object
 * @param config - The configuration object to clean
 * @param key - The key to check for empty properties
 */
export function cleanEmptyProps<T extends Record<string, any>>(
  config: T,
  key: keyof T,
): void {
  const obj = config[key];
  if (!obj || typeof obj !== 'object') return;

  for (const k of Object.keys(obj)) {
    !obj[k] && delete obj[k];
    cleanEmptyArrays(obj, k);
  }
  if (!Object.keys(obj).length) delete config[key];
}
