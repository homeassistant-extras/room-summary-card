/**
 * https://github.com/home-assistant/frontend/blob/dev/src/common/entity/state_color.ts
 */

import { batteryStateColorProperty } from '@hass/common/entity/color/battery_color';
import { computeDomain } from '@hass/common/entity/compute_domain';
import { stateActive } from '@hass/common/entity/state_active';
import { slugify } from '@hass/common/string/slugify';
import { UNAVAILABLE } from '@hass/data/entity';
import { computeGroupDomain, type GroupEntity } from '@hass/data/group';
import { computeCssVariable } from '@hass/resources/css-variables';
import type { HassEntity } from '@hass/types';

const STATE_COLORED_DOMAIN = new Set([
  'alarm_control_panel',
  'alert',
  'automation',
  'binary_sensor',
  'calendar',
  'camera',
  'climate',
  'cover',
  'device_tracker',
  'fan',
  'group',
  'humidifier',
  'input_boolean',
  'lawn_mower',
  'light',
  'lock',
  'media_player',
  'person',
  'plant',
  'remote',
  'schedule',
  'script',
  'siren',
  'sun',
  'switch',
  'timer',
  'update',
  'vacuum',
  'valve',
  'water_heater',
]);

export const stateColorCss = (stateObj: HassEntity, state?: string) => {
  const compareState = state !== undefined ? state : stateObj?.state;
  if (compareState === UNAVAILABLE) {
    return `var(--state-unavailable-color)`;
  }

  const properties = stateColorProperties(stateObj, state);
  if (properties) {
    return computeCssVariable(properties);
  }

  return undefined;
};

/**
 * This method has been modified slightly to account for other themes.
 */
export const domainStateColorProperties = (
  domain: string,
  stateObj: HassEntity,
  state?: string,
): string[] => {
  const compareState = state !== undefined ? state : stateObj.state;
  const active = stateActive(stateObj, state);

  // allow for theme override
  const properties: string[] = ['--state-color-theme-override'];

  const stateKey = slugify(compareState, '_');
  const activeKey = active ? 'active' : 'inactive';

  const dc = stateObj.attributes.device_class;

  if (dc) {
    properties.push(`--state-${domain}-${dc}-${stateKey}-color`);
  }

  properties.push(
    `--state-${domain}-${stateKey}-color`,
    `--state-${domain}-${activeKey}-color`,
    `--state-${activeKey}-color`,
  );

  return properties;
};

export const stateColorProperties = (
  stateObj: HassEntity,
  state?: string,
): string[] | undefined => {
  const compareState = state !== undefined ? state : stateObj?.state;
  const domain = computeDomain(stateObj.entity_id);
  const dc = stateObj.attributes.device_class;

  // Special rules for battery coloring
  if (domain === 'sensor' && dc === 'battery') {
    const property = batteryStateColorProperty(compareState);
    if (property) {
      return [property];
    }
  }

  // Special rules for group coloring
  if (domain === 'group') {
    const groupDomain = computeGroupDomain(stateObj as GroupEntity);
    if (groupDomain && STATE_COLORED_DOMAIN.has(groupDomain)) {
      return domainStateColorProperties(groupDomain, stateObj, state);
    }
  }

  if (STATE_COLORED_DOMAIN.has(domain)) {
    return domainStateColorProperties(domain, stateObj, state);
  }

  return undefined;
};

export const stateColorBrightness = (stateObj: HassEntity): string => {
  if (
    stateObj.attributes.brightness &&
    computeDomain(stateObj.entity_id) !== 'plant'
  ) {
    // lowest brightness will be around 50% (that's pretty dark)
    const brightness = stateObj.attributes.brightness;
    return `brightness(${(brightness + 245) / 5}%)`;
  }
  return '';
};
