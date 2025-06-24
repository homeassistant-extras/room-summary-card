import actionHandlerDelegate from './action-handler-delegate.spec';
import occupancySpec from './checks/occupancy.spec';
import thresholdsSpec from './checks/thresholds.spec';
import entitiesSpec from './entities/index.spec';
import retrieversDelegate from './retrievers/index.spec';
import utilsSpec from './utils/index.spec';

describe('delegates', () => {
  describe('checks', () => {
    occupancySpec();
    thresholdsSpec();
  });
  entitiesSpec();
  retrieversDelegate();
  actionHandlerDelegate();
  utilsSpec();
});
