import {
  cleanEmptyArrays,
  cleanEmptyProps,
} from '@editor/utils/config-cleanup';
import { fireEvent } from '@hass/common/dom/fire_event';
import type { Config } from '@type/config';

/**
 * Cleans the config and fires a config-changed event
 * @param element - The element to fire the event on
 * @param config - The configuration to clean and fire
 */
export function cleanAndFireConfigChanged(
  element: HTMLElement,
  config: Config,
): void {
  if (!config) return;

  // Clean default values
  if (config.sensor_layout === 'default') delete config.sensor_layout;

  // Clean up undefined entity field
  if (config.entity === undefined) delete config.entity;

  // Clean up empty arrays
  cleanEmptyArrays(config, 'features');
  cleanEmptyArrays(config, 'entities');
  cleanEmptyArrays(config, 'lights');
  cleanEmptyArrays(config, 'problem_entities');
  cleanEmptyArrays(config, 'sensor_classes');

  // Clean empty strings from entity configs
  cleanEmptyProps(config, 'entity');
  cleanEmptyProps(config, 'entities');
  cleanEmptyProps(config, 'lights');
  cleanEmptyProps(config, 'sensors');

  // Clean nested objects
  cleanEmptyProps(config, 'background');
  cleanEmptyProps(config, 'thresholds');
  cleanEmptyProps(config, 'occupancy');
  cleanEmptyProps(config, 'smoke');

  // @ts-ignore
  fireEvent(element, 'config-changed', { config });
}
