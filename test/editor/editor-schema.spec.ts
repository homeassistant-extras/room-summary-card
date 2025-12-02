import {
  areaEntities,
  deviceClasses,
  entityFeaturesSchema,
  getEntitiesStylesSchema,
  getMainSchema,
  getOccupancySchema,
  getSensorsSchema,
  getSensorsSchemaRest,
} from '@editor/editor-schema';
import * as sensorModule from '@hass/data/sensor';
import type { HomeAssistant } from '@hass/types';
import * as localizeModule from '@localize/localize';
import { expect } from 'chai';
import { stub, type SinonStub } from 'sinon';

describe('editor-schema.ts', () => {
  let mockHass: HomeAssistant;
  let getSensorNumericDeviceClassesStub: SinonStub;
  let localizeStub: SinonStub;

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

    localizeStub = stub(localizeModule, 'localize').callsFake(
      (hass: HomeAssistant, key: string) => key,
    );
  });

  afterEach(() => {
    getSensorNumericDeviceClassesStub.restore();
    localizeStub.restore();
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

  describe('getEntitiesStylesSchema', () => {
    it('should return schema array with entity styles grid and slider style', () => {
      const schema = getEntitiesStylesSchema(mockHass);

      expect(schema).to.be.an('array');
      expect(schema).to.have.lengthOf(2);
      expect(schema[0]).to.deep.equal({
        name: 'styles',
        label: 'editor.styles.css_styles',
        type: 'grid',
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
      });
      expect(schema[1]).to.deep.equal({
        name: 'slider_style',
        label: 'editor.slider.slider_style',
        required: false,
        selector: {
          select: {
            mode: 'dropdown',
            options: [
              {
                label: 'editor.slider.minimalist',
                value: 'minimalist',
              },
              {
                label: 'editor.slider.track',
                value: 'track',
              },
              {
                label: 'editor.slider.line',
                value: 'line',
              },
              {
                label: 'editor.slider.filled',
                value: 'filled',
              },
              {
                label: 'editor.slider.gradient',
                value: 'gradient',
              },
              {
                label: 'editor.slider.dual_rail',
                value: 'dual-rail',
              },
              {
                label: 'editor.slider.dots',
                value: 'dots',
              },
              {
                label: 'editor.slider.notched',
                value: 'notched',
              },
              {
                label: 'editor.slider.grid',
                value: 'grid',
              },
              {
                label: 'editor.slider.glow',
                value: 'glow',
              },
              {
                label: 'editor.slider.shadow_trail',
                value: 'shadow-trail',
              },
              {
                label: 'editor.slider.outlined',
                value: 'outlined',
              },
            ],
          },
        },
      });
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
                  label: 'editor.layout.default_in_label_area',
                  value: 'default',
                },
                {
                  label: 'editor.layout.bottom',
                  value: 'bottom',
                },
                {
                  label: 'editor.layout.vertical_stack',
                  value: 'stacked',
                },
              ],
            },
          },
        },
      ]);
    });
  });

  describe('getSensorsSchemaRest', () => {
    it('should return schema with sensor classes, sensor layout, sensor styles, and sensor features', () => {
      const sensorClasses = ['temperature', 'humidity', 'pressure'];
      const schema = getSensorsSchemaRest(mockHass, sensorClasses);

      expect(schema).to.have.lengthOf(3);
      expect(schema[0]).to.deep.equal({
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
      });
      expect(schema[1]).to.deep.equal({
        name: 'sensor_layout',
        label: 'editor.layout.sensor_layout',
        required: false,
        selector: {
          select: {
            mode: 'dropdown',
            options: [
              {
                label: 'editor.layout.default_in_label_area',
                value: 'default',
              },
              {
                label: 'editor.layout.bottom',
                value: 'bottom',
              },
              {
                label: 'editor.layout.vertical_stack',
                value: 'stacked',
              },
            ],
          },
        },
      });
      expect(schema[2]).to.deep.equal({
        name: 'styles',
        label: 'editor.styles.css_styles',
        type: 'grid',
        column_min_width: '100%',
        schema: [
          {
            name: 'sensors',
            label: 'editor.styles.sensor_styles',
            required: false,
            selector: { object: {} },
          },
        ],
      });
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
                  selector: { media: { image_upload: true } },
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
                          label: 'editor.background.disable_background_image',
                          value: 'disable',
                        },
                        {
                          label: 'editor.icon.icon_background',
                          value: 'icon_background',
                        },
                        {
                          label: 'editor.icon.hide_icon_only',
                          value: 'hide_icon_only',
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
                      label: 'editor.stats.hide_area_stats',
                      value: 'hide_area_stats',
                    },
                    {
                      label: 'editor.icon.hide_room_icon',
                      value: 'hide_room_icon',
                    },
                    {
                      label: 'editor.styles.skip_climate_styles',
                      value: 'skip_climate_styles',
                    },
                    {
                      label: 'editor.card.skip_card_background_styles',
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

  describe('entityFeaturesSchema', () => {
    it('should return schema with entity-specific features including slider', () => {
      const schema = entityFeaturesSchema(mockHass);

      expect(schema).to.deep.equal({
        name: 'features',
        label: 'editor.features.features',
        required: false,
        selector: {
          select: {
            multiple: true,
            mode: 'list',
            options: [
              {
                label: 'editor.entity.show_entity_labels',
                value: 'show_entity_labels',
              },
              {
                label: 'editor.features.exclude_default_entities',
                value: 'exclude_default_entities',
              },
              {
                label: 'editor.entity.ignore_entity',
                value: 'ignore_entity',
              },
              {
                label: 'editor.features.sticky_entities',
                value: 'sticky_entities',
              },
              {
                label: 'editor.features.slider',
                value: 'slider',
              },
            ],
          },
        },
      });
    });
  });

  describe('getOccupancySchema', () => {
    it('should return schema with occupancy configuration', () => {
      const entities = Object.keys(mockHass.entities);
      const schema = getOccupancySchema(mockHass, entities);

      expect(schema).to.deep.equal([
        {
          name: 'occupancy',
          label: 'editor.alarm.occupancy_detection',
          type: 'expandable',
          icon: 'mdi:motion-sensor',
          schema: [
            {
              name: 'entities',
              label: 'editor.alarm.motion_occupancy_presence_sensors',
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
              label: 'editor.alarm.alarm_options',
              required: false,
              selector: {
                select: {
                  multiple: true,
                  mode: 'list',
                  options: [
                    {
                      label: 'editor.card.disable_card_border',
                      value: 'disabled_card_styles',
                    },
                    {
                      label: 'editor.card.disable_card_border_animations',
                      value: 'disabled_card_styles_animation',
                    },
                    {
                      label: 'editor.icon.disable_icon_color',
                      value: 'disable_icon_styles',
                    },
                    {
                      label: 'editor.icon.disable_icon_animations',
                      value: 'disable_icon_animation',
                    },
                  ],
                },
              },
            },
          ],
        },
        {
          name: 'smoke',
          label: 'editor.alarm.smoke_detection',
          type: 'expandable',
          icon: 'mdi:smoke-detector',
          schema: [
            {
              name: 'entities',
              label: 'editor.alarm.smoke_detectors',
              required: true,
              selector: {
                entity: {
                  multiple: true,
                  include_entities: entities,
                  filter: {
                    domain: ['binary_sensor'],
                    device_class: ['smoke'],
                  },
                },
              },
            },
            {
              name: 'card_border_color',
              label: 'editor.card.card_border_color_smoke',
              required: false,
              selector: { ui_color: {} },
            },
            {
              name: 'icon_color',
              label: 'editor.icon.icon_background_color_smoke',
              required: false,
              selector: { ui_color: {} },
            },
            {
              name: 'options',
              label: 'editor.alarm.alarm_options',
              required: false,
              selector: {
                select: {
                  multiple: true,
                  mode: 'list',
                  options: [
                    {
                      label: 'editor.card.disable_card_border',
                      value: 'disabled_card_styles',
                    },
                    {
                      label: 'editor.card.disable_card_border_animations',
                      value: 'disabled_card_styles_animation',
                    },
                    {
                      label: 'editor.icon.disable_icon_color',
                      value: 'disable_icon_styles',
                    },
                    {
                      label: 'editor.icon.disable_icon_animations',
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
