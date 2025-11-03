import { localize } from '@/localize/localize';
import { computeDomain } from '@hass/common/entity/compute_domain';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import { getSensorNumericDeviceClasses } from '@hass/data/sensor';
import type { HomeAssistant } from '@hass/types';
import { INTERACTIONS } from './schema-constants';

export const areaEntities = (hass: HomeAssistant, area: string) => {
  return Object.values(hass.entities)
    .filter((entity) => {
      return (
        entity.area_id === area ||
        (entity.device_id && hass.devices[entity.device_id]?.area_id === area)
      );
    })
    .map((entity) => entity.entity_id);
};

export const deviceClasses = async (
  hass: HomeAssistant,
  area: string,
): Promise<string[]> => {
  const entities = Object.values(hass.entities).filter((entity) => {
    const entityDomain = computeDomain(entity.entity_id);

    return (
      entityDomain === 'sensor' &&
      (entity.area_id === area ||
        (entity.device_id && hass.devices[entity.device_id]?.area_id === area))
    );
  });

  const numericDeviceClasses = await getSensorNumericDeviceClasses(hass);
  const classes = entities
    .map(
      (entity) => hass.states[entity.entity_id]?.attributes.device_class ?? '',
    )
    .filter(
      (c) => c && numericDeviceClasses.numeric_device_classes.includes(c),
    );

  return [...new Set(classes)];
};

const schemeStyles = (
  hass: HomeAssistant,
  entities: string[],
): HaFormSchema => {
  return {
    name: 'styles',
    label: 'editor.styles',
    type: 'expandable',
    flatten: true,
    icon: 'mdi:brush-variant',
    schema: [
      {
        name: 'background',
        label: 'editor.background',
        type: 'expandable',
        icon: 'mdi:format-paint',
        schema: [
          {
            name: 'image',
            label: 'editor.background_image',
            selector: { image: {} },
          },
          {
            name: 'image_entity',
            label: 'editor.background_image_entity',
            selector: { entity: { filter: { domain: ['image', 'person'] } } },
          },
          {
            name: 'opacity',
            label: 'editor.background_opacity',
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
            label: 'editor.options',
            selector: {
              select: {
                multiple: true,
                mode: 'list' as const,
                options: [
                  {
                    label: localize(hass, 'editor.disable_background_image'),
                    value: 'disable',
                  },
                  {
                    label: localize(hass, 'editor.icon_background'),
                    value: 'icon_background',
                  },
                  {
                    label: localize(hass, 'editor.hide_icon_only'),
                    value: 'hide_icon_only',
                  },
                ],
              },
            },
          },
        ],
      },
      {
        name: 'thresholds',
        label: 'editor.thresholds',
        type: 'expandable',
        icon: 'mdi:thermometer-alert',
        schema: [
          {
            name: 'temperature',
            label: 'editor.temperature_threshold',
            required: false,
            selector: {
              number: { mode: 'box' as const, unit_of_measurement: '°' },
            },
          },
          {
            name: 'humidity',
            label: 'editor.humidity_threshold',
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
            name: 'mold',
            label: 'editor.mold_threshold',
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
            name: 'temperature_entity',
            label: 'editor.temperature_entity',
            required: false,
            selector: {
              entity: {
                multiple: false,
                include_entities: entities,
                filter: {
                  device_class: 'temperature',
                },
              },
            },
          },
          {
            name: 'temperature_operator',
            label: 'editor.temperature_operator',
            required: false,
            selector: {
              select: {
                mode: 'dropdown' as const,
                options: [
                  { value: 'gt', label: localize(hass, 'editor.greater_than') },
                  {
                    value: 'gte',
                    label: localize(hass, 'editor.greater_than_or_equal'),
                  },
                  { value: 'lt', label: localize(hass, 'editor.less_than') },
                  {
                    value: 'lte',
                    label: localize(hass, 'editor.less_than_or_equal'),
                  },
                  { value: 'eq', label: localize(hass, 'editor.equal') },
                ],
              },
            },
          },
          {
            name: 'humidity_entity',
            label: 'editor.humidity_entity',
            required: false,
            selector: {
              entity: {
                multiple: false,
                include_entities: entities,
                filter: {
                  device_class: 'humidity',
                },
              },
            },
          },
          {
            name: 'humidity_operator',
            label: 'editor.humidity_operator',
            required: false,
            selector: {
              select: {
                mode: 'dropdown' as const,
                options: [
                  { value: 'gt', label: localize(hass, 'editor.greater_than') },
                  {
                    value: 'gte',
                    label: localize(hass, 'editor.greater_than_or_equal'),
                  },
                  { value: 'lt', label: localize(hass, 'editor.less_than') },
                  {
                    value: 'lte',
                    label: localize(hass, 'editor.less_than_or_equal'),
                  },
                  { value: 'eq', label: localize(hass, 'editor.equal') },
                ],
              },
            },
          },
        ],
      },
      {
        name: 'styles',
        label: 'editor.css_styles',
        type: 'expandable',
        icon: 'mdi:spray',
        schema: [
          {
            name: 'card',
            label: 'editor.card_styles',
            required: false,
            selector: { object: {} },
          },
          {
            name: 'entities',
            label: 'editor.entities_container_styles',
            required: false,
            selector: { object: {} },
          },
          {
            name: 'entity_icon',
            label: 'editor.entity_icon_styles',
            required: false,
            selector: { object: {} },
          },
          {
            name: 'sensors',
            label: 'editor.sensor_styles',
            required: false,
            selector: { object: {} },
          },
          {
            name: 'stats',
            label: 'editor.stats_styles',
            required: false,
            selector: { object: {} },
          },
          {
            name: 'title',
            label: 'editor.title_styles',
            required: false,
            selector: { object: {} },
          },
        ],
      },
    ],
  };
};

