import * as featureModule from '@config/feature';
import { climateThresholds } from '@delegates/checks/thresholds';
import type { Config } from '@type/config';
import type { SensorData } from '@type/sensor';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { stub, type SinonStub } from 'sinon';

describe('climate-thresholds.ts', () => {
  let hasFeatureStub: SinonStub;

  beforeEach(() => {
    hasFeatureStub = stub(featureModule, 'hasFeature');
    hasFeatureStub.returns(false);
  });

  afterEach(() => {
    hasFeatureStub.restore();
  });

  describe('climateThresholds', () => {
    it('should return false for both when skip_climate_styles is enabled', () => {
      hasFeatureStub
        .withArgs(sinon.match.any, 'skip_climate_styles')
        .returns(true);

      const config: Config = { area: 'test' };
      const sensorData: SensorData = {
        individual: [],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        thresholdSensors: [],

      };

      const result = climateThresholds(config, sensorData);

      expect(result).to.deep.equal({ hot: false, humid: false });
    });

    it('should return false when temperature or humidity sensors are missing', () => {
      const config: Config = { area: 'test' };
      const sensorData: SensorData = {
        individual: [],
        averaged: [
          // Missing both temperature and humidity sensors
        ],
        problemSensors: [],
        lightEntities: [],
        thresholdSensors: [],

      };

      const result = climateThresholds(config, sensorData);

      expect(result).to.deep.equal({ hot: false, humid: false });
    });

    it('should detect hot and humid conditions using default thresholds', () => {
      const config: Config = { area: 'test' };
      const sensorData: SensorData = {
        individual: [],
        averaged: [
          {
            device_class: 'temperature',
            average: 85, // Above default 80
            uom: '°F',
            states: [],
            domain: 'sensor',
          },
          {
            device_class: 'humidity',
            average: 65, // Above default 60
            uom: '%',
            states: [],
            domain: 'sensor',
          },
        ],
        problemSensors: [],
        lightEntities: [],
        thresholdSensors: [],
      };

      const result = climateThresholds(config, sensorData);

      expect(result).to.deep.equal({ hot: true, humid: true });
    });

    const testCases = [
      {
        description: 'Thresholds are number',
        thresholds: {
          temperature: 75,
          humidity: 50
        },
        thresholdSensors: []
      },
      {
        description: 'Thresholds are entity',
        thresholds: {
          temperature: 'sensor.temperature_threshold',
          humidity: 'sensor.humidity_threshold'
        },
        thresholdSensors: [
          {
            entity_id: 'sensor.temperature_threshold',
            state: '75',
            domain: 'sensor',
            attributes: {
              device_class: 'temperature',
              unit_of_measurement: '°F',
            },
          },
          {
            entity_id: 'sensor.humidity_threshold',
            state: '50',
            domain: 'sensor',
            attributes: {
              device_class: 'humidity',
              unit_of_measurement: '%',
            },
          },
        ]
      }
    ];

    testCases.forEach((testCase) => {
      describe(testCase.description, () => {
        it('should use custom thresholds when provided', () => {
          const config: Config = {
            area: 'test',
            thresholds: {
              ...testCase.thresholds,
            },
          };
          const sensorData: SensorData = {
            individual: [],
            averaged: [
              {
                device_class: 'temperature',
                average: 78, // Above custom 75
                uom: '°F',
                states: [],
                domain: 'sensor',
              },
              {
                device_class: 'humidity',
                average: 45, // Below custom 50
                uom: '%',
                states: [],
                domain: 'sensor',
              },
            ],
            problemSensors: [],
            lightEntities: [],
            thresholdSensors: testCase.thresholdSensors,
          };

          const result = climateThresholds(config, sensorData);

          expect(result).to.deep.equal({ hot: true, humid: false });
        });

        it('should use specific entity states when entity IDs are configured', () => {
          const config: Config = {
            area: 'test',
            thresholds: {
              ...testCase.thresholds,
              temperature_entity: 'sensor.specific_temp',
              humidity_entity: 'sensor.specific_humidity',
            },
          };
          const sensorData: SensorData = {
            individual: [],
            averaged: [
              {
                device_class: 'temperature',
                average: 70, // Below threshold, but specific entity is above
                uom: '°F',
                states: [
                  {
                    entity_id: 'sensor.temp1',
                    state: '72',
                    domain: 'sensor',
                    attributes: {},
                  },
                  {
                    entity_id: 'sensor.specific_temp',
                    state: '78',
                    domain: 'sensor',
                    attributes: {},
                  }, // Above 75
                ],
                domain: 'sensor',
              },
              {
                device_class: 'humidity',
                average: 55, // Above threshold, but specific entity is below
                uom: '%',
                states: [
                  {
                    entity_id: 'sensor.humidity1',
                    state: '60',
                    domain: 'sensor',
                    attributes: {},
                  },
                  {
                    entity_id: 'sensor.specific_humidity',
                    state: '45',
                    domain: 'sensor',
                    attributes: {},
                  }, // Below 50
                ],
                domain: 'sensor',
              },
            ],
            problemSensors: [],
            lightEntities: [],
            thresholdSensors: testCase.thresholdSensors,
          };

          const result = climateThresholds(config, sensorData);

          expect(result).to.deep.equal({ hot: true, humid: false });
        });

        it('should use individual sensors when entity ID matches and device class is correct', () => {
          const config: Config = {
            area: 'test',
            thresholds: {
              ...testCase.thresholds,
              temperature_entity: 'sensor.individual_temp',
              humidity_entity: 'sensor.individual_humidity',
            },
          };
          const sensorData: SensorData = {
            individual: [
              {
                entity_id: 'sensor.individual_temp',
                state: '78', // Above threshold
                domain: 'sensor',
                attributes: {
                  device_class: 'temperature',
                  unit_of_measurement: '°F',
                },
              },
              {
                entity_id: 'sensor.individual_humidity',
                state: '45', // Below threshold
                domain: 'sensor',
                attributes: {
                  device_class: 'humidity',
                  unit_of_measurement: '%',
                },
              },
            ],
            averaged: [
              {
                device_class: 'temperature',
                average: 70, // Below threshold, should be ignored
                uom: '°F',
                states: [],
                domain: 'sensor',
              },
              {
                device_class: 'humidity',
                average: 55, // Above threshold, should be ignored
                uom: '%',
                states: [],
                domain: 'sensor',
              },
            ],
            problemSensors: [],
            lightEntities: [],
            thresholdSensors: testCase.thresholdSensors,
          };

          const result = climateThresholds(config, sensorData);

          expect(result).to.deep.equal({ hot: true, humid: false });
        });

        it('should fall back to averaged sensors when individual sensor device class does not match', () => {
          const config: Config = {
            area: 'test',
            thresholds: {
              ...testCase.thresholds,
              temperature_entity: 'sensor.wrong_device_class',
            },
          };
          const sensorData: SensorData = {
            individual: [
              {
                entity_id: 'sensor.wrong_device_class',
                state: '78', // Above threshold but wrong device class
                domain: 'sensor',
                attributes: {
                  device_class: 'pressure', // Wrong device class
                  unit_of_measurement: 'hPa',
                },
              },
            ],
            averaged: [
              {
                device_class: 'temperature',
                average: 70, // Below threshold, should be used
                uom: '°F',
                states: [],
                domain: 'sensor',
              },
            ],
            problemSensors: [],
            lightEntities: [],
            thresholdSensors: testCase.thresholdSensors,
          };

          const result = climateThresholds(config, sensorData);

          expect(result).to.deep.equal({ hot: false, humid: false });
        });

        it('should use averaged sensors when no specific entity is configured', () => {
          const config: Config = {
            area: 'test',
            thresholds: {
              ...testCase.thresholds,
            },
          };
          const sensorData: SensorData = {
            individual: [
              {
                entity_id: 'sensor.individual_temp',
                state: '78', // Above threshold but should be ignored
                domain: 'sensor',
                attributes: {
                  device_class: 'temperature',
                  unit_of_measurement: '°F',
                },
              },
            ],
            averaged: [
              {
                device_class: 'temperature',
                average: 70, // Below threshold, should be used
                uom: '°F',
                states: [],
                domain: 'sensor',
              },
              {
                device_class: 'humidity',
                average: 45, // Below threshold
                uom: '%',
                states: [],
                domain: 'sensor',
              },
            ],
            problemSensors: [],
            lightEntities: [],
            thresholdSensors: testCase.thresholdSensors,
          };

          const result = climateThresholds(config, sensorData);

          expect(result).to.deep.equal({ hot: false, humid: false });
        });
      });
    });

    describe('operator functionality', () => {
      it('should use gt operator for temperature (default)', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            temperature: 75,
            temperature_operator: 'gt',
          },
        };
        const sensorData: SensorData = {
          individual: [],
          averaged: [
            {
              device_class: 'temperature',
              average: 76, // Above threshold
              uom: '°F',
              states: [],
              domain: 'sensor',
            },
          ],
          problemSensors: [],
          lightEntities: [],
          thresholdSensors: [],

        };

        const result = climateThresholds(config, sensorData);
        expect(result).to.deep.equal({ hot: true, humid: false });
      });

      it('should use lt operator for temperature', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            temperature: 75,
            temperature_operator: 'lt',
          },
        };
        const sensorData: SensorData = {
          individual: [],
          averaged: [
            {
              device_class: 'temperature',
              average: 70, // Below threshold
              uom: '°F',
              states: [],
              domain: 'sensor',
            },
          ],
          problemSensors: [],
          lightEntities: [],
          thresholdSensors: [],

        };

        const result = climateThresholds(config, sensorData);
        expect(result).to.deep.equal({ hot: true, humid: false });
      });

      it('should use lte operator for temperature', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            temperature: 75,
            temperature_operator: 'lte',
          },
        };
        const sensorData: SensorData = {
          individual: [],
          averaged: [
            {
              device_class: 'temperature',
              average: 75, // Equal to threshold
              uom: '°F',
              states: [],
              domain: 'sensor',
            },
          ],
          problemSensors: [],
          lightEntities: [],
          thresholdSensors: [],

        };

        const result = climateThresholds(config, sensorData);
        expect(result).to.deep.equal({ hot: true, humid: false });
      });

      it('should use eq operator for temperature', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            temperature: 75,
            temperature_operator: 'eq',
          },
        };
        const sensorData: SensorData = {
          individual: [],
          averaged: [
            {
              device_class: 'temperature',
              average: 75, // Equal to threshold
              uom: '°F',
              states: [],
              domain: 'sensor',
            },
          ],
          problemSensors: [],
          lightEntities: [],
          thresholdSensors: [],

        };

        const result = climateThresholds(config, sensorData);
        expect(result).to.deep.equal({ hot: true, humid: false });
      });

      it('should use gte operator for humidity', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            humidity: 60,
            humidity_operator: 'gte',
          },
        };
        const sensorData: SensorData = {
          individual: [],
          averaged: [
            {
              device_class: 'humidity',
              average: 60, // Equal to threshold
              uom: '%',
              states: [],
              domain: 'sensor',
            },
          ],
          problemSensors: [],
          lightEntities: [],
          thresholdSensors: [],

        };

        const result = climateThresholds(config, sensorData);
        expect(result).to.deep.equal({ hot: false, humid: true });
      });

      it('should use both temperature and humidity operators together', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            temperature: 70,
            humidity: 50,
            temperature_operator: 'lt', // Below 70°F
            humidity_operator: 'lt', // Below 50%
          },
        };
        const sensorData: SensorData = {
          individual: [],
          averaged: [
            {
              device_class: 'temperature',
              average: 65, // Below threshold
              uom: '°F',
              states: [],
              domain: 'sensor',
            },
            {
              device_class: 'humidity',
              average: 45, // Below threshold
              uom: '%',
              states: [],
              domain: 'sensor',
            },
          ],
          problemSensors: [],
          lightEntities: [],
          thresholdSensors: [],

        };

        const result = climateThresholds(config, sensorData);
        expect(result).to.deep.equal({ hot: true, humid: true });
      });

      it('should default to gt operator when no operator is specified', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            temperature: 75,
            // No operator specified, should default to 'gt'
          },
        };
        const sensorData: SensorData = {
          individual: [],
          averaged: [
            {
              device_class: 'temperature',
              average: 76, // Above threshold
              uom: '°F',
              states: [],
              domain: 'sensor',
            },
          ],
          problemSensors: [],
          lightEntities: [],
          thresholdSensors: [],

        };

        const result = climateThresholds(config, sensorData);
        expect(result).to.deep.equal({ hot: true, humid: false });
      });

      it('should use default gt operator for unknown operator', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            temperature: 75,
            temperature_operator: 'unknown' as any, // Invalid operator
          },
        };
        const sensorData: SensorData = {
          individual: [],
          averaged: [
            {
              device_class: 'temperature',
              average: 76, // Above threshold
              uom: '°F',
              states: [],
              domain: 'sensor',
            },
          ],
          problemSensors: [],
          lightEntities: [],
          thresholdSensors: [],

        };

        const result = climateThresholds(config, sensorData);
        // Should default to 'gt' behavior (value > threshold)
        expect(result).to.deep.equal({ hot: true, humid: false });
      });
    });
  });
});
