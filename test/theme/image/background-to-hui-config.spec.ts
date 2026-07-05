import * as areaRetrieverModule from '@delegates/retrievers/area';
import * as stateRetrieverModule from '@delegates/retrievers/state';
import { HOLD_AND_DOUBLE_TAP_NONE } from '@homeassistant-extras/hass/render/constants';
import { backgroundToHuiConfig } from '@theme/image/background-to-hui-config';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { stub, type SinonStub } from 'sinon';

describe('background-to-hui-config.ts', () => {
  let mockHass: any;
  let mockConfig: Config;
  let getStateStub: SinonStub;
  let getAreaStub: SinonStub;

  const base = {
    type: 'image',
    tap_action: { action: 'none' },
    ...HOLD_AND_DOUBLE_TAP_NONE,
  };

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

  describe('backgroundToHuiConfig', () => {
    it('should return undefined when disable option is set', () => {
      mockConfig.background = { options: ['disable'] };

      const result = backgroundToHuiConfig(mockHass, mockConfig);

      expect(result).to.be.undefined;
    });

    it('should map a camera entity to camera_image with auto view', () => {
      mockConfig.background = { image_entity: 'camera.front_door' };

      const result = backgroundToHuiConfig(mockHass, mockConfig);

      expect(result).to.deep.equal({
        ...base,
        camera_image: 'camera.front_door',
        camera_view: 'auto',
      });
      expect(getStateStub.called).to.be.false;
    });

    it('should map an image entity to image_entity', () => {
      mockConfig.background = { image_entity: 'image.floorplan' };

      const result = backgroundToHuiConfig(mockHass, mockConfig);

      expect(result).to.deep.equal({
        ...base,
        image_entity: 'image.floorplan',
      });
    });

    it('should map a person entity to a resolved entity_picture', () => {
      mockConfig.background = { image_entity: 'person.john' };
      getStateStub.returns({
        attributes: { entity_picture: '/api/person/john.jpg' },
      });

      const result = backgroundToHuiConfig(mockHass, mockConfig);

      expect(result).to.deep.equal({
        ...base,
        image: '/api/person/john.jpg',
      });
      expect(getStateStub.calledWith(mockHass.states, 'person.john')).to.be
        .true;
    });

    it('should fall back to config image when entity has no picture', () => {
      mockConfig.background = {
        image_entity: 'person.john',
        image: '/local/fallback.jpg',
      };
      getStateStub.returns({ attributes: undefined });

      const result = backgroundToHuiConfig(mockHass, mockConfig);

      expect(result).to.deep.equal({ ...base, image: '/local/fallback.jpg' });
    });

    it('should return config image when no entity specified', () => {
      mockConfig.background = { image: '/local/room.jpg' };

      const result = backgroundToHuiConfig(mockHass, mockConfig);

      expect(result).to.deep.equal({ ...base, image: '/local/room.jpg' });
    });

    it('should pass a media source object through as-is', () => {
      const image = {
        media_content_id:
          'media-source://image/image.wild_trail_cam_last_visit_event',
        media_content_type: 'image/jpeg',
      };
      mockConfig.background = { image };

      const result = backgroundToHuiConfig(mockHass, mockConfig);

      expect(result).to.deep.equal({ ...base, image });
    });

    it('should return area picture as fallback', () => {
      getAreaStub.returns({ picture: '/local/area-pic.jpg' });

      const result = backgroundToHuiConfig(mockHass, mockConfig);

      expect(result).to.deep.equal({ ...base, image: '/local/area-pic.jpg' });
      expect(getAreaStub.calledWith(mockHass.areas, 'test_area')).to.be.true;
    });

    it('should return undefined when no image sources are available', () => {
      getAreaStub.returns({ picture: undefined });

      const result = backgroundToHuiConfig(mockHass, mockConfig);

      expect(result).to.be.undefined;
    });

    it('should handle a null area gracefully', () => {
      getAreaStub.returns(null);

      const result = backgroundToHuiConfig(mockHass, mockConfig);

      expect(result).to.be.undefined;
    });

    it('should prioritize image_entity over config image and area picture', () => {
      mockConfig.background = {
        image_entity: 'camera.bedroom',
        image: '/local/should-not-use.jpg',
      };
      getAreaStub.returns({ picture: '/local/also-not-used.jpg' });

      const result = backgroundToHuiConfig(mockHass, mockConfig);

      expect(result).to.deep.equal({
        ...base,
        camera_image: 'camera.bedroom',
        camera_view: 'auto',
      });
    });

    it('should prioritize config image over area picture', () => {
      mockConfig.background = { image: '/local/room.jpg' };
      getAreaStub.returns({ picture: '/local/area-pic.jpg' });

      const result = backgroundToHuiConfig(mockHass, mockConfig);

      expect(result).to.deep.equal({ ...base, image: '/local/room.jpg' });
      expect(getAreaStub.called).to.be.false;
    });
  });
});
