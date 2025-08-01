import * as actionHandlerModule from '@/delegates/action-handler-delegate';
import type { HomeAssistant } from '@hass/types';
import {
  renderProblemIndicator,
  renderRoomIcon,
  renderStateIcon,
} from '@html/icon';
import { elementUpdated, fixture } from '@open-wc/testing-helpers';
import type { Config } from '@type/config';
import type { EntityInformation, EntityState } from '@type/room';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

// Helper to create EntityState objects for testing
const createEntityState = (
  entityId: string,
  state = 'on',
  attributes = {},
): EntityState => ({
  entity_id: entityId,
  state,
  attributes,
  domain: entityId.split('.')[0] || 'unknown',
});

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
    const mockConfig: Config = { area: 'test' };

    it('should return empty problems div when problemSensors array is empty', async () => {
      const result = renderProblemIndicator(mockHass, mockConfig, {
        individual: [],
        averaged: [],
        problemSensors: [],
      });
      const el = await fixture(result as TemplateResult);

      expect(el).to.exist;
      expect(el.className).to.equal('problems');
      expect(el.children.length).to.equal(0);
    });

    it('should render icon with correct number when one problem entity exists', async () => {
      const result = renderProblemIndicator(mockHass, mockConfig, {
        individual: [],
        averaged: [],
        problemSensors: [createEntityState('entity1')],
      });
      const el = await fixture(result as TemplateResult);

      expect(el).to.exist;
      const icon = el.querySelector('ha-icon');
      expect(icon).to.exist;
      expect((icon as any).icon).to.equal('mdi:numeric-1');
      expect((icon as any).className).to.include('status-entities');
    });

    it('should render icon with correct number for multiple problem entities', async () => {
      const result = renderProblemIndicator(mockHass, mockConfig, {
        individual: [],
        averaged: [],
        problemSensors: [
          createEntityState('entity1'),
          createEntityState('entity2'),
          createEntityState('entity3'),
        ],
      });
      const el = await fixture(result as TemplateResult);

      expect(el).to.exist;
      const icon = el.querySelector('ha-icon');
      expect(icon).to.exist;
      expect((icon as any).icon).to.equal('mdi:numeric-3');
    });

    it('should not have has-problems attribute when no problem entities are active', async () => {
      const result = renderProblemIndicator(mockHass, mockConfig, {
        individual: [],
        averaged: [],
        problemSensors: [createEntityState('entity1', 'off')],
      });
      const el = await fixture(result as TemplateResult);

      expect(el).to.exist;
      const icon = el.querySelector('ha-icon');
      expect(icon).to.exist;
      expect((icon as any).hasAttribute('has-problems')).to.be.false;
    });

    it('should have has-problems attribute when problem entities are active', async () => {
      const result = renderProblemIndicator(mockHass, mockConfig, {
        individual: [],
        averaged: [],
        problemSensors: [createEntityState('entity1', 'on')],
      });
      const el = await fixture(result as TemplateResult);

      expect(el).to.exist;
      const icon = el.querySelector('ha-icon');
      expect(icon).to.exist;
      expect((icon as any).hasAttribute('has-problems')).to.be.true;
    });

    // Edge cases
    it('should handle large numbers of entities correctly', async () => {
      const manyEntities = Array(10)
        .fill(null)
        .map((_, i) => createEntityState(`entity${i}`));
      const result = renderProblemIndicator(mockHass, mockConfig, {
        individual: [],
        averaged: [],
        problemSensors: manyEntities,
      });
      const el = await fixture(result as TemplateResult);

      expect(el).to.exist;
      const icon = el.querySelector('ha-icon');
      expect(icon).to.exist;
      expect((icon as any).icon).to.equal('mdi:numeric-10');
    });

    it('should handle entities with special characters', async () => {
      const result = renderProblemIndicator(mockHass, mockConfig, {
        individual: [],
        averaged: [],
        problemSensors: [
          createEntityState('entity/with/slashes'),
          createEntityState('entity.with.dots'),
        ],
      });
      const el = await fixture(result as TemplateResult);

      expect(el).to.exist;
      const icon = el.querySelector('ha-icon');
      expect(icon).to.exist;
      expect((icon as any).icon).to.equal('mdi:numeric-2');
    });

    it('should properly combine multiple CSS classes', async () => {
      const result = renderProblemIndicator(mockHass, mockConfig, {
        individual: [],
        averaged: [],
        problemSensors: [createEntityState('entity1')],
      });
      const el = await fixture(result as TemplateResult);

      const icon = el.querySelector('ha-icon');
      expect(icon).to.exist;
      expect((icon as any).className).to.include('status-entities');
    });

    it('should show mold indicator when mold sensor exists and should be shown', async () => {
      const moldSensor = createEntityState('sensor.mold', '75');
      const configWithThreshold: Config = {
        area: 'test',
        thresholds: { mold: 50 },
      };
      const sensorData = {
        individual: [],
        averaged: [],
        problemSensors: [],
        mold: moldSensor,
      };
      const result = renderProblemIndicator(
        mockHass,
        configWithThreshold,
        sensorData,
      );
      const el = await fixture(result as TemplateResult);

      expect(el).to.exist;
      expect(el.querySelector('ha-state-icon')).to.exist;
    });

    it('should hide mold indicator when mold sensor should not be shown', async () => {
      const moldSensor = createEntityState('sensor.mold', '25');
      const configWithThreshold: Config = {
        area: 'test',
        thresholds: { mold: 50 },
      };
      const sensorData = {
        individual: [],
        averaged: [],
        problemSensors: [],
        mold: moldSensor,
      };
      const result = renderProblemIndicator(
        mockHass,
        configWithThreshold,
        sensorData,
      );
      const el = await fixture(result as TemplateResult);

      expect(el).to.exist;
      expect(el.querySelector('ha-state-icon')).to.not.exist;
    });
  });

  describe('renderRoomIcon', () => {
    // Common test variables
    let entity: EntityInformation;
    let mockState: EntityState;
    let config: Config;

    beforeEach(() => {
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

      // Mock config object
      config = {
        area: 'living_room',
        area_name: 'Living Room',
        navigate: '/lovelace/living-room',
      };
    });

    it('should return nothing when state is not present', () => {
      entity.state = undefined;
      const result = renderRoomIcon(mockHass, entity, config);

      expect(result).to.equal(nothing);
    });

    it('should return template with room-state-icon element', async () => {
      const result = renderRoomIcon(mockHass, entity, config);

      expect(result).to.not.equal(nothing);
      expect(result).to.be.instanceOf(Object);
    });
  });
});
