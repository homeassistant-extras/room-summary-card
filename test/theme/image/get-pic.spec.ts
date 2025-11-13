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
    it('should return undefined when disable option is set', async () => {
      mockConfig.background = { options: ['disable'] };

      const result = await getBackgroundImageUrl(mockHass, mockConfig);

      expect(result).to.be.undefined;
    });

    it('should return image entity picture when available', async () => {
      mockConfig.background = { image_entity: 'person.john' };
      getStateStub.returns({
        attributes: { entity_picture: '/api/person/john.jpg' },
      });

      const result = await getBackgroundImageUrl(mockHass, mockConfig);

      expect(result).to.equal('/api/person/john.jpg');
      expect(getStateStub.calledWith(mockHass.states, 'person.john')).to.be
        .true;
    });

    it('should return config image when entity has no picture', async () => {
      mockConfig.background = {
        image_entity: 'person.john',
        image: '/local/fallback.jpg',
      };
      getStateStub.returns({ attributes: undefined });

      const result = await getBackgroundImageUrl(mockHass, mockConfig);

      expect(result).to.equal('/local/fallback.jpg');
    });

    it('should return config image when entity state is null', async () => {
      mockConfig.background = {
        image_entity: 'person.jane',
        image: '/local/default.jpg',
      };
      getStateStub.returns(null);

      const result = await getBackgroundImageUrl(mockHass, mockConfig);

      expect(result).to.equal('/local/default.jpg');
    });

    it('should return config image when no entity specified', async () => {
      mockConfig.background = { image: '/local/room.jpg' };

      const result = await getBackgroundImageUrl(mockHass, mockConfig);

      expect(result).to.equal('/local/room.jpg');
    });

    it('should return area picture as fallback', async () => {
      getAreaStub.returns({ picture: '/local/area-pic.jpg' });

      const result = await getBackgroundImageUrl(mockHass, mockConfig);

      expect(result).to.equal('/local/area-pic.jpg');
      expect(getAreaStub.calledWith(mockHass.areas, 'test_area')).to.be.true;
    });

    it('should return undefined when no image sources available', async () => {
      getAreaStub.returns({ picture: undefined });

      const result = await getBackgroundImageUrl(mockHass, mockConfig);

      expect(result).to.be.undefined;
    });

    it('should prioritize image entity over config image', async () => {
      mockConfig.background = {
        image_entity: 'camera.bedroom',
        image: '/local/should-not-use.jpg',
      };
      getStateStub.returns({
        attributes: { entity_picture: '/api/camera/bedroom' },
      });

      const result = await getBackgroundImageUrl(mockHass, mockConfig);

      expect(result).to.equal('/api/camera/bedroom');
    });

    it('should handle null area gracefully', async () => {
      getAreaStub.returns(null);

      const result = await getBackgroundImageUrl(mockHass, mockConfig);

      expect(result).to.be.undefined;
    });

    it('should resolve media source object with media_content_id', async () => {
      mockConfig.background = {
        image: {
          media_content_id:
            'media-source://image/image.wild_trail_cam_last_visit_event',
          media_content_type: 'image/jpeg',
        },
      };
      mockHass.callWS = stub().resolves({
        url: '/api/media_source_proxy/image/image.wild_trail_cam_last_visit_event',
        mime_type: 'image/jpeg',
      });

      const result = await getBackgroundImageUrl(mockHass, mockConfig);

      expect(result).to.equal(
        '/api/media_source_proxy/image/image.wild_trail_cam_last_visit_event',
      );
      expect(
        (mockHass.callWS as sinon.SinonStub).calledWith({
          type: 'media_source/resolve_media',
          media_content_id:
            'media-source://image/image.wild_trail_cam_last_visit_event',
        }),
      ).to.be.true;
    });

    it('should resolve media source string', async () => {
      mockConfig.background = {
        image: 'media-source://image/image.wild_trail_cam_last_visit_event',
      };
      mockHass.callWS = stub().resolves({
        url: '/api/media_source_proxy/image/image.wild_trail_cam_last_visit_event',
        mime_type: 'image/jpeg',
      });

      const result = await getBackgroundImageUrl(mockHass, mockConfig);

      expect(result).to.equal(
        '/api/media_source_proxy/image/image.wild_trail_cam_last_visit_event',
      );
      expect(
        (mockHass.callWS as sinon.SinonStub).calledWith({
          type: 'media_source/resolve_media',
          media_content_id:
            'media-source://image/image.wild_trail_cam_last_visit_event',
        }),
      ).to.be.true;
    });

    it('should return non-media-source string as-is (backwards compatibility)', async () => {
      mockConfig.background = {
        image: '/local/room.jpg',
      };

      const result = await getBackgroundImageUrl(mockHass, mockConfig);

      expect(result).to.equal('/local/room.jpg');
    });

    it('should return non-media-source media_content_id as-is', async () => {
      mockConfig.background = {
        image: {
          media_content_id: '/local/custom.jpg',
          media_content_type: 'image/jpeg',
        },
      };

      const result = await getBackgroundImageUrl(mockHass, mockConfig);

      expect(result).to.equal('/local/custom.jpg');
    });
  });
});
