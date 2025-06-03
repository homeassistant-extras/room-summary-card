import type { HomeAssistant } from '@hass/types';
import * as colorsModule from '@theme/colors';
import { getThemeColorOverride } from '@theme/custom-theme';
import * as rgbColorModule from '@theme/get-rgb';
import { expect } from 'chai';
import { stub } from 'sinon';

export default () => {
  describe('custom-theme.ts', () => {
    describe('getThemeColorOverride', () => {
      let getRgbColorStub: sinon.SinonStub;
      let processMinimalistColorsStub: sinon.SinonStub;
      let processHomeAssistantColorsStub: sinon.SinonStub;

      // Mock Home Assistant instances
      const hassDefault = {
        themes: {
          theme: 'default',
        },
      } as any as HomeAssistant;

      const hassMinimalist = {
        themes: {
          theme: 'minimalist-blue',
        },
      } as any as HomeAssistant;

      beforeEach(() => {
        getRgbColorStub = stub(rgbColorModule, 'getRgbColor');
        processMinimalistColorsStub = stub(
          colorsModule,
          'processMinimalistColors',
        );
        processHomeAssistantColorsStub = stub(
          colorsModule,
          'processHomeAssistantColors',
        );
      });

      afterEach(() => {
        getRgbColorStub.restore();
        processMinimalistColorsStub.restore();
        processHomeAssistantColorsStub.restore();
      });

      it('should return undefined when state is undefined', () => {
        const result = getThemeColorOverride(hassDefault, undefined, true);
        expect(result).to.be.undefined;
      });

      describe('icon_color priority', () => {
        it('should return hex color when icon_color starts with #', () => {
          const state = {
            entity_id: 'light.living_room',
            state: 'on',
            attributes: {
              icon_color: '#FF5733',
              on_color: 'red',
              off_color: 'grey',
            },
            domain: 'light',
          };

          const result = getThemeColorOverride(hassDefault, state, true);
          expect(result).to.equal('#FF5733');

          // Should not call other color functions when icon_color is hex
          expect(getRgbColorStub.called).to.be.false;
          expect(processMinimalistColorsStub.called).to.be.false;
          expect(processHomeAssistantColorsStub.called).to.be.false;
        });

        it('should ignore icon_color if it does not start with #', () => {
          const state = {
            entity_id: 'light.living_room',
            state: 'on',
            attributes: {
              icon_color: 'red',
              on_color: 'blue',
            },
            domain: 'light',
          };

          getRgbColorStub.returns(undefined);
          processHomeAssistantColorsStub.returns('var(--blue-color)');

          const result = getThemeColorOverride(hassDefault, state, true);

          expect(getRgbColorStub.called).to.be.true;
          expect(processHomeAssistantColorsStub.called).to.be.true;
        });

        it('should handle undefined icon_color', () => {
          const state = {
            entity_id: 'light.living_room',
            state: 'on',
            attributes: {
              icon_color: undefined,
              on_color: 'blue',
            },
            domain: 'light',
          };

          getRgbColorStub.returns(undefined);
          processHomeAssistantColorsStub.returns('var(--blue-color)');

          const result = getThemeColorOverride(hassDefault, state, true);

          expect(getRgbColorStub.called).to.be.true;
          expect(processHomeAssistantColorsStub.called).to.be.true;
        });
      });

      describe('RGB color processing', () => {
        it('should return RGB color when getRgbColor returns a value', () => {
          const state = {
            entity_id: 'light.living_room',
            state: 'on',
            attributes: {
              rgb_color: [123, 45, 67],
              on_color: 'red',
            },
            domain: 'light',
          };

          getRgbColorStub.returns('rgb(123, 45, 67)');

          const result = getThemeColorOverride(hassDefault, state, true);

          expect(result).to.equal('rgb(123, 45, 67)');
          expect(getRgbColorStub.calledWith(state, 'red', undefined, true)).to
            .be.true;

          // Should not call color processing when RGB is available
          expect(processMinimalistColorsStub.called).to.be.false;
          expect(processHomeAssistantColorsStub.called).to.be.false;
        });

        it('should continue to color processing when getRgbColor returns undefined', () => {
          const state = {
            entity_id: 'light.living_room',
            state: 'on',
            attributes: {
              on_color: 'red',
            },
            domain: 'light',
          };

          getRgbColorStub.returns(undefined);
          processHomeAssistantColorsStub.returns('var(--red-color)');

          const result = getThemeColorOverride(hassDefault, state, true);

          expect(getRgbColorStub.called).to.be.true;
          expect(processHomeAssistantColorsStub.called).to.be.true;
        });
      });

      describe('theme processing', () => {
        it('should process minimalist colors first for minimalist theme', () => {
          const state = {
            entity_id: 'light.living_room',
            state: 'on',
            attributes: {
              on_color: 'red',
            },
            domain: 'light',
          };

          getRgbColorStub.returns(undefined);
          processMinimalistColorsStub.returns('rgb(var(--color-red))');

          const result = getThemeColorOverride(hassMinimalist, state, true);

          expect(result).to.equal('rgb(var(--color-red))');
          expect(
            processMinimalistColorsStub.calledWith(
              undefined,
              'red',
              undefined,
              'light',
              true,
            ),
          ).to.be.true;

          // Should not call HA colors when minimalist succeeds
          expect(processHomeAssistantColorsStub.called).to.be.false;
        });

        it('should fallback to HA colors when minimalist returns undefined', () => {
          const state = {
            entity_id: 'light.living_room',
            state: 'on',
            attributes: {
              on_color: 'cyan', // Not in minimalistColors
            },
            domain: 'light',
          };

          getRgbColorStub.returns(undefined);
          processMinimalistColorsStub.returns(undefined);
          processHomeAssistantColorsStub.returns('var(--cyan-color)');

          const result = getThemeColorOverride(hassMinimalist, state, true);

          expect(result).to.equal('var(--cyan-color)');
          expect(processMinimalistColorsStub.called).to.be.true;
          expect(
            processHomeAssistantColorsStub.calledWith(
              undefined,
              'cyan',
              undefined,
              true,
            ),
          ).to.be.true;
        });

        it('should use HA colors directly for default theme', () => {
          const state = {
            entity_id: 'light.living_room',
            state: 'on',
            attributes: {
              on_color: 'red',
            },
            domain: 'light',
          };

          getRgbColorStub.returns(undefined);
          processHomeAssistantColorsStub.returns('var(--red-color)');

          const result = getThemeColorOverride(hassDefault, state, true);

          expect(result).to.equal('var(--red-color)');
          expect(
            processHomeAssistantColorsStub.calledWith(
              undefined,
              'red',
              undefined,
              true,
            ),
          ).to.be.true;

          // Should not call minimalist colors for default theme
          expect(processMinimalistColorsStub.called).to.be.false;
        });

        it('should return undefined when all color processing fails', () => {
          const state = {
            entity_id: 'light.living_room',
            state: 'on',
            attributes: {
              on_color: 'invalid-color',
            },
            domain: 'light',
          };

          getRgbColorStub.returns(undefined);
          processMinimalistColorsStub.returns(undefined);
          processHomeAssistantColorsStub.returns(undefined);

          const result = getThemeColorOverride(hassMinimalist, state, true);

          expect(result).to.be.undefined;
        });
      });
    });
  });
};
