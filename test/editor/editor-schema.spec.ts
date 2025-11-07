import {
  areaEntities,
  deviceClasses,
  getEntitiesSchema,
  getMainSchema,
  getOccupancySchema,
  getSensorsSchema,
} from '@/editor/editor-schema';
import * as sensorModule from '@hass/data/sensor';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { stub, type SinonStub } from 'sinon';

describe('editor-schema.ts', () => {
  let mockHass: HomeAssistant;
  let getSensorNumericDeviceClassesStub: SinonStub;

  beforeEach(() => {
    mockHass = {
      states: {
        'sensor.living_room_temperature': {
          entity_id: 'sensor.living_room_temperature',
          state: '72',
          attributes: {
            device_class: 'temperature',
            unit_of_measurement: '°F',
          },
        },
        'sensor.living_room_humidity': {
          entity_id: 'sensor.living_room_humidity',
          state: '45',
          attributes: {
            device_class: 'humidity',
            unit_of_measurement: '%',
          },
        },
        'sensor.living_room_pressure': {
          entity_id: 'sensor.living_room_pressure',
          state: '1013',
          attributes: {
            device_class: 'pressure',
            unit_of_measurement: 'hPa',
          },
        },
        'light.living_room': {
          entity_id: 'light.living_room',
          state: 'on',
          attributes: {},
        },
      },
      entities: {
        'sensor.living_room_temperature': {
          entity_id: 'sensor.living_room_temperature',
          device_id: 'device_1',
          area_id: 'living_room',
          labels: [],
        },
        'sensor.living_room_humidity': {
          entity_id: 'sensor.living_room_humidity',
          device_id: 'device_2',
          area_id: 'living_room',
          labels: [],
        },
        'sensor.living_room_pressure': {
          entity_id: 'sensor.living_room_pressure',
          device_id: 'device_3',
          area_id: 'living_room',
          labels: [],
        },
        'light.living_room': {
          entity_id: 'light.living_room',
          device_id: 'device_4',
          area_id: 'living_room',
          labels: [],
        },
      },
      devices: {
        device_1: { area_id: 'living_room' },
        device_2: { area_id: 'living_room' },
        device_3: { area_id: 'living_room' },
        device_4: { area_id: 'living_room' },
      },
      areas: {
        living_room: {
          area_id: 'living_room',
          name: 'Living Room',
          icon: 'mdi:sofa',
        },
      },
      language: 'en',
    } as any as HomeAssistant;

    getSensorNumericDeviceClassesStub = stub(
      sensorModule,
      'getSensorNumericDeviceClasses',
    );
    getSensorNumericDeviceClassesStub.resolves({
      numeric_device_classes: [
        'temperature',
        'humidity',
        'pressure',
        'battery',
        'illuminance',
      ],
    });
  });

  afterEach(() => {
    getSensorNumericDeviceClassesStub.restore();
  });

  describe('areaEntities', () => {
    it('should return entity IDs for entities in the specified area', () => {
      const entities = areaEntities(mockHass, 'living_room');
      expect(entities).to.deep.equal([
        'sensor.living_room_temperature',
        'sensor.living_room_humidity',
        'sensor.living_room_pressure',
        'light.living_room',
      ]);
    });

    it('should return empty array when area has no entities', () => {
      const entities = areaEntities(mockHass, 'non_existent_area');
      expect(entities).to.deep.equal([]);
    });
  });

  describe('deviceClasses', () => {
    it('should return unique device classes for sensors in the area', async () => {
      const classes = await deviceClasses(mockHass, 'living_room');
      expect(classes).to.deep.equal(['temperature', 'humidity', 'pressure']);
    });

    it('should return empty array when area has no sensors', async () => {
      const classes = await deviceClasses(mockHass, 'non_existent_area');
      expect(classes).to.deep.equal([]);
    });
  });

  describe('getEntitiesSchema', () => {
    it('should return schema with entities and lights for entities tab', () => {
      const entities = Object.keys(mockHass.entities);
      const schema = getEntitiesSchema(mockHass, entities);

      expect(schema).to.deep.equal([
        {
          name: 'entities',
          label: 'editor.area.area_side_entities',
          required: false,
          selector: {
            entity: { multiple: true, include_entities: entities },
          },
        },
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
      ]);
    });
  });

  describe('getSensorsSchema', () => {
    it('should return schema with sensors, sensor classes, and sensor layout', () => {
      const entities = Object.keys(mockHass.entities);
      const sensorClasses = ['temperature', 'humidity', 'pressure'];
      const schema = getSensorsSchema(mockHass, sensorClasses, entities);

      expect(schema).to.deep.equal([
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
              mode: 'dropdown',
              options: [
                {
                  label: 'Default (in label area)',
                  value: 'default',
                },
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
      ]);
    });
  });

  describe('getMainSchema', () => {
    it('should return schema with area, entity, content, interactions, styles, and features', () => {
      const entities = Object.keys(mockHass.entities);
      const schema = getMainSchema(mockHass, entities);

      expect(schema).to.deep.equal([
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
          selector: {
            entity: { multiple: false, include_entities: entities },
          },
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
        {
          name: 'interactions',
          label: 'editor.interactions.interactions',
          type: 'expandable',
          flatten: true,
          icon: 'mdi:gesture-tap',
          schema: [
            {
              name: 'navigate',
              label: 'editor.interactions.navigate_path',
              required: false,
              selector: { navigation: {} },
            },
          ],
        },
        {
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
                  selector: { image: {} },
                },
                {
                  name: 'image_entity',
                  label: 'editor.background.background_image_entity',
                  selector: {
                    entity: { filter: { domain: ['image', 'person'] } },
                  },
                },
                {
                  name: 'opacity',
                  label: 'editor.background.background_opacity',
                  required: false,
                  selector: {
                    number: {
                      mode: 'slider',
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
                      mode: 'list',
                      options: [
                        {
                          label: 'Disable Background Image',
                          value: 'disable',
                        },
                        {
                          label: 'Icon Background',
                          value: 'icon_background',
                        },
                        {
                          label: 'Hide Icon Only',
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
                    number: { mode: 'box', unit_of_measurement: '°' },
                  },
                },
                {
                  name: 'humidity',
                  label: 'editor.threshold.humidity_threshold',
                  required: false,
                  selector: {
                    number: {
                      mode: 'slider',
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
                      mode: 'slider',
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
                      mode: 'dropdown',
                      options: [
                        {
                          value: 'gt',
                          label: 'Greater than (>)',
                        },
                        {
                          value: 'gte',
                          label: 'Greater than or equal (≥)',
                        },
                        {
                          value: 'lt',
                          label: 'Less than (<)',
                        },
                        {
                          value: 'lte',
                          label: 'Less than or equal (≤)',
                        },
                        {
                          value: 'eq',
                          label: 'Equal (=)',
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
                      mode: 'dropdown',
                      options: [
                        {
                          value: 'gt',
                          label: 'Greater than (>)',
                        },
                        {
                          value: 'gte',
                          label: 'Greater than or equal (≥)',
                        },
                        {
                          value: 'lt',
                          label: 'Less than (<)',
                        },
                        {
                          value: 'lte',
                          label: 'Less than or equal (≤)',
                        },
                        {
                          value: 'eq',
                          label: 'Equal (=)',
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
                {
                  name: 'sensors',
                  label: 'editor.styles.sensor_styles',
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
        },
        {
          name: 'features',
          label: 'editor.features.features',
          type: 'expandable',
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
                  mode: 'list',
                  options: [
                    {
                      label: 'Hide Area Stats',
                      value: 'hide_area_stats',
                    },
                    {
                      label: 'Hide Sensors',
                      value: 'hide_climate_label',
                    },
                    {
                      label: 'Hide Room Icon',
                      value: 'hide_room_icon',
                    },
                    {
                      label: 'Hide Sensor icons',
                      value: 'hide_sensor_icons',
                    },
                    {
                      label: 'Hide Sensor labels',
                      value: 'hide_sensor_labels',
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
        },
      ]);
    });
  });

  describe('getOccupancySchema', () => {
    it('should return schema with occupancy configuration', () => {
      const entities = Object.keys(mockHass.entities);
      const schema = getOccupancySchema(mockHass, entities);

      expect(schema).to.deep.equal([
        {
          name: 'occupancy',
          label: 'editor.occupancy.occupancy_presence_detection',
          type: 'grid',
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
                  mode: 'list',
                  options: [
                    {
                      label: 'Disable Card Border',
                      value: 'disabled_card_styles',
                    },
                    {
                      label: 'Disable Card Border Animations',
                      value: 'disabled_card_styles_animation',
                    },
                    {
                      label: 'Disable Icon Color',
                      value: 'disable_icon_styles',
                    },
                    {
                      label: 'Disable Icon Animations',
                      value: 'disable_icon_animation',
                    },
                  ],
                },
              },
            },
          ],
        },
      ]);
    });
  });
});
