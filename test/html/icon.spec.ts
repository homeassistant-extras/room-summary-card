import type { HomeAssistant } from '@hass/types';
import { renderProblemIndicator, renderRoomIcon } from '@html/icon';
import { fixture } from '@open-wc/testing-helpers';
import type { Config } from '@type/config';
import type { EntityInformation, EntityState } from '@type/room';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';

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

  describe('renderProblemIndicator', () => {
    const mockConfig: Config = { area: 'test' };

    it('should return empty problems div when problemSensors array is empty', async () => {
      const result = renderProblemIndicator(mockHass, mockConfig, {
        individual: [],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
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
        lightEntities: [],
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
        lightEntities: [],
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
        lightEntities: [],
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
        lightEntities: [],
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
        lightEntities: [],
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
        lightEntities: [],
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
        lightEntities: [],
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
        lightEntities: [],
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
        lightEntities: [],
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

    it('should return nothing when state is not present and sticky entities is not enabled', () => {
      entity.state = undefined;
      config.features = [];
      const result = renderRoomIcon(mockHass, entity, config, true, true);

      expect(result).to.equal(nothing);
    });

    it('should return sticky-entity div when state is not present and sticky entities is enabled', async () => {
      entity.state = undefined;
      config.features = ['sticky_entities'];
      const result = renderRoomIcon(mockHass, entity, config, true, true);

      expect(result).to.not.equal(nothing);
      const el = await fixture(result as TemplateResult);
      expect(el.tagName.toLowerCase()).to.equal('div');
      expect(el.className).to.equal('sticky-entity');
    });

    it('should return template with room-state-icon element and pass isActive parameter', async () => {
      const result = renderRoomIcon(mockHass, entity, config, true, true);
      const el = await fixture(result as TemplateResult);

      expect(result).to.not.equal(nothing);
      expect(result).to.be.instanceOf(Object);

      // The fixture creates the room-state-icon element directly
      expect(el.tagName.toLowerCase()).to.equal('room-state-icon');
      // Verify that the isActive property is set correctly
      expect((el as any).isActive).to.be.true;
      expect((el as any).isMainRoomEntity).to.be.true;
    });
  });
});
