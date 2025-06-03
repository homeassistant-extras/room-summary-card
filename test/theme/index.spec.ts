import colorsSpec from './colors.spec';
import customThemeSpec from './custom-theme.spec';
import domainColorSpec from './domain-color.spec';
import getRgbSpec from './get-rgb.spec';
import renderSpec from './render/index.spec';

describe('theme', () => {
  colorsSpec();
  customThemeSpec();
  domainColorSpec();
  getRgbSpec();
  renderSpec();
});
