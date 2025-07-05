import * as actionHandlerModule from '@/delegates/action-handler-delegate';
import type { HomeAssistant } from '@hass/types';
import { renderProblemIndicator, renderStateIcon } from '@html/icon';
import { elementUpdated, fixture } from '@open-wc/testing-helpers';
import type { EntityInformation, EntityState } from '@type/room';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('icon.ts', () => {
  let mockHass: HomeAssistant;

  beforeEach(() => {
    mockHass = {
      entities: {},
      devices: {},
      areas: {},
      states: {},
      themes: {
        theme: 'minimalist-foo',
      },
    } as any as HomeAssistant;
  });

  describe('renderStateIcon', () => {
    // Common test variables
    let element: HTMLElement;
    let entity: EntityInformation;
    let mockState: EntityState;
    let actionHandlerStub: sinon.SinonStub;

    beforeEach(() => {
      // Mock element
      element = document.createElement('div');

      actionHandlerStub = stub(actionHandlerModule, 'actionHandler').returns({
        bind: () => {}, // Mock the bind method
        handleAction: () => {}, // Add any other methods that might be called
      });

      // Mock state object
      mockState = {
        entity_id: 'light.living_room',
        state: 'on',
        attributes: {
          icon: 'mdi:light',
        },
        domain: 'light',
      };

      // Mock entity information
      entity = {
        config: {
          entity_id: 'light.living_room',
          icon: 'mdi:light',
        },
        state: mockState,
      };
    });

    afterEach(() => {
      actionHandlerStub.restore();
    });

    it('should return empty template when state is not present', async () => {
      entity.state = undefined;
      const result = renderStateIcon(element, mockHass, entity, []);

      expect(result).to.equal(nothing);
    });

    it('should render icon with correct classes', async () => {
      const classes = ['test-class', 'another-class'];
      const result = renderStateIcon(element, mockHass, entity, classes);
      const el = await fixture(result as TemplateResult);

      expect(el.className).to.include('icon');
      expect(el.className).to.include('test-class');
      expect(el.className).to.include('another-class');
    });

    it('should apply correct icon styles', async () => {
      const result = renderStateIcon(element, mockHass, entity, []);
      const el = await fixture(result as TemplateResult);

      expect((el as any).style.getPropertyValue('--icon-color')).to.equal(
        'var(--state-color-icon-theme, var(--state-light-on-color, var(--state-light-active-color, var(--state-active-color))))',
      );
      expect(
        (el as any).style.getPropertyValue('--state-color-icon-theme'),
      ).to.equal('rgb(var(--color-yellow))');
    });

    it('should render ha-state-icon with correct properties', async () => {
      const result = renderStateIcon(element, mockHass, entity, []);
      const el = await fixture(result as TemplateResult);
      const stateIcon = el.querySelector('ha-state-icon');

      expect(stateIcon).to.exist;
      expect((stateIcon as any).hass).to.equal(mockHass);
      expect((stateIcon as any).stateObj).to.equal(mockState);
      expect((stateIcon as any).icon).to.equal('mdi:light');
    });

    it('should attach action handlers', async () => {
      const result = renderStateIcon(element, mockHass, entity, []);
      const el = await fixture(result as TemplateResult);

      // Verify action handler was attached
      expect((el as any).actionHandler).to.exist;
    });

    it('should handle state changes', async () => {
      // Initial render
      const result = renderStateIcon(element, mockHass, entity, []);
      const el = await fixture(result as TemplateResult);

      // Change state
      mockState.state = 'off';
      entity.state = mockState;

      // Update element
      await elementUpdated(el);

      const stateIcon = el.querySelector('ha-state-icon');
      expect((stateIcon as any).stateObj.state).to.equal('off');
    });

    it('should handle custom icons from config', async () => {
      entity.config.icon = 'mdi:custom-icon';
      const result = renderStateIcon(element, mockHass, entity, []);
      const el = await fixture(result as TemplateResult);

      const stateIcon = el.querySelector('ha-state-icon');
      expect((stateIcon as any).icon).to.equal('mdi:custom-icon');
    });

    it('should handle empty classes array', async () => {
      const result = renderStateIcon(element, mockHass, entity, []);
      const el = await fixture(result as TemplateResult);

      expect(el.className).to.equal('icon');
    });
  });

  describe('renderProblemIndicator', () => {
    it('should return nothing when problemEntities array is empty', () => {
      const result = renderProblemIndicator([], true);
      expect(result).to.equal(nothing);
    });

    it('should render icon with correct number when one problem entity exists', async () => {
      const result = renderProblemIndicator(['entity1'], true);
      const el = await fixture(result as TemplateResult);

      expect(el).to.exist;
      expect((el as any).icon).to.equal('mdi:numeric-1');
      expect(el.className).to.include('status-entities');
    });

    it('should render icon with correct number for multiple problem entities', async () => {
      const result = renderProblemIndicator(
        ['entity1', 'entity2', 'entity3'],
        true,
      );
      const el = await fixture(result as TemplateResult);

      expect(el).to.exist;
      expect((el as any).icon).to.equal('mdi:numeric-3');
    });

    it('should use green background when problemExists is false', async () => {
      const result = renderProblemIndicator(['entity1'], false);
      const el = await fixture(result as TemplateResult);

      expect(el).to.exist;
      expect(
        (el as any).style.getPropertyValue('--background-color-icon'),
      ).to.equal('var(--success-color)');
      expect(
        (el as any).style.getPropertyValue('--background-opacity-icon'),
      ).to.equal('0.6');
    });

    it('should use red background when problemExists is true', async () => {
      const result = renderProblemIndicator(['entity1'], true);
      const el = await fixture(result as TemplateResult);

      expect(el).to.exist;
      expect(
        (el as any).style.getPropertyValue('--background-color-icon'),
      ).to.equal('var(--error-color)');
      expect(
        (el as any).style.getPropertyValue('--background-opacity-icon'),
      ).to.equal('0.8');
    });

    // Edge cases
    it('should handle large numbers of entities correctly', async () => {
      const manyEntities = Array(10).fill('entity');
      const result = renderProblemIndicator(manyEntities, true);
      const el = await fixture(result as TemplateResult);

      expect(el).to.exist;
      expect((el as any).icon).to.equal('mdi:numeric-10');
    });

    it('should handle entities with special characters', async () => {
      const result = renderProblemIndicator(
        ['entity/with/slashes', 'entity.with.dots'],
        true,
      );
      const el = await fixture(result as TemplateResult);

      expect(el).to.exist;
      expect((el as any).icon).to.equal('mdi:numeric-2');
    });

    it('should properly combine multiple CSS classes', async () => {
      const result = renderProblemIndicator(['entity1'], true);
      const el = await fixture(result as TemplateResult);

      expect(el.className).to.include('status-entities');
    });
  });
});
