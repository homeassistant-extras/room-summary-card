/**
 * Configuration utilities for feature flag management
 */
import type { Config, Features } from '@type/config';

/**
 * Determines if a specified feature is enabled in the provided configuration
 *
 * @param config - The configuration object containing feature flags
 * @param feature - The specific feature to check for
 * @returns True if the feature is enabled, false otherwise
 *
 * @example
 * // Check if the 'DARK_MODE' feature is enabled
 * const isDarkModeEnabled = hasFeature(appConfig, 'DARK_MODE');
 *
 * @remarks
 * - Returns false if config is null or undefined
 * - Returns false if the features array doesn't exist or doesn't include the specified feature
 */
export const hasFeature = (config: Config, feature: Features): boolean =>
  !config || config.features?.includes(feature) || false;
