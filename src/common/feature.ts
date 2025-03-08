/**
 * @fileoverview Feature checker utility for configuration management
 * This module provides functionality to check if specific features are enabled
 * in a given configuration object.
 */

import type { Config, Features } from '@type/config';

export const hasFeature = (config: Config, feature: Features): boolean =>
  !config || config.features?.includes(feature) || false;
