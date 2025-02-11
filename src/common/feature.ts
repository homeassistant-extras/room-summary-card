/**
 * @fileoverview Feature checker utility for configuration management
 * This module provides functionality to check if specific features are enabled
 * in a given configuration object.
 */

import type { Config, Features } from '@type/config';

/**
 * Checks if a specific feature is enabled in the provided configuration.
 *
 * @param {Config} config - The configuration object to check. Can be undefined/null.
 * @param {Features} feature - The feature to check for.
 * @returns {boolean} True if:
 *   1. The config is null/undefined (fallback to enabled), OR
 *   2. The feature exists in config.features array
 *   Returns false otherwise.
 *
 * @example
 * const config = { features: ['darkMode', 'notifications'] };
 * feature(config, 'darkMode'); // returns true
 * feature(config, 'analytics'); // returns false
 * feature(null, 'anything'); // returns true
 */
export const feature = (config: Config, feature: Features): boolean =>
  !config || config.features?.includes(feature) || false;
