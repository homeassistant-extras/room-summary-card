import * as featureModule from '@config/feature';
import * as areaRetrieverModule from '@delegates/retrievers/area';
import * as stateRetrieverModule from '@delegates/retrievers/state';
import * as stateActiveModule from '@hass/common/entity/state_active';
import { backgroundImage } from '@theme/render/background-bits';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { stub, type SinonStub } from 'sinon';

export default () => {
  describe('background-bits.ts', () => {
    let mockHass: any;
    let mockConfig: Config;
    let hasFeatureStub: SinonStub;
    let getStateStub: SinonStub;
    let getAreaStub: SinonStub;
    let stateActiveStub: SinonStub;

    beforeEach(() => {
      hasFeatureStub = stub(featureModule, 'hasFeature');
      getStateStub = stub(stateRetrieverModule, 'getState');
      getAreaStub = stub(areaRetrieverModule, 'getArea');
      stateActiveStub = stub(stateActiveModule, 'stateActive');

      // Default stub behaviors
      hasFeatureStub.returns(false);
      getStateStub.returns(undefined);
      getAreaStub.returns({ picture: undefined });
      stateActiveStub.returns(false);

      mockHass = {
        themes: { darkMode: false },
        states: {},
        areas: { test_area: {} },
      };

      mockConfig = { area: 'test_area' };
    });

    afterEach(() => {
      hasFeatureStub.restore();
      getStateStub.restore();
      getAreaStub.restore();
      stateActiveStub.restore();
    });

    describe('backgroundImage', () => {
      it('should return default opacity when no config background', () => {
        const result = backgroundImage(mockHass, mockConfig);

        expect(result).to.deep.equal({
          image: undefined,
          opacity: 'var(--opacity-background-inactive)',
        });
      });

      it('should use area picture when available', () => {
        getAreaStub.returns({ picture: '/local/area-pic.jpg' });

        const result = backgroundImage(mockHass, mockConfig);

        expect(result).to.deep.equal({
          image: 'url(/local/area-pic.jpg)',
          opacity: 0.2,
        });
      });

      it('should prioritize config background image over area picture', () => {
        mockConfig.background = { image: '/local/custom-bg.jpg' };
        getAreaStub.returns({ picture: '/local/area-pic.jpg' });

        const result = backgroundImage(mockHass, mockConfig);

        expect(result).to.deep.equal({
          image: 'url(/local/custom-bg.jpg)',
          opacity: 0.2,
        });
      });

      it('should use custom opacity when configured', () => {
        mockConfig.background = { opacity: 75 };

        const result = backgroundImage(mockHass, mockConfig);

        expect(result).to.deep.equal({
          image: undefined,
          opacity: 0.75,
        });
      });

      it('should use image entity when available', () => {
        mockConfig.background = { image_entity: 'camera.bedroom' };
        getStateStub.returns({
          attributes: { entity_picture: '/api/camera_proxy/camera.bedroom' },
        });

        const result = backgroundImage(mockHass, mockConfig);

        expect(result).to.deep.equal({
          image: 'url(/api/camera_proxy/camera.bedroom)',
          opacity: 0.2,
        });
      });

      it('should prioritize image entity over config image', () => {
        mockConfig.background = {
          image_entity: 'camera.bedroom',
          image: '/local/fallback.jpg',
        };
        getStateStub.returns({
          attributes: { entity_picture: '/api/camera_proxy/camera.bedroom' },
        });

        const result = backgroundImage(mockHass, mockConfig);

        expect(result).to.deep.equal({
          image: 'url(/api/camera_proxy/camera.bedroom)',
          opacity: 0.2,
        });
      });

      it('should disable image when options includes disable', () => {
        mockConfig.background = {
          image: '/local/custom-bg.jpg',
          options: ['disable'],
        };
        getAreaStub.returns({ picture: '/local/area-pic.jpg' });

        const result = backgroundImage(mockHass, mockConfig);

        expect(result).to.deep.equal({
          image: undefined,
          opacity: 'var(--opacity-background-inactive)',
        });
      });

      it('should use active opacity in dark mode when entity is active', () => {
        mockHass.themes.darkMode = true;
        stateActiveStub.returns(true);

        const mockState = {
          entity_id: 'light.test',
          state: 'on',
          attributes: {},
          domain: 'light',
        };

        const result = backgroundImage(mockHass, mockConfig, mockState);

        expect(result).to.deep.equal({
          image: undefined,
          opacity: 'var(--opacity-background-active)',
        });
      });

      it('should use inactive opacity when skip_entity_styles is enabled', () => {
        mockHass.themes.darkMode = true;
        stateActiveStub.returns(true);
        hasFeatureStub.withArgs(mockConfig, 'skip_entity_styles').returns(true);

        const mockState = {
          entity_id: 'light.test',
          state: 'on',
          attributes: {},
          domain: 'light',
        };

        const result = backgroundImage(mockHass, mockConfig, mockState);

        expect(result).to.deep.equal({
          image: undefined,
          opacity: 'var(--opacity-background-inactive)',
        });
      });
    });
  });
};
