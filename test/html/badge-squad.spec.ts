import type { HomeAssistant } from '@hass/types';
import { renderBadgeElements } from '@html/badge-squad';
import { createStateEntity } from '@test/test-helpers';
import type { BadgeConfig } from '@type/config/entity';
import type { EntityInformation } from '@type/room';
import { expect } from 'chai';

describe('badge-squad.ts', () => {
  let mockHass: HomeAssistant;
  let mockEntity: EntityInformation;

  beforeEach(() => {
    mockHass = {
      states: {},
      formatEntityState: () => '',
    } as any as HomeAssistant;

    mockEntity = {
      config: {
        entity_id: 'light.test',
      },
      state: createStateEntity('light', 'test', 'on', {
        friendly_name: 'Test Light',
      }),
    };
  });

  describe('renderBadgeElements', () => {
    it('should return empty array when badges is undefined', () => {
      const result = renderBadgeElements(undefined, mockEntity, mockHass);
      expect(result).to.be.an('array');
      expect(result).to.have.length(0);
    });

    it('should return empty array when badges is empty', () => {
      const result = renderBadgeElements([], mockEntity, mockHass);
      expect(result).to.be.an('array');
      expect(result).to.have.length(0);
    });

    it('should render single badge', () => {
      const badges: BadgeConfig[] = [
        {
          position: 'top_right',
          mode: 'show_always',
        },
      ];
      const result = renderBadgeElements(badges, mockEntity, mockHass);
      expect(result).to.have.length(1);
      expect(result[0]).to.be.instanceOf(Object);
    });

    it('should limit badges to maximum of 4', () => {
      const badges: BadgeConfig[] = [
        { position: 'top_right' },
        { position: 'top_left' },
        { position: 'bottom_right' },
        { position: 'bottom_left' },
        { position: 'top_right' }, // 5th badge should be ignored
        { position: 'top_left' }, // 6th badge should be ignored
      ];
      const result = renderBadgeElements(badges, mockEntity, mockHass);
      expect(result).to.have.length(4);
    });

    it('should render all badges when count is exactly 4', () => {
      const badges: BadgeConfig[] = [
        { position: 'top_right' },
        { position: 'top_left' },
        { position: 'bottom_right' },
        { position: 'bottom_left' },
      ];
      const result = renderBadgeElements(badges, mockEntity, mockHass);
      expect(result).to.have.length(4);
    });

    it('should render badges with correct properties', () => {
      const badges: BadgeConfig[] = [
        {
          position: 'top_right',
          mode: 'show_always',
          entity_id: 'sensor.test',
        },
      ];
      const result = renderBadgeElements(badges, mockEntity, mockHass);
      expect(result).to.have.length(1);
      // Verify it's a template result (has strings and values)
      expect(result[0]).to.have.property('strings');
      expect(result[0]).to.have.property('values');
    });
  });
});
