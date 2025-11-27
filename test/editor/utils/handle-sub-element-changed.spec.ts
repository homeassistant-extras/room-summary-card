import type { SubElementEditorConfig } from '@cards/components/editor/sub-element-editor';
import {
  handleEntitiesArrayUpdate,
  handleLightsArrayUpdate,
  handleSensorsArrayUpdate,
  handleSingleEntityUpdate,
  handleSubElementChanged,
} from '@editor/utils/handle-sub-element-changed';
import type { Config } from '@type/config';
import type { EntityConfig } from '@type/config/entity';
import type { SensorConfig } from '@type/config/sensor';
import { expect } from 'chai';

describe('handle-sub-element-changed.ts', () => {
  const baseConfig: Config = {
    area: 'living_room',
  };

  describe('handleSingleEntityUpdate', () => {
    it('should set entity to undefined and return shouldGoBack true when value is null', () => {
      const config: Config = {
        ...baseConfig,
        entity: 'light.test',
      };

      const result = handleSingleEntityUpdate(config, null);

      expect(result.config.entity).to.be.undefined;
      expect(result.shouldGoBack).to.be.true;
    });

    it('should set entity to undefined and return shouldGoBack true when value is undefined', () => {
      const config: Config = {
        ...baseConfig,
        entity: 'light.test',
      };

      const result = handleSingleEntityUpdate(config, undefined);

      expect(result.config.entity).to.be.undefined;
      expect(result.shouldGoBack).to.be.true;
    });

    it('should update entity with string value', () => {
      const config: Config = {
        ...baseConfig,
        entity: 'light.old',
      };

      const result = handleSingleEntityUpdate(config, 'light.new');

      expect(result.config.entity).to.equal('light.new');
      expect(result.shouldGoBack).to.be.false;
    });

    it('should update entity with EntityConfig value', () => {
      const config: Config = {
        ...baseConfig,
        entity: 'light.old',
      };

      const entityConfig: EntityConfig = {
        entity_id: 'light.new',
        label: 'New Light',
        icon: 'mdi:bulb',
      };

      const result = handleSingleEntityUpdate(config, entityConfig);

      expect(result.config.entity).to.deep.equal(entityConfig);
      expect(result.shouldGoBack).to.be.false;
    });

    it('should preserve other config properties', () => {
      const config: Config = {
        ...baseConfig,
        entity: 'light.old',
        entities: ['light.other'],
        lights: ['light.lamp'],
      };

      const result = handleSingleEntityUpdate(config, 'light.new');

      expect(result.config.area).to.equal('living_room');
      expect(result.config.entities).to.deep.equal(['light.other']);
      expect(result.config.lights).to.deep.equal(['light.lamp']);
    });
  });

  describe('handleEntitiesArrayUpdate', () => {
    it('should remove entity at index when value is null', () => {
      const config: Config = {
        ...baseConfig,
        entities: ['light.one', 'light.two', 'light.three'],
      };

      const result = handleEntitiesArrayUpdate(config, null, 1);

      expect(result.config.entities).to.deep.equal([
        'light.one',
        'light.three',
      ]);
      expect(result.shouldGoBack).to.be.true;
    });

    it('should remove entity at index when value is undefined', () => {
      const config: Config = {
        ...baseConfig,
        entities: ['light.one', 'light.two'],
      };

      const result = handleEntitiesArrayUpdate(config, undefined, 0);

      expect(result.config.entities).to.deep.equal(['light.two']);
      expect(result.shouldGoBack).to.be.true;
    });

    it('should update entity at index with string value', () => {
      const config: Config = {
        ...baseConfig,
        entities: ['light.one', 'light.two'],
      };

      const result = handleEntitiesArrayUpdate(config, 'light.updated', 1);

      expect(result.config.entities).to.deep.equal([
        'light.one',
        'light.updated',
      ]);
      expect(result.shouldGoBack).to.be.false;
    });

    it('should update entity at index with EntityConfig value', () => {
      const config: Config = {
        ...baseConfig,
        entities: ['light.one', 'light.two'],
      };

      const entityConfig: EntityConfig = {
        entity_id: 'light.updated',
        label: 'Updated Light',
      };

      const result = handleEntitiesArrayUpdate(config, entityConfig, 0);

      expect(result.config.entities?.[0]).to.deep.equal(entityConfig);
      expect(result.config.entities?.[1]).to.equal('light.two');
      expect(result.shouldGoBack).to.be.false;
    });

    it('should handle empty entities array', () => {
      const config: Config = {
        ...baseConfig,
        entities: [],
      };

      const result = handleEntitiesArrayUpdate(config, 'light.new', 0);

      expect(result.config.entities).to.deep.equal(['light.new']);
      expect(result.shouldGoBack).to.be.false;
    });

    it('should handle undefined entities array', () => {
      const config: Config = {
        ...baseConfig,
      };

      const result = handleEntitiesArrayUpdate(config, 'light.new', 0);

      expect(result.config.entities).to.deep.equal(['light.new']);
      expect(result.shouldGoBack).to.be.false;
    });

    it('should preserve other config properties', () => {
      const config: Config = {
        ...baseConfig,
        entities: ['light.one'],
        entity: 'light.main',
        lights: ['light.lamp'],
      };

      const result = handleEntitiesArrayUpdate(config, 'light.updated', 0);

      expect(result.config.entity).to.equal('light.main');
      expect(result.config.lights).to.deep.equal(['light.lamp']);
    });
  });

  describe('handleSensorsArrayUpdate', () => {
    it('should remove sensor at index when value is null', () => {
      const config: Config = {
        ...baseConfig,
        sensors: ['sensor.temp', 'sensor.humidity', 'sensor.pressure'],
      };

      const result = handleSensorsArrayUpdate(config, null, 1);

      expect(result.config.sensors).to.deep.equal([
        'sensor.temp',
        'sensor.pressure',
      ]);
      expect(result.shouldGoBack).to.be.true;
    });

    it('should remove sensor at index when value is undefined', () => {
      const config: Config = {
        ...baseConfig,
        sensors: ['sensor.temp', 'sensor.humidity'],
      };

      const result = handleSensorsArrayUpdate(config, undefined, 0);

      expect(result.config.sensors).to.deep.equal(['sensor.humidity']);
      expect(result.shouldGoBack).to.be.true;
    });

    it('should update sensor at index with string value', () => {
      const config: Config = {
        ...baseConfig,
        sensors: ['sensor.temp', 'sensor.humidity'],
      };

      const result = handleSensorsArrayUpdate(config, 'sensor.updated', 1);

      expect(result.config.sensors).to.deep.equal([
        'sensor.temp',
        'sensor.updated',
      ]);
      expect(result.shouldGoBack).to.be.false;
    });

    it('should update sensor at index with SensorConfig value', () => {
      const config: Config = {
        ...baseConfig,
        sensors: ['sensor.temp', 'sensor.humidity'],
      };

      const sensorConfig: SensorConfig = {
        entity_id: 'sensor.updated',
        label: 'Updated Sensor',
        attribute: 'temperature',
      };

      const result = handleSensorsArrayUpdate(config, sensorConfig, 0);

      expect(result.config.sensors?.[0]).to.deep.equal(sensorConfig);
      expect(result.config.sensors?.[1]).to.equal('sensor.humidity');
      expect(result.shouldGoBack).to.be.false;
    });

    it('should handle empty sensors array', () => {
      const config: Config = {
        ...baseConfig,
        sensors: [],
      };

      const result = handleSensorsArrayUpdate(config, 'sensor.new', 0);

      expect(result.config.sensors).to.deep.equal(['sensor.new']);
      expect(result.shouldGoBack).to.be.false;
    });

    it('should handle undefined sensors array', () => {
      const config: Config = {
        ...baseConfig,
      };

      const result = handleSensorsArrayUpdate(config, 'sensor.new', 0);

      expect(result.config.sensors).to.deep.equal(['sensor.new']);
      expect(result.shouldGoBack).to.be.false;
    });

    it('should preserve other config properties', () => {
      const config: Config = {
        ...baseConfig,
        sensors: ['sensor.temp'],
        entities: ['light.one'],
      };

      const result = handleSensorsArrayUpdate(config, 'sensor.updated', 0);

      expect(result.config.entities).to.deep.equal(['light.one']);
    });
  });

  describe('handleLightsArrayUpdate', () => {
    it('should remove light at index when value is null', () => {
      const config: Config = {
        ...baseConfig,
        lights: ['light.one', 'light.two', 'light.three'],
      };

      const result = handleLightsArrayUpdate(config, null, 1);

      expect(result.config.lights).to.deep.equal(['light.one', 'light.three']);
      expect(result.shouldGoBack).to.be.true;
    });

    it('should remove light at index when value is undefined', () => {
      const config: Config = {
        ...baseConfig,
        lights: ['light.one', 'light.two'],
      };

      const result = handleLightsArrayUpdate(config, undefined, 0);

      expect(result.config.lights).to.deep.equal(['light.two']);
      expect(result.shouldGoBack).to.be.true;
    });

    it('should update light at index with string value', () => {
      const config: Config = {
        ...baseConfig,
        lights: ['light.one', 'light.two'],
      };

      const result = handleLightsArrayUpdate(config, 'light.updated', 1);

      expect(result.config.lights).to.deep.equal([
        'light.one',
        'light.updated',
      ]);
      expect(result.shouldGoBack).to.be.false;
    });

    it('should extract entity_id from EntityConfig value', () => {
      const config: Config = {
        ...baseConfig,
        lights: ['light.one', 'light.two'],
      };

      const entityConfig: EntityConfig = {
        entity_id: 'light.updated',
        label: 'Updated Light',
        icon: 'mdi:bulb',
      };

      const result = handleLightsArrayUpdate(config, entityConfig, 0);

      expect(result.config.lights?.[0]).to.equal('light.updated');
      expect(result.config.lights?.[1]).to.equal('light.two');
      expect(result.shouldGoBack).to.be.false;
    });

    it('should handle empty lights array', () => {
      const config: Config = {
        ...baseConfig,
        lights: [],
      };

      const result = handleLightsArrayUpdate(config, 'light.new', 0);

      expect(result.config.lights).to.deep.equal(['light.new']);
      expect(result.shouldGoBack).to.be.false;
    });

    it('should handle undefined lights array', () => {
      const config: Config = {
        ...baseConfig,
      };

      const result = handleLightsArrayUpdate(config, 'light.new', 0);

      expect(result.config.lights).to.deep.equal(['light.new']);
      expect(result.shouldGoBack).to.be.false;
    });

    it('should preserve other config properties', () => {
      const config: Config = {
        ...baseConfig,
        lights: ['light.one'],
        entities: ['light.other'],
      };

      const result = handleLightsArrayUpdate(config, 'light.updated', 0);

      expect(result.config.entities).to.deep.equal(['light.other']);
    });
  });

  describe('handleSubElementChanged', () => {
    it('should route to handleSingleEntityUpdate for tab 0 with entities field', () => {
      const config: Config = {
        ...baseConfig,
        entity: 'light.old',
      };

      const subElementConfig: SubElementEditorConfig = {
        field: 'entities',
        index: undefined,
        type: 'entity',
      };

      const result = handleSubElementChanged(
        config,
        'light.new',
        subElementConfig,
        0,
      );

      expect(result.config.entity).to.equal('light.new');
      expect(result.shouldGoBack).to.be.false;
    });

    it('should route to handleEntitiesArrayUpdate for tab 1 with entities field', () => {
      const config: Config = {
        ...baseConfig,
        entities: ['light.one', 'light.two'],
      };

      const subElementConfig: SubElementEditorConfig = {
        field: 'entities',
        index: 1,
        type: 'entity',
      };

      const result = handleSubElementChanged(
        config,
        'light.updated',
        subElementConfig,
        1,
      );

      expect(result.config.entities).to.deep.equal([
        'light.one',
        'light.updated',
      ]);
      expect(result.shouldGoBack).to.be.false;
    });

    it('should route to handleSensorsArrayUpdate for tab 3 with entities field', () => {
      const config: Config = {
        ...baseConfig,
        sensors: ['sensor.temp', 'sensor.humidity'],
      };

      const subElementConfig: SubElementEditorConfig = {
        field: 'entities',
        index: 0,
        type: 'sensor',
      };

      const result = handleSubElementChanged(
        config,
        'sensor.updated',
        subElementConfig,
        3,
      );

      expect(result.config.sensors).to.deep.equal([
        'sensor.updated',
        'sensor.humidity',
      ]);
      expect(result.shouldGoBack).to.be.false;
    });

    it('should route to handleLightsArrayUpdate for lights field', () => {
      const config: Config = {
        ...baseConfig,
        lights: ['light.one', 'light.two'],
      };

      const subElementConfig: SubElementEditorConfig = {
        field: 'lights',
        index: 1,
        type: 'entity',
      };

      const result = handleSubElementChanged(
        config,
        'light.updated',
        subElementConfig,
        2,
      );

      expect(result.config.lights).to.deep.equal([
        'light.one',
        'light.updated',
      ]);
      expect(result.shouldGoBack).to.be.false;
    });

    it('should return unchanged config for unknown field/tab combination', () => {
      const config: Config = {
        ...baseConfig,
        entity: 'light.test',
      };

      const subElementConfig: SubElementEditorConfig = {
        field: 'entities',
        index: 0,
        type: 'entity',
      };

      // Tab 2 (lights tab) with entities field - should not match any handler
      const result = handleSubElementChanged(
        config,
        'light.new',
        subElementConfig,
        2,
      );

      expect(result.config).to.deep.equal(config);
      expect(result.shouldGoBack).to.be.false;
    });

    it('should handle null value for single entity update', () => {
      const config: Config = {
        ...baseConfig,
        entity: 'light.test',
      };

      const subElementConfig: SubElementEditorConfig = {
        field: 'entities',
        index: undefined,
        type: 'entity',
      };

      const result = handleSubElementChanged(config, null, subElementConfig, 0);

      expect(result.config.entity).to.be.undefined;
      expect(result.shouldGoBack).to.be.true;
    });

    it('should handle null value for entities array update', () => {
      const config: Config = {
        ...baseConfig,
        entities: ['light.one', 'light.two'],
      };

      const subElementConfig: SubElementEditorConfig = {
        field: 'entities',
        index: 0,
        type: 'entity',
      };

      const result = handleSubElementChanged(config, null, subElementConfig, 1);

      expect(result.config.entities).to.deep.equal(['light.two']);
      expect(result.shouldGoBack).to.be.true;
    });

    it('should handle EntityConfig value for lights array update', () => {
      const config: Config = {
        ...baseConfig,
        lights: ['light.one'],
      };

      const entityConfig: EntityConfig = {
        entity_id: 'light.extracted',
        label: 'Extracted Light',
      };

      const subElementConfig: SubElementEditorConfig = {
        field: 'lights',
        index: 0,
        type: 'entity',
      };

      const result = handleSubElementChanged(
        config,
        entityConfig,
        subElementConfig,
        2,
      );

      expect(result.config.lights?.[0]).to.equal('light.extracted');
      expect(result.shouldGoBack).to.be.false;
    });
  });
});
