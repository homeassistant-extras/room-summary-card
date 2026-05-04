import { setValue } from '@hass/data/input_text';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { restore, type SinonStub, stub } from 'sinon';

describe('input_text.ts', () => {
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

  describe('setValue', () => {
    it("should call '<domain>.set_value' derived from the entity_id", () => {
      setValue(mockHass, 'input_number.thermostat', '21');

      expect(callServiceStub.calledOnce).to.be.true;
      expect(callServiceStub.firstCall.args[0]).to.equal('input_number');
      expect(callServiceStub.firstCall.args[1]).to.equal('set_value');
      expect(callServiceStub.firstCall.args[2]).to.deep.equal({
        value: '21',
        entity_id: 'input_number.thermostat',
      });
    });

    it('should work for any domain that exposes set_value (e.g. number, input_text)', () => {
      setValue(mockHass, 'number.fan_speed', '42');
      setValue(mockHass, 'input_text.note', 'hello');

      expect(callServiceStub.callCount).to.equal(2);
      expect(callServiceStub.firstCall.args[0]).to.equal('number');
      expect(callServiceStub.secondCall.args[0]).to.equal('input_text');
      expect(callServiceStub.secondCall.args[2]).to.deep.equal({
        value: 'hello',
        entity_id: 'input_text.note',
      });
    });

    it("should use only the segment before the first '.' as the domain", () => {
      setValue(mockHass, 'sensor.temperature.living_room', '20');

      expect(callServiceStub.firstCall.args[0]).to.equal('sensor');
      expect(callServiceStub.firstCall.args[2]).to.deep.equal({
        value: '20',
        entity_id: 'sensor.temperature.living_room',
      });
    });

    it('should pass the value through verbatim (no coercion)', () => {
      setValue(mockHass, 'input_text.note', '');

      expect(callServiceStub.firstCall.args[2]).to.deep.equal({
        value: '',
        entity_id: 'input_text.note',
      });
    });

    it('should return the promise from callService', async () => {
      const result = setValue(mockHass, 'input_number.x', '5');

      expect(result).to.be.an.instanceOf(Promise);
      await result;
      expect(callServiceStub.calledOnce).to.be.true;
    });
  });
});
