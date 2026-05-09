import { hasFeature } from '@config/feature';
import { getDevice } from '@delegates/retrievers/device';
import { getEntity } from '@delegates/retrievers/entity';
import type { HomeAssistant } from '@hass/types';
import { stylesToMap } from '@theme/util/style-converter';
import type { Config } from '@type/config';
import { type TemplateResult, html, nothing } from 'lit';

/**
 * Cache for area statistics to avoid re-scanning all devices/entities on every render.
 * Keyed by area ID, stores the last known registry references and computed counts.
 */
interface AreaStatsCache {
  devices: Record<string, any>;
  entities: Record<string, any>;
  deviceCount: number;
  entityCount: number;
}
const areaStatsCacheMap = new Map<string, AreaStatsCache>();

/**
 * Gets statistics about devices and entities in the area
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {Config} config - The configuration object
 * @returns {TemplateResult | typeof nothing} Formatted statistics HTML, or nothing if no statistics or feature is disabled
 */

export const renderAreaStatistics = (
  hass: HomeAssistant,
  config: Config,
): TemplateResult | typeof nothing => {
  if (!hass || hasFeature(config, 'hide_area_stats')) return nothing;

  let deviceCount: number;
  let entityCount: number;

  // Check if we have a valid cache for this area
  const cached = areaStatsCacheMap.get(config.area);
  if (
    cached &&
    cached.devices === hass.devices &&
    cached.entities === hass.entities
  ) {
    // Registry references haven't changed — use cached counts
    deviceCount = cached.deviceCount;
    entityCount = cached.entityCount;
  } else {
    // Recompute counts
    const devices = Object.keys(hass.devices).filter(
      (k) => getDevice(hass.devices, k)!.area_id === config.area,
    );

    const entities = Object.keys(hass.entities).filter((k) => {
      const entity = getEntity(hass.entities, k)!;
      return (
        entity.area_id === config.area || devices.includes(entity.device_id)
      );
    });

    deviceCount = devices.length;
    entityCount = entities.length;

    // Update cache
    areaStatsCacheMap.set(config.area, {
      devices: hass.devices,
      entities: hass.entities,
      deviceCount,
      entityCount,
    });
  }

  const e = [
    [deviceCount, 'devices'],
    [entityCount, 'entities'],
  ]
    .filter((count) => count.length > 0)
    .map(([count, type]) => `${count} ${type}`)
    .join(' ');

  const s = stylesToMap(config.styles?.stats);
  return html`<span style="${s}" class="stats text">${e}</span>`;
};
