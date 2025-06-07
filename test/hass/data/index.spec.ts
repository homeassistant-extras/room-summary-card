import entitySpec from './entity.spec';
import groupSpec from './group.spec';
import sensorSpec from './sensor.spec';

export default () => {
  describe('data', () => {
    sensorSpec();
    entitySpec();
    groupSpec();
  });
};
