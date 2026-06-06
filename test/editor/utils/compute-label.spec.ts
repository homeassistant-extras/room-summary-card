import { computeLabel } from '@editor/utils/compute-label';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import { type LocalizedHaFormSchema } from '@localize/localize';
import { expect } from 'chai';

describe('compute-label', () => {
  let hass: HomeAssistant;

  beforeEach(() => {
    hass = {
      language: 'en',
      localize: (key: string) => key,
    } as HomeAssistant;
  });

  it('should compute label for required field', () => {
    const schema: LocalizedHaFormSchema = {
      name: 'area',
      label: 'editor.area.area',
      required: true,
      selector: { area: {} },
    };

    const result = computeLabel(schema, hass);

    expect(result).to.equal(
      'Area (ui.panel.lovelace.editor.card.config.required)',
    );
  });

  it('should compute label for optional field', () => {
    const schema: LocalizedHaFormSchema = {
      name: 'entity',
      label: 'editor.entity.entity_id',
      required: false,
      selector: { entity: {} },
    };

    const result = computeLabel(schema, hass);

    expect(result).to.equal(
      'Entity (ui.panel.lovelace.editor.card.config.optional)',
    );
  });
});
