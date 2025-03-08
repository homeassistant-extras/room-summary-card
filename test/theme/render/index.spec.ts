import cardStylesSpec from './card-styles.spec';
import iconStylesSpec from './icon-styles.spec';

export default () => {
  describe('render', () => {
    cardStylesSpec();
    iconStylesSpec();
  });
};
