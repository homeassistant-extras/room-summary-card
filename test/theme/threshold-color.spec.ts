import {
  getEntityLabel,
  getStateColor,
  getStateResult,
  getThresholdResult,
} from '@theme/threshold-color';
import type { StateConfig, ThresholdConfig } from '@type/config/entity';
import type { EntityInformation } from '@type/room';
import { expect } from 'chai';

describe('threshold-color.ts', () => {
  describe('getStateColor', () => {
    const createEntity = (
      state: string,
      states?: StateConfig[],
    ): EntityInformation => ({
      config: {
        entity_id: 'sensor.test',
        states,
      },
      state: {
        entity_id: 'sensor.test',
        state,
        domain: 'sensor',
        attributes: {},
      },
    });

    it('should return undefined when no states configured', () => {
      const entity = createEntity('running');
      const result = getStateColor(entity);
      expect(result).to.be.undefined;
    });

    it('should return undefined when state is undefined', () => {
      const entity = {
        config: {
          entity_id: 'sensor.test',
          states: [{ state: 'running', icon_color: 'green', styles: {} }],
        },
        state: undefined,
      };
      const result = getStateColor(entity);
      expect(result).to.be.undefined;
    });

    it('should return color when state matches exactly', () => {
      const states: StateConfig[] = [
        { state: 'running', icon_color: 'green', styles: {} },
        { state: 'idle', icon_color: 'blue', styles: {} },
      ];
      const entity = createEntity('running', states);
      const result = getStateColor(entity);
      expect(result).to.equal('green');
    });

    it('should return undefined when no state matches', () => {
      const states: StateConfig[] = [
        { state: 'running', icon_color: 'green', styles: {} },
        { state: 'idle', icon_color: 'blue', styles: {} },
      ];
      const entity = createEntity('stopped', states);
      const result = getStateColor(entity);
      expect(result).to.be.undefined;
    });

    it('should handle case-sensitive state matching', () => {
      const states: StateConfig[] = [
        { state: 'Running', icon_color: 'green', styles: {} },
      ];
      const entity = createEntity('running', states);
      const result = getStateColor(entity);
      expect(result).to.be.undefined;
    });

    it('should work with washing machine example states', () => {
      const states: StateConfig[] = [
        { state: 'running', icon_color: 'green', styles: {} },
        { state: 'rinsing', icon_color: 'orange', styles: {} },
        { state: 'spinning', icon_color: 'blue', styles: {} },
        { state: 'finished', icon_color: 'purple', styles: {} },
      ];

      expect(getStateColor(createEntity('running', states))).to.equal('green');
      expect(getStateColor(createEntity('rinsing', states))).to.equal('orange');
      expect(getStateColor(createEntity('spinning', states))).to.equal('blue');
      expect(getStateColor(createEntity('finished', states))).to.equal(
        'purple',
      );
      expect(getStateColor(createEntity('idle', states))).to.be.undefined;
    });

    it('should handle numeric string states', () => {
      const states: StateConfig[] = [
        { state: '0', icon_color: 'red', styles: {} },
        { state: '1', icon_color: 'green', styles: {} },
      ];

      expect(getStateColor(createEntity('0', states))).to.equal('red');
      expect(getStateColor(createEntity('1', states))).to.equal('green');
      expect(getStateColor(createEntity('2', states))).to.be.undefined;
    });

    it('should handle special characters in states', () => {
      const states: StateConfig[] = [
        { state: 'on-standby', icon_color: 'yellow', styles: {} },
        { state: 'off/idle', icon_color: 'gray', styles: {} },
      ];

      expect(getStateColor(createEntity('on-standby', states))).to.equal(
        'yellow',
      );
      expect(getStateColor(createEntity('off/idle', states))).to.equal('gray');
    });

    it('should return the first matching state when duplicates exist', () => {
      const states: StateConfig[] = [
        { state: 'running', icon_color: 'green', styles: {} },
        { state: 'running', icon_color: 'red', styles: {} },
      ];

      const entity = createEntity('running', states);
      const result = getStateColor(entity);
      expect(result).to.equal('green');
    });
  });

  describe('getThresholdResult', () => {
    const createEntity = (
      state: string,
      thresholds?: ThresholdConfig[],
      states?: StateConfig[],
    ): EntityInformation => ({
      config: {
        entity_id: 'sensor.test',
        thresholds,
        states,
      },
      state: {
        entity_id: 'sensor.test',
        state,
        domain: 'sensor',
        attributes: {},
      },
    });

    it('should return undefined when no thresholds configured', () => {
      const entity = createEntity('25');
      const result = getThresholdResult(entity);
      expect(result).to.be.undefined;
    });

    it('should return undefined when state is undefined', () => {
      const entity = {
        config: {
          entity_id: 'sensor.test',
          thresholds: [
            { threshold: 50, icon_color: 'green', icon: 'mdi:thermometer' },
          ],
        },
        state: undefined,
      };
      const result = getThresholdResult(entity);
      expect(result).to.be.undefined;
    });

    it('should return color and icon when threshold matches', () => {
      const entity = createEntity('75', [
        { threshold: 50, icon_color: 'orange', icon: 'mdi:fire' },
      ]);
      const result = getThresholdResult(entity);
      expect(result).to.deep.equal({
        color: 'orange',
        icon: 'mdi:fire',
        label: undefined,
        styles: undefined,
      });
    });

    it('should return only color when threshold matches but no icon defined', () => {
      const entity = createEntity('75', [
        { threshold: 50, icon_color: 'orange' },
      ]);
      const result = getThresholdResult(entity);
      expect(result).to.deep.equal({
        color: 'orange',
        icon: undefined,
        label: undefined,
        styles: undefined,
      });
    });

    it('should prioritize state-based results over threshold-based results', () => {
      const thresholds: ThresholdConfig[] = [
        { threshold: 50, icon_color: 'red', icon: 'mdi:fire' },
      ];
      const states: StateConfig[] = [
        { state: 'running', icon_color: 'green', icon: 'mdi:play', styles: {} },
      ];

      const entity = createEntity('running', thresholds, states);
      const result = getThresholdResult(entity);
      expect(result).to.deep.equal({
        color: 'green',
        icon: 'mdi:play',
        label: undefined,
        styles: {},
      });
    });

    it('should fall back to threshold results when no state matches', () => {
      const thresholds: ThresholdConfig[] = [
        { threshold: 50, icon_color: 'red', icon: 'mdi:fire' },
      ];
      const states: StateConfig[] = [
        { state: 'running', icon_color: 'green', styles: {} },
      ];

      const entity = createEntity('75', thresholds, states);
      const result = getThresholdResult(entity);
      expect(result).to.deep.equal({
        color: 'red',
        icon: 'mdi:fire',
        label: undefined,
        styles: undefined,
      });
    });
  });

  describe('getStateResult', () => {
    const createEntity = (
      state: string,
      states?: StateConfig[],
    ): EntityInformation => ({
      config: {
        entity_id: 'sensor.test',
        states,
      },
      state: {
        entity_id: 'sensor.test',
        state,
        domain: 'sensor',
        attributes: {},
      },
    });

    it('should return undefined when no states configured', () => {
      const entity = createEntity('running');
      const result = getStateResult(entity);
      expect(result).to.be.undefined;
    });

    it('should return undefined when state is undefined', () => {
      const entity = {
        config: {
          entity_id: 'sensor.test',
          states: [
            {
              state: 'running',
              icon_color: 'green',
              icon: 'mdi:play',
              styles: {},
            },
          ],
        },
        state: undefined,
      };
      const result = getStateResult(entity);
      expect(result).to.be.undefined;
    });

    it('should return color and icon when state matches', () => {
      const states: StateConfig[] = [
        { state: 'running', icon_color: 'green', icon: 'mdi:play', styles: {} },
        { state: 'idle', icon_color: 'blue', icon: 'mdi:pause', styles: {} },
      ];
      const entity = createEntity('running', states);
      const result = getStateResult(entity);
      expect(result).to.deep.equal({
        color: 'green',
        icon: 'mdi:play',
        label: undefined,
        styles: {},
      });
    });

    it('should return only color when state matches but no icon defined', () => {
      const states: StateConfig[] = [
        { state: 'running', icon_color: 'green', styles: {} },
      ];
      const entity = createEntity('running', states);
      const result = getStateResult(entity);
      expect(result).to.deep.equal({
        color: 'green',
        icon: undefined,
        label: undefined,
        styles: {},
      });
    });

    it('should return undefined when no state matches', () => {
      const states: StateConfig[] = [
        { state: 'running', icon_color: 'green', icon: 'mdi:play', styles: {} },
        { state: 'idle', icon_color: 'blue', icon: 'mdi:pause', styles: {} },
      ];
      const entity = createEntity('stopped', states);
      const result = getStateResult(entity);
      expect(result).to.be.undefined;
    });

    it('should match attribute value when attribute is specified', () => {
      const states: StateConfig[] = [
        {
          state: '50',
          attribute: 'current_position',
          icon_color: 'orange',
          icon: 'mdi:window-shutter-settings',
          styles: {},
        },
      ];
      const entity: EntityInformation = {
        config: {
          entity_id: 'cover.window',
          states,
        },
        state: {
          entity_id: 'cover.window',
          state: 'open',
          domain: 'cover',
          attributes: { current_position: 50 },
        },
      };
      const result = getStateResult(entity);
      expect(result).to.deep.equal({
        color: 'orange',
        icon: 'mdi:window-shutter-settings',
        label: undefined,
        styles: {},
      });
    });

    it('should not match attribute value when state does not match', () => {
      const states: StateConfig[] = [
        {
          state: '100',
          attribute: 'current_position',
          icon_color: 'green',
          styles: {},
        },
      ];
      const entity: EntityInformation = {
        config: {
          entity_id: 'cover.window',
          states,
        },
        state: {
          entity_id: 'cover.window',
          state: 'open',
          domain: 'cover',
          attributes: { current_position: 50 },
        },
      };
      const result = getStateResult(entity);
      expect(result).to.be.undefined;
    });

    it('should fall back to entity state when no attribute is specified', () => {
      const states: StateConfig[] = [
        { state: 'open', icon_color: 'green', styles: {} },
      ];
      const entity: EntityInformation = {
        config: {
          entity_id: 'cover.window',
          states,
        },
        state: {
          entity_id: 'cover.window',
          state: 'open',
          domain: 'cover',
          attributes: { current_position: 50 },
        },
      };
      const result = getStateResult(entity);
      expect(result).to.deep.equal({
        color: 'green',
        icon: undefined,
        label: undefined,
        styles: {},
      });
    });

    it('should handle missing attribute gracefully', () => {
      const states: StateConfig[] = [
        {
          state: '50',
          attribute: 'brightness',
          icon_color: 'yellow',
          styles: {},
        },
      ];
      const entity: EntityInformation = {
        config: {
          entity_id: 'light.test',
          states,
        },
        state: {
          entity_id: 'light.test',
          state: 'on',
          domain: 'light',
          attributes: {},
        },
      };
      const result = getStateResult(entity);
      expect(result).to.be.undefined;
    });
  });

  describe('getThresholdResult - attribute matching', () => {
    it('should match threshold on attribute value when attribute is specified', () => {
      const thresholds: ThresholdConfig[] = [
        {
          threshold: 50,
          attribute: 'current_position',
          icon_color: 'orange',
          icon: 'mdi:window-shutter-settings',
          operator: 'gte',
        },
      ];
      const entity: EntityInformation = {
        config: {
          entity_id: 'cover.window',
          thresholds,
        },
        state: {
          entity_id: 'cover.window',
          state: 'open',
          domain: 'cover',
          attributes: { current_position: 75 },
        },
      };
      const result = getThresholdResult(entity);
      expect(result).to.deep.equal({
        color: 'orange',
        icon: 'mdi:window-shutter-settings',
        label: undefined,
        styles: undefined,
      });
    });

    it('should not match threshold when attribute value is below threshold', () => {
      const thresholds: ThresholdConfig[] = [
        {
          threshold: 50,
          attribute: 'current_position',
          icon_color: 'orange',
          operator: 'gte',
        },
      ];
      const entity: EntityInformation = {
        config: {
          entity_id: 'cover.window',
          thresholds,
        },
        state: {
          entity_id: 'cover.window',
          state: 'open',
          domain: 'cover',
          attributes: { current_position: 25 },
        },
      };
      const result = getThresholdResult(entity);
      expect(result).to.be.undefined;
    });

    it('should handle multiple thresholds with different attributes', () => {
      const thresholds: ThresholdConfig[] = [
        {
          threshold: 200,
          attribute: 'brightness',
          icon_color: 'yellow',
          operator: 'gte',
        },
        {
          threshold: 50,
          attribute: 'current_position',
          icon_color: 'orange',
          operator: 'gte',
        },
      ];
      const entity: EntityInformation = {
        config: {
          entity_id: 'cover.window',
          thresholds,
        },
        state: {
          entity_id: 'cover.window',
          state: 'open',
          domain: 'cover',
          attributes: { current_position: 75, brightness: 100 },
        },
      };
      const result = getThresholdResult(entity);
      // Should match the second threshold since brightness is 100 (< 200)
      expect(result).to.deep.equal({
        color: 'orange',
        icon: undefined,
        label: undefined,
        styles: undefined,
      });
    });

    it('should fall back to entity state when no attribute is specified', () => {
      const thresholds: ThresholdConfig[] = [
        { threshold: 20, icon_color: 'blue', operator: 'gte' },
      ];
      const entity: EntityInformation = {
        config: {
          entity_id: 'sensor.temperature',
          thresholds,
        },
        state: {
          entity_id: 'sensor.temperature',
          state: '25',
          domain: 'sensor',
          attributes: { unit_of_measurement: '°C' },
        },
      };
      const result = getThresholdResult(entity);
      expect(result).to.deep.equal({
        color: 'blue',
        icon: undefined,
        label: undefined,
        styles: undefined,
      });
    });

    it('should skip threshold when attribute value is not numeric', () => {
      const thresholds: ThresholdConfig[] = [
        {
          threshold: 50,
          attribute: 'invalid_attr',
          icon_color: 'red',
          operator: 'gte',
        },
        { threshold: 10, icon_color: 'green', operator: 'gte' },
      ];
      const entity: EntityInformation = {
        config: {
          entity_id: 'sensor.test',
          thresholds,
        },
        state: {
          entity_id: 'sensor.test',
          state: '15',
          domain: 'sensor',
          attributes: { invalid_attr: 'not_a_number' },
        },
      };
      const result = getThresholdResult(entity);
      // Should skip first threshold and match second one
      expect(result).to.deep.equal({
        color: 'green',
        icon: undefined,
        label: undefined,
        styles: undefined,
      });
    });

    it('should handle missing attribute gracefully', () => {
      const thresholds: ThresholdConfig[] = [
        {
          threshold: 50,
          attribute: 'missing_attr',
          icon_color: 'red',
          operator: 'gte',
        },
      ];
      const entity: EntityInformation = {
        config: {
          entity_id: 'sensor.test',
          thresholds,
        },
        state: {
          entity_id: 'sensor.test',
          state: '15',
          domain: 'sensor',
          attributes: {},
        },
      };
      const result = getThresholdResult(entity);
      expect(result).to.be.undefined;
    });
  });

  describe('getEntityLabel', () => {
    const createEntity = (
      state: string,
      thresholds?: ThresholdConfig[],
      states?: StateConfig[],
      label?: string,
    ): EntityInformation => ({
      config: {
        entity_id: 'sensor.test',
        thresholds,
        states,
        label,
      },
      state: {
        entity_id: 'sensor.test',
        state,
        domain: 'sensor',
        attributes: {},
      },
    });

    it('should return label from state result when state matches with label', () => {
      const states: StateConfig[] = [
        {
          state: 'running',
          icon_color: 'green',
          icon: 'mdi:play',
          label: 'Running Status',
          styles: {},
        },
      ];
      const entity = createEntity('running', undefined, states);
      const result = getStateResult(entity);
      const label = getEntityLabel(entity, result);
      expect(label).to.equal('Running Status');
    });

    it('should return label from threshold result when threshold matches with label', () => {
      const thresholds: ThresholdConfig[] = [
        {
          threshold: 50,
          icon_color: 'orange',
          icon: 'mdi:fire',
          label: 'High Temperature',
        },
      ];
      const entity = createEntity('75', thresholds);
      const result = getThresholdResult(entity);
      const label = getEntityLabel(entity, result);
      expect(label).to.equal('High Temperature');
    });

    it('should return config label when no state/threshold label exists', () => {
      const states: StateConfig[] = [
        { state: 'running', icon_color: 'green', icon: 'mdi:play', styles: {} },
      ];
      const entity = createEntity('running', undefined, states, 'Custom Label');
      const result = getStateResult(entity);
      const label = getEntityLabel(entity, result);
      expect(label).to.equal('Custom Label');
    });

    it('should prioritize state label over config label', () => {
      const states: StateConfig[] = [
        {
          state: 'running',
          icon_color: 'green',
          icon: 'mdi:play',
          label: 'State Label',
          styles: {},
        },
      ];
      const entity = createEntity('running', undefined, states, 'Config Label');
      const result = getStateResult(entity);
      const label = getEntityLabel(entity, result);
      expect(label).to.equal('State Label');
    });

    it('should prioritize threshold label over config label', () => {
      const thresholds: ThresholdConfig[] = [
        {
          threshold: 50,
          icon_color: 'orange',
          icon: 'mdi:fire',
          label: 'Threshold Label',
        },
      ];
      const entity = createEntity('75', thresholds, undefined, 'Config Label');
      const result = getThresholdResult(entity);
      const label = getEntityLabel(entity, result);
      expect(label).to.equal('Threshold Label');
    });

    it('should return undefined when no label is configured', () => {
      const states: StateConfig[] = [
        { state: 'running', icon_color: 'green', icon: 'mdi:play', styles: {} },
      ];
      const entity = createEntity('running', undefined, states);
      const result = getStateResult(entity);
      const label = getEntityLabel(entity, result);
      expect(label).to.be.undefined;
    });

    it('should include label in getStateResult when configured', () => {
      const states: StateConfig[] = [
        {
          state: 'running',
          icon_color: 'green',
          icon: 'mdi:play',
          label: 'Running',
          styles: {},
        },
      ];
      const entity = createEntity('running', undefined, states);
      const result = getStateResult(entity);
      expect(result).to.deep.equal({
        color: 'green',
        icon: 'mdi:play',
        label: 'Running',
        styles: {},
      });
    });

    it('should include label in getThresholdResult when configured', () => {
      const thresholds: ThresholdConfig[] = [
        {
          threshold: 50,
          icon_color: 'orange',
          icon: 'mdi:fire',
          label: 'High Temp',
        },
      ];
      const entity = createEntity('75', thresholds);
      const result = getThresholdResult(entity);
      expect(result).to.deep.equal({
        color: 'orange',
        icon: 'mdi:fire',
        label: 'High Temp',
        styles: undefined,
      });
    });
  });
});
