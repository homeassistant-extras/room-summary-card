import type { HomeAssistant } from '@hass/types';
import * as colorsModule from '@theme/colors';
import { getThemeColorOverride } from '@theme/custom-theme';
import * as rgbColorModule from '@theme/get-rgb';
import * as thresholdColorModule from '@theme/threshold-color';
import type { EntityInformation } from '@type/room';
import { expect } from 'chai';
import { stub } from 'sinon';
describe('custom-theme.ts', () => {
  describe('getThemeColorOverride', () => {
    let getRgbColorStub: sinon.SinonStub;
    let processMinimalistColorsStub: sinon.SinonStub;
    let processHomeAssistantColorsStub: sinon.SinonStub;
    let getThresholdColorStub: sinon.SinonStub;

    const hassDefault = {
      themes: { theme: 'default' },
    } as any as HomeAssistant;

    const hassMinimalist = {
      themes: { theme: 'minimalist-blue' },
    } as any as HomeAssistant;

    const createEntity = (
      configColors = {},
      stateAttributes = {},
      entityId = 'light.test',
    ): EntityInformation => ({
      config: {
        entity_id: entityId,
        ...configColors,
      },
      state: {
        entity_id: entityId,
        state: 'on',
        domain: 'light',
        attributes: stateAttributes,
      },
    });

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
      getThresholdColorStub = stub(thresholdColorModule, 'getThresholdColor').returns(undefined);
    });

    afterEach(() => {
      getRgbColorStub.restore();
      processMinimalistColorsStub.restore();
      processHomeAssistantColorsStub.restore();
      getThresholdColorStub.restore();
    });

    it('should return undefined when state is undefined', () => {
      const entity = {
        config: { entity_id: 'light.test' },
        state: undefined,
      };
      const result = getThemeColorOverride(hassDefault, entity, true);
      expect(result).to.be.undefined;
    });

    it('should prioritize threshold color over everything else', () => {
      const entity = createEntity(
        { on_color: 'red' },
        { icon_color: '#FF5733', on_color: 'blue' },
      );

      getThresholdColorStub.returns('orange');

      const result = getThemeColorOverride(hassDefault, entity, true);

      expect(result).to.equal('orange');
      expect(getThresholdColorStub.calledWith(entity)).to.be.true;
      expect(getRgbColorStub.called).to.be.false;
      expect(processMinimalistColorsStub.called).to.be.false;
      expect(processHomeAssistantColorsStub.called).to.be.false;
    });

    it('should prioritize hex icon_color over everything else', () => {
      const entity = createEntity(
        { on_color: 'red' },
        { icon_color: '#FF5733', on_color: 'blue' },
      );

      const result = getThemeColorOverride(hassDefault, entity, true);

      expect(result).to.equal('#FF5733');
      expect(getThresholdColorStub.called).to.be.true;
      expect(getRgbColorStub.called).to.be.false;
      expect(processMinimalistColorsStub.called).to.be.false;
      expect(processHomeAssistantColorsStub.called).to.be.false;
    });

    it('should use entity.config colors over state attributes', () => {
      const entity = createEntity(
        { on_color: 'green', off_color: 'red' },
        { on_color: 'blue', off_color: 'yellow' },
      );

      getRgbColorStub.returns(undefined);
      processHomeAssistantColorsStub.returns('var(--green-color)');

      getThemeColorOverride(hassDefault, entity, true);

      expect(getRgbColorStub.calledWith(entity.state, 'green', 'red', true)).to
        .be.true;
      expect(
        processHomeAssistantColorsStub.calledWith(
          undefined,
          'green',
          'red',
          true,
        ),
      ).to.be.true;
    });

    it('should fallback to state attributes when config colors missing', () => {
      const entity = createEntity({}, { on_color: 'blue', off_color: 'grey' });

      getRgbColorStub.returns(undefined);
      processHomeAssistantColorsStub.returns('var(--blue-color)');

      getThemeColorOverride(hassDefault, entity, true);

      expect(getRgbColorStub.calledWith(entity.state, 'blue', 'grey', true)).to
        .be.true;
    });

    it('should return RGB color when available', () => {
      const entity = createEntity({ on_color: 'red' });
      getRgbColorStub.returns('rgb(123, 45, 67)');

      const result = getThemeColorOverride(hassDefault, entity, true);

      expect(result).to.equal('rgb(123, 45, 67)');
      expect(processMinimalistColorsStub.called).to.be.false;
      expect(processHomeAssistantColorsStub.called).to.be.false;
    });

    it('should process minimalist theme colors for minimalist themes', () => {
      const entity = createEntity({ on_color: 'red' });
      getRgbColorStub.returns(undefined);
      processMinimalistColorsStub.returns('rgb(var(--color-red))');

      const result = getThemeColorOverride(hassMinimalist, entity, true);

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
      expect(processHomeAssistantColorsStub.called).to.be.false;
    });

    it('should fallback to HA colors when minimalist processing fails', () => {
      const entity = createEntity({ on_color: 'cyan' });
      getRgbColorStub.returns(undefined);
      processMinimalistColorsStub.returns(undefined);
      processHomeAssistantColorsStub.returns('var(--cyan-color)');

      const result = getThemeColorOverride(hassMinimalist, entity, true);

      expect(result).to.equal('var(--cyan-color)');
      expect(processMinimalistColorsStub.called).to.be.true;
      expect(processHomeAssistantColorsStub.called).to.be.true;
    });

    it('should use HA colors directly for non-minimalist themes', () => {
      const entity = createEntity({ on_color: 'red' });
      getRgbColorStub.returns(undefined);
      processHomeAssistantColorsStub.returns('var(--red-color)');

      const result = getThemeColorOverride(hassDefault, entity, true);

      expect(result).to.equal('var(--red-color)');
      expect(processMinimalistColorsStub.called).to.be.false;
      expect(processHomeAssistantColorsStub.called).to.be.true;
    });

    it('should return undefined when all processing fails', () => {
      const entity = createEntity({ on_color: 'invalid-color' });
      getRgbColorStub.returns(undefined);
      processMinimalistColorsStub.returns(undefined);
      processHomeAssistantColorsStub.returns(undefined);

      const result = getThemeColorOverride(hassMinimalist, entity, true);

      expect(result).to.be.undefined;
    });
  });
});
