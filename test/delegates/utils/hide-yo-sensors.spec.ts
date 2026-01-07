import { getSensors } from '@delegates/utils/hide-yo-sensors';
import * as sensorAveragesModule from '@delegates/utils/sensor-averages';
import type { HomeAssistant } from '@hass/types';
import { createStateEntity as e } from '@test/test-helpers';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { stub, type SinonStub } from 'sinon';

describe('get-sensors.ts', () => {
  let mockHass: HomeAssistant;
  let calculateAveragesStub: SinonStub;
  let defaultConfig: Config;

  beforeEach(() => {
    calculateAveragesStub = stub(sensorAveragesModule, 'calculateAverages');

    // Default config used by most tests - can be overridden in individual tests
    defaultConfig = {
      area: 'living_room',
    };

    mockHass = {
      states: {
        'sensor.living_room_temperature': e(
          'sensor',
          'living_room_temperature',
          '72',
          {
            device_class: 'temperature',
            unit_of_measurement: '°F',
          },
        ),
        'sensor.living_room_humidity': e(
          'sensor',
          'living_room_humidity',
          '45',
          {
            device_class: 'humidity',
            unit_of_measurement: '%',
          },
        ),
        'sensor.living_room_pressure': e(
          'sensor',
          'living_room_pressure',
          '1013',
          {
            device_class: 'pressure',
            unit_of_measurement: 'hPa',
          },
        ),
        'sensor.custom_sensor_1': e('sensor', 'custom_sensor_1', '100'),
        'sensor.custom_sensor_2': e('sensor', 'custom_sensor_2', '200'),
        'sensor.other_area_temp': e('sensor', 'other_area_temp', '68', {
          device_class: 'temperature',
        }),
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
        'sensor.custom_sensor_1': {
          entity_id: 'sensor.custom_sensor_1',
          device_id: 'device_4',
          area_id: 'living_room',
          labels: [],
        },
        'sensor.custom_sensor_2': {
          entity_id: 'sensor.custom_sensor_2',
          device_id: 'device_5',
          area_id: 'living_room',
          labels: [],
        },
        'sensor.other_area_temp': {
          entity_id: 'sensor.other_area_temp',
          device_id: 'device_6',
          area_id: 'kitchen', // Different area
          labels: [],
        },
      },
      devices: {
        device_1: { area_id: 'living_room' },
        device_2: { area_id: 'living_room' },
        device_3: { area_id: 'living_room' },
        device_4: { area_id: 'living_room' },
        device_5: { area_id: 'living_room' },
        device_6: { area_id: 'kitchen' },
      },
      areas: {
        living_room: {
          area_id: 'living_room',
          name: 'Living Room',
          icon: 'mdi:sofa',
        },
        kitchen: {
          area_id: 'kitchen',
          name: 'Kitchen',
          icon: 'mdi:kitchen',
        },
      },
    } as any as HomeAssistant;

    // Default stub return
    calculateAveragesStub.returns([]);
  });

  afterEach(() => {
    calculateAveragesStub.restore();
  });

  it('should return SensorData with individual and averaged properties', () => {
    const mockAveraged = [
      e('sensor', 'averaged_temp', '72', { device_class: 'temperature' }),
    ];
    calculateAveragesStub.returns(mockAveraged);

    const result = getSensors(mockHass, defaultConfig);

    expect(result).to.have.keys([
      'individual',
      'averaged',
      'problemSensors',
      'mold',
      'lightEntities',
      'ambientLightEntities',
      'thresholdSensors',
    ]);
    expect(result.individual).to.be.an('array');
    expect(result.averaged).to.equal(mockAveraged);
  });

  it('should call calculateAverages with correct parameters', () => {
    const config: Config = {
      ...defaultConfig,
      sensor_classes: ['temperature', 'humidity', 'pressure'],
    };

    getSensors(mockHass, config);

    expect(calculateAveragesStub.calledOnce).to.be.true;
    const [classSensors, sensorClasses] = calculateAveragesStub.firstCall.args;

    // Should include temp, humidity, and pressure sensors from living_room
    expect(classSensors).to.have.lengthOf(3);
    expect(classSensors.map((s: any) => s.entity_id)).to.include.members([
      'sensor.living_room_temperature',
      'sensor.living_room_humidity',
      'sensor.living_room_pressure',
    ]);
    expect(sensorClasses).to.deep.equal([
      'temperature',
      'humidity',
      'pressure',
    ]);
  });

  it('should use default sensor classes when not specified', () => {
    getSensors(mockHass, defaultConfig);

    const [, sensorClasses] = calculateAveragesStub.firstCall.args;
    expect(sensorClasses).to.deep.equal([
      'temperature',
      'humidity',
      'illuminance',
    ]);
  });

  it('should return config sensors in individual array', () => {
    const config: Config = {
      ...defaultConfig,
      sensors: ['sensor.custom_sensor_2', 'sensor.custom_sensor_1'],
    };

    const result = getSensors(mockHass, config);

    expect(result.individual).to.have.lengthOf(2);
    expect(result.individual[0]!.entity_id).to.equal('sensor.custom_sensor_2');
    expect(result.individual[1]!.entity_id).to.equal('sensor.custom_sensor_1');
  });

  it('should handle SensorConfig format in sensors array', () => {
    const config: Config = {
      ...defaultConfig,
      sensors: [
        { entity_id: 'sensor.custom_sensor_2' },
        { entity_id: 'sensor.custom_sensor_1' },
      ],
    };

    const result = getSensors(mockHass, config);

    expect(result.individual).to.have.lengthOf(2);
    expect(result.individual[0]!.entity_id).to.equal('sensor.custom_sensor_2');
    expect(result.individual[1]!.entity_id).to.equal('sensor.custom_sensor_1');
  });

  it('should handle mixed string and SensorConfig formats in sensors array', () => {
    const config: Config = {
      ...defaultConfig,
      sensors: [
        'sensor.custom_sensor_2',
        { entity_id: 'sensor.custom_sensor_1' },
        'sensor.living_room_temperature',
      ],
    };

    const result = getSensors(mockHass, config);

    expect(result.individual).to.have.lengthOf(3);
    expect(result.individual[0]!.entity_id).to.equal('sensor.custom_sensor_2');
    expect(result.individual[1]!.entity_id).to.equal('sensor.custom_sensor_1');
    expect(result.individual[2]!.entity_id).to.equal(
      'sensor.living_room_temperature',
    );
  });

  it('should exclude sensors from other areas', () => {
    const config: Config = {
      ...defaultConfig,
      sensors: [],
    };

    const result = getSensors(mockHass, config);

    // Should not include the kitchen sensor
    expect(result.individual.map((s) => s.entity_id)).to.not.include(
      'sensor.other_area_temp', // This is in kitchen area
    );
  });

  it('should exclude sensors from other areas unless configured', () => {
    const config: Config = {
      ...defaultConfig,
      sensors: ['sensor.other_area_temp'], // This is in kitchen area
    };

    const result = getSensors(mockHass, config);

    // Should include the kitchen sensor since it's explicitly configured
    expect(result.individual.map((s) => s.entity_id)).to.deep.equal([
      'sensor.other_area_temp',
    ]);
  });

  it('should include sensors from other areas when configured with SensorConfig format', () => {
    const config: Config = {
      ...defaultConfig,
      sensors: [{ entity_id: 'sensor.other_area_temp' }], // This is in kitchen area
    };

    const result = getSensors(mockHass, config);

    // Should include the kitchen sensor since it's explicitly configured
    expect(result.individual.map((s) => s.entity_id)).to.deep.equal([
      'sensor.other_area_temp',
    ]);
  });

  it('should skip default entities when exclude_default_entities is enabled', () => {
    const config: Config = {
      ...defaultConfig,
      features: ['exclude_default_entities'],
    };

    getSensors(mockHass, config);

    const [classSensors] = calculateAveragesStub.firstCall.args;
    expect(classSensors).to.have.lengthOf(0);
  });

  it('should still include config sensors when exclude_default_entities is enabled', () => {
    const config: Config = {
      ...defaultConfig,
      features: ['exclude_default_entities'],
      sensors: ['sensor.custom_sensor_1'],
    };

    const result = getSensors(mockHass, config);

    expect(result.individual).to.have.lengthOf(1);
    expect(result.individual[0]!.entity_id).to.equal('sensor.custom_sensor_1');
  });

  it('should handle entities assigned via device area', () => {
    // Add entity with no direct area but device in correct area
    mockHass.entities['sensor.device_area_sensor'] = {
      entity_id: 'sensor.device_area_sensor',
      device_id: 'device_1', // This device is in living_room
      area_id: '', // No direct area
      labels: [],
    };
    mockHass.states['sensor.device_area_sensor'] = e(
      'sensor',
      'device_area_sensor',
      '50',
      {
        device_class: 'illuminance',
      },
    );

    const config: Config = {
      ...defaultConfig,
      sensors: ['sensor.device_area_sensor'],
    };

    const result = getSensors(mockHass, config);

    expect(result.individual.map((s) => s.entity_id)).to.include(
      'sensor.device_area_sensor',
    );
  });

  it('should handle missing entities gracefully', () => {
    const config: Config = {
      ...defaultConfig,
      sensors: [
        'sensor.living_room_temperature',
        'sensor.nonexistent_sensor', // This doesn't exist
      ],
    };

    const result = getSensors(mockHass, config);

    // Should include only the existing sensor
    expect(result.individual).to.have.lengthOf(1);
    expect(result.individual[0]!.entity_id).to.equal(
      'sensor.living_room_temperature',
    );
  });

  it('should return empty arrays when no matching sensors found', () => {
    const config: Config = {
      area: 'empty_area',
    };

    const result = getSensors(mockHass, config);

    expect(result.individual).to.be.an('array');
    expect(result.individual).to.have.lengthOf(0);
    expect(result.averaged).to.be.an('array');
    expect(result.lightEntities).to.be.an('array');
    expect(result.lightEntities).to.have.lengthOf(0);
  });

  it('should collect light entities when multi_light_background feature is enabled', () => {
    // Add light entities to the mock
    mockHass.states['light.living_room_main'] = e(
      'light',
      'living_room_main',
      'on',
    );
    mockHass.states['light.living_room_lamp'] = e(
      'light',
      'living_room_lamp',
      'off',
    );
    mockHass.states['light.kitchen_light'] = e('light', 'kitchen_light', 'on');

    mockHass.entities['light.living_room_main'] = {
      entity_id: 'light.living_room_main',
      device_id: 'device_7',
      area_id: 'living_room',
      labels: [],
    };
    mockHass.entities['light.living_room_lamp'] = {
      entity_id: 'light.living_room_lamp',
      device_id: 'device_8',
      area_id: 'living_room',
      labels: [],
    };
    mockHass.entities['light.kitchen_light'] = {
      entity_id: 'light.kitchen_light',
      device_id: 'device_9',
      area_id: 'kitchen',
      labels: [],
    };

    const config: Config = {
      ...defaultConfig,
      features: ['multi_light_background'],
    };

    const result = getSensors(mockHass, config);

    expect(result.lightEntities).to.be.an('array');
    expect(result.lightEntities).to.have.lengthOf(2);
    expect(result.lightEntities.map((l) => l.entity_id)).to.include.members([
      'light.living_room_main',
      'light.living_room_lamp',
    ]);
    expect(result.lightEntities.map((l) => l.entity_id)).to.not.include(
      'light.kitchen_light',
    );
  });

  it('should collect configured light entities even from other areas', () => {
    // Add light entities to the mock
    mockHass.states['light.kitchen_light'] = e('light', 'kitchen_light', 'on');
    mockHass.states['light.bedroom_light'] = e('light', 'bedroom_light', 'off');

    mockHass.entities['light.kitchen_light'] = {
      entity_id: 'light.kitchen_light',
      device_id: 'device_9',
      area_id: 'kitchen',
      labels: [],
    };
    mockHass.entities['light.bedroom_light'] = {
      entity_id: 'light.bedroom_light',
      device_id: 'device_10',
      area_id: 'bedroom',
      labels: [],
    };

    const config: Config = {
      ...defaultConfig,
      features: ['multi_light_background'],
      lights: ['light.kitchen_light', 'light.bedroom_light'],
    };

    const result = getSensors(mockHass, config);

    expect(result.lightEntities).to.be.an('array');
    expect(result.lightEntities).to.have.lengthOf(2);
    expect(result.lightEntities.map((l) => l.entity_id)).to.include.members([
      'light.kitchen_light',
      'light.bedroom_light',
    ]);
  });

  it('should not collect light entities when multi_light_background feature is disabled', () => {
    // Add light entities to the mock
    mockHass.states['light.living_room_main'] = e(
      'light',
      'living_room_main',
      'on',
    );
    mockHass.entities['light.living_room_main'] = {
      entity_id: 'light.living_room_main',
      device_id: 'device_7',
      area_id: 'living_room',
      labels: [],
    };

    const result = getSensors(mockHass, defaultConfig);

    expect(result.lightEntities).to.be.an('array');
    expect(result.lightEntities).to.have.lengthOf(0);
  });

  describe('ambient lights', () => {
    beforeEach(() => {
      // Add light entities to the mock
      mockHass.states['light.living_room_main'] = e(
        'light',
        'living_room_main',
        'on',
      );
      mockHass.states['light.living_room_led'] = e(
        'light',
        'living_room_led',
        'on',
      );
      mockHass.entities['light.living_room_main'] = {
        entity_id: 'light.living_room_main',
        device_id: 'device_7',
        area_id: 'living_room',
        labels: [],
      };
      mockHass.entities['light.living_room_led'] = {
        entity_id: 'light.living_room_led',
        device_id: 'device_8',
        area_id: 'living_room',
        labels: [],
      };
    });

    it('should separate ambient lights from regular lights', () => {
      const config: Config = {
        ...defaultConfig,
        features: ['multi_light_background'],
        lights: [
          'light.living_room_main',
          { entity_id: 'light.living_room_led', type: 'ambient' },
        ],
      };

      const result = getSensors(mockHass, config);

      expect(result.lightEntities).to.have.lengthOf(1);
      expect(result.lightEntities[0]!.entity_id).to.equal(
        'light.living_room_main',
      );

      expect(result.ambientLightEntities).to.have.lengthOf(1);
      expect(result.ambientLightEntities[0]!.entity_id).to.equal(
        'light.living_room_led',
      );
    });

    it('should handle lights config with entity_id object format as regular light', () => {
      const config: Config = {
        ...defaultConfig,
        features: ['multi_light_background'],
        lights: [
          { entity_id: 'light.living_room_main' },
          { entity_id: 'light.living_room_led', type: 'ambient' },
        ],
      };

      const result = getSensors(mockHass, config);

      expect(result.lightEntities).to.have.lengthOf(1);
      expect(result.lightEntities[0]!.entity_id).to.equal(
        'light.living_room_main',
      );

      expect(result.ambientLightEntities).to.have.lengthOf(1);
      expect(result.ambientLightEntities[0]!.entity_id).to.equal(
        'light.living_room_led',
      );
    });

    it('should return empty ambientLightEntities when no ambient lights are configured', () => {
      const config: Config = {
        ...defaultConfig,
        features: ['multi_light_background'],
        lights: ['light.living_room_main', 'light.living_room_led'],
      };

      const result = getSensors(mockHass, config);

      expect(result.lightEntities).to.have.lengthOf(2);
      expect(result.ambientLightEntities).to.have.lengthOf(0);
    });

    it('should auto-discover regular lights only (not ambient) when no lights configured', () => {
      const config: Config = {
        ...defaultConfig,
        features: ['multi_light_background'],
        // No lights configured - should auto-discover
      };

      const result = getSensors(mockHass, config);

      // Auto-discovered lights go to lightEntities, not ambientLightEntities
      expect(result.lightEntities).to.have.lengthOf(2);
      expect(result.lightEntities.map((l) => l.entity_id)).to.include.members([
        'light.living_room_main',
        'light.living_room_led',
      ]);
      expect(result.ambientLightEntities).to.have.lengthOf(0);
    });
  });

  describe('threshold sensors collection', () => {
    beforeEach(() => {
      // Add threshold sensor entities
      mockHass.states['sensor.temperature_threshold'] = e(
        'sensor',
        'temperature_threshold',
        '75',
        {
          device_class: 'temperature',
          unit_of_measurement: '°F',
        },
      );
      mockHass.states['sensor.humidity_threshold'] = e(
        'sensor',
        'humidity_threshold',
        '60',
        {
          device_class: 'humidity',
          unit_of_measurement: '%',
        },
      );
      mockHass.states['sensor.other_area_threshold'] = e(
        'sensor',
        'other_area_threshold',
        '80',
        {
          device_class: 'temperature',
        },
      );

      mockHass.entities['sensor.temperature_threshold'] = {
        entity_id: 'sensor.temperature_threshold',
        device_id: 'device_threshold_1',
        area_id: 'living_room',
        labels: [],
      };
      mockHass.entities['sensor.humidity_threshold'] = {
        entity_id: 'sensor.humidity_threshold',
        device_id: 'device_threshold_2',
        area_id: 'living_room',
        labels: [],
      };
      mockHass.entities['sensor.other_area_threshold'] = {
        entity_id: 'sensor.other_area_threshold',
        device_id: 'device_threshold_3',
        area_id: 'kitchen', // Different area
        labels: [],
      };
    });

    it('should collect threshold sensors when value is a string (entity ID)', () => {
      const config: Config = {
        ...defaultConfig,
        thresholds: {
          temperature: [
            {
              value: 'sensor.temperature_threshold', // Entity ID string
            },
          ],
          humidity: [
            {
              value: 'sensor.humidity_threshold', // Entity ID string
            },
          ],
        },
      };

      const result = getSensors(mockHass, config);

      expect(result.thresholdSensors).to.be.an('array');
      expect(result.thresholdSensors).to.have.lengthOf(2);
      expect(
        result.thresholdSensors.map((s) => s.entity_id),
      ).to.include.members([
        'sensor.temperature_threshold',
        'sensor.humidity_threshold',
      ]);
    });

    it('should NOT collect threshold sensors when value is a number', () => {
      const config: Config = {
        ...defaultConfig,
        thresholds: {
          temperature: [
            {
              value: 75, // Number, not entity ID
            },
          ],
          humidity: [
            {
              value: 60, // Number, not entity ID
            },
          ],
        },
      };

      const result = getSensors(mockHass, config);

      expect(result.thresholdSensors).to.be.an('array');
      expect(result.thresholdSensors).to.have.lengthOf(0);
    });

    it('should NOT collect threshold sensors when value is omitted', () => {
      const config: Config = {
        ...defaultConfig,
        thresholds: {
          temperature: [
            {
              // value omitted - uses default
            },
          ],
          humidity: [
            {
              // value omitted - uses default
            },
          ],
        },
      };

      const result = getSensors(mockHass, config);

      expect(result.thresholdSensors).to.be.an('array');
      expect(result.thresholdSensors).to.have.lengthOf(0);
    });

    it('should collect multiple threshold sensors from different entries', () => {
      const config: Config = {
        ...defaultConfig,
        thresholds: {
          temperature: [
            {
              value: 'sensor.temperature_threshold',
            },
            {
              value: 'sensor.other_area_threshold',
            },
          ],
          humidity: [
            {
              value: 'sensor.humidity_threshold',
            },
          ],
        },
      };

      const result = getSensors(mockHass, config);

      expect(result.thresholdSensors).to.be.an('array');
      expect(result.thresholdSensors).to.have.lengthOf(3);
      expect(
        result.thresholdSensors.map((s) => s.entity_id),
      ).to.include.members([
        'sensor.temperature_threshold',
        'sensor.other_area_threshold',
        'sensor.humidity_threshold',
      ]);
    });

    it('should handle mixed number and string values correctly', () => {
      const config: Config = {
        ...defaultConfig,
        thresholds: {
          temperature: [
            {
              value: 75, // Number - should NOT be collected
            },
            {
              value: 'sensor.temperature_threshold', // String - should be collected
            },
          ],
          humidity: [
            {
              value: 60, // Number - should NOT be collected
            },
          ],
        },
      };

      const result = getSensors(mockHass, config);

      expect(result.thresholdSensors).to.be.an('array');
      expect(result.thresholdSensors).to.have.lengthOf(1);
      expect(result.thresholdSensors[0]!.entity_id).to.equal(
        'sensor.temperature_threshold',
      );
    });

    it('should ignore entity_id field when collecting threshold sensors', () => {
      const config: Config = {
        ...defaultConfig,
        thresholds: {
          temperature: [
            {
              entity_id: 'sensor.living_room_temperature', // This is NOT collected
              value: 'sensor.temperature_threshold', // This IS collected
            },
          ],
        },
      };

      const result = getSensors(mockHass, config);

      expect(result.thresholdSensors).to.be.an('array');
      expect(result.thresholdSensors).to.have.lengthOf(1);
      expect(result.thresholdSensors[0]!.entity_id).to.equal(
        'sensor.temperature_threshold',
      );
      // entity_id should NOT be in thresholdSensors
      expect(result.thresholdSensors.map((s) => s.entity_id)).to.not.include(
        'sensor.living_room_temperature',
      );
    });

    it('should return empty thresholdSensors array when no thresholds configured', () => {
      const result = getSensors(mockHass, defaultConfig);

      expect(result.thresholdSensors).to.be.an('array');
      expect(result.thresholdSensors).to.have.lengthOf(0);
    });
  });

  describe('hide_hidden_entities feature', () => {
    beforeEach(() => {
      // Add a hidden sensor entity
      mockHass.states['sensor.hidden_sensor'] = e(
        'sensor',
        'hidden_sensor',
        '50',
        {
          device_class: 'temperature',
        },
      );
      mockHass.entities['sensor.hidden_sensor'] = {
        entity_id: 'sensor.hidden_sensor',
        device_id: 'device_hidden',
        area_id: 'living_room',
        labels: [],
        hidden: true,
      };
    });

    it('should filter out hidden entities when hide_hidden_entities feature is enabled', () => {
      const config: Config = {
        ...defaultConfig,
        features: ['hide_hidden_entities'],
      };

      getSensors(mockHass, config);

      const [classSensors] = calculateAveragesStub.firstCall.args;
      // Should not include the hidden sensor
      expect(classSensors.map((s: any) => s.entity_id)).to.not.include(
        'sensor.hidden_sensor',
      );
    });

    it('should include hidden entities when hide_hidden_entities feature is disabled', () => {
      const config: Config = {
        ...defaultConfig,
        // Feature not enabled
      };

      getSensors(mockHass, config);

      const [classSensors] = calculateAveragesStub.firstCall.args;
      // Should include the hidden sensor
      expect(classSensors.map((s: any) => s.entity_id)).to.include(
        'sensor.hidden_sensor',
      );
    });

    it('should filter out hidden config sensors when hide_hidden_entities feature is enabled', () => {
      const config: Config = {
        ...defaultConfig,
        features: ['hide_hidden_entities'],
        sensors: ['sensor.hidden_sensor', 'sensor.custom_sensor_1'],
      };

      const result = getSensors(mockHass, config);

      // Should only include non-hidden config sensor
      expect(result.individual).to.have.lengthOf(1);
      expect(result.individual[0]!.entity_id).to.equal(
        'sensor.custom_sensor_1',
      );
      expect(result.individual.map((s) => s.entity_id)).to.not.include(
        'sensor.hidden_sensor',
      );
    });

    it('should filter out hidden threshold sensors when hide_hidden_entities feature is enabled', () => {
      // Add hidden threshold sensor
      mockHass.states['sensor.hidden_threshold'] = e(
        'sensor',
        'hidden_threshold',
        '75',
        {
          device_class: 'temperature',
        },
      );
      mockHass.entities['sensor.hidden_threshold'] = {
        entity_id: 'sensor.hidden_threshold',
        device_id: 'device_hidden_threshold',
        area_id: 'living_room',
        labels: [],
        hidden: true,
      };

      const config: Config = {
        ...defaultConfig,
        features: ['hide_hidden_entities'],
        thresholds: {
          temperature: [
            {
              value: 'sensor.hidden_threshold',
            },
          ],
        },
      };

      const result = getSensors(mockHass, config);

      // Should not include hidden threshold sensor
      expect(result.thresholdSensors).to.have.lengthOf(0);
      expect(result.thresholdSensors.map((s) => s.entity_id)).to.not.include(
        'sensor.hidden_threshold',
      );
    });

    it('should filter out hidden light entities when hide_hidden_entities feature is enabled', () => {
      // Add hidden light entity
      mockHass.states['light.hidden_light'] = e('light', 'hidden_light', 'on');
      mockHass.entities['light.hidden_light'] = {
        entity_id: 'light.hidden_light',
        device_id: 'device_hidden_light',
        area_id: 'living_room',
        labels: [],
        hidden: true,
      };

      const config: Config = {
        ...defaultConfig,
        features: ['hide_hidden_entities', 'multi_light_background'],
      };

      const result = getSensors(mockHass, config);

      // Should not include hidden light entity
      expect(result.lightEntities).to.have.lengthOf(0);
      expect(result.lightEntities.map((l) => l.entity_id)).to.not.include(
        'light.hidden_light',
      );
    });
  });

  describe('problem sensors detection', () => {
    beforeEach(() => {
      // Add problem entities with different detection methods
      mockHass.states['binary_sensor.problem_label'] = e(
        'binary_sensor',
        'problem_label',
        'on',
      );
      mockHass.states['binary_sensor.problem_device_class'] = e(
        'binary_sensor',
        'problem_device_class',
        'on',
        {
          device_class: 'problem',
        },
      );
      mockHass.states['binary_sensor.problem_both'] = e(
        'binary_sensor',
        'problem_both',
        'on',
        {
          device_class: 'problem',
        },
      );
      mockHass.states['binary_sensor.normal_sensor'] = e(
        'binary_sensor',
        'normal_sensor',
        'off',
      );
      mockHass.states['binary_sensor.other_area_problem'] = e(
        'binary_sensor',
        'other_area_problem',
        'on',
        {
          device_class: 'problem',
        },
      );

      mockHass.entities['binary_sensor.problem_label'] = {
        entity_id: 'binary_sensor.problem_label',
        device_id: 'device_problem_label',
        area_id: 'living_room',
        labels: ['problem'],
      };
      mockHass.entities['binary_sensor.problem_device_class'] = {
        entity_id: 'binary_sensor.problem_device_class',
        device_id: 'device_problem_device_class',
        area_id: 'living_room',
        labels: [],
      };
      mockHass.entities['binary_sensor.problem_both'] = {
        entity_id: 'binary_sensor.problem_both',
        device_id: 'device_problem_both',
        area_id: 'living_room',
        labels: ['problem'],
      };
      mockHass.entities['binary_sensor.normal_sensor'] = {
        entity_id: 'binary_sensor.normal_sensor',
        device_id: 'device_normal',
        area_id: 'living_room',
        labels: [],
      };
      mockHass.entities['binary_sensor.other_area_problem'] = {
        entity_id: 'binary_sensor.other_area_problem',
        device_id: 'device_other_area',
        area_id: 'kitchen', // Different area
        labels: [],
      };
    });

    it('should detect entities with "problem" label', () => {
      const result = getSensors(mockHass, defaultConfig);

      expect(result.problemSensors).to.be.an('array');
      expect(result.problemSensors.map((s) => s.entity_id)).to.include(
        'binary_sensor.problem_label',
      );
    });

    it('should detect entities with device_class: problem', () => {
      const result = getSensors(mockHass, defaultConfig);

      expect(result.problemSensors).to.be.an('array');
      expect(result.problemSensors.map((s) => s.entity_id)).to.include(
        'binary_sensor.problem_device_class',
      );
    });

    it('should detect entities that have both label and device_class', () => {
      const result = getSensors(mockHass, defaultConfig);

      expect(result.problemSensors).to.be.an('array');
      expect(result.problemSensors.map((s) => s.entity_id)).to.include(
        'binary_sensor.problem_both',
      );
    });

    it('should not detect entities without label or device_class', () => {
      const result = getSensors(mockHass, defaultConfig);

      expect(result.problemSensors.map((s) => s.entity_id)).to.not.include(
        'binary_sensor.normal_sensor',
      );
    });

    it('should only include entities in the correct area', () => {
      const result = getSensors(mockHass, defaultConfig);

      expect(result.problemSensors.map((s) => s.entity_id)).to.not.include(
        'binary_sensor.other_area_problem',
      );
    });

    it('should include all problem entities from the area', () => {
      const result = getSensors(mockHass, defaultConfig);

      expect(result.problemSensors).to.have.lengthOf(3);
      expect(result.problemSensors.map((s) => s.entity_id)).to.include.members([
        'binary_sensor.problem_label',
        'binary_sensor.problem_device_class',
        'binary_sensor.problem_both',
      ]);
    });
  });
});
