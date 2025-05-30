import cardStylesSpec from './card-styles.spec';
import commonStyleSpec from './common-style.spec';
import iconStylesSpec from './icon-styles.spec';
import textStylesSpec from './text-styles.spec';

export default () => {
  describe('render', () => {
    cardStylesSpec();
    commonStyleSpec();
    iconStylesSpec();
    textStylesSpec();
  });
};
