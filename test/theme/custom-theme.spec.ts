import type { HomeAssistant } from '@hass/types';
import { getThemeColorOverride } from '@theme/custom-theme';
import * as rgbColorModule from '@theme/get-rgb';
import type { EntityState } from '@type/config';
import { expect } from 'chai';
import { stub } from 'sinon';

export default () => {
  describe('custom-theme.ts', () => {
    describe('getThemeColorOverride', () => {
      // Mock Home Assistant instance with default theme
      const hassDefault = {
        themes: {
          theme: 'default',
        },
      } as any as HomeAssistant;

      // Mock Home Assistant instance with minimalist theme
      const hassMinimalist = {
        themes: {
          theme: 'minimalist-blue',
        },
      } as any as HomeAssistant;

      describe('with default theme', () => {
        it('should return undefined when state is undefined', () => {
          const result = getThemeColorOverride(hassDefault, undefined, true);
          expect(result).to.be.undefined;
        });

        it('should return on_color CSS variable when entity is active and on_color is valid', () => {
          const state = {
            entity_id: 'light.living_room',
            state: 'on',
            attributes: {
              on_color: 'red',
              off_color: 'grey',
            },
            domain: 'light',
          };

          const result = getThemeColorOverride(hassDefault, state, true);
          expect(result).to.equal('var(--red-color)');
        });

        it('should return off_color CSS variable when entity is inactive and off_color is valid', () => {
          const state = {
            entity_id: 'light.living_room',
            state: 'off',
            attributes: {
              on_color: 'red',
              off_color: 'grey',
            },
            domain: 'light',
          };

          const result = getThemeColorOverride(hassDefault, state, false);
          expect(result).to.equal('var(--grey-color)');
        });

        it('should return undefined if color is not in homeAssistantColors list', () => {
          const state = {
            entity_id: 'light.living_room',
            state: 'on',
            attributes: {
              on_color: 'not-a-valid-color',
              off_color: 'grey',
            },
            domain: 'light',
          };

          const result = getThemeColorOverride(hassDefault, state, true);
          expect(result).to.be.undefined;
        });
      });

      describe('with minimalist theme', () => {
        it('should use domain-based color when on_color is not provided', () => {
          const state = {
            entity_id: 'light.living_room',
            state: 'on',
            attributes: {},
            domain: 'light',
          };

          const result = getThemeColorOverride(hassMinimalist, state, true);
          expect(result).to.equal('rgb(var(--color-yellow))');
        });

        it('should use on_color when provided and valid for minimalist theme', () => {
          const state = {
            entity_id: 'light.living_room',
            state: 'on',
            attributes: {
              on_color: 'red',
              off_color: 'grey',
            },
            domain: 'light',
          };

          const result = getThemeColorOverride(hassMinimalist, state, true);
          expect(result).to.equal('rgb(var(--color-red))');
        });

        it('should use off_color when inactive', () => {
          const state = {
            entity_id: 'light.living_room',
            state: 'off',
            attributes: {
              on_color: 'red',
              off_color: 'grey',
            },
            domain: 'light',
          };

          const result = getThemeColorOverride(hassMinimalist, state, false);
          expect(result).to.equal('rgb(var(--color-grey))');
        });

        it('should return undefined if color is not in minimalistColors list', () => {
          const state = {
            entity_id: 'light.living_room',
            state: 'on',
            attributes: {
              on_color: 'cyan', // not in minimalistColors
            },
            domain: 'light',
          };

          const result = getThemeColorOverride(hassMinimalist, state, true);
          expect(result).to.be.undefined;
        });
      });

      it('should return rgb color when getRgbColor returns a value', () => {
        // Create a stub for the getRgbColor function
        const getRgbColorStub = stub(rgbColorModule, 'getRgbColor').returns(
          'rgb(123, 45, 67)',
        );

        // Create a mock state with rgb_color
        const state = {
          entity_id: 'light.living_room',
          state: 'on',
          attributes: {
            rgb_color: [123, 45, 67],
            on_color: 'red',
          },
          domain: 'light',
        };

        // Call getThemeColorOverride with the state
        const result = getThemeColorOverride(hassDefault, state, true);

        // Verify the function returns the RGB color string
        expect(result).to.equal('rgb(123, 45, 67)');

        // Verify getRgbColor was called with the correct parameters
        expect(getRgbColorStub.calledOnce).to.be.true;
        expect(getRgbColorStub.firstCall.args[0]).to.equal(state);
        expect(getRgbColorStub.firstCall.args[1]).to.equal('red');
        expect(getRgbColorStub.firstCall.args[2]).to.equal(undefined);
        expect(getRgbColorStub.firstCall.args[3]).to.equal(true);

        // Restore the stub to avoid affecting other tests
        getRgbColorStub.restore();
      });

      describe('domain-based color mapping', () => {
        // Mock Home Assistant instance with minimalist theme
        const hassMinimalist = {
          themes: {
            theme: 'minimalist-blue',
          },
        } as any as HomeAssistant;

        // Helper function to create a state object for a specific domain
        const createStateForDomain = (domain: string) => ({
          entity_id: `${domain}.test`,
          state: 'on',
          attributes: {},
          domain,
        });

        // Helper function to test a domain's color mapping
        const testDomainColor = (domain: string, expectedColor: string) => {
          it(`should map ${domain} domain to ${expectedColor}`, () => {
            const state = createStateForDomain(domain);
            const result = getThemeColorOverride(hassMinimalist, state, true);

            // Handle colors that aren't in minimalistColors
            if (
              ['teal', 'cyan', 'indigo', 'deep-purple', 'orange'].includes(
                expectedColor,
              )
            ) {
              expect(result).to.be.undefined;
            } else {
              expect(result).to.equal(`rgb(var(--color-${expectedColor}))`);
            }
          });
        };

        // Test all domain cases from the switch statement

        // Lighting
        testDomainColor('light', 'yellow');
        testDomainColor('switch_as_x', 'yellow');

        // Switches & Electric
        testDomainColor('switch', 'blue');
        testDomainColor('input_boolean', 'blue');
        testDomainColor('automation', 'blue');
        testDomainColor('script', 'blue');

        // Climate & Environment
        testDomainColor('climate', 'teal');
        testDomainColor('fan', 'teal');

        // Security & Safety
        testDomainColor('alarm_control_panel', 'red');
        testDomainColor('lock', 'red');

        // Covers & Doors
        testDomainColor('cover', 'green');
        testDomainColor('garage_door', 'green');
        testDomainColor('door', 'green');

        // Media
        testDomainColor('media_player', 'indigo');

        // Sensors & Binary Sensors
        testDomainColor('binary_sensor', 'cyan');
        testDomainColor('sensor', 'cyan');

        // Person & Presence
        testDomainColor('person', 'purple');
        testDomainColor('device_tracker', 'purple');

        // Weather & Update
        testDomainColor('weather', 'orange');
        testDomainColor('update', 'orange');

        // Vacuum
        testDomainColor('vacuum', 'deep-purple');

        // Timer & Schedule
        testDomainColor('timer', 'pink');
        testDomainColor('schedule', 'pink');

        // Default case
        testDomainColor('unknown_domain', 'yellow');
        testDomainColor('another_unknown', 'yellow');

        it('should handle undefined domain by using default color (yellow)', () => {
          const state = {
            entity_id: 'entity.without.domain',
            state: 'on',
            attributes: {},
            // domain is intentionally undefined here
          } as any as EntityState;

          const result = getThemeColorOverride(hassMinimalist, state, true);
          expect(result).to.equal('rgb(var(--color-yellow))');
        });
      });
    });
  });
};
