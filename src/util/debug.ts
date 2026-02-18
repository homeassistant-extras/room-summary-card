import type { Config } from '@type/config';

/**
 * Logs debug messages to the console when config.debug is present.
 * Supports scoping by component and/or category.
 *
 * @param config - The configuration object. When undefined, no logging occurs.
 * @param component - Component name (e.g. 'room-summary-card')
 * @param category - Category (e.g. 'render', 'set hass')
 * @param args - Additional data to log
 */
export const d = (
  config: Config | undefined,
  component: string,
  category: string,
  ...args: any[]
) => {
  if (!config?.debug) return;

  const { scope, categories } = config.debug;
  if (scope?.length && !scope.includes(component)) return;
  if (categories?.length && !categories.includes(category)) return;

  console.debug(`[${component}] ${category}`, ...args);
};
