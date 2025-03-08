import customThemeSpec from './custom-theme.spec';
import renderSpec from './render/index.spec';

describe('theme', () => {
  renderSpec();
  customThemeSpec();
});
