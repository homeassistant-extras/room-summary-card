import type { EntityState } from '@type/room';
import { shouldHideStateDisplayWhenInactive } from '@util/should-hide-state-display';
import { expect } from 'chai';

describe('should-hide-state-display.ts', () => {
  describe('shouldHideStateDisplayWhenInactive', () => {
    it('should return false for domains not in HIDDEN_ZERO_ATTRIBUTES_DOMAINS', () => {
      // Arrange
      const state: EntityState = {
        entity_id: 'climate.living_room',
        domain: 'climate',
        state: 'off',
        attributes: {},
      };

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.false;
    });

    it('should return false for domains not in DEFAULT_STATE_CONTENT_DOMAINS', () => {
      // Arrange
      const state: EntityState = {
        entity_id: 'sensor.temperature',
        domain: 'sensor',
        state: 'off',
        attributes: {},
      };

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.false;
    });

    it('should return false when no zero-attribute domains are in content', () => {
      // Arrange - using a domain where content doesn't include zero-attributes
      const state: EntityState = {
        entity_id: 'climate.living_room',
        domain: 'climate',
        state: 'off',
        attributes: { current_temperature: 0 },
      };

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.false;
    });

    it('should return false when some zero-attribute domains have non-zero values', () => {
      // Arrange
      const state: EntityState = {
        entity_id: 'light.living_room',
        domain: 'light',
        state: 'off',
        attributes: { brightness: 50 },
      };

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.false;
    });

    it('should return true for light when off and brightness is 0', () => {
      // Arrange
      const state: EntityState = {
        entity_id: 'light.living_room',
        domain: 'light',
        state: 'off',
        attributes: { brightness: 0 },
      };

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.true;
    });

    it('should return true for light when off and brightness is null', () => {
      // Arrange
      const state: EntityState = {
        entity_id: 'light.living_room',
        domain: 'light',
        state: 'off',
        attributes: { brightness: null },
      };

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.true;
    });

    it('should return false for light when on even if brightness is 0', () => {
      // Arrange
      const state: EntityState = {
        entity_id: 'light.living_room',
        domain: 'light',
        state: 'on',
        attributes: { brightness: 0 },
      };

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.false;
    });

    it('should return true for fan when off and percentage is 0', () => {
      // Arrange
      const state: EntityState = {
        entity_id: 'fan.living_room',
        domain: 'fan',
        state: 'off',
        attributes: { percentage: 0 },
      };

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.true;
    });

    it('should return true for cover when closed and current_position is 0', () => {
      // Arrange
      const state: EntityState = {
        entity_id: 'cover.garage',
        domain: 'cover',
        state: 'closed',
        attributes: { current_position: 0 },
      };

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.true;
    });

    it('should return true for cover when closed and current_position is null', () => {
      // Arrange
      const state: EntityState = {
        entity_id: 'cover.garage',
        domain: 'cover',
        state: 'closed',
        attributes: { current_position: null },
      };

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.true;
    });

    it('should return false for cover when open even if current_position is 0', () => {
      // Arrange
      const state: EntityState = {
        entity_id: 'cover.garage',
        domain: 'cover',
        state: 'open',
        attributes: { current_position: 0 },
      };

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.false;
    });

    it('should return true for valve when closed and current_position is 0', () => {
      // Arrange
      const state: EntityState = {
        entity_id: 'valve.water',
        domain: 'valve',
        state: 'closed',
        attributes: { current_position: 0 },
      };

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.true;
    });

    it('should return false for cover when closed but current_position has non-zero value', () => {
      // Arrange
      const state: EntityState = {
        entity_id: 'cover.garage',
        domain: 'cover',
        state: 'closed',
        attributes: { current_position: 25 },
      };

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.false;
    });
  });
});
