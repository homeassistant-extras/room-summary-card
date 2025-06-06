import hideYoSensorsSpec from './hide-yo-sensors.spec';
import iconEntitiesSpec from './icon-entities.spec';
import cardEntitiesSpec from './problem-entities.spec';
import roomEntitySpec from './room-entity.spec';
import setupCardSpec from './setup-card.spec';
export default () => {
  describe('utils', () => {
    cardEntitiesSpec();
    iconEntitiesSpec();
    roomEntitySpec();
    setupCardSpec();
    hideYoSensorsSpec();
  });
};
