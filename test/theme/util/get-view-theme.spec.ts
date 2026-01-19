import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { getViewTheme } from '../../../src/theme/util/get-view-theme';

describe('get-view-theme.ts', () => {
  let mockHass: HomeAssistant;

  beforeEach(() => {
    mockHass = {
      themes: {
        theme: 'default-theme',
      },
    } as HomeAssistant;
  });

  it('should return global theme when element is null', () => {
    const result = getViewTheme(null, mockHass);
    expect(result).to.equal('default-theme');
  });

  it('should return global theme when element is undefined', () => {
    const result = getViewTheme(undefined, mockHass);
    expect(result).to.equal('default-theme');
  });

  it('should return global theme when no view container is found', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);

    const result = getViewTheme(div, mockHass);

    expect(result).to.equal('default-theme');
    document.body.removeChild(div);
  });

  it('should return view container theme when found', () => {
    const viewContainer = document.createElement('hui-view-container');
    (viewContainer as any).theme = 'view-theme';
    document.body.appendChild(viewContainer);

    const div = document.createElement('div');
    viewContainer.appendChild(div);

    const result = getViewTheme(div, mockHass);

    expect(result).to.equal('view-theme');
    document.body.removeChild(viewContainer);
  });

  it('should fall back to global theme when view container has no theme', () => {
    const viewContainer = document.createElement('hui-view-container');
    document.body.appendChild(viewContainer);

    const div = document.createElement('div');
    viewContainer.appendChild(div);

    const result = getViewTheme(div, mockHass);

    expect(result).to.equal('default-theme');
    document.body.removeChild(viewContainer);
  });

  it('should traverse through shadow DOM boundaries', () => {
    // Skip if ShadowRoot is not available (e.g., in JSDOM)
    if (typeof ShadowRoot === 'undefined') {
      return;
    }

    const viewContainer = document.createElement('hui-view-container');
    (viewContainer as any).theme = 'shadow-theme';
    document.body.appendChild(viewContainer);

    const shadowHost = document.createElement('div');
    viewContainer.appendChild(shadowHost);
    const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

    const div = document.createElement('div');
    shadowRoot.appendChild(div);

    const result = getViewTheme(div, mockHass);

    expect(result).to.equal('shadow-theme');
    document.body.removeChild(viewContainer);
  });

  it('should return undefined when hass.themes is undefined', () => {
    const hassWithoutThemes = {} as HomeAssistant;
    const div = document.createElement('div');
    document.body.appendChild(div);

    const result = getViewTheme(div, hassWithoutThemes);

    expect(result).to.be.undefined;
    document.body.removeChild(div);
  });

  it('should return undefined when hass.themes.theme is undefined', () => {
    const hassWithUndefinedTheme = {
      themes: {},
    } as HomeAssistant;
    const div = document.createElement('div');
    document.body.appendChild(div);

    const result = getViewTheme(div, hassWithUndefinedTheme);

    expect(result).to.be.undefined;
    document.body.removeChild(div);
  });
});
