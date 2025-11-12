import { setBrightness } from '@delegates/actions/brightness-control';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { restore, type SinonStub, stub } from 'sinon';

describe('brightness-control.ts', () => {
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

  describe('setBrightness', () => {
    it('should return early if entityId is undefined', async () => {
      // Act
      await setBrightness(mockHass, undefined, 128);

      // Assert
      expect(callServiceStub.called).to.be.false;
    });

    it('should call turn_on service with brightness when brightness is greater than 0', async () => {
      // Act
      await setBrightness(mockHass, 'light.test', 128);

      // Assert
      expect(callServiceStub.calledOnce).to.be.true;
      expect(callServiceStub.firstCall.args[0]).to.equal('light');
      expect(callServiceStub.firstCall.args[1]).to.equal('turn_on');
      expect(callServiceStub.firstCall.args[2]).to.deep.equal({
        entity_id: 'light.test',
        brightness: 128,
      });
    });

    it('should call turn_off service when brightness is 0', async () => {
      // Act
      await setBrightness(mockHass, 'light.test', 0);

      // Assert
      expect(callServiceStub.calledOnce).to.be.true;
      expect(callServiceStub.firstCall.args[0]).to.equal('light');
      expect(callServiceStub.firstCall.args[1]).to.equal('turn_off');
      expect(callServiceStub.firstCall.args[2]).to.deep.equal({
        entity_id: 'light.test',
      });
    });

    it('should clamp brightness values above 255 to 255', async () => {
      // Act
      await setBrightness(mockHass, 'light.test', 300);

      // Assert
      expect(callServiceStub.calledOnce).to.be.true;
      expect(callServiceStub.firstCall.args[2]).to.deep.equal({
        entity_id: 'light.test',
        brightness: 255,
      });
    });

    it('should clamp brightness values below 0 to 0 and call turn_off', async () => {
      // Act
      await setBrightness(mockHass, 'light.test', -10);

      // Assert
      expect(callServiceStub.calledOnce).to.be.true;
      expect(callServiceStub.firstCall.args[0]).to.equal('light');
      expect(callServiceStub.firstCall.args[1]).to.equal('turn_off');
      expect(callServiceStub.firstCall.args[2]).to.deep.equal({
        entity_id: 'light.test',
      });
    });

    it('should round brightness values', async () => {
      // Act
      await setBrightness(mockHass, 'light.test', 128.7);

      // Assert
      expect(callServiceStub.calledOnce).to.be.true;
      expect(callServiceStub.firstCall.args[2]).to.deep.equal({
        entity_id: 'light.test',
        brightness: 129,
      });
    });

    it('should round and clamp brightness values correctly', async () => {
      // Act
      await setBrightness(mockHass, 'light.test', 255.7);

      // Assert
      expect(callServiceStub.calledOnce).to.be.true;
      expect(callServiceStub.firstCall.args[2]).to.deep.equal({
        entity_id: 'light.test',
        brightness: 255,
      });
    });
  });
});
