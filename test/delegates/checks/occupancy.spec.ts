import {
  getOccupancyCssVars,
  getOccupancyState,
} from '@delegates/checks/occupancy';
import * as stateActiveModule from '@hass/common/entity/state_active';
import type { HomeAssistant } from '@hass/types';
import { createState as s } from '@test/test-helpers';
import type { OccupancyConfig } from '@type/config';
import { expect } from 'chai';
import * as sinon from 'sinon';

export default () => {
  describe('occupancy.ts', () => {
    let mockHass: HomeAssistant;
    let sandbox: sinon.SinonSandbox;
    let stateActiveStub: sinon.SinonStub;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      stateActiveStub = sandbox.stub(stateActiveModule, 'stateActive');

      mockHass = {
        states: {
          'binary_sensor.motion_1': s('binary_sensor', 'motion_1', 'on'),
          'binary_sensor.motion_2': s('binary_sensor', 'motion_2', 'off'),
          'binary_sensor.presence_1': s('binary_sensor', 'presence_1', 'on'),
        },
      } as any as HomeAssistant;
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('getOccupancyState', () => {
      it('should return false when no config is provided', () => {
        const result = getOccupancyState(mockHass);
        expect(result).to.be.false;
      });

      it('should return false when config has no entities', () => {
        const config: OccupancyConfig = { entities: [] };
        const result = getOccupancyState(mockHass, config);
        expect(result).to.be.false;
      });

      it('should return true when any entity detects occupancy', () => {
        stateActiveStub
          .withArgs(mockHass.states['binary_sensor.motion_1'])
          .returns(true);
        stateActiveStub
          .withArgs(mockHass.states['binary_sensor.motion_2'])
          .returns(false);

        const config: OccupancyConfig = {
          entities: ['binary_sensor.motion_1', 'binary_sensor.motion_2'],
        };
        const result = getOccupancyState(mockHass, config);
        expect(result).to.be.true;
      });

      it('should return false when no entities detect occupancy', () => {
        stateActiveStub.returns(false);

        const config: OccupancyConfig = {
          entities: ['binary_sensor.motion_1', 'binary_sensor.motion_2'],
        };
        const result = getOccupancyState(mockHass, config);
        expect(result).to.be.false;
      });

      it('should handle non-existent entities gracefully', () => {
        stateActiveStub.returns(false);

        const config: OccupancyConfig = {
          entities: ['binary_sensor.non_existent', 'binary_sensor.motion_1'],
        };
        const result = getOccupancyState(mockHass, config);
        expect(result).to.be.false;
      });
    });

    describe('getOccupancyCssVars', () => {
      it('should return empty object when no config is provided', () => {
        const result = getOccupancyCssVars(false);
        expect(result).to.deep.equal({});
      });

      it('should return empty object when not occupied', () => {
        const config: OccupancyConfig = {
          entities: ['binary_sensor.motion_1'],
          card_border_color: '#00ff00',
          icon_color: '#ff0000',
        };
        const result = getOccupancyCssVars(false, config);
        expect(result).to.deep.equal({});
      });

      it('should return card border styles when occupied with default colors', () => {
        const config: OccupancyConfig = {
          entities: ['binary_sensor.motion_1'],
        };
        const result = getOccupancyCssVars(true, config);

        expect(result).to.deep.equal({
          '--occupancy-card-border': '3px solid var(--success-color)',
          '--occupancy-card-border-color': 'var(--success-color)',
          '--occupancy-card-animation':
            'occupancy-pulse 2s ease-in-out infinite alternate',
          '--occupancy-icon-color': 'var(--success-color)',
          '--occupancy-icon-animation':
            'icon-breathe 3s ease-in-out infinite alternate',
        });
      });

      it('should use custom card border color when provided', () => {
        const config: OccupancyConfig = {
          entities: ['binary_sensor.motion_1'],
          card_border_color: '#ff0000',
        };
        const result = getOccupancyCssVars(true, config);

        expect(result['--occupancy-card-border']).to.equal('3px solid #ff0000');
        expect(result['--occupancy-card-border-color']).to.equal('#ff0000');
      });

      it('should use custom icon color when provided', () => {
        const config: OccupancyConfig = {
          entities: ['binary_sensor.motion_1'],
          icon_color: '#00ff00',
        };
        const result = getOccupancyCssVars(true, config);

        expect(result['--occupancy-icon-color']).to.equal('#00ff00');
      });

      it('should disable card border styles when disabled_card_styles option is set', () => {
        const config: OccupancyConfig = {
          entities: ['binary_sensor.motion_1'],
          options: ['disabled_card_styles'],
        };
        const result = getOccupancyCssVars(true, config);

        expect(result['--occupancy-card-border']).to.be.undefined;
        expect(result['--occupancy-card-border-color']).to.be.undefined;
        expect(result['--occupancy-card-animation']).to.be.undefined;
        expect(result['--occupancy-icon-color']).to.equal(
          'var(--success-color)',
        );
        expect(result['--occupancy-icon-animation']).to.equal(
          'icon-breathe 3s ease-in-out infinite alternate',
        );
      });

      it('should disable card border animation when disabled_card_styles_animation option is set', () => {
        const config: OccupancyConfig = {
          entities: ['binary_sensor.motion_1'],
          options: ['disabled_card_styles_animation'],
        };
        const result = getOccupancyCssVars(true, config);

        expect(result['--occupancy-card-border']).to.equal(
          '3px solid var(--success-color)',
        );
        expect(result['--occupancy-card-border-color']).to.equal(
          'var(--success-color)',
        );
        expect(result['--occupancy-card-animation']).to.be.undefined;
        expect(result['--occupancy-icon-color']).to.equal(
          'var(--success-color)',
        );
        expect(result['--occupancy-icon-animation']).to.equal(
          'icon-breathe 3s ease-in-out infinite alternate',
        );
      });

      it('should disable icon styles when disable_icon_styles option is set', () => {
        const config: OccupancyConfig = {
          entities: ['binary_sensor.motion_1'],
          options: ['disable_icon_styles'],
        };
        const result = getOccupancyCssVars(true, config);

        expect(result['--occupancy-card-border']).to.equal(
          '3px solid var(--success-color)',
        );
        expect(result['--occupancy-card-border-color']).to.equal(
          'var(--success-color)',
        );
        expect(result['--occupancy-card-animation']).to.equal(
          'occupancy-pulse 2s ease-in-out infinite alternate',
        );
        expect(result['--occupancy-icon-color']).to.be.undefined;
        expect(result['--occupancy-icon-animation']).to.be.undefined;
      });

      it('should disable icon animation when disable_icon_animation option is set', () => {
        const config: OccupancyConfig = {
          entities: ['binary_sensor.motion_1'],
          options: ['disable_icon_animation'],
        };
        const result = getOccupancyCssVars(true, config);

        expect(result['--occupancy-card-border']).to.equal(
          '3px solid var(--success-color)',
        );
        expect(result['--occupancy-card-border-color']).to.equal(
          'var(--success-color)',
        );
        expect(result['--occupancy-card-animation']).to.equal(
          'occupancy-pulse 2s ease-in-out infinite alternate',
        );
        expect(result['--occupancy-icon-color']).to.equal(
          'var(--success-color)',
        );
        expect(result['--occupancy-icon-animation']).to.be.undefined;
      });

      it('should handle multiple disable options simultaneously', () => {
        const config: OccupancyConfig = {
          entities: ['binary_sensor.motion_1'],
          options: [
            'disabled_card_styles',
            'disabled_card_styles_animation',
            'disable_icon_styles',
            'disable_icon_animation',
          ],
        };
        const result = getOccupancyCssVars(true, config);

        expect(result).to.deep.equal({});
      });

      it('should combine custom colors with disabled options correctly', () => {
        const config: OccupancyConfig = {
          entities: ['binary_sensor.motion_1'],
          card_border_color: '#ff0000',
          icon_color: '#00ff00',
          options: ['disabled_card_styles_animation', 'disable_icon_animation'],
        };
        const result = getOccupancyCssVars(true, config);

        expect(result).to.deep.equal({
          '--occupancy-card-border': '3px solid #ff0000',
          '--occupancy-card-border-color': '#ff0000',
          '--occupancy-icon-color': '#00ff00',
        });
      });

      it('should handle undefined options array', () => {
        const config: OccupancyConfig = {
          entities: ['binary_sensor.motion_1'],
          options: undefined,
        };
        const result = getOccupancyCssVars(true, config);

        expect(result).to.deep.equal({
          '--occupancy-card-border': '3px solid var(--success-color)',
          '--occupancy-card-border-color': 'var(--success-color)',
          '--occupancy-card-animation':
            'occupancy-pulse 2s ease-in-out infinite alternate',
          '--occupancy-icon-color': 'var(--success-color)',
          '--occupancy-icon-animation':
            'icon-breathe 3s ease-in-out infinite alternate',
        });
      });
    });
  });
};
