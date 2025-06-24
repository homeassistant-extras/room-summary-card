import iconEntitiesSpec from './icon-entities.spec';
import cardEntitiesSpec from './problem-entities.spec';
import roomEntitySpec from './room-entity.spec';

export default () => {
  describe('entities', () => {
    cardEntitiesSpec();
    iconEntitiesSpec();
    roomEntitySpec();
  });
};
