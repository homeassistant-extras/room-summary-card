import * as featureModule from '@/config/feature';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { stub } from 'sinon';
import { d } from '../../src/util/debug';

export default () => {
  describe('debug.ts', () => {
    let hasFeatureStub: sinon.SinonStub;

    beforeEach(() => {
      hasFeatureStub = stub(featureModule, 'hasFeature');
    });

    afterEach(() => {
      hasFeatureStub.restore();
    });

    it('should log debug messages when the "debug" feature is enabled', () => {
      const config: Config = {} as Config;
      hasFeatureStub.withArgs(config, 'debug').returns(true);
      const consoleDebugStub = stub(console, 'debug');

      d(config, 'Test message', 123);

      expect(consoleDebugStub.calledOnceWithExactly('Test message', 123)).to.be
        .true;
      consoleDebugStub.restore();
    });

    it('should not log debug messages when the "debug" feature is disabled', () => {
      const config: Config = {} as Config;
      hasFeatureStub.withArgs(config, 'debug').returns(false);
      const consoleDebugStub = stub(console, 'debug');

      d(config, 'Test message', 123);

      expect(consoleDebugStub.notCalled).to.be.true;
      consoleDebugStub.restore();
    });
  });
};
