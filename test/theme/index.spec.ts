import colorsSpec from './colors.spec';
import customThemeSpec from './custom-theme.spec';
import domainColorSpec from './domain-color.spec';
import getRgbSpec from './get-rgb.spec';
import getPicSpec from './image/get-pic.spec';
import renderSpec from './render/index.spec';

describe('theme', () => {
  describe('image', getPicSpec);
  colorsSpec();
  customThemeSpec();
  domainColorSpec();
  getRgbSpec();
  renderSpec();
});
