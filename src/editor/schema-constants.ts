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

export const STYLES: HaFormSchema = {
  name: 'styles',
  label: 'Styles',
  type: 'expandable',
  flatten: true,
  icon: 'mdi:brush-variant',
  schema: [
    {
      name: 'sensor_layout',
      label: 'Sensor Layout',
      required: false,
      selector: {
        select: {
          mode: 'dropdown' as const,
          options: [
            { label: 'Default (in label area)', value: 'default' },
            {
              label: 'Bottom',
              value: 'bottom',
            },
            {
              label: 'Vertical Stack',
              value: 'stacked',
            },
          ],
        },
      },
    },
    {
      name: 'background',
      label: 'Background',
      type: 'expandable',
      icon: 'mdi:format-paint',
      schema: [
        { name: 'image', label: 'Background Image', selector: { image: {} } },
        {
          name: 'image_entity',
          label: 'Background Image Entity',
          selector: { entity: { filter: { domain: ['image', 'person'] } } },
        },
        {
          name: 'opacity',
          label: 'Background Opacity',
          required: false,
          selector: {
            number: {
              mode: 'slider' as const,
              unit_of_measurement: '%',
              min: 0,
              max: 100,
            },
          },
        },
        {
          name: 'options',
          label: 'Options',
          selector: {
            select: {
              multiple: true,
              mode: 'list' as const,
              options: [
                {
                  label: 'Disable Background Image',
                  value: 'disable',
                },
              ],
            },
          },
        },
      ],
    },
    {
      name: 'thresholds',
      label: 'Thresholds',
      type: 'expandable',
      icon: 'mdi:thermometer-alert',
      schema: [
        {
          name: 'temperature',
          label: 'Temperature threshold',
          required: false,
          selector: {
            number: { mode: 'box' as const, unit_of_measurement: '°' },
          },
        },
        {
          name: 'humidity',
          label: 'Humidity threshold',
          required: false,
          selector: {
            number: {
              mode: 'slider' as const,
              unit_of_measurement: '%',
              min: 0,
              max: 100,
            },
          },
        },
      ],
    },
    {
      name: 'styles',
      label: 'Your CSS Styles',
      type: 'expandable',
      icon: 'mdi:spray',
      schema: [
        {
          name: 'card',
          label: 'Card Styles',
          required: false,
          selector: { object: {} },
        },
        {
          name: 'entities',
          label: 'Entities Styles',
          required: false,
          selector: { object: {} },
        },
        {
          name: 'sensors',
          label: 'Sensor Styles',
          required: false,
          selector: { object: {} },
        },
        {
          name: 'stats',
          label: 'Stats Styles',
          required: false,
          selector: { object: {} },
        },
        {
          name: 'title',
          label: 'Title Styles',
          required: false,
          selector: { object: {} },
        },
      ],
    },
  ],
};
