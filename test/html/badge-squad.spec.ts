import type { HomeAssistant } from '@hass/types';
import { renderBadgeElements } from '@html/badge-squad';
import { createStateEntity } from '@test/test-helpers';
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
    it('should return undefined when entity.config.badges is undefined', () => {
      const result = renderBadgeElements(mockEntity, mockHass);
      expect(result).to.be.undefined;
    });

    it('should return empty array when entity.config.badges is empty', () => {
      mockEntity.config.badges = [];
      const result = renderBadgeElements(mockEntity, mockHass);
      expect(result).to.be.an('array');
      expect(result).to.have.length(0);
    });

    it('should limit badges to maximum of 4', () => {
      mockEntity.config.badges = [
        { position: 'top_right' },
        { position: 'top_left' },
        { position: 'bottom_right' },
        { position: 'bottom_left' },
        { position: 'top_right' }, // 5th badge should be ignored
        { position: 'top_left' }, // 6th badge should be ignored
      ];
      const result = renderBadgeElements(mockEntity, mockHass);
      expect(result).to.have.length(4);
    });

    it('should fall back to entity.config.entity_id when badge has no entity_id', () => {
      mockEntity.config.badges = [
        {
          position: 'top_right',
          mode: 'show_always',
        },
      ];
      const result = renderBadgeElements(mockEntity, mockHass);
      expect(result).to.have.length(1);
      const badgeConfig = result?.[0]?.values?.[1] as { entity_id?: string };
      expect(badgeConfig?.entity_id).to.equal('light.test');
    });

    it('should render badges with correct template structure', () => {
      mockEntity.config.badges = [
        {
          position: 'top_right',
          mode: 'show_always',
          entity_id: 'sensor.test',
        },
      ];
      const result = renderBadgeElements(mockEntity, mockHass);
      expect(result).to.have.length(1);
      expect(result![0]).to.have.property('strings');
      expect(result![0]).to.have.property('values');
      const badgeConfig = result?.[0]?.values?.[1] as { entity_id?: string };
      expect(badgeConfig?.entity_id).to.equal('sensor.test');
    });
  });
});
