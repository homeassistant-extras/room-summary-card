import type { HomeAssistant } from '@hass/types';
import { stateDisplay } from '@html/state-display';
import { fixture } from '@open-wc/testing-helpers';
import type { EntityState } from '@type/room';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';

export default () => {
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

    it('should render state-display with correct hass and stateObj properties', async () => {
      const result = stateDisplay(mockHass, mockEntity);
      const el = await fixture(result as TemplateResult);

      // Check that the element was correctly created
      expect(el.tagName.toLowerCase()).to.equal('state-display');

      // Check that properties were correctly passed
      expect((el as any).hass).to.equal(mockHass);
      expect((el as any).stateObj).to.equal(mockEntity);
    });

    it('should apply the provided className when specified', async () => {
      const customClass = 'custom-state-display';
      const result = stateDisplay(mockHass, mockEntity, customClass);
      const el = await fixture(result as TemplateResult);

      // Check that the class attribute was correctly set
      expect(el.classList.contains(customClass)).to.be.true;
    });

    it('should not apply any class when className is not provided', async () => {
      const result = stateDisplay(mockHass, mockEntity);
      const el = await fixture(result as TemplateResult);

      // Check that no class was applied (just the empty string)
      expect(el.getAttribute('class')).to.equal('');
    });

    it('should handle multiple class names correctly', async () => {
      const multipleClasses = 'first-class second-class';
      const result = stateDisplay(mockHass, mockEntity, multipleClasses);
      const el = await fixture(result as TemplateResult);

      // Check that both classes were applied
      expect(el.classList.contains('first-class')).to.be.true;
      expect(el.classList.contains('second-class')).to.be.true;
    });
  });
};
