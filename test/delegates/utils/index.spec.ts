import cardEntitiesSpec from './card-entities.spec';
import iconEntitiesSpec from './icon-entities.spec';
import roomEntitySpec from './room-entity.spec';

export default () => {
  describe('utils', () => {
    cardEntitiesSpec();
    iconEntitiesSpec();
    roomEntitySpec();
  });
};
