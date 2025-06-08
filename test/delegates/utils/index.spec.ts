import hideYoSensorsSpec from './hide-yo-sensors.spec';
import sensorAveragesSpec from './sensor-averages.spec';
import sensorUtilsSpec from './sensor-utils.spec';
import setupCardSpec from './setup-card.spec';

export default () => {
  describe('utils', () => {
    setupCardSpec();
    hideYoSensorsSpec();
    sensorAveragesSpec();
    sensorUtilsSpec();
  });
};