export const getEntitiesSchema = (
  hass: HomeAssistant,
  entities: string[],
): HaFormSchema[] => {
  return [
    {
      name: 'entities',
      label: 'editor.area_side_entities',
      required: false,
      selector: { entity: { multiple: true, include_entities: entities } },
    },
    {
      name: 'lights',
      label: 'editor.light_entities',
      required: false,
      selector: {
        entity: {
          multiple: true,
          include_entities: entities,
          filter: { domain: ['light', 'switch'] },
        },
      },
    },
  ];
};

export const getSensorsSchema = (
  hass: HomeAssistant,
  sensorClasses: string[],
  entities: string[],
): HaFormSchema[] => {
  return [
    {
      name: 'sensors',
      label: 'editor.individual_sensor_entities',
      required: false,
      selector: { entity: { multiple: true, include_entities: entities } },
    },
    {
      name: 'sensor_classes',
      label: 'editor.sensor_classes',
      selector: {
        select: {
          reorder: true,
          multiple: true,
          custom_value: true,
          options: sensorClasses,
        },
      },
    },
    {
      name: 'sensor_layout',
      label: 'editor.sensor_layout',
      required: false,
      selector: {
        select: {
          mode: 'dropdown' as const,
          options: [
            {
              label: localize(hass, 'editor.default_in_label_area'),
              value: 'default',
            },
            {
              label: localize(hass, 'editor.bottom'),
              value: 'bottom',
            },
            {
              label: localize(hass, 'editor.vertical_stack'),
              value: 'stacked',
            },
          ],
        },
      },
    },
  ];
};

export const getMainSchema = (
  hass: HomeAssistant,
  entities: string[],
): HaFormSchema[] => [
  {
    name: 'area',
    label: 'editor.area',
    required: true,
    selector: { area: {} },
  },
  {
    name: 'entity',
    label: 'editor.room_entity',
    required: false,
    selector: { entity: { multiple: false, include_entities: entities } },
  },
  {
    name: 'content',
    label: 'editor.content',
    type: 'expandable',
    flatten: true,
    icon: 'mdi:text-short',
    schema: [
      {
        name: 'area_name',
        label: 'editor.area_name',
        required: false,
        selector: { text: {} },
      },
    ],
  },
  INTERACTIONS,
  schemeStyles(hass, entities),
  featuresSchema(hass),
];

export const getOccupancySchema = (
  hass: HomeAssistant,
  entities: string[],
): HaFormSchema[] => {
  return [
    {
      name: 'occupancy',
      label: 'editor.occupancy_presence_detection',
      type: 'grid' as const,
      column_min_width: '100%',
      schema: [
        {
          name: 'entities',
          label: 'editor.motion_occupancy_presence_sensors',
          required: true,
          selector: {
            entity: {
              multiple: true,
              include_entities: entities,
              filter: {
                domain: ['binary_sensor'],
                device_class: ['motion', 'occupancy', 'presence'],
              },
            },
          },
        },
        {
          name: 'card_border_color',
          label: 'editor.card_border_color_occupied',
          required: false,
          selector: { text: { type: 'color' as const } },
        },
        {
          name: 'icon_color',
          label: 'editor.icon_background_color_occupied',
          required: false,
          selector: { text: { type: 'color' as const } },
        },
        {
          name: 'options',
          label: 'editor.occupancy_options',
          required: false,
          selector: {
            select: {
              multiple: true,
              mode: 'list' as const,
              options: [
                {
                  label: localize(hass, 'editor.disable_card_border'),
                  value: 'disabled_card_styles',
                },
                {
                  label: localize(
                    hass,
                    'editor.disable_card_border_animations',
                  ),
                  value: 'disabled_card_styles_animation',
                },
                {
                  label: localize(hass, 'editor.disable_icon_color'),
                  value: 'disable_icon_styles',
                },
                {
                  label: localize(hass, 'editor.disable_icon_animations'),
                  value: 'disable_icon_animation',
                },
              ],
            },
          },
        },
      ],
    },
  ];
};

const featuresSchema = (hass: HomeAssistant): HaFormSchema => {
  return {
    name: 'features',
    label: 'editor.features',
    type: 'expandable' as const,
    flatten: true,
    icon: 'mdi:list-box',
    schema: [
      {
        name: 'features',
        label: 'editor.features',
        required: false,
        selector: {
          select: {
            multiple: true,
            mode: 'list' as const,
            options: [
              {
                label: localize(hass, 'editor.hide_area_stats'),
                value: 'hide_area_stats',
              },
              {
                label: localize(hass, 'editor.hide_sensors'),
                value: 'hide_climate_label',
              },
              {
                label: localize(hass, 'editor.hide_room_icon'),
                value: 'hide_room_icon',
              },
              {
                label: localize(hass, 'editor.hide_sensor_icons'),
                value: 'hide_sensor_icons',
              },
              {
                label: localize(hass, 'editor.hide_sensor_labels'),
                value: 'hide_sensor_labels',
              },
              {
                label: localize(hass, 'editor.exclude_default_entities'),
                value: 'exclude_default_entities',
              },
              {
                label: localize(hass, 'editor.skip_climate_styles'),
                value: 'skip_climate_styles',
              },
              {
                label: localize(hass, 'editor.skip_card_background_styles'),
                value: 'skip_entity_styles',
              },
              {
                label: localize(hass, 'editor.show_entity_labels'),
                value: 'show_entity_labels',
              },
              {
                label: localize(hass, 'editor.multi_light_background'),
                value: 'multi_light_background',
              },
              {
                label: localize(hass, 'editor.ignore_entity'),
                value: 'ignore_entity',
              },
            ],
          },
        },
      },
    ],
  };
};
