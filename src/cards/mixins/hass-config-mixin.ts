import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import type { LitElement } from 'lit';
import type { Constructor } from './hass-update-mixin';

/**
 * Provides non-decorated `hass` and `config` fields.
 *
 * These are intentionally NOT `@property()` to avoid Lit reactive property
 * plumbing/attribute semantics. Prefer {@link HassUpdateMixin} for child
 * components that must react to `hass-update` when the parent card skips a full
 * render (see {@link AreaStatistics}).
 */
export const HassConfigMixin = <T extends Constructor<LitElement>>(
  superClass: T,
) => {
  class HassConfigClass extends superClass {
    public hass!: HomeAssistant;
    public config!: Config;
  }

  return HassConfigClass;
};
