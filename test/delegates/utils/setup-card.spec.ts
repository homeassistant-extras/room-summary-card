import * as occupancyModule from '@delegates/checks/occupancy';
import * as climateThresholdsModule from '@delegates/checks/thresholds';
import * as getRoomEntityModule from '@delegates/entities/room-entity';
import * as areaRetrieverModule from '@delegates/retrievers/area';
import * as getSensorsModule from '@delegates/utils/hide-yo-sensors';
import { getRoomProperties } from '@delegates/utils/setup-card';
import type { HomeAssistant } from '@hass/types';
import { createState as s } from '@test/test-helpers';
import * as getBackgroundImageModule from '@theme/image/get-pic';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { stub, type SinonStub } from 'sinon';

describe('setup-card.ts', () => {
  let mockHass: HomeAssistant;
  let getAreaStub: SinonStub;
  let getSensorsStub: SinonStub;
  let getRoomEntityStub: SinonStub;
  let climateThresholdsStub: SinonStub;
  let getBackgroundImageUrlStub: SinonStub;
  let getOccupancyStateStub: SinonStub;

  beforeEach(() => {
    // Create stubs for all the delegate functions
    getAreaStub = stub(areaRetrieverModule, 'getArea');
    getSensorsStub = stub(getSensorsModule, 'getSensors');
    getRoomEntityStub = stub(getRoomEntityModule, 'getRoomEntity');
    climateThresholdsStub = stub(climateThresholdsModule, 'climateThresholds');
    getBackgroundImageUrlStub = stub(
      getBackgroundImageModule,
      'getBackgroundImageUrl',
    );
    getOccupancyStateStub = stub(occupancyModule, 'getOccupancyState');

    mockHass = {
      areas: { living_room: { area_id: 'living_room', name: 'Living Room' } },
      themes: { darkMode: true },
    } as any as HomeAssistant;

    // Set up default stub returns
    getAreaStub.returns({ area_id: 'living_room', name: 'Living Room' });
    getSensorsStub.returns({
      individual: [],
      averaged: [],
      problemSensors: [],
    });
    getRoomEntityStub.returns({
      config: { entity_id: 'light.test' },
      state: s('light', 'test', 'on'),
    });
    climateThresholdsStub.returns({ hot: false, humid: false });
    getBackgroundImageUrlStub.returns('/local/bg.jpg');
    getOccupancyStateStub.returns(true);
  });

  afterEach(() => {
    getAreaStub.restore();
    getSensorsStub.restore();
    getRoomEntityStub.restore();
    climateThresholdsStub.restore();
    getBackgroundImageUrlStub.restore();
    getOccupancyStateStub.restore();
  });

  describe('getRoomProperties', () => {
    it('should call all delegate functions and return their results', () => {
      const config: Config = { area: 'living_room' };
      const result = getRoomProperties(mockHass, config);

      // Verify all functions were called with correct parameters
      expect(getRoomEntityStub.calledWith(mockHass, config)).to.be.true;
      expect(getSensorsStub.calledWith(mockHass, config)).to.be.true;
      expect(getBackgroundImageUrlStub.calledWith(mockHass, config)).to.be.true;
      expect(getOccupancyStateStub.calledWith(mockHass, config.occupancy)).to.be
        .true;

      // Verify climateThresholds is called with full sensor data
      expect(
        climateThresholdsStub.calledWith(config, {
          individual: [],
          averaged: [],
          problemSensors: [],
        }),
      ).to.be.true;

      // Verify result structure and values
      expect(result).to.have.all.keys([
        'roomInfo',
        'roomEntity',
        'sensors',
        'image',
        'isActive',
        'flags',
      ]);
      expect(result.image).to.equal('/local/bg.jpg');
      expect(result.flags.dark).to.be.true;
      expect(result.flags.occupied).to.be.true;
    });

    it('should use config area_name when provided instead of calling getArea', () => {
      const config: Config = {
        area: 'living_room',
        area_name: 'Custom Name',
      };
      const result = getRoomProperties(mockHass, config);

      expect(result.roomInfo.area_name).to.equal('Custom Name');
      expect(getAreaStub.called).to.be.false;
    });

    describe('isActive calculation', () => {
      it('should return true when room entity is active', () => {
        const config: Config = { area: 'living_room' };

        // Mock room entity as active
        getRoomEntityStub.returns({
          config: { entity_id: 'light.living_room' },
          state: s('light', 'living_room', 'on'),
        });

        // Mock sensors with no active lights
        getSensorsStub.returns({
          individual: [],
          averaged: [],
          problemSensors: [],
          lightEntities: [s('light', 'bedroom', 'off')],
        });

        const result = getRoomProperties(mockHass, config);
        expect(result.isActive).to.be.true;
      });

      it('should return true when room entity is inactive but light entities are active', () => {
        const config: Config = { area: 'living_room' };

        // Mock room entity as inactive
        getRoomEntityStub.returns({
          config: { entity_id: 'light.living_room' },
          state: s('light', 'living_room', 'off'),
        });

        // Mock sensors with active lights
        getSensorsStub.returns({
          individual: [],
          averaged: [],
          problemSensors: [],
          lightEntities: [
            s('light', 'bedroom', 'off'),
            s('light', 'kitchen', 'on'),
          ],
        });

        const result = getRoomProperties(mockHass, config);
        expect(result.isActive).to.be.true;
      });

      it('should return false when both room entity and light entities are inactive', () => {
        const config: Config = { area: 'living_room' };

        // Mock room entity as inactive
        getRoomEntityStub.returns({
          config: { entity_id: 'light.living_room' },
          state: s('light', 'living_room', 'off'),
        });

        // Mock sensors with no active lights
        getSensorsStub.returns({
          individual: [],
          averaged: [],
          problemSensors: [],
          lightEntities: [
            s('light', 'bedroom', 'off'),
            s('light', 'kitchen', 'off'),
          ],
        });

        const result = getRoomProperties(mockHass, config);
        expect(result.isActive).to.be.false;
      });

      it('should return false when room entity has no state and no light entities are active', () => {
        const config: Config = { area: 'living_room' };

        // Mock room entity with no state
        getRoomEntityStub.returns({
          config: { entity_id: 'light.living_room' },
          state: undefined,
        });

        // Mock sensors with no active lights
        getSensorsStub.returns({
          individual: [],
          averaged: [],
          problemSensors: [],
          lightEntities: [s('light', 'bedroom', 'off')],
        });

        const result = getRoomProperties(mockHass, config);
        expect(result.isActive).to.be.false;
      });

      it('should return false when lightEntities array is empty', () => {
        const config: Config = { area: 'living_room' };

        // Mock room entity as inactive
        getRoomEntityStub.returns({
          config: { entity_id: 'light.living_room' },
          state: s('light', 'living_room', 'off'),
        });

        // Mock sensors with empty lightEntities array
        getSensorsStub.returns({
          individual: [],
          averaged: [],
          problemSensors: [],
          lightEntities: [],
        });

        const result = getRoomProperties(mockHass, config);
        expect(result.isActive).to.be.false;
      });
    });
  });
});
