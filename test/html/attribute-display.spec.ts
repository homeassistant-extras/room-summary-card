import type { HomeAssistant } from '@hass/types';
import { attributeDisplay } from '@html/attribute-display';
import { fixture } from '@open-wc/testing-helpers';
import type { EntityState } from '@type/room';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';

describe('attributeDisplay.ts', () => {
  // Common test variables
  let mockHass: HomeAssistant;
  let mockEntity: EntityState;

  beforeEach(() => {
    // Mock entity information
    mockEntity = {
      entity_id: 'sensor.weather_station',
      state: 'clear',
      attributes: {
        temperature: 72,
        humidity: 50,
        condition: 'sunny',
      },
    } as any as EntityState;

    // Mock Home Assistant
    mockHass = {
      entities: {
        'sensor.weather_station': {
          area_id: 'test_area',
          device_id: 'test_device',
          labels: [],
        },
      },
    } as any as HomeAssistant;
  });

  it('should render ha-attribute-value with correct hass, stateObj, and attribute properties', async () => {
    const result = attributeDisplay(mockHass, mockEntity, 'temperature');
    const el = await fixture(result as TemplateResult);

    // Check that the element was correctly created
    expect(el.tagName.toLowerCase()).to.equal('ha-attribute-value');

    // Check that properties were correctly passed
    expect((el as any).hass).to.equal(mockHass);
    expect((el as any).stateObj).to.equal(mockEntity);
    expect((el as any).attribute).to.equal('temperature');
  });

  it('should include hide-unit attribute', async () => {
    const result = attributeDisplay(mockHass, mockEntity, 'humidity');
    const el = await fixture(result as TemplateResult);

    // Check that hide-unit attribute is present
    expect(el.hasAttribute('hide-unit')).to.be.true;
  });

  it('should apply the provided className when specified', async () => {
    const customClass = 'custom-attribute-display';
    const result = attributeDisplay(
      mockHass,
      mockEntity,
      'condition',
      customClass,
    );
    const el = await fixture(result as TemplateResult);

    // Check that the class attribute was correctly set
    expect(el.classList.contains(customClass)).to.be.true;
  });

  it('should not apply any class when className is not provided', async () => {
    const result = attributeDisplay(mockHass, mockEntity, 'temperature');
    const el = await fixture(result as TemplateResult);

    // Check that no class was applied (just the empty string)
    expect(el.getAttribute('class')).to.equal('');
  });

  it('should handle multiple class names correctly', async () => {
    const multipleClasses = 'first-class second-class';
    const result = attributeDisplay(
      mockHass,
      mockEntity,
      'condition',
      multipleClasses,
    );
    const el = await fixture(result as TemplateResult);

    // Check that both classes were applied
    expect(el.classList.contains('first-class')).to.be.true;
    expect(el.classList.contains('second-class')).to.be.true;
  });

  it('should work with different attribute names', async () => {
    const result1 = attributeDisplay(mockHass, mockEntity, 'temperature');
    const result2 = attributeDisplay(mockHass, mockEntity, 'humidity');
    const result3 = attributeDisplay(mockHass, mockEntity, 'condition');

    const el1 = await fixture(result1 as TemplateResult);
    const el2 = await fixture(result2 as TemplateResult);
    const el3 = await fixture(result3 as TemplateResult);

    expect((el1 as any).attribute).to.equal('temperature');
    expect((el2 as any).attribute).to.equal('humidity');
    expect((el3 as any).attribute).to.equal('condition');
  });
});
