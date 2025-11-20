import { hasFeature } from '@config/feature';
import type { Config } from '@type/config';

/**
 * Calculates the opacity value for the background
 */
export const getBackgroundOpacity = (config: Config, active: boolean) => {
  const skipStyles = hasFeature(config, 'skip_entity_styles');
  const isIconBackground =
    config.background?.options?.includes('icon_background') ?? false;

  // Only apply opacity to card if icon_background is NOT set
  const opacity =
    !isIconBackground && config.background?.opacity
      ? config.background.opacity / 100
      : undefined;

  return {
    '--opacity-theme': opacity,
    '--background-opacity-card': `var(--opacity-background-${active && !skipStyles ? 'active' : 'inactive'})`,
  };
};
