import type { HomeAssistant } from '@hass/types';
import { getThemeColorOverride } from '@theme/custom-theme';
import { expect } from 'chai';

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
            isActive: true,
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
            isActive: false,
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
            isActive: true,
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
            isActive: true,
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
            isActive: true,
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
            isActive: false,
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
            isActive: true,
          };

          const result = getThemeColorOverride(hassMinimalist, state, true);
          expect(result).to.be.undefined;
        });
      });

      describe('domain-based color mapping', () => {
        it('should map light domain to yellow', () => {
          const state = {
            entity_id: 'light.living_room',
            state: 'on',
            attributes: {},
            domain: 'light',
            isActive: true,
          };

          const result = getThemeColorOverride(hassMinimalist, state, true);
          expect(result).to.equal('rgb(var(--color-yellow))');
        });

        it('should map switch domain to blue', () => {
          const state = {
            entity_id: 'switch.kitchen',
            state: 'on',
            attributes: {},
            domain: 'switch',
            isActive: true,
          };

          const result = getThemeColorOverride(hassMinimalist, state, true);
          expect(result).to.equal('rgb(var(--color-blue))');
        });

        it('should map climate domain to teal', () => {
          const state = {
            entity_id: 'climate.bedroom',
            state: 'heat',
            attributes: {},
            domain: 'climate',
            isActive: true,
          };

          // teal isn't in minimalistColors, so we expect undefined
          const result = getThemeColorOverride(hassMinimalist, state, true);
          expect(result).to.be.undefined;
        });

        it('should use default color (yellow) for unknown domains', () => {
          const state = {
            entity_id: 'unknown.entity',
            state: 'active',
            attributes: {},
            domain: 'unknown',
            isActive: true,
          };

          const result = getThemeColorOverride(hassMinimalist, state, true);
          expect(result).to.equal('rgb(var(--color-yellow))');
        });
      });
    });
  });
};
