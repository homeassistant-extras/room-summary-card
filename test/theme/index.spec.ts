import customThemeSpec from './custom-theme.spec';
import getRgbSpec from './get-rgb.spec';
import renderSpec from './render/index.spec';

describe('theme', () => {
  customThemeSpec();
  getRgbSpec();
  renderSpec();
});
