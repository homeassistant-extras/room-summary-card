import * as featureModule from '@config/feature';
import { createStateEntity } from '@test/test-helpers';
import { computeEntityIcon } from '@theme/render/loot-box-icon';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';
import { expect } from 'chai';
import { stub } from 'sinon';

describe('loot-box-icon.ts', () => {
  let mockConfig: Config;
  let hasFeatureStub: sinon.SinonStub;

  beforeEach(() => {
    mockConfig = { area: 'test_room' } as Config;
    hasFeatureStub = stub(featureModule, 'hasFeature');
    hasFeatureStub.returns(false);
  });

  afterEach(() => {
    hasFeatureStub.restore();
  });

  describe('computeEntityIcon', () => {
    it('should return undefined when entity state is not available', () => {
      const entity: EntityInformation = {
        config: { entity_id: 'light.test' },
        state: undefined,
      };

      const icon = computeEntityIcon(entity, mockConfig);

      expect(icon).to.be.undefined;
    });

    it('should return configured icon as priority 1', () => {
      const entity: EntityInformation = {
        config: {
          entity_id: 'light.test',
          icon: 'mdi:custom-icon',
        },
        state: createStateEntity('light', 'light.test', 'on'),
      };

      const icon = computeEntityIcon(entity, mockConfig);

      expect(icon).to.equal('mdi:custom-icon');
    });

    it('should return threshold icon as priority 2 when no configured icon', () => {
      const entity: EntityInformation = {
        config: { entity_id: 'light.test' },
        state: createStateEntity('light', 'light.test', 'on'),
      };

      const icon = computeEntityIcon(entity, mockConfig, {
        thresholdResult: { icon: 'mdi:threshold-icon' },
      });

      expect(icon).to.equal('mdi:threshold-icon');
    });

    it('should prioritize configured icon over threshold icon', () => {
      const entity: EntityInformation = {
        config: {
          entity_id: 'light.test',
          icon: 'mdi:config-icon',
        },
        state: createStateEntity('light', 'light.test', 'on'),
      };

      const icon = computeEntityIcon(entity, mockConfig, {
        thresholdResult: { icon: 'mdi:threshold-icon' },
      });

      expect(icon).to.equal('mdi:config-icon');
    });

    it('should return climate icon based on hvac_action when available', () => {
      const entity: EntityInformation = {
        config: { entity_id: 'climate.thermostat' },
        state: createStateEntity('climate', 'climate.thermostat', 'heat', {
          hvac_action: 'heating',
          hvac_mode: 'heat',
        }),
      };

      const icon = computeEntityIcon(entity, mockConfig);

      // hvac_action 'heating' maps to mode 'heat' which has icon 'mdi:fire'
      expect(icon).to.equal('mdi:fire');
    });

    it('should fall back to state.state when hvac_action is not available', () => {
      const entity: EntityInformation = {
        config: { entity_id: 'climate.thermostat' },
        state: createStateEntity('climate', 'climate.thermostat', 'cool'),
      };

      const icon = computeEntityIcon(entity, mockConfig);

      // Should use state.state 'cool' which has icon 'mdi:snowflake'
      expect(icon).to.equal('mdi:snowflake');
    });

    it('should not return climate icon when skip_climate_styles is enabled', () => {
      hasFeatureStub.withArgs(mockConfig, 'skip_climate_styles').returns(true);

      const entity: EntityInformation = {
        config: { entity_id: 'climate.thermostat' },
        state: createStateEntity('climate', 'climate.thermostat', 'heat'),
      };

      const icon = computeEntityIcon(entity, mockConfig);

      expect(icon).to.be.undefined;
    });

    it('should prioritize threshold icon over climate icon', () => {
      const entity: EntityInformation = {
        config: { entity_id: 'climate.thermostat' },
        state: createStateEntity('climate', 'climate.thermostat', 'heat'),
      };

      const icon = computeEntityIcon(entity, mockConfig, {
        thresholdResult: { icon: 'mdi:threshold-icon' },
      });

      expect(icon).to.equal('mdi:threshold-icon');
    });

    it('should prioritize configured icon over climate icon', () => {
      const entity: EntityInformation = {
        config: {
          entity_id: 'climate.thermostat',
          icon: 'mdi:config-icon',
        },
        state: createStateEntity('climate', 'climate.thermostat', 'heat'),
      };

      const icon = computeEntityIcon(entity, mockConfig);

      expect(icon).to.equal('mdi:config-icon');
    });

    it('should return correct climate icon for different hvac_actions', () => {
      const actions = [
        { action: 'heating', expectedIcon: 'mdi:fire' },
        { action: 'cooling', expectedIcon: 'mdi:snowflake' },
        { action: 'drying', expectedIcon: 'mdi:water-percent' },
        { action: 'fan', expectedIcon: 'mdi:fan' },
        { action: 'idle', expectedIcon: 'mdi:power' },
        { action: 'off', expectedIcon: 'mdi:power' },
        { action: 'preheating', expectedIcon: 'mdi:fire' },
        { action: 'defrosting', expectedIcon: 'mdi:fire' },
      ];

      for (const { action, expectedIcon } of actions) {
        const entity: EntityInformation = {
          config: { entity_id: 'climate.thermostat' },
          state: createStateEntity('climate', 'climate.thermostat', 'heat', {
            hvac_action: action,
            hvac_mode: 'heat',
          }),
        };

        const icon = computeEntityIcon(entity, mockConfig);

        expect(icon).to.equal(
          expectedIcon,
          `Action ${action} should map to ${expectedIcon}`,
        );
      }
    });

    it('should return correct climate icon for different state values (hvac_modes)', () => {
      const modes = [
        { mode: 'auto', expectedIcon: 'mdi:thermostat-auto' },
        { mode: 'cool', expectedIcon: 'mdi:snowflake' },
        { mode: 'heat', expectedIcon: 'mdi:fire' },
        { mode: 'dry', expectedIcon: 'mdi:water-percent' },
        { mode: 'heat_cool', expectedIcon: 'mdi:sun-snowflake-variant' },
        { mode: 'fan_only', expectedIcon: 'mdi:fan' },
        { mode: 'off', expectedIcon: 'mdi:power' },
      ];

      for (const { mode, expectedIcon } of modes) {
        const entity: EntityInformation = {
          config: { entity_id: 'climate.thermostat' },
          state: createStateEntity('climate', 'climate.thermostat', mode),
        };

        const icon = computeEntityIcon(entity, mockConfig);

        expect(icon).to.equal(
          expectedIcon,
          `Mode ${mode} should map to ${expectedIcon}`,
        );
      }
    });

    it('should return undefined for non-climate entities when no icon configured', () => {
      const entity: EntityInformation = {
        config: { entity_id: 'light.test' },
        state: createStateEntity('light', 'light.test', 'on'),
      };

      const icon = computeEntityIcon(entity, mockConfig);

      expect(icon).to.be.undefined;
    });

    it('should return default icon for climate entities with unknown mode', () => {
      const entity: EntityInformation = {
        config: { entity_id: 'climate.thermostat' },
        state: createStateEntity('climate', 'climate.thermostat', 'unknown'),
      };

      const icon = computeEntityIcon(entity, mockConfig);

      // climateHvacModeIcon returns 'mdi:thermostat' for unknown modes
      expect(icon).to.equal('mdi:thermostat');
    });

    it('should return undefined for climate entities with unknown action', () => {
      const entity: EntityInformation = {
        config: { entity_id: 'climate.thermostat' },
        state: createStateEntity('climate', 'climate.thermostat', 'heat', {
          hvac_action: 'unknown_action' as any,
          hvac_mode: 'heat',
        }),
      };

      const icon = computeEntityIcon(entity, mockConfig);

      // Should fall back to hvac_mode when action is unknown
      expect(icon).to.equal('mdi:fire');
    });

    it('should handle empty options object', () => {
      const entity: EntityInformation = {
        config: { entity_id: 'light.test' },
        state: createStateEntity('light', 'light.test', 'on'),
      };

      const icon = computeEntityIcon(entity, mockConfig, {});

      expect(icon).to.be.undefined;
    });
  });
});
