import * as getIconEntitiesModule from '@delegates/entities/icon-entities';
import * as getProblemEntitiesModule from '@delegates/entities/problem-entities';
import * as getRoomEntityModule from '@delegates/entities/room-entity';
import * as areaRetrieverModule from '@delegates/retrievers/area';
import * as getSensorsModule from '@delegates/utils/hide-yo-sensors';
import { getRoomProperties } from '@delegates/utils/setup-card';
import type { HomeAssistant } from '@hass/types';
import { createState as s } from '@test/test-helpers';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { stub, type SinonStub } from 'sinon';

export default () => {
  describe('setup-card.ts', () => {
    let mockHass: HomeAssistant;
    let getAreaStub: SinonStub;
    let getSensorsStub: SinonStub;
    let getIconEntitiesStub: SinonStub;
    let getProblemEntitiesStub: SinonStub;
    let getRoomEntityStub: SinonStub;

    beforeEach(() => {
      // Create stubs for all the delegate functions
      getAreaStub = stub(areaRetrieverModule, 'getArea');
      getSensorsStub = stub(getSensorsModule, 'getSensors');
      getIconEntitiesStub = stub(getIconEntitiesModule, 'getIconEntities');
      getProblemEntitiesStub = stub(
        getProblemEntitiesModule,
        'getProblemEntities',
      );
      getRoomEntityStub = stub(getRoomEntityModule, 'getRoomEntity');

      mockHass = {
        states: {
          'light.living_room_light': s('light', 'living_room_light', 'on', {
            friendly_name: 'Living Room Light',
          }),
        },
        devices: {
          device_1: { area_id: 'living_room' },
        },
        entities: {
          'light.living_room_light': {
            device_id: 'device_1',
            area_id: 'living_room',
            labels: [],
          },
        },
        areas: {
          living_room: {
            area_id: 'living_room',
            name: 'Living Room',
            icon: '',
          },
        },
        themes: {
          darkMode: true,
          theme: 'default',
        },
      } as any as HomeAssistant;

      // Set up default stub returns
      getAreaStub.returns({
        area_id: 'living_room',
        name: 'Living Room',
        icon: '',
      });

      getSensorsStub.returns([
        s('sensor', 'temperature', '72'),
        s('sensor', 'humidity', '50'),
      ]);

      getIconEntitiesStub.returns([
        {
          config: { entity_id: 'light.living_room_light' },
          state: s('light', 'living_room_light', 'on'),
        },
      ]);

      getProblemEntitiesStub.returns({
        problemEntities: [],
        problemExists: false,
      });

      getRoomEntityStub.returns({
        config: { entity_id: 'light.living_room_light' },
        state: s('light', 'living_room_light', 'on'),
      });
    });

    afterEach(() => {
      getAreaStub.restore();
      getSensorsStub.restore();
      getIconEntitiesStub.restore();
      getProblemEntitiesStub.restore();
      getRoomEntityStub.restore();
    });

    describe('getRoomProperties', () => {
      it('should return all required properties with basic config', () => {
        const config: Config = { area: 'living_room' };
        const result = getRoomProperties(mockHass, config);

        expect(result).to.have.all.keys([
          'roomInfo',
          'states',
          'roomEntity',
          'problemEntities',
          'problemExists',
          'sensors',
          'isDarkMode',
        ]);

        // Verify it calls all the delegate functions
        expect(getIconEntitiesStub.calledWith(mockHass, config)).to.be.true;
        expect(getRoomEntityStub.calledWith(mockHass, config)).to.be.true;
        expect(getProblemEntitiesStub.calledWith(mockHass, config.area)).to.be
          .true;
        expect(getSensorsStub.calledWith(mockHass, config)).to.be.true;
      });

      it('should use area_name from config when provided', () => {
        const config: Config = {
          area: 'living_room',
          area_name: 'Custom Room Name',
        };
        const result = getRoomProperties(mockHass, config);

        expect(result.roomInfo.area_name).to.equal('Custom Room Name');
        // Should not call getArea when area_name is provided
        expect(getAreaStub.called).to.be.false;
      });

      it('should use area name from getArea when no area_name in config', () => {
        const config: Config = { area: 'living_room' };
        const result = getRoomProperties(mockHass, config);

        expect(result.roomInfo.area_name).to.equal('Living Room');
        expect(getAreaStub.calledWith(mockHass, 'living_room')).to.be.true;
      });

      it('should fallback to area ID when getArea returns null', () => {
        getAreaStub.returns(null);

        const config: Config = { area: 'living_room' };
        const result = getRoomProperties(mockHass, config);

        expect(result.roomInfo.area_name).to.equal('living_room');
      });

      it('should fallback to area ID when getArea returns area without name', () => {
        getAreaStub.returns({
          area_id: 'living_room',
          name: undefined,
          icon: '',
        });

        const config: Config = { area: 'living_room' };
        const result = getRoomProperties(mockHass, config);

        expect(result.roomInfo.area_name).to.equal('living_room');
      });

      it('should return sensors from getSensors', () => {
        const mockSensors = [
          s('sensor', 'custom_temp', '75'),
          s('sensor', 'custom_humidity', '45'),
          s('sensor', 'pressure', '1013'),
        ];
        getSensorsStub.returns(mockSensors);

        const config: Config = { area: 'living_room' };
        const result = getRoomProperties(mockHass, config);

        expect(result.sensors).to.equal(mockSensors);
        expect(getSensorsStub.calledWith(mockHass, config)).to.be.true;
      });

      it('should return states from getIconEntities', () => {
        const mockStates = [
          {
            config: { entity_id: 'light.test' },
            state: s('light', 'test', 'on'),
          },
          {
            config: { entity_id: 'switch.test' },
            state: s('switch', 'test', 'off'),
          },
        ];
        getIconEntitiesStub.returns(mockStates);

        const config: Config = { area: 'living_room' };
        const result = getRoomProperties(mockHass, config);

        expect(result.states).to.equal(mockStates);
        expect(getIconEntitiesStub.calledWith(mockHass, config)).to.be.true;
      });

      it('should return room entity from getRoomEntity', () => {
        const mockRoomEntity = {
          config: { entity_id: 'light.custom_room' },
          state: s('light', 'custom_room', 'on'),
        };
        getRoomEntityStub.returns(mockRoomEntity);

        const config: Config = { area: 'living_room' };
        const result = getRoomProperties(mockHass, config);

        expect(result.roomEntity).to.equal(mockRoomEntity);
        expect(getRoomEntityStub.calledWith(mockHass, config)).to.be.true;
      });

      it('should return problem entities from getProblemEntities', () => {
        const mockProblemData = {
          problemEntities: ['binary_sensor.smoke', 'binary_sensor.leak'],
          problemExists: true,
        };
        getProblemEntitiesStub.returns(mockProblemData);

        const config: Config = { area: 'living_room' };
        const result = getRoomProperties(mockHass, config);

        expect(result.problemEntities).to.equal(
          mockProblemData.problemEntities,
        );
        expect(result.problemExists).to.equal(mockProblemData.problemExists);
        expect(getProblemEntitiesStub.calledWith(mockHass, config.area)).to.be
          .true;
      });

      it('should return dark mode status from hass.themes', () => {
        // Test dark mode true
        mockHass.themes.darkMode = true;
        let config: Config = { area: 'living_room' };
        let result = getRoomProperties(mockHass, config);
        expect(result.isDarkMode).to.be.true;

        // Test dark mode false
        mockHass.themes.darkMode = false;
        result = getRoomProperties(mockHass, config);
        expect(result.isDarkMode).to.be.false;
      });

      it('should handle all functions returning empty/default values', () => {
        getSensorsStub.returns([]);
        getIconEntitiesStub.returns([]);
        getProblemEntitiesStub.returns({
          problemEntities: [],
          problemExists: false,
        });

        const config: Config = { area: 'living_room' };
        const result = getRoomProperties(mockHass, config);

        expect(result.sensors).to.have.length(0);
        expect(result.states).to.have.length(0);
        expect(result.problemEntities).to.have.length(0);
        expect(result.problemExists).to.be.false;
      });
    });
  });
};
