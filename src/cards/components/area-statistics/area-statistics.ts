import { getDevice } from '@delegates/retrievers/device';
import { getEntity } from '@delegates/retrievers/entity';
import { hasFeature } from '@homeassistant-extras/hass/common/config/feature';
import { HassConfigMixin } from '@homeassistant-extras/hass/mixins/hass-config-mixin';
import { stylesToMap } from '@theme/util/style-converter';
import type { Config } from '@type/config';
import { d } from '@util/debug';
import {
  LitElement,
  html,
  nothing,
  type CSSResult,
  type TemplateResult,
} from 'lit';
import { customElement } from 'lit/decorators.js';
import { styles } from './styles';

/**
 * Device and entity counts for the configured area. Uses {@link HassConfigMixin}.
 * This has no properties, so it does not need to be reactive.
 * Essentially it is a stateless component that is rendered once and then never updated.
 */
@customElement('area-statistics')
export class AreaStatistics extends HassConfigMixin<typeof LitElement, Config>(
  LitElement,
) {
  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  /**
   * Render the badge
   */
  public override render(): TemplateResult | typeof nothing {
    const hass = this.hass;
    const config = this.config;
    d(config, 'area-statistics', 'render');
    if (!hass || !config || hasFeature(config, 'hide_area_stats')) {
      return nothing;
    }

    const devices = Object.keys(hass.devices).filter(
      (k) => getDevice(hass.devices, k)!.area_id === config.area,
    );

    const entities = Object.keys(hass.entities).filter((k) => {
      const entity = getEntity(hass.entities, k)!;
      return (
        entity.area_id === config.area ||
        (entity.device_id != null && devices.includes(entity.device_id))
      );
    });

    const rows: [number, string][] = [
      [devices.length, 'devices'],
      [entities.length, 'entities'],
    ];
    const summary = rows
      .filter(([n]) => n > 0)
      .map(([count, type]) => `${count} ${type}`)
      .join(' ');

    const style = stylesToMap(config.styles?.stats);
    return html`<span style="${style}" class="stats text">${summary}</span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'area-statistics': AreaStatistics;
  }
}
