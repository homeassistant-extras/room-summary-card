import { hasFeature } from '@/config/feature';
import type { Config } from '@type/config';

/**
 * Logs debug messages to the console if the 'debug' feature is enabled in the configuration.
 *
 * @param config - The configuration object used to determine if debugging is enabled.
 * @param args - The arguments to be logged to the console.
 */
export const d = (config: Config, ...args: any[]) => {
  if (hasFeature(config, 'debug')) {
    console.debug(...args);
  }
};
