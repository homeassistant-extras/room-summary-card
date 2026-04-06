import type { HomeAssistant } from '@hass/types';
import { stateDisplay } from '@html/state-display';
import { fixture } from '@open-wc/testing-helpers';
import type { EntityState } from '@type/room';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';

describe('stateDisplay.ts', () => {
  // Common test variables
  let mockHass: HomeAssistant;
  let mockEntity: EntityState;

  beforeEach(() => {
    // Mock entity information
    mockEntity = {
      entity_id: 'light.test_light',
      state: 'on',
    } as any as EntityState;

    // Mock Home Assistant
    mockHass = {
      entities: {
        'light.test_light': {
          area_id: 'test_area',
          device_id: 'test_device',
          labels: [],
        },
      },
    } as any as HomeAssistant;
  });

  it('should render state-display with correct hass, stateObj, and content properties', async () => {
    const result = stateDisplay(mockHass, mockEntity);
    const el = await fixture(result as TemplateResult);

    // Check that the element was correctly created
    expect(el.tagName.toLowerCase()).to.equal('state-display');

    // Check that properties were correctly passed
    expect((el as any).hass).to.equal(mockHass);
    expect((el as any).stateObj).to.equal(mockEntity);
    expect((el as any).content).to.be.undefined;

    const withContent = stateDisplay(mockHass, mockEntity, 'humidity');
    const el2 = await fixture(withContent as TemplateResult);
    expect((el2 as any).content).to.equal('humidity');
  });
});
