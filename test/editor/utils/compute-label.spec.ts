import { computeLabel } from '@editor/utils/compute-label';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
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
    const schema: HaFormSchema = {
      name: 'area',
      label: 'editor.area.area',
      required: true,
      selector: { area: {} },
    };

    const result = computeLabel(hass, schema);

    // The result should include the localized label and required indicator
    expect(result).to.be.a('string');
    expect(result.length).to.be.greaterThan(0);
    expect(result).to.include('required');
  });

  it('should compute label for optional field', () => {
    const schema: HaFormSchema = {
      name: 'entity',
      label: 'editor.entity.entity_id',
      required: false,
      selector: { entity: {} },
    };

    const result = computeLabel(hass, schema);

    // The result should include the localized label and optional indicator
    expect(result).to.be.a('string');
    expect(result.length).to.be.greaterThan(0);
    expect(result).to.include('optional');
  });
});
