import areaSpec from './area.spec';
import deviceSpec from './device.spec';
import entitySpec from './entity.spec';
import stateSpec from './state.spec';

export default () => {
  describe('retrievers', () => {
    areaSpec();
    deviceSpec();
    entitySpec();
    stateSpec();
  });
};
