import * as featureModule from '@config/feature';
import { climateThresholds } from '@delegates/checks/thresholds';
import { createStateEntityForEntityId as s } from '@test/test-helpers';
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
        ambientLightEntities: [],
        thresholdSensors: [],
      };

      const result = climateThresholds(config, sensorData);

      expect(result).to.have.property('hot', false);
      expect(result).to.have.property('humid', false);
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
        ambientLightEntities: [],
        thresholdSensors: [],
      };

      const result = climateThresholds(config, sensorData);

      expect(result).to.have.property('hot', false);
      expect(result).to.have.property('humid', false);
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
        ambientLightEntities: [],
        thresholdSensors: [],
      };

      const result = climateThresholds(config, sensorData);

      expect(result).to.have.property('hot', true);
      expect(result).to.have.property('humid', true);
    });

    const testCases = [
      {
        description: 'Thresholds are number',
        thresholds: {
          temperature: [{ value: 75 }],
          humidity: [{ value: 50 }],
        },
        thresholdSensors: [],
      },
      {
        description: 'Thresholds are entity',
        thresholds: {
          temperature: [{ value: 'sensor.temperature_threshold' }],
          humidity: [{ value: 'sensor.humidity_threshold' }],
        },
        thresholdSensors: [
          s('sensor.temperature_threshold', '75', {
            device_class: 'temperature',
            unit_of_measurement: '°F',
          }),
          s('sensor.humidity_threshold', '50', {
            device_class: 'humidity',
            unit_of_measurement: '%',
          }),
        ],
      },
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
            ambientLightEntities: [],
            thresholdSensors: testCase.thresholdSensors,
          };

          const result = climateThresholds(config, sensorData);

          expect(result).to.have.property('hot', true);
          expect(result).to.have.property('humid', false);
        });

        it('should use specific entity states when entity IDs are configured', () => {
          const config: Config = {
            area: 'test',
            thresholds: {
              temperature: [
                {
                  entity_id: 'sensor.specific_temp',
                  ...testCase.thresholds.temperature[0],
                },
              ],
              humidity: [
                {
                  entity_id: 'sensor.specific_humidity',
                  ...testCase.thresholds.humidity[0],
                },
              ],
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
                  s('sensor.temp1', '72', {}),
                  s('sensor.specific_temp', '78', {}), // Above 75
                ],
                domain: 'sensor',
              },
              {
                device_class: 'humidity',
                average: 55, // Above threshold, but specific entity is below
                uom: '%',
                states: [
                  s('sensor.humidity1', '60', {}),
                  s('sensor.specific_humidity', '45', {}), // Below 50
                ],
                domain: 'sensor',
              },
            ],
            problemSensors: [],
            lightEntities: [],
            ambientLightEntities: [],
            thresholdSensors: testCase.thresholdSensors,
          };

          const result = climateThresholds(config, sensorData);

          expect(result).to.have.property('hot', true);
          expect(result).to.have.property('humid', false);
        });

        it('should use individual sensors when entity ID matches and device class is correct', () => {
          const config: Config = {
            area: 'test',
            thresholds: {
              temperature: [
                {
                  entity_id: 'sensor.individual_temp',
                  ...testCase.thresholds.temperature[0],
                },
              ],
              humidity: [
                {
                  entity_id: 'sensor.individual_humidity',
                  ...testCase.thresholds.humidity[0],
                },
              ],
            },
          };
          const sensorData: SensorData = {
            individual: [
              s('sensor.individual_temp', '78', {
                device_class: 'temperature',
                unit_of_measurement: '°F',
              }), // Above threshold
              s('sensor.individual_humidity', '45', {
                device_class: 'humidity',
                unit_of_measurement: '%',
              }), // Below threshold
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
            ambientLightEntities: [],
            thresholdSensors: testCase.thresholdSensors,
          };

          const result = climateThresholds(config, sensorData);

          expect(result).to.have.property('hot', true);
          expect(result).to.have.property('humid', false);
        });

        it('should fall back to averaged sensors when individual sensor device class does not match', () => {
          const config: Config = {
            area: 'test',
            thresholds: {
              temperature: [
                {
                  entity_id: 'sensor.wrong_device_class',
                  ...testCase.thresholds.temperature[0],
                },
              ],
            },
          };
          const sensorData: SensorData = {
            individual: [
              s('sensor.wrong_device_class', '78', {
                device_class: 'pressure', // Wrong device class
                unit_of_measurement: 'hPa',
              }), // Above threshold but wrong device class
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
            ambientLightEntities: [],
            thresholdSensors: testCase.thresholdSensors,
          };

          const result = climateThresholds(config, sensorData);

          expect(result).to.have.property('hot', false);
          expect(result).to.have.property('humid', false);
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
              s('sensor.individual_temp', '78', {
                device_class: 'temperature',
                unit_of_measurement: '°F',
              }), // Above threshold but should be ignored
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
            ambientLightEntities: [],
            thresholdSensors: testCase.thresholdSensors,
          };

          const result = climateThresholds(config, sensorData);

          expect(result).to.have.property('hot', false);
          expect(result).to.have.property('humid', false);
        });
      });
    });

    describe('operator functionality', () => {
      it('should use gt operator for temperature (default)', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            temperature: [{ value: 75, operator: 'gt' }],
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
          ambientLightEntities: [],
          thresholdSensors: [],
        };

        const result = climateThresholds(config, sensorData);
        expect(result).to.have.property('hot', true);
        expect(result).to.have.property('humid', false);
      });

      it('should use lt operator for temperature', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            temperature: [{ value: 75, operator: 'lt' }],
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
          ambientLightEntities: [],
          thresholdSensors: [],
        };

        const result = climateThresholds(config, sensorData);
        expect(result).to.have.property('hot', true);
        expect(result).to.have.property('humid', false);
      });

      it('should use lte operator for temperature', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            temperature: [{ value: 75, operator: 'lte' }],
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
          ambientLightEntities: [],
          thresholdSensors: [],
        };

        const result = climateThresholds(config, sensorData);
        expect(result).to.have.property('hot', true);
        expect(result).to.have.property('humid', false);
      });

      it('should use eq operator for temperature', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            temperature: [{ value: 75, operator: 'eq' }],
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
          ambientLightEntities: [],
          thresholdSensors: [],
        };

        const result = climateThresholds(config, sensorData);
        expect(result).to.have.property('hot', true);
        expect(result).to.have.property('humid', false);
      });

      it('should use gte operator for humidity', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            humidity: [{ value: 60, operator: 'gte' }],
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
          ambientLightEntities: [],
          thresholdSensors: [],
        };

        const result = climateThresholds(config, sensorData);
        expect(result).to.have.property('hot', false);
        expect(result).to.have.property('humid', true);
      });

      it('should use both temperature and humidity operators together', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            temperature: [{ value: 70, operator: 'lt' }], // Below 70°F
            humidity: [{ value: 50, operator: 'lt' }], // Below 50%
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
          ambientLightEntities: [],
          thresholdSensors: [],
        };

        const result = climateThresholds(config, sensorData);
        expect(result).to.have.property('hot', true);
        expect(result).to.have.property('humid', true);
      });

      it('should default to gt operator when no operator is specified', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            temperature: [{ value: 75 }], // No operator specified, should default to 'gt'
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
          ambientLightEntities: [],
          thresholdSensors: [],
        };

        const result = climateThresholds(config, sensorData);
        expect(result).to.have.property('hot', true);
        expect(result).to.have.property('humid', false);
      });

      it('should use default gt operator for unknown operator', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            temperature: [{ value: 75, operator: 'unknown' as any }], // Invalid operator
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
          ambientLightEntities: [],
          thresholdSensors: [],
        };

        const result = climateThresholds(config, sensorData);
        // Should default to 'gt' behavior (value > threshold)
        expect(result).to.have.property('hot', true);
        expect(result).to.have.property('humid', false);
      });
    });

    describe('array threshold behavior', () => {
      it('should activate when any entry in temperature array trips threshold', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            temperature: [
              { value: 80 }, // First threshold not met (75 < 80)
              { value: 70 }, // Second threshold met (75 > 70)
              { value: 90 }, // Third threshold not met (75 < 90)
            ],
          },
        };
        const sensorData: SensorData = {
          individual: [],
          averaged: [
            {
              device_class: 'temperature',
              average: 75,
              uom: '°F',
              states: [],
              domain: 'sensor',
            },
          ],
          problemSensors: [],
          lightEntities: [],
          ambientLightEntities: [],
          thresholdSensors: [],
        };

        const result = climateThresholds(config, sensorData);
        // Should be hot because second entry (70) is tripped
        expect(result).to.have.property('hot', true);
        expect(result).to.have.property('humid', false);
      });

      it('should activate when any entry in humidity array trips threshold', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            humidity: [
              { value: 50 }, // First threshold not met (45 < 50)
              { value: 40 }, // Second threshold met (45 > 40)
              { value: 60 }, // Third threshold not met (45 < 60)
            ],
          },
        };
        const sensorData: SensorData = {
          individual: [],
          averaged: [
            {
              device_class: 'humidity',
              average: 45,
              uom: '%',
              states: [],
              domain: 'sensor',
            },
          ],
          problemSensors: [],
          lightEntities: [],
          ambientLightEntities: [],
          thresholdSensors: [],
        };

        const result = climateThresholds(config, sensorData);
        // Should be humid because second entry (40) is tripped
        expect(result).to.have.property('hot', false);
        expect(result).to.have.property('humid', true);
      });

      it('should not activate when no entries in array trip threshold', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            temperature: [
              { value: 80 }, // Not met (75 < 80)
              { value: 90 }, // Not met (75 < 90)
            ],
            humidity: [
              { value: 50 }, // Not met (45 < 50)
              { value: 60 }, // Not met (45 < 60)
            ],
          },
        };
        const sensorData: SensorData = {
          individual: [],
          averaged: [
            {
              device_class: 'temperature',
              average: 75,
              uom: '°F',
              states: [],
              domain: 'sensor',
            },
            {
              device_class: 'humidity',
              average: 45,
              uom: '%',
              states: [],
              domain: 'sensor',
            },
          ],
          problemSensors: [],
          lightEntities: [],
          ambientLightEntities: [],
          thresholdSensors: [],
        };

        const result = climateThresholds(config, sensorData);
        expect(result).to.have.property('hot', false);
        expect(result).to.have.property('humid', false);
      });

      it('should handle multiple entries with different operators', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            temperature: [
              { value: 80, operator: 'gt' }, // Not met (75 < 80)
              { value: 70, operator: 'lt' }, // Not met (75 > 70)
              { value: 75, operator: 'gte' }, // Met (75 >= 75)
            ],
          },
        };
        const sensorData: SensorData = {
          individual: [],
          averaged: [
            {
              device_class: 'temperature',
              average: 75,
              uom: '°F',
              states: [],
              domain: 'sensor',
            },
          ],
          problemSensors: [],
          lightEntities: [],
          ambientLightEntities: [],
          thresholdSensors: [],
        };

        const result = climateThresholds(config, sensorData);
        // Should be hot because third entry (gte 75) is met
        expect(result).to.have.property('hot', true);
        expect(result).to.have.property('humid', false);
      });

      it('should handle multiple entries with different entity IDs', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            temperature: [
              { entity_id: 'sensor.temp1', value: 80 }, // Not met (70 < 80)
              { entity_id: 'sensor.temp2', value: 70 }, // Met (75 > 70)
            ],
          },
        };
        const sensorData: SensorData = {
          individual: [],
          averaged: [
            {
              device_class: 'temperature',
              average: 72, // Average not used when entity_id specified
              uom: '°F',
              states: [
                s('sensor.temp1', '70', {}),
                s('sensor.temp2', '75', {}),
              ],
              domain: 'sensor',
            },
          ],
          problemSensors: [],
          lightEntities: [],
          ambientLightEntities: [],
          thresholdSensors: [],
        };

        const result = climateThresholds(config, sensorData);
        // Should be hot because second entry (sensor.temp2 > 70) is met
        expect(result).to.have.property('hot', true);
        expect(result).to.have.property('humid', false);
      });

      it('should return false when array is empty (no thresholds to check)', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            temperature: [],
            humidity: [],
          },
        };
        const sensorData: SensorData = {
          individual: [],
          averaged: [
            {
              device_class: 'temperature',
              average: 85, // Above default 80, but no thresholds configured
              uom: '°F',
              states: [],
              domain: 'sensor',
            },
            {
              device_class: 'humidity',
              average: 65, // Above default 60, but no thresholds configured
              uom: '%',
              states: [],
              domain: 'sensor',
            },
          ],
          problemSensors: [],
          lightEntities: [],
          ambientLightEntities: [],
          thresholdSensors: [],
        };

        const result = climateThresholds(config, sensorData);
        // Empty array means no thresholds to check, so should return false
        expect(result).to.have.property('hot', false);
        expect(result).to.have.property('humid', false);
      });

      it('should handle array with empty object (uses default threshold)', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            temperature: [{}], // Empty object uses defaults
            humidity: [{}],
          },
        };
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
          ambientLightEntities: [],
          thresholdSensors: [],
        };

        const result = climateThresholds(config, sensorData);
        // Should use default thresholds
        expect(result).to.have.property('hot', true);
        expect(result).to.have.property('humid', true);
      });
    });

    describe('custom threshold colors', () => {
      it('should return custom color when threshold is triggered with color property', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            temperature: [
              {
                value: 70,
                operator: 'lt',
                color: 'blue',
              },
            ],
            humidity: [
              {
                value: 85,
                operator: 'gt',
                color: 'red',
              },
            ],
          },
        };
        const sensorData: SensorData = {
          individual: [],
          averaged: [
            {
              device_class: 'temperature',
              average: 65, // Below 70, should trigger
              uom: '°F',
              states: [],
              domain: 'sensor',
            },
            {
              device_class: 'humidity',
              average: 90, // Above 85, should trigger
              uom: '%',
              states: [],
              domain: 'sensor',
            },
          ],
          problemSensors: [],
          lightEntities: [],
          ambientLightEntities: [],
          thresholdSensors: [],
        };

        const result = climateThresholds(config, sensorData);

        expect(result).to.have.property('hot', true);
        expect(result).to.have.property('humid', true);
        expect(result).to.have.property('hotColor', 'blue');
        expect(result).to.have.property('humidColor', 'red');
      });

      it('should not return color when threshold is not triggered', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            temperature: [
              {
                value: 70,
                operator: 'lt',
                color: 'blue',
              },
            ],
          },
        };
        const sensorData: SensorData = {
          individual: [],
          averaged: [
            {
              device_class: 'temperature',
              average: 75, // Above 70, should not trigger
              uom: '°F',
              states: [],
              domain: 'sensor',
            },
          ],
          problemSensors: [],
          lightEntities: [],
          ambientLightEntities: [],
          thresholdSensors: [],
        };

        const result = climateThresholds(config, sensorData);

        expect(result).to.have.property('hot', false);
        expect(result.hotColor).to.be.undefined;
      });
    });
  });
});
