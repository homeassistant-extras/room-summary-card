import { activeColorFromDomain } from './domain-color';
import { homeAssistantColors, minimalistColors } from './themes';

/**
 * Processes minimalist theme colors
 */
export const processMinimalistColors = (
  iconColor: string,
  onColor: string | undefined,
  offColor: string | undefined,
  domain: string | undefined,
  active: boolean | undefined,
): string | undefined => {
  if (iconColor && minimalistColors.includes(iconColor)) {
    return `rgb(var(--color-${iconColor}))`;
  }

  const color = active ? (onColor ?? activeColorFromDomain(domain)) : offColor;
  if (color && minimalistColors.includes(color)) {
    return `rgb(var(--color-${color}))`;
  }

  return undefined;
};

/**
 * Processes Home Assistant fallback colors
 */
export const processHomeAssistantColors = (
  iconColor: string | undefined,
  onColor: string = '',
  offColor: string = '',
  active: boolean = false,
): string | undefined => {
  if (iconColor && homeAssistantColors.includes(iconColor)) {
    return `var(--${iconColor}-color)`;
  }
  if (active && onColor && homeAssistantColors.includes(onColor)) {
    return `var(--${onColor}-color)`;
  }
  if (!active && offColor && homeAssistantColors.includes(offColor)) {
    return `var(--${offColor}-color)`;
  }

  return iconColor;
};
