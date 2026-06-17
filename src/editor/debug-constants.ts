import type { Config } from '@type/config';

/** Components that emit `d()` logs */
export const DEBUG_COMPONENTS = [
  'room-summary-card',
  'room-summary-card-editor',
  'room-state-icon',
  'sensor-collection',
  'entity-collection',
  'entity-slider',
  'horizontal-slider',
  'badge',
  'room-badge-label',
  'room-entity-label',
  'room-sensor-label',
  'area-statistics',
  'problem-dialog',
  'problem-entity-list',
  'problem-entity-row',
] as const;

/** Categories passed to `d()` */
export const DEBUG_CATEGORIES = [
  'render',
  'set hass',
  'config',
  'sensors',
] as const;

export type DebugPresetId = 'off' | 'renders' | 'all';

export interface DebugPreset {
  id: DebugPresetId;
  label: string;
  description: string;
  debug?: Config['debug'];
}

export const DEBUG_PRESETS: DebugPreset[] = [
  {
    id: 'off',
    label: 'Off',
    description: 'Remove debug from card config',
    debug: undefined,
  },
  {
    id: 'renders',
    label: 'Renders',
    description: 'Log every component render',
    debug: { categories: ['render'] },
  },
  {
    id: 'all',
    label: 'Everything',
    description: 'All components and categories',
    debug: {},
  },
];
