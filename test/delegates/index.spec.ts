import actionHandlerDelegate from './action-handler-delegate.spec';
import thresholdsSpec from './checks/thresholds.spec';
import entitySpec from './retrievers/entity.spec';
import retrieversDelegate from './retrievers/index.spec';
import utilsSpec from './utils/index.spec';

describe('delegates', () => {
  describe('checks', () => {
    thresholdsSpec();
  });
  entitySpec();
  retrieversDelegate();
  actionHandlerDelegate();
  utilsSpec();
});
