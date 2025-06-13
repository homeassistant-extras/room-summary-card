import { getIconResources } from '@delegates/retrievers/icons';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { stub } from 'sinon';

describe('getIconResources', () => {
  let mockHass: any;
  let callWSStub: sinon.SinonStub;

  beforeEach(() => {
    mockHass = { callWS: () => {} };
    callWSStub = stub(mockHass, 'callWS');
  });

  afterEach(() => {
    callWSStub.restore();
  });

  it('should call WebSocket with correct parameters and always memoize', async () => {
    const mockResponse = { icons: { light: 'mdi:lightbulb' } };
    callWSStub.resolves(mockResponse);
    const mockHass2 = {
      ...mockHass,
    } as HomeAssistant;

    const result = await getIconResources(mockHass);
    const result2 = await getIconResources(mockHass2);

    expect(result).to.equal(result2);
    expect(callWSStub.calledOnce).to.be.true;
    expect(
      callWSStub.calledWith({
        type: 'frontend/get_icons',
        category: 'entity_component',
      }),
    ).to.be.true;
    expect(result).to.equal(mockResponse);

    expect(callWSStub.calledOnce).to.be.true;
  });
});
