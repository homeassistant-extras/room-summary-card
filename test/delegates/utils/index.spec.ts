import entitySpec from '../retrievers/entity.spec';
import hideYoSensorsSpec from './hide-yo-sensors.spec';
import setupCardSpec from './setup-card.spec';

export default () => {
  describe('utils', () => {
    entitySpec();
    setupCardSpec();
    hideYoSensorsSpec();
  });
};
