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
  let getSmokeStateStub: SinonStub;
  let getGasStateStub: SinonStub;
  let getWaterStateStub: SinonStub;

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
    getSmokeStateStub = stub(occupancyModule, 'getSmokeState');
    getGasStateStub = stub(occupancyModule, 'getGasState');
    getWaterStateStub = stub(occupancyModule, 'getWaterState');

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
      lightEntities: [],
      ambientLightEntities: [],
      thresholdSensors: [],
    });
    getRoomEntityStub.returns({
      config: { entity_id: 'light.test' },
      state: s('light', 'test', 'on'),
    });
    climateThresholdsStub.returns({
      hot: false,
      humid: false,
      hotColor: undefined,
      humidColor: undefined,
    });
    getBackgroundImageUrlStub.resolves('/local/bg.jpg');
    getOccupancyStateStub.returns(false);
    getSmokeStateStub.returns(false);
    getGasStateStub.returns(false);
    getWaterStateStub.returns(false);
  });

  afterEach(() => {
    getAreaStub.restore();
    getSensorsStub.restore();
    getRoomEntityStub.restore();
    climateThresholdsStub.restore();
    getBackgroundImageUrlStub.restore();
    getOccupancyStateStub.restore();
    getSmokeStateStub.restore();
    getGasStateStub.restore();
    getWaterStateStub.restore();
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
      expect(getSmokeStateStub.calledWith(mockHass, config.smoke)).to.be.true;

      // Verify climateThresholds is called with full sensor data
      expect(
        climateThresholdsStub.calledWith(config, {
          individual: [],
          averaged: [],
          problemSensors: [],
          lightEntities: [],
          ambientLightEntities: [],
          thresholdSensors: [],
        }),
      ).to.be.true;

      // Verify result structure and values
      expect(result).to.have.all.keys([
        'roomInfo',
        'roomEntity',
        'sensors',
        'image',
        'isActive',
        'isIconActive',
        'thresholds',
        'flags',
      ]);
      expect(result.image).to.be.a('promise');
      expect(result.flags.dark).to.be.true;
      expect(result.flags.alarm).to.be.undefined;
      expect(result.flags.frostedGlass).to.be.false;
    });

    it('should return image as a promise that resolves to the image URL', async () => {
      const config: Config = { area: 'living_room' };
      const result = getRoomProperties(mockHass, config);

      const imageUrl = await result.image;
      expect(imageUrl).to.equal('/local/bg.jpg');
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
          ambientLightEntities: [],
          thresholdSensors: [],
        });

        const result = getRoomProperties(mockHass, config);
        expect(result.isActive).to.be.true;
        expect(result.isIconActive).to.be.true;
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
          ambientLightEntities: [],
          thresholdSensors: [],
        });

        const result = getRoomProperties(mockHass, config);
        expect(result.isActive).to.be.true;
        expect(result.isIconActive).to.be.true;
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
          ambientLightEntities: [],
          thresholdSensors: [],
        });

        const result = getRoomProperties(mockHass, config);
        expect(result.isActive).to.be.false;
        expect(result.isIconActive).to.be.false;
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
          ambientLightEntities: [],
          thresholdSensors: [],
        });

        const result = getRoomProperties(mockHass, config);
        expect(result.isActive).to.be.false;
        expect(result.isIconActive).to.be.false;
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
          ambientLightEntities: [],
          thresholdSensors: [],
        });

        const result = getRoomProperties(mockHass, config);
        expect(result.isActive).to.be.false;
        expect(result.isIconActive).to.be.false;
      });

      it('should set isActive true but isIconActive false when only ambient lights are on', () => {
        const config: Config = { area: 'living_room' };

        // Mock room entity as inactive
        getRoomEntityStub.returns({
          config: { entity_id: 'light.living_room' },
          state: s('light', 'living_room', 'off'),
        });

        // Mock sensors with ambient light on but no regular lights
        getSensorsStub.returns({
          individual: [],
          averaged: [],
          problemSensors: [],
          lightEntities: [],
          ambientLightEntities: [s('light', 'led_strip', 'on')],
          thresholdSensors: [],
        });

        const result = getRoomProperties(mockHass, config);
        expect(result.isActive).to.be.true;
        expect(result.isIconActive).to.be.false;
      });
    });

    describe('alarm priority system', () => {
      it('should call getSmokeState with smoke config', () => {
        const config: Config = {
          area: 'living_room',
          smoke: { entities: ['binary_sensor.smoke_1'] },
        };
        getRoomProperties(mockHass, config);

        expect(getSmokeStateStub.calledWith(mockHass, config.smoke)).to.be.true;
      });

      it('should call getGasState with gas config', () => {
        const config: Config = {
          area: 'living_room',
          gas: { entities: ['binary_sensor.gas_1'] },
        };
        getRoomProperties(mockHass, config);

        expect(getGasStateStub.calledWith(mockHass, config.gas)).to.be.true;
      });

      it('should call getWaterState with water config', () => {
        const config: Config = {
          area: 'living_room',
          water: { entities: ['binary_sensor.water_1'] },
        };
        getRoomProperties(mockHass, config);

        expect(getWaterStateStub.calledWith(mockHass, config.water)).to.be.true;
      });

      it('should set alarm to smoke when smoke is detected', () => {
        const config: Config = {
          area: 'living_room',
          smoke: { entities: ['binary_sensor.smoke_1'] },
        };
        getSmokeStateStub.returns(true);
        getGasStateStub.returns(true);
        getWaterStateStub.returns(true);
        getOccupancyStateStub.returns(true);

        const result = getRoomProperties(mockHass, config);
        expect(result.flags.alarm).to.equal('smoke'); // Smoke takes highest priority
      });

      it('should set alarm to gas when gas is detected and smoke is not', () => {
        const config: Config = {
          area: 'living_room',
          gas: { entities: ['binary_sensor.gas_1'] },
        };
        getSmokeStateStub.returns(false);
        getGasStateStub.returns(true);
        getWaterStateStub.returns(true);
        getOccupancyStateStub.returns(true);

        const result = getRoomProperties(mockHass, config);
        expect(result.flags.alarm).to.equal('gas'); // Gas takes priority over water and occupancy
      });

      it('should set alarm to water when water is detected and smoke/gas are not', () => {
        const config: Config = {
          area: 'living_room',
          water: { entities: ['binary_sensor.water_1'] },
        };
        getSmokeStateStub.returns(false);
        getGasStateStub.returns(false);
        getWaterStateStub.returns(true);
        getOccupancyStateStub.returns(true);

        const result = getRoomProperties(mockHass, config);
        expect(result.flags.alarm).to.equal('water'); // Water takes priority over occupancy
      });

      it('should set alarm to occupied when only occupancy is detected', () => {
        const config: Config = {
          area: 'living_room',
          occupancy: { entities: ['binary_sensor.motion_1'] },
        };
        getSmokeStateStub.returns(false);
        getGasStateStub.returns(false);
        getWaterStateStub.returns(false);
        getOccupancyStateStub.returns(true);

        const result = getRoomProperties(mockHass, config);
        expect(result.flags.alarm).to.equal('occupied');
      });

      it('should set alarm to undefined when no alarms are detected', () => {
        const config: Config = {
          area: 'living_room',
          occupancy: { entities: ['binary_sensor.motion_1'] },
          smoke: { entities: ['binary_sensor.smoke_1'] },
          gas: { entities: ['binary_sensor.gas_1'] },
          water: { entities: ['binary_sensor.water_1'] },
        };
        getSmokeStateStub.returns(false);
        getGasStateStub.returns(false);
        getWaterStateStub.returns(false);
        getOccupancyStateStub.returns(false);

        const result = getRoomProperties(mockHass, config);
        expect(result.flags.alarm).to.be.undefined;
      });

      it('should prioritize smoke over all other alarms', () => {
        const config: Config = {
          area: 'living_room',
          occupancy: { entities: ['binary_sensor.motion_1'] },
          smoke: { entities: ['binary_sensor.smoke_1'] },
          gas: { entities: ['binary_sensor.gas_1'] },
          water: { entities: ['binary_sensor.water_1'] },
        };
        getSmokeStateStub.returns(true);
        getGasStateStub.returns(true);
        getWaterStateStub.returns(true);
        getOccupancyStateStub.returns(true);

        const result = getRoomProperties(mockHass, config);
        expect(result.flags.alarm).to.equal('smoke');
      });

      it('should prioritize gas over water and occupancy when smoke is not detected', () => {
        const config: Config = {
          area: 'living_room',
          occupancy: { entities: ['binary_sensor.motion_1'] },
          gas: { entities: ['binary_sensor.gas_1'] },
          water: { entities: ['binary_sensor.water_1'] },
        };
        getSmokeStateStub.returns(false);
        getGasStateStub.returns(true);
        getWaterStateStub.returns(true);
        getOccupancyStateStub.returns(true);

        const result = getRoomProperties(mockHass, config);
        expect(result.flags.alarm).to.equal('gas');
      });

      it('should prioritize water over occupancy when smoke and gas are not detected', () => {
        const config: Config = {
          area: 'living_room',
          occupancy: { entities: ['binary_sensor.motion_1'] },
          water: { entities: ['binary_sensor.water_1'] },
        };
        getSmokeStateStub.returns(false);
        getGasStateStub.returns(false);
        getWaterStateStub.returns(true);
        getOccupancyStateStub.returns(true);

        const result = getRoomProperties(mockHass, config);
        expect(result.flags.alarm).to.equal('water');
      });
    });

    describe('frostedGlass detection', () => {
      it('should detect Frosted Glass theme', () => {
        const config: Config = { area: 'living_room' };
        mockHass.themes = { darkMode: true, theme: 'Frosted Glass' } as any;

        const result = getRoomProperties(mockHass, config);
        expect(result.flags.frostedGlass).to.be.true;
      });

      it('should detect Frosted Glass Lite theme', () => {
        const config: Config = { area: 'living_room' };
        mockHass.themes = { darkMode: true, theme: 'Frosted Glass Lite' } as any;

        const result = getRoomProperties(mockHass, config);
        expect(result.flags.frostedGlass).to.be.true;
      });

      it('should not detect non-Frosted Glass themes', () => {
        const config: Config = { area: 'living_room' };
        mockHass.themes = { darkMode: true, theme: 'default' } as any;

        const result = getRoomProperties(mockHass, config);
        expect(result.flags.frostedGlass).to.be.false;
      });

      it('should return false when theme is undefined', () => {
        const config: Config = { area: 'living_room' };
        mockHass.themes = { darkMode: true } as any;

        const result = getRoomProperties(mockHass, config);
        expect(result.flags.frostedGlass).to.be.false;
      });

      it('should use view theme when element is provided', () => {
        const config: Config = { area: 'living_room' };
        mockHass.themes = { darkMode: true, theme: 'default' } as any;

        const viewContainer = document.createElement('hui-view-container');
        (viewContainer as any).theme = 'Frosted Glass';
        document.body.appendChild(viewContainer);

        const div = document.createElement('div');
        viewContainer.appendChild(div);

        const result = getRoomProperties(mockHass, config, div);
        expect(result.flags.frostedGlass).to.be.true;

        document.body.removeChild(viewContainer);
      });

      it('should fall back to global theme when view container has no theme', () => {
        const config: Config = { area: 'living_room' };
        mockHass.themes = { darkMode: true, theme: 'Frosted Glass' } as any;

        const viewContainer = document.createElement('hui-view-container');
        document.body.appendChild(viewContainer);

        const div = document.createElement('div');
        viewContainer.appendChild(div);

        const result = getRoomProperties(mockHass, config, div);
        expect(result.flags.frostedGlass).to.be.true;

        document.body.removeChild(viewContainer);
      });
    });
  });
});
