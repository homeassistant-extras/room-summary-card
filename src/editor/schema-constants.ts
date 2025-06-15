import type { HaFormSchema } from '@hass/components/ha-form/types';

export const MAIN: HaFormSchema = {
  name: 'area',
  label: 'Area',
  required: true,
  selector: { area: {} },
};

export const CONTENT: HaFormSchema = {
  name: 'content',
  label: 'Content',
  type: 'expandable',
  flatten: true,
  icon: 'mdi:text-short',
  schema: [
    {
      name: 'area_name',
      label: 'Area name',
      required: false,
      selector: { text: {} },
    },
  ],
};

export const FEATURES: HaFormSchema = {
  name: 'features',
  label: 'Features',
  type: 'expandable' as const,
  flatten: true,
  icon: 'mdi:list-box',
  schema: [
    {
      name: 'features',
      label: 'Features',
      required: false,
      selector: {
        select: {
          multiple: true,
          mode: 'list' as const,
          options: [
            { label: 'Hide Area Stats', value: 'hide_area_stats' },
            {
              label: 'Hide Sensors',
              value: 'hide_climate_label',
            },
            { label: 'Hide Room Icon', value: 'hide_room_icon' },
            {
              label: 'Hide Sensor icons',
              value: 'hide_sensor_icons',
            },
            {
              label: 'Exclude Default Entities',
              value: 'exclude_default_entities',
            },
            {
              label: 'Skip Climate Styles',
              value: 'skip_climate_styles',
            },
            {
              label: 'Skip Card Background Styles',
              value: 'skip_entity_styles',
            },
          ],
        },
      },
    },
  ],
};

export const INTERACTIONS: HaFormSchema = {
  name: 'interactions',
  label: 'Interactions',
  type: 'expandable' as const,
  flatten: true,
  icon: 'mdi:gesture-tap',
  schema: [
    {
      name: 'navigate',
      label: 'Navigate path when card tapped',
      required: false,
      selector: { text: { type: 'url' as const } },
    },
  ],
};
