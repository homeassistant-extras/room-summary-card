import { setMediaPlayerVolume } from '@hass/data/media-player';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { restore, type SinonStub, stub } from 'sinon';

describe('media-player.ts', () => {
  let mockHass: HomeAssistant;
  let callServiceStub: SinonStub;

  beforeEach(() => {
    callServiceStub = stub().resolves({ context: { id: 'test' } });
    mockHass = {
      callService: callServiceStub,
    } as any as HomeAssistant;
  });

  afterEach(() => {
    restore();
  });

  describe('setMediaPlayerVolume', () => {
    it('should call media_player.volume_set with entity_id and volume_level', () => {
      setMediaPlayerVolume(mockHass, 'media_player.living_room', 0.42);

      expect(callServiceStub.calledOnce).to.be.true;
      expect(callServiceStub.firstCall.args[0]).to.equal('media_player');
      expect(callServiceStub.firstCall.args[1]).to.equal('volume_set');
      expect(callServiceStub.firstCall.args[2]).to.deep.equal({
        entity_id: 'media_player.living_room',
        volume_level: 0.42,
      });
    });

    it('should return the promise from callService', async () => {
      const result = setMediaPlayerVolume(mockHass, 'media_player.kitchen', 0);

      expect(result).to.be.an.instanceOf(Promise);
      await result;
      expect(callServiceStub.calledOnce).to.be.true;
    });
  });
});
