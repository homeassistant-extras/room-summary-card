import type { Config, Features } from '@type/config';
import type { EntityFeatures } from '@type/config/entity';
import type { EntityInformation } from '@type/room';
import memoizeOne from 'memoize-one';

/**
 * Determines if a specified feature is enabled in the provided configuration
 *
 * @param config - The configuration object containing feature flags
 * @param feature - The specific feature to check for
 * @returns True if the feature is enabled, false otherwise
 */
export const hasFeature = memoizeOne(
  (config: Config, feature: Features): boolean =>
    !config || config.features?.includes(feature) || false,
);

/**
 * Determines if a specified feature is enabled in the provided configuration
 *
 * @param config - The configuration object containing feature flags
 * @param feature - The specific feature to check for
 * @returns True if the feature is enabled, false otherwise
 */
export const hasEntityFeature = memoizeOne(
  (entity: EntityInformation, feature: EntityFeatures): boolean =>
    !entity || entity.config.features?.includes(feature) || false,
);
