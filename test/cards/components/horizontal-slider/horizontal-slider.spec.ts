import { HorizontalSlider } from '@cards/components/horizontal-slider/horizontal-slider';
import { styles } from '@cards/components/horizontal-slider/styles';
import * as brightnessControlModule from '@delegates/actions/brightness-control';
import * as inputTextModule from '@hass/data/input_text';
import * as mediaPlayerModule from '@hass/data/media-player';
import type { HomeAssistant } from '@hass/types';
import { createStateEntity } from '@test/test-helpers';
import type { Config } from '@type/config';
import type { EntityState } from '@type/room';
import { expect } from 'chai';
import { nothing } from 'lit';
import { stub } from 'sinon';

describe('horizontal-slider.ts', () => {
  let element: HorizontalSlider;
  let mockHass: HomeAssistant;
  let mockEntityState: EntityState;
  let setValueStub: sinon.SinonStub;
  let setMediaPlayerVolumeStub: sinon.SinonStub;
  let setBrightnessStub: sinon.SinonStub;

  beforeEach(() => {
    mockEntityState = createStateEntity('input_number', 'brightness', '42', {
      min: 0,
      max: 100,
      step: 1,
    });

    setValueStub = stub(inputTextModule, 'setValue');
    setMediaPlayerVolumeStub = stub(mediaPlayerModule, 'setMediaPlayerVolume');
    setBrightnessStub = stub(brightnessControlModule, 'setBrightness');

    mockHass = {
      states: {
        'input_number.brightness': mockEntityState,
      },
    } as any as HomeAssistant;

    element = new HorizontalSlider();
    element.hass = mockHass;
  });

  afterEach(() => {
    setValueStub.restore();
    setMediaPlayerVolumeStub.restore();
    setBrightnessStub.restore();
  });

  describe('config setter', () => {
    it('should leave entity/style undefined when no entity declares a slider block', () => {
      element.config = {
        area: 'office',
        entity: { entity_id: 'light.office' },
        entities: ['switch.office_fan'],
      } as any as Config;

      expect(element['entity']).to.be.undefined;
      expect(element['_style']).to.be.undefined;
    });

    it('should bind to the first entity with a slider block and default style to "bar"', () => {
      element.config = {
        area: 'office',
        entity: { entity_id: 'light.office' },
        entities: [
          {
            entity_id: 'input_number.brightness',
            slider: {},
          },
        ],
      } as any as Config;

      expect(element['entity']).to.equal('input_number.brightness');
      expect(element['_style']).to.equal('bar');
    });

    it('should respect an explicit slider.style', () => {
      element.config = {
        area: 'office',
        entities: [
          {
            entity_id: 'input_number.brightness',
            slider: { style: 'ha' },
          },
        ],
      } as any as Config;

      expect(element['_style']).to.equal('ha');
    });
  });

  describe('static styles', () => {
    it('should expose component styles', () => {
      expect(HorizontalSlider.styles).to.equal(styles);
    });
  });

  describe('render', () => {
    it('should render nothing when state is unavailable', () => {
      element.config = {
        area: 'office',
        entities: [
          {
            entity_id: 'input_number.brightness',
            slider: {},
          },
        ],
      } as any as Config;
      // no state subscription has fired in tests
      expect(element.render()).to.equal(nothing);
    });
  });

  describe('_handleChange', () => {
    beforeEach(() => {
      element.config = {
        area: 'office',
        entities: [
          {
            entity_id: 'input_number.brightness',
            slider: {},
          },
        ],
      } as any as Config;
      element['state'] = mockEntityState;
    });

    it('should call setValue with the new value when it differs from current state', () => {
      const ev = { target: { value: '75' } } as unknown as Event;

      element['_handleChange'](ev);

      expect(setValueStub.calledOnce).to.be.true;
      expect(setValueStub.calledWith(mockHass, 'input_number.brightness', '75'))
        .to.be.true;
    });

    it('should call setBrightness with raw 0–255 value when domain is light', () => {
      element['state'] = createStateEntity('light', 'office', 'on', {
        brightness: 128,
      });

      element['_handleChange']({
        target: { value: '200' },
      } as unknown as Event);

      expect(setBrightnessStub.calledOnce).to.be.true;
      expect(setBrightnessStub.calledWith(mockHass, 'light.office', 200)).to.be
        .true;
      expect(setValueStub.called).to.be.false;
      expect(setMediaPlayerVolumeStub.called).to.be.false;
    });

    it('should call setMediaPlayerVolume when domain is media_player', () => {
      element['state'] = createStateEntity(
        'media_player',
        'living_room',
        'playing',
        { volume_level: 0.5 },
      );

      element['_handleChange']({
        target: { value: '75' },
      } as unknown as Event);

      expect(setMediaPlayerVolumeStub.calledOnce).to.be.true;
      expect(
        setMediaPlayerVolumeStub.calledWith(
          mockHass,
          'media_player.living_room',
          0.75,
        ),
      ).to.be.true;
      expect(setValueStub.called).to.be.false;
    });
  });
});
