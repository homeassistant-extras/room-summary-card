import * as areaRetrieverModule from '@delegates/retrievers/area';
import * as stateRetrieverModule from '@delegates/retrievers/state';
import { getBackgroundImageUrl } from '@theme/image/get-pic';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { stub, type SinonStub } from 'sinon';

describe('get-background-image-url.ts', () => {
  let mockHass: any;
  let mockConfig: Config;
  let getStateStub: SinonStub;
  let getAreaStub: SinonStub;

  beforeEach(() => {
    getStateStub = stub(stateRetrieverModule, 'getState');
    getAreaStub = stub(areaRetrieverModule, 'getArea');

    mockHass = {
      states: {},
      areas: { test_area: {} },
    };

    mockConfig = { area: 'test_area' };
  });

  afterEach(() => {
    getStateStub.restore();
    getAreaStub.restore();
  });

  describe('getBackgroundImageUrl', () => {
    it('should return undefined when disable option is set', () => {
      mockConfig.background = { options: ['disable'] };

      const result = getBackgroundImageUrl(mockHass, mockConfig);

      expect(result).to.be.undefined;
    });

    it('should return image entity picture when available', () => {
      mockConfig.background = { image_entity: 'person.john' };
      getStateStub.returns({
        attributes: { entity_picture: '/api/person/john.jpg' },
      });

      const result = getBackgroundImageUrl(mockHass, mockConfig);

      expect(result).to.equal('/api/person/john.jpg');
      expect(getStateStub.calledWith(mockHass.states, 'person.john')).to.be
        .true;
    });

    it('should return config image when entity has no picture', () => {
      mockConfig.background = {
        image_entity: 'person.john',
        image: '/local/fallback.jpg',
      };
      getStateStub.returns({ attributes: {} });

      const result = getBackgroundImageUrl(mockHass, mockConfig);

      expect(result).to.equal('/local/fallback.jpg');
    });

    it('should return config image when no entity specified', () => {
      mockConfig.background = { image: '/local/room.jpg' };

      const result = getBackgroundImageUrl(mockHass, mockConfig);

      expect(result).to.equal('/local/room.jpg');
    });

    it('should return area picture as fallback', () => {
      getAreaStub.returns({ picture: '/local/area-pic.jpg' });

      const result = getBackgroundImageUrl(mockHass, mockConfig);

      expect(result).to.equal('/local/area-pic.jpg');
      expect(getAreaStub.calledWith(mockHass.areas, 'test_area')).to.be.true;
    });

    it('should return undefined when no image sources available', () => {
      getAreaStub.returns({ picture: undefined });

      const result = getBackgroundImageUrl(mockHass, mockConfig);

      expect(result).to.be.undefined;
    });

    it('should prioritize image entity over config image', () => {
      mockConfig.background = {
        image_entity: 'camera.bedroom',
        image: '/local/should-not-use.jpg',
      };
      getStateStub.returns({
        attributes: { entity_picture: '/api/camera/bedroom' },
      });

      const result = getBackgroundImageUrl(mockHass, mockConfig);

      expect(result).to.equal('/api/camera/bedroom');
    });

    it('should handle null area gracefully', () => {
      getAreaStub.returns(null);

      const result = getBackgroundImageUrl(mockHass, mockConfig);

      expect(result).to.be.undefined;
    });
  });
});
