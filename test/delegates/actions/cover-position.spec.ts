import { setCoverPosition } from '@delegates/actions/cover-position';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import { expect } from 'chai';
import { restore, type SinonStub, stub } from 'sinon';

describe('cover-position.ts', () => {
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

  describe('setCoverPosition', () => {
    it('should return early if entityId is undefined', async () => {
      await setCoverPosition(mockHass, undefined, 50);

      expect(callServiceStub.called).to.be.false;
    });

    it('should call set_cover_position with a rounded, clamped 0-100 value', async () => {
      await setCoverPosition(mockHass, 'cover.blinds', 50.6);

      expect(callServiceStub.calledOnce).to.be.true;
      expect(callServiceStub.firstCall.args[0]).to.equal('cover');
      expect(callServiceStub.firstCall.args[1]).to.equal('set_cover_position');
      expect(callServiceStub.firstCall.args[2]).to.deep.equal({
        entity_id: 'cover.blinds',
        position: 51,
      });

      callServiceStub.resetHistory();
      await setCoverPosition(mockHass, 'cover.blinds', 150);
      expect(callServiceStub.firstCall.args[2]).to.deep.equal({
        entity_id: 'cover.blinds',
        position: 100,
      });

      callServiceStub.resetHistory();
      await setCoverPosition(mockHass, 'cover.blinds', -10);
      expect(callServiceStub.firstCall.args[2]).to.deep.equal({
        entity_id: 'cover.blinds',
        position: 0,
      });
    });
  });
});
