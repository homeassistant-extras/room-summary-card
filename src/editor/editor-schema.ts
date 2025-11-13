import { computeDomain } from '@hass/common/entity/compute_domain';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import { getSensorNumericDeviceClasses } from '@hass/data/sensor';
import type { HomeAssistant } from '@hass/types';
import { localize } from '@localize/localize';
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
    label: 'editor.styles.styles',
    type: 'expandable',
    flatten: true,
    icon: 'mdi:brush-variant',
    schema: [
      {
        name: 'background',
        label: 'editor.background.background',
        type: 'expandable',
        icon: 'mdi:format-paint',
        schema: [
          {
            name: 'image',
            label: 'editor.background.background_image',
            selector: { media: { image_upload: true } },
          },
          {
            name: 'image_entity',
            label: 'editor.background.background_image_entity',
            selector: { entity: { filter: { domain: ['image', 'person'] } } },
          },
          {
            name: 'opacity',
            label: 'editor.background.background_opacity',
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
            label: 'editor.features.options',
            selector: {
              select: {
                multiple: true,
                mode: 'list' as const,
                options: [
                  {
                    label: localize(
                      hass,
                      'editor.background.disable_background_image',
                    ),
                    value: 'disable',
                  },
                  {
                    label: localize(hass, 'editor.icon.icon_background'),
                    value: 'icon_background',
                  },
                  {
                    label: localize(hass, 'editor.icon.hide_icon_only'),
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
        label: 'editor.threshold.thresholds',
        type: 'expandable',
        icon: 'mdi:thermometer-alert',
        schema: [
          {
            name: 'temperature',
            label: 'editor.threshold.temperature_threshold',
            required: false,
            selector: {
              number: { mode: 'box' as const, unit_of_measurement: '°' },
            },
          },
          {
            name: 'humidity',
            label: 'editor.threshold.humidity_threshold',
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
            label: 'editor.threshold.mold_threshold',
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
            label: 'editor.threshold.temperature_entity',
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
            label: 'editor.threshold.temperature_operator',
            required: false,
            selector: {
              select: {
                mode: 'dropdown' as const,
                options: [
                  {
                    value: 'gt',
                    label: localize(
                      hass,
                      'editor.threshold.operator.greater_than',
                    ),
                  },
                  {
                    value: 'gte',
                    label: localize(
                      hass,
                      'editor.threshold.operator.greater_than_or_equal',
                    ),
                  },
                  {
                    value: 'lt',
                    label: localize(
                      hass,
                      'editor.threshold.operator.less_than',
                    ),
                  },
                  {
                    value: 'lte',
                    label: localize(
                      hass,
                      'editor.threshold.operator.less_than_or_equal',
                    ),
                  },
                  {
                    value: 'eq',
                    label: localize(hass, 'editor.threshold.operator.equal'),
                  },
                ],
              },
            },
          },
          {
            name: 'humidity_entity',
            label: 'editor.threshold.humidity_entity',
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
            label: 'editor.threshold.humidity_operator',
            required: false,
            selector: {
              select: {
                mode: 'dropdown' as const,
                options: [
                  {
                    value: 'gt',
                    label: localize(
                      hass,
                      'editor.threshold.operator.greater_than',
                    ),
                  },
                  {
                    value: 'gte',
                    label: localize(
                      hass,
                      'editor.threshold.operator.greater_than_or_equal',
                    ),
                  },
                  {
                    value: 'lt',
                    label: localize(
                      hass,
                      'editor.threshold.operator.less_than',
                    ),
                  },
                  {
                    value: 'lte',
                    label: localize(
                      hass,
                      'editor.threshold.operator.less_than_or_equal',
                    ),
                  },
                  {
                    value: 'eq',
                    label: localize(hass, 'editor.threshold.operator.equal'),
                  },
                ],
              },
            },
          },
        ],
      },
      {
        name: 'styles',
        label: 'editor.styles.css_styles',
        type: 'expandable',
        icon: 'mdi:spray',
        schema: [
          {
            name: 'card',
            label: 'editor.styles.card_styles',
            required: false,
            selector: { object: {} },
          },
          {
            name: 'stats',
            label: 'editor.styles.stats_styles',
            required: false,
            selector: { object: {} },
          },
          {
            name: 'title',
            label: 'editor.styles.title_styles',
            required: false,
            selector: { object: {} },
          },
        ],
      },
    ],
  };
};

/**
 * Returns schema for entity styles only (for entities tab)
 */
export const getEntitiesStylesSchema = (
  hass: HomeAssistant,
): HaFormSchema[] => {
  return [
    {
      name: 'styles',
      label: 'editor.styles.css_styles',
      type: 'grid' as const,
      column_min_width: '100%',
      schema: [
        {
          name: 'entities',
          label: 'editor.styles.entities_container_styles',
          required: false,
          selector: { object: {} },
        },
        {
          name: 'entity_icon',
          label: 'editor.styles.entity_icon_styles',
          required: false,
          selector: { object: {} },
        },
      ],
    },
    {
      name: 'slider_style',
      label: 'editor.slider.slider_style',
      required: false,
      selector: {
        select: {
          mode: 'dropdown' as const,
          options: [
            {
              label: localize(hass, 'editor.slider.minimalist'),
              value: 'minimalist',
            },
            {
              label: localize(hass, 'editor.slider.track'),
              value: 'track',
            },
            {
              label: localize(hass, 'editor.slider.line'),
              value: 'line',
            },
            {
              label: localize(hass, 'editor.slider.filled'),
              value: 'filled',
            },
            {
              label: localize(hass, 'editor.slider.gradient'),
              value: 'gradient',
            },
            {
              label: localize(hass, 'editor.slider.dual_rail'),
              value: 'dual-rail',
            },
            {
              label: localize(hass, 'editor.slider.dots'),
              value: 'dots',
            },
            {
              label: localize(hass, 'editor.slider.notched'),
              value: 'notched',
            },
            {
              label: localize(hass, 'editor.slider.grid'),
              value: 'grid',
            },
            {
              label: localize(hass, 'editor.slider.glow'),
              value: 'glow',
            },
            {
              label: localize(hass, 'editor.slider.shadow_trail'),
              value: 'shadow-trail',
            },
            {
              label: localize(hass, 'editor.slider.outlined'),
              value: 'outlined',
            },
          ],
        },
      },
    },
  ];
};

export const getLightsSchema = (
  hass: HomeAssistant,
  entities: string[],
): HaFormSchema[] => {
  return [
    {
      name: 'lights',
      label: 'editor.background.light_entities',
      required: false,
      selector: {
        entity: {
          multiple: true,
          include_entities: entities,
          filter: { domain: ['light', 'switch'] },
        },
      },
    },
    lightsFeaturesSchema(hass),
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
      label: 'editor.sensor.individual_sensor_entities',
      required: false,
      selector: { entity: { multiple: true, include_entities: entities } },
    },
    {
      name: 'sensor_classes',
      label: 'editor.sensor.sensor_classes',
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
      label: 'editor.layout.sensor_layout',
      required: false,
      selector: {
        select: {
          mode: 'dropdown' as const,
          options: [
            {
              label: localize(hass, 'editor.layout.default_in_label_area'),
              value: 'default',
            },
            {
              label: localize(hass, 'editor.layout.bottom'),
              value: 'bottom',
            },
            {
              label: localize(hass, 'editor.layout.vertical_stack'),
              value: 'stacked',
            },
          ],
        },
      },
    },
  ];
};

/**
 * Returns schema for sensors tab excluding the sensors field
 * Used when sensors are handled by room-summary-entities-row-editor
 */
export const getSensorsSchemaRest = (
  hass: HomeAssistant,
  sensorClasses: string[],
): HaFormSchema[] => {
  return [
    {
      name: 'sensor_classes',
      label: 'editor.sensor.sensor_classes',
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
      label: 'editor.layout.sensor_layout',
      required: false,
      selector: {
        select: {
          mode: 'dropdown' as const,
          options: [
            {
              label: localize(hass, 'editor.layout.default_in_label_area'),
              value: 'default',
            },
            {
              label: localize(hass, 'editor.layout.bottom'),
              value: 'bottom',
            },
            {
              label: localize(hass, 'editor.layout.vertical_stack'),
              value: 'stacked',
            },
          ],
        },
      },
    },
    {
      name: 'styles',
      label: 'editor.styles.css_styles',
      type: 'grid' as const,
      column_min_width: '100%',
      schema: [
        {
          name: 'sensors',
          label: 'editor.styles.sensor_styles',
          required: false,
          selector: { object: {} },
        },
      ],
    },
  ];
};

export const getMainSchema = (
  hass: HomeAssistant,
  entities: string[],
): HaFormSchema[] => [
  {
    name: 'area',
    label: 'editor.area.area',
    required: true,
    selector: { area: {} },
  },
  {
    name: 'entity',
    label: 'editor.area.room_entity',
    required: false,
    selector: { entity: { multiple: false, include_entities: entities } },
  },
  {
    name: 'content',
    label: 'editor.layout.content',
    type: 'expandable',
    flatten: true,
    icon: 'mdi:text-short',
    schema: [
      {
        name: 'area_name',
        label: 'editor.area.area_name',
        required: false,
        selector: { text: {} },
      },
    ],
  },
  INTERACTIONS,
  schemeStyles(hass, entities),
  featuresSchema(hass),
];

/**
 * Returns schema for the area field only
 */
export const getAreaSchema = (): HaFormSchema => ({
  name: 'area',
  label: 'editor.area.area',
  required: true,
  selector: { area: {} },
});

/**
 * Returns the main schema excluding area and entity fields
 * Used for tab 0 when area and entity are handled separately
 * Includes area_name and the rest of the schema
 */
export const getMainSchemaRest = (
  hass: HomeAssistant,
  entities: string[],
): HaFormSchema[] => [
  {
    name: 'area_name',
    label: 'editor.area.area_name',
    required: false,
    selector: { text: {} },
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
      label: 'editor.occupancy.occupancy_presence_detection',
      type: 'grid' as const,
      column_min_width: '100%',
      schema: [
        {
          name: 'entities',
          label: 'editor.occupancy.motion_occupancy_presence_sensors',
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
          label: 'editor.card.card_border_color_occupied',
          required: false,
          selector: { ui_color: {} },
        },
        {
          name: 'icon_color',
          label: 'editor.icon.icon_background_color_occupied',
          required: false,
          selector: { ui_color: {} },
        },
        {
          name: 'options',
          label: 'editor.occupancy.occupancy_options',
          required: false,
          selector: {
            select: {
              multiple: true,
              mode: 'list' as const,
              options: [
                {
                  label: localize(hass, 'editor.card.disable_card_border'),
                  value: 'disabled_card_styles',
                },
                {
                  label: localize(
                    hass,
                    'editor.card.disable_card_border_animations',
                  ),
                  value: 'disabled_card_styles_animation',
                },
                {
                  label: localize(hass, 'editor.icon.disable_icon_color'),
                  value: 'disable_icon_styles',
                },
                {
                  label: localize(hass, 'editor.icon.disable_icon_animations'),
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
    label: 'editor.features.features',
    type: 'expandable' as const,
    flatten: true,
    icon: 'mdi:list-box',
    schema: [
      {
        name: 'features',
        label: 'editor.features.features',
        required: false,
        selector: {
          select: {
            multiple: true,
            mode: 'list' as const,
            options: [
              {
                label: localize(hass, 'editor.stats.hide_area_stats'),
                value: 'hide_area_stats',
              },
              {
                label: localize(hass, 'editor.icon.hide_room_icon'),
                value: 'hide_room_icon',
              },
              {
                label: localize(hass, 'editor.styles.skip_climate_styles'),
                value: 'skip_climate_styles',
              },
              {
                label: localize(
                  hass,
                  'editor.card.skip_card_background_styles',
                ),
                value: 'skip_entity_styles',
              },
            ],
          },
        },
      },
    ],
  };
};

/**
 * Returns schema for entity-specific features only
 * Filters the full features list to only include entity-related features
 */
export const entityFeaturesSchema = (hass: HomeAssistant): HaFormSchema => {
  return {
    name: 'features',
    label: 'editor.features.features',
    required: false,
    selector: {
      select: {
        multiple: true,
        mode: 'list' as const,
        options: [
          {
            label: localize(hass, 'editor.entity.show_entity_labels'),
            value: 'show_entity_labels',
          },
          {
            label: localize(hass, 'editor.features.exclude_default_entities'),
            value: 'exclude_default_entities',
          },
          {
            label: localize(hass, 'editor.entity.ignore_entity'),
            value: 'ignore_entity',
          },
          {
            label: localize(hass, 'editor.features.sticky_entities'),
            value: 'sticky_entities',
          },
          {
            label: localize(hass, 'editor.features.slider'),
            value: 'slider',
          },
        ],
      },
    },
  };
};

/**
 * Returns schema for lights-specific features only
 */
export const lightsFeaturesSchema = (hass: HomeAssistant): HaFormSchema => {
  return {
    name: 'features',
    label: 'editor.features.features',
    required: false,
    selector: {
      select: {
        multiple: true,
        mode: 'list' as const,
        options: [
          {
            label: localize(hass, 'editor.background.multi_light_background'),
            value: 'multi_light_background',
          },
        ],
      },
    },
  };
};

/**
 * Returns schema for sensors-specific features only
 */
export const sensorsFeaturesSchema = (hass: HomeAssistant): HaFormSchema => {
  return {
    name: 'features',
    label: 'editor.features.features',
    required: false,
    selector: {
      select: {
        multiple: true,
        mode: 'list' as const,
        options: [
          {
            label: localize(hass, 'editor.sensor.hide_sensors'),
            value: 'hide_climate_label',
          },
          {
            label: localize(hass, 'editor.sensor.hide_sensor_icons'),
            value: 'hide_sensor_icons',
          },
          {
            label: localize(hass, 'editor.sensor.hide_sensor_labels'),
            value: 'hide_sensor_labels',
          },
        ],
      },
    },
  };
};
