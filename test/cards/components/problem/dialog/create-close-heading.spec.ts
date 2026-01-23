import { createCloseHeading } from '@cards/components/problem/dialog/create-close-heading';
import type { HomeAssistant } from '@hass/types';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';

describe('create-close-heading.ts', () => {
  let mockHass: HomeAssistant;

  beforeEach(() => {
    mockHass = {
      localize: (key: string) => {
        if (key === 'ui.common.close') {
          return 'Close';
        }
        return key;
      },
      language: 'en',
    } as any as HomeAssistant;
  });

  it('should create a heading with close button and title', async () => {
    const result = createCloseHeading(mockHass);
    const el = await fixture(result);

    expect(el).to.exist;
    expect(el.className).to.equal('header_title');

    const button = el.querySelector('ha-icon-button');
    expect(button).to.exist;
    expect(button?.getAttribute('dialogAction')).to.equal('close');
    expect((button as any).path).to.equal(
      'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z',
    );

    const span = el.querySelector('span');
    expect(span).to.exist;
  });

  it('should use hass localize for close button label', async () => {
    const result = createCloseHeading(mockHass);
    const el = await fixture(result);

    const button = el.querySelector('ha-icon-button');
    expect(button).to.exist;
    expect((button as any).label).to.equal('Close');
  });
});
