import backgroundBitsSpec from './background-bits.spec';
import cardStylesSpec from './card-styles.spec';
import commonStyleSpec from './common-style.spec';
import iconStylesSpec from './icon-styles.spec';
import textStylesSpec from './text-styles.spec';

export default () => {
  describe('render', () => {
    backgroundBitsSpec();
    cardStylesSpec();
    commonStyleSpec();
    iconStylesSpec();
    textStylesSpec();
  });
};
