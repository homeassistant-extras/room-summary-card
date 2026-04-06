import { createStateEntityForEntityId as s } from '@test/test-helpers';
import type { EntityState } from '@type/room';
import { shouldHideStateDisplayWhenInactive } from '@util/should-hide-state-display';
import { expect } from 'chai';

describe('should-hide-state-display.ts', () => {
  describe('shouldHideStateDisplayWhenInactive', () => {
    it('should return false for domains not in HIDDEN_ZERO_ATTRIBUTES_DOMAINS', () => {
      // Arrange
      const state: EntityState = s('climate.living_room', 'off');

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.false;
    });

    it('should return false for domains not in DEFAULT_STATE_CONTENT_DOMAINS', () => {
      // Arrange
      const state: EntityState = s('sensor.temperature', 'off');

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.false;
    });

    it('should return false when no zero-attribute domains are in content', () => {
      // Arrange - using a domain where content doesn't include zero-attributes
      const state: EntityState = s('climate.living_room', 'off', {
        current_temperature: 0,
      });

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.false;
    });

    it('should return false when some zero-attribute domains have non-zero values', () => {
      // Arrange
      const state: EntityState = s('light.living_room', 'off', {
        brightness: 50,
      });

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.false;
    });

    it('should return true for light when off and brightness is 0', () => {
      // Arrange
      const state: EntityState = s('light.living_room', 'off', {
        brightness: 0,
      });

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.true;
    });

    it('should return true for light when off and brightness is null', () => {
      // Arrange
      const state: EntityState = s('light.living_room', 'off', {
        brightness: null,
      });

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.true;
    });

    it('should return false for light when on even if brightness is 0', () => {
      // Arrange
      const state: EntityState = s('light.living_room', 'on', {
        brightness: 0,
      });

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.false;
    });

    it('should return true for fan when off and percentage is 0', () => {
      // Arrange
      const state: EntityState = s('fan.living_room', 'off', {
        percentage: 0,
      });

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.true;
    });

    it('should return true for cover when closed and current_position is 0', () => {
      // Arrange
      const state: EntityState = s('cover.garage', 'closed', {
        current_position: 0,
      });

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.true;
    });

    it('should return true for cover when closed and current_position is null', () => {
      // Arrange
      const state: EntityState = s('cover.garage', 'closed', {
        current_position: null,
      });

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.true;
    });

    it('should return false for cover when open even if current_position is 0', () => {
      // Arrange
      const state: EntityState = s('cover.garage', 'open', {
        current_position: 0,
      });

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.false;
    });

    it('should return true for valve when closed and current_position is 0', () => {
      // Arrange
      const state: EntityState = s('valve.water', 'closed', {
        current_position: 0,
      });

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.true;
    });

    it('should return false for cover when closed but current_position has non-zero value', () => {
      // Arrange
      const state: EntityState = s('cover.garage', 'closed', {
        current_position: 25,
      });

      // Act & Assert
      expect(shouldHideStateDisplayWhenInactive(state)).to.be.false;
    });
  });
});
