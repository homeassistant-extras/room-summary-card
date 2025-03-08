import batteryColorSpec from './color/battery-color.spec';
import computeDomainSpec from './compute_domain.spec';
import stateActiveSpec from './state_active.spec';
import stateColorSpec from './state_color.spec';

export default () => {
  describe('entity', () => {
    describe('color', () => {
      batteryColorSpec();
    });
    computeDomainSpec();
    stateActiveSpec();
    stateColorSpec();
  });
};
