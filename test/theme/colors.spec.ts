import {
  processHomeAssistantColors,
  processMinimalistColors,
} from '@theme/colors';
import * as domainColorModule from '@theme/domain-color';
import { expect } from 'chai';
import { stub } from 'sinon';

describe('colors.ts', () => {
  describe('processMinimalistColors', () => {
    let activeColorFromDomainStub: sinon.SinonStub;

    beforeEach(() => {
      activeColorFromDomainStub = stub(
        domainColorModule,
        'activeColorFromDomain',
      );
    });

    afterEach(() => {
      activeColorFromDomainStub.restore();
    });

    it('should return iconColor when it is in minimalistColors', () => {
      const result = processMinimalistColors('red', '', '', 'light', true);
      expect(result).to.equal('rgb(var(--color-red))');
    });

    it('should return undefined when iconColor is not in minimalistColors', () => {
      const result = processMinimalistColors('cyan', '', '', 'light', true);
      expect(result).to.be.undefined;
    });

    it('should use onColor when active and valid', () => {
      const result = processMinimalistColors('', 'blue', '', 'light', true);
      expect(result).to.equal('rgb(var(--color-blue))');
    });

    it('should use offColor when inactive and valid', () => {
      const result = processMinimalistColors(
        '',
        'blue',
        'grey',
        'light',
        false,
      );
      expect(result).to.equal('rgb(var(--color-grey))');
    });

    it('should use domain color when active and no onColor provided', () => {
      activeColorFromDomainStub.returns('yellow');
      const result = processMinimalistColors('', undefined, '', 'light', true);
      expect(result).to.equal('rgb(var(--color-yellow))');
      expect(activeColorFromDomainStub.calledWith('light')).to.be.true;
    });

    it('should return undefined when color is not in minimalistColors', () => {
      const result = processMinimalistColors('', 'cyan', '', 'light', true);
      expect(result).to.be.undefined;
    });
  });

  describe('processHomeAssistantColors', () => {
    it('should return iconColor CSS variable when iconColor is valid', () => {
      const result = processHomeAssistantColors('primary', '', '', true);
      expect(result).to.equal('var(--primary-color)');
    });

    it('should return iconColor when iconColor is not in homeAssistantColors', () => {
      const result = processHomeAssistantColors('invalid-color', '', '', true);
      expect(result).to.equal('invalid-color');
    });

    it('should return onColor CSS variable when active and onColor is valid', () => {
      const result = processHomeAssistantColors('', 'red', '', true);
      expect(result).to.equal('var(--red-color)');
    });

    it('should return offColor CSS variable when inactive and offColor is valid', () => {
      const result = processHomeAssistantColors('', '', 'grey', false);
      expect(result).to.equal('var(--grey-color)');
    });

    it('should return iconColor when active but onColor is invalid', () => {
      const result = processHomeAssistantColors('', 'invalid-color', '', true);
      expect(result).to.equal('');
    });

    it('should return iconColor when inactive but offColor is invalid', () => {
      const result = processHomeAssistantColors('', '', 'invalid-color', false);
      expect(result).to.equal('');
    });

    it('should prioritize iconColor over onColor/offColor', () => {
      const result = processHomeAssistantColors('blue', 'red', 'grey', true);
      expect(result).to.equal('var(--blue-color)');
    });
  });
});
