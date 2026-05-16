import { isTemplateString } from '@hass/common/string/is_template';
import { expect } from 'chai';

describe('is_template.ts', () => {
  it('detects {{', () => {
    expect(isTemplateString('{{ states("sensor.a") }}')).to.be.true;
  });

  it('detects {%', () => {
    expect(isTemplateString('{% set x = 1 %}')).to.be.true;
  });

  it('returns false for plain text', () => {
    expect(isTemplateString('Living Room')).to.be.false;
  });
});
