import { HorizontalSlider } from '@cards/components/horizontal-slider/horizontal-slider';
import { styles } from '@cards/components/horizontal-slider/styles';
import * as brightnessControlModule from '@delegates/actions/brightness-control';
import * as inputTextModule from '@homeassistant-extras/hass/data/input_text';
import * as mediaPlayerModule from '@homeassistant-extras/hass/data/media-player';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import { createStateEntity } from '@test/test-helpers';
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

  const sliderEntity = {
    entity_id: 'input_number.brightness',
    slider: {},
  };

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
    element.config = { area: 'office' };
  });

  afterEach(() => {
    setValueStub.restore();
    setMediaPlayerVolumeStub.restore();
    setBrightnessStub.restore();
  });

  /**
   * Drive the element's subscribed state. `state` is a getter over the
   * reactive `states` map (keyed by entity_id), so point `entity` at the
   * state and register it in the map.
   */
  function setSliderState(state: EntityState): void {
    element['entity'] = state.entity_id;
    element['states'] = { [state.entity_id]: state };
  }

  describe('slider setter', () => {
    it('should leave entity and style undefined before slider is assigned', () => {
      expect(element['entity']).to.be.undefined;
      expect(element['_style']).to.be.undefined;
    });

    it('should bind to the slider entity and default style to "bar"', () => {
      element.slider = sliderEntity;

      expect(element['entity']).to.equal('input_number.brightness');
      expect(element['_style']).to.equal('bar');
    });

    it('should respect an explicit slider.style', () => {
      element.slider = {
        entity_id: 'input_number.brightness',
        slider: { style: 'ha' },
      };

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
      element.slider = sliderEntity;
      expect(element.render()).to.equal(nothing);
    });
  });

  describe('_handleChange', () => {
    beforeEach(() => {
      element.slider = sliderEntity;
      setSliderState(mockEntityState);
    });

    it('should call setValue with the new value when it differs from current state', () => {
      const ev = { target: { value: '75' } } as unknown as Event;

      element['_handleChange'](ev);

      expect(setValueStub.calledOnce).to.be.true;
      expect(setValueStub.calledWith(mockHass, 'input_number.brightness', '75'))
        .to.be.true;
    });

    it('should call setBrightness with raw 0–255 value when domain is light', () => {
      setSliderState(
        createStateEntity('light', 'office', 'on', {
          brightness: 128,
        }),
      );

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
      setSliderState(
        createStateEntity('media_player', 'living_room', 'playing', {
          volume_level: 0.5,
        }),
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
