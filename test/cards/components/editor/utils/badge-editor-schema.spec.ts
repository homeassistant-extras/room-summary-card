import { getBadgeSchema } from '@cards/components/editor/utils/badge-editor-schema';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import * as localizeModule from '@localize/localize';
import { expect } from 'chai';
import { restore, stub } from 'sinon';

describe('badge-editor-schema', () => {
  let mockHass: HomeAssistant;

  beforeEach(() => {
    mockHass = {
      localize: stub().callsFake((key: string) => `translated:${key}`),
    } as unknown as HomeAssistant;

    stub(localizeModule, 'localize').callsFake(
      (_hass: HomeAssistant, key: string) => `localized:${key}`,
    );
  });

  afterEach(() => {
    restore();
  });

  describe('getBadgeSchema', () => {
    it('should return the correct schema structure', () => {
      const schema = getBadgeSchema(mockHass);

      expect(schema).to.be.an('array').with.lengthOf(4);

      expect(schema[0]).to.deep.equal({
        name: 'entity_id',
        required: false,
        label: 'editor.entity.entity_id',
        selector: { entity: {} },
      });

      expect(schema[1]).to.deep.equal({
        name: 'label',
        required: false,
        label: 'editor.badge.label',
        selector: { template: { preview: true } },
      });

      expect(schema[2]).to.deep.include({
        name: 'position',
        required: false,
        label: 'editor.badge.position_label',
      });

      const positionSchema = schema[2] as any;
      expect(positionSchema.selector.select.options).to.have.lengthOf(4);
      expect(positionSchema.selector.select.options[0].value).to.equal(
        'top_right',
      );

      expect(schema[3]).to.deep.include({
        name: 'mode',
        required: false,
        label: 'editor.badge.mode_label',
      });

      const modeSchema = schema[3] as any;
      expect(modeSchema.selector.select.options).to.have.lengthOf(3);
      expect(modeSchema.selector.select.options[0].value).to.equal(
        'show_always',
      );
    });
  });
});
