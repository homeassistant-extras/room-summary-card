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

  it('should call WebSocket with correct parameters', async () => {
    const mockResponse = { icons: { light: 'mdi:lightbulb' } };
    callWSStub.resolves(mockResponse);

    const result = await getIconResources(mockHass);

    expect(callWSStub.calledOnce).to.be.true;
    expect(
      callWSStub.calledWith({
        type: 'frontend/get_icons',
        category: 'entity_component',
      }),
    ).to.be.true;
    expect(result).to.equal(mockResponse);
  });

  it('should memoize results for same hass instance', async () => {
    const mockResponse = { icons: { switch: 'mdi:toggle-switch' } };
    callWSStub.resolves(mockResponse);

    await getIconResources(mockHass);
    await getIconResources(mockHass);

    expect(callWSStub.calledOnce).to.be.true;
  });

  it('should make new calls for different hass instances', async () => {
    const mockHass2 = {
      callWS: callWSStub.resolves({}),
    } as any as HomeAssistant;
    callWSStub.resolves({});

    await getIconResources(mockHass);
    await getIconResources(mockHass2);

    expect(callWSStub.calledTwice).to.be.true;
  });
});
