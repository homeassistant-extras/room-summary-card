import actionHandlerDelegate from './action-handler-delegate.spec';
import retrieversDelegate from './retrievers/index.spec';
import cardEntitiesSpec from './utils/card-entities.spec';

describe('delegates', () => {
  retrieversDelegate();
  actionHandlerDelegate();

  describe('utils', () => {
    cardEntitiesSpec();
  });
});
