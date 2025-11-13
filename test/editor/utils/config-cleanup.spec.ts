import {
  cleanEmptyArrays,
  cleanEmptyProps,
} from '@editor/utils/config-cleanup';
import { expect } from 'chai';

describe('config-cleanup', () => {
  describe('cleanEmptyArrays', () => {
    it('should remove empty arrays from config', () => {
      const config = {
        area: 'test',
        entities: [],
        lights: ['light.test'],
      };

      cleanEmptyArrays(config, 'entities');

      expect(config.entities).to.be.undefined;
      expect(config.lights).to.deep.equal(['light.test']);
      expect(config.area).to.equal('test');
    });

    it('should not remove non-empty arrays', () => {
      const config = {
        entities: ['entity.test'],
      };

      cleanEmptyArrays(config, 'entities');

      expect(config.entities).to.deep.equal(['entity.test']);
    });

    it('should not remove non-array values', () => {
      const config = {
        area: 'test',
        count: 0,
      };

      cleanEmptyArrays(config, 'count');

      expect(config.count).to.equal(0);
    });
  });

  describe('cleanEmptyProps', () => {
    it('should remove empty nested objects', () => {
      const config = {
        area: 'test',
        background: {},
      };

      cleanEmptyProps(config, 'background');

      expect(config.background).to.be.undefined;
      expect(config.area).to.equal('test');
    });

    it('should remove empty arrays from nested objects', () => {
      const config = {
        occupancy: {
          entities: [],
          options: ['option1'],
        },
      };

      cleanEmptyProps(config, 'occupancy');

      expect(config.occupancy?.entities).to.be.undefined;
      expect(config.occupancy?.options).to.deep.equal(['option1']);
    });

    it('should remove falsy values from nested objects', () => {
      const config = {
        background: {
          options: undefined,
          color: 'red',
        },
      };

      cleanEmptyProps(config, 'background');

      expect(config.background?.options).to.be.undefined;
      expect(config.background?.color).to.equal('red');
    });

    it('should remove the entire object if all properties are empty', () => {
      const config = {
        thresholds: {
          temp: undefined,
          humidity: [],
        },
      };

      cleanEmptyProps(config, 'thresholds');

      expect(config.thresholds).to.be.undefined;
    });

    it('should not modify non-object values', () => {
      const config = {
        area: 'test',
      };

      cleanEmptyProps(config, 'area');

      expect(config.area).to.equal('test');
    });
  });
});
