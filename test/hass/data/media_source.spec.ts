import {
  isMediaSourceContentId,
  resolveMediaSource,
} from '@hass/data/media_source';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { stub } from 'sinon';

describe('media_source.ts', () => {
  let mockHass: HomeAssistant;

  beforeEach(() => {
    mockHass = {
      callWS: stub(),
    } as any as HomeAssistant;
  });

  describe('isMediaSourceContentId', () => {
    it('should return true for media-source:// prefix', () => {
      expect(isMediaSourceContentId('media-source://image/image.test')).to.be
        .true;
      expect(isMediaSourceContentId('media-source://media_source/local')).to.be
        .true;
    });

    it('should return false for non-media-source strings', () => {
      expect(isMediaSourceContentId('/local/image.jpg')).to.be.false;
      expect(isMediaSourceContentId('http://example.com/image.jpg')).to.be
        .false;
      expect(isMediaSourceContentId('')).to.be.false;
    });
  });

  describe('resolveMediaSource', () => {
    it('should call WebSocket with correct parameters', async () => {
      const mediaContentId = 'media-source://image/image.test';
      const mockResponse = {
        url: '/api/media_source_proxy/image/image.test',
        mime_type: 'image/jpeg',
      };

      (mockHass.callWS as sinon.SinonStub).resolves(mockResponse);

      const result = await resolveMediaSource(mockHass, mediaContentId);

      expect(result).to.equal('/api/media_source_proxy/image/image.test');
      expect(
        (mockHass.callWS as sinon.SinonStub).calledWith({
          type: 'media_source/resolve_media',
          media_content_id: mediaContentId,
        }),
      ).to.be.true;
    });

    it('should return the URL from the resolved media source', async () => {
      const mediaContentId = 'media-source://media_source/local/test.jpg';
      const mockResponse = {
        url: '/api/media_source_proxy/media_source/local/test.jpg',
        mime_type: 'image/jpeg',
      };

      (mockHass.callWS as sinon.SinonStub).resolves(mockResponse);

      const result = await resolveMediaSource(mockHass, mediaContentId);

      expect(result).to.equal(
        '/api/media_source_proxy/media_source/local/test.jpg',
      );
    });
  });
});
