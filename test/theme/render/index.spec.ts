import backgroundBitsSpec from '../background/background-bits.spec';
import getPicSpec from '../image/get-pic.spec';
import cardStylesSpec from './card-styles.spec';
import commonStyleSpec from './common-style.spec';
import iconStylesSpec from './icon-styles.spec';
import textStylesSpec from './text-styles.spec';

export default () => {
  describe('render', () => {
    describe('background', backgroundBitsSpec);
    describe('image', getPicSpec);
    cardStylesSpec();
    commonStyleSpec();
    iconStylesSpec();
    textStylesSpec();
  });
};
