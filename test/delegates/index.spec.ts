import actionHandlerDelegate from './action-handler-delegate.spec';
import retrieversDelegate from './retrievers/index.spec';
import utilsSpec from './utils/index.spec';

describe('delegates', () => {
  retrieversDelegate();
  actionHandlerDelegate();
  utilsSpec();
});
