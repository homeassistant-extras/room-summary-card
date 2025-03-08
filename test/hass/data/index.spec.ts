import entitySpec from './entity.spec';
import groupSpec from './group.spec';

export default () => {
  describe('data', () => {
    entitySpec();
    groupSpec();
  });
};
