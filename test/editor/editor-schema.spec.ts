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
          label: 'editor.area_side_entities',
          required: false,
          selector: {
            entity: { multiple: true, include_entities: entities },
          },
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
      ]);
    });
  });

  describe('getSensorsSchema', () => {
    it('should return schema with sensors, sensor classes, and sensor layout', () => {
      const entities = Object.keys(mockHass.entities);
      const sensorClasses = ['temperature', 'humidity', 'pressure'];
      const schema = getSensorsSchema(mockHass, sensorClasses, entities);

      expect(schema).to.have.length(3);
      expect(schema[0]?.name).to.equal('sensors');
      expect(schema[1]?.name).to.equal('sensor_classes');
      expect(schema[2]?.name).to.equal('sensor_layout');
    });
  });

  describe('getMainSchema', () => {
    it('should return schema with area, entity, content, interactions, styles, and features', () => {
      const entities = Object.keys(mockHass.entities);
      const schema = getMainSchema(mockHass, entities);

      expect(schema).to.be.an('array');
      expect(schema.length).to.be.greaterThan(0);
      expect(schema[0]?.name).to.equal('area');
    });
  });

  describe('getOccupancySchema', () => {
    it('should return schema with occupancy configuration', () => {
      const entities = Object.keys(mockHass.entities);
      const schema = getOccupancySchema(mockHass, entities);

      expect(schema).to.be.an('array');
      expect(schema.length).to.equal(1);
      expect(schema[0]?.name).to.equal('occupancy');
      expect(schema[0]?.type).to.equal('grid');
    });
  });
});
