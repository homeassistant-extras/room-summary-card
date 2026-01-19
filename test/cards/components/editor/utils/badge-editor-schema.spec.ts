import {
  getBadgeSchema,
  computeLabelCallback,
} from '@cards/components/editor/utils/badge-editor-schema';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
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
      const schema = getBadgeSchema('sensor.test', mockHass);

      expect(schema).to.be.an('array').with.lengthOf(3);

      expect(schema[0]).to.deep.equal({
        name: 'entity_id',
        required: false,
        label: 'editor.entity.entity_id',
        selector: { entity: {} },
      });

      expect(schema[1]).to.deep.include({
        name: 'position',
        required: false,
        label: 'editor.badge.position_label',
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const positionSchema = schema[1] as any;
      expect(positionSchema.selector.select.options).to.have.lengthOf(4);
      expect(positionSchema.selector.select.options[0].value).to.equal(
        'top_right',
      );

      expect(schema[2]).to.deep.include({
        name: 'mode',
        required: false,
        label: 'editor.badge.mode_label',
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const modeSchema = schema[2] as any;
      expect(modeSchema.selector.select.options).to.have.lengthOf(3);
      expect(modeSchema.selector.select.options[0].value).to.equal(
        'show_always',
      );
    });
  });

  describe('computeLabelCallback', () => {
    it('should return empty string when schema has no label', () => {
      const schema = { name: 'test' } as unknown as HaFormSchema;
      const result = computeLabelCallback(schema, mockHass);
      expect(result).to.equal('');
    });

    it('should return localized label with optional suffix for non-required fields', () => {
      const schema: HaFormSchema = {
        name: 'test',
        label: 'editor.entity.entity_id',
        required: false,
        selector: { entity: {} },
      };
      const result = computeLabelCallback(schema, mockHass);
      expect(result).to.equal(
        'localized:editor.entity.entity_id (translated:ui.panel.lovelace.editor.card.config.optional)',
      );
    });

    it('should return localized label with required suffix for required fields', () => {
      const schema: HaFormSchema = {
        name: 'test',
        label: 'editor.entity.entity_id',
        required: true,
        selector: { entity: {} },
      };
      const result = computeLabelCallback(schema, mockHass);
      expect(result).to.equal(
        'localized:editor.entity.entity_id (translated:ui.panel.lovelace.editor.card.config.required)',
      );
    });
  });
});
