import { HorizontalSlider } from '@cards/components/horizontal-slider/horizontal-slider';
import { styles } from '@cards/components/horizontal-slider/styles';
import * as brightnessControlModule from '@delegates/actions/brightness-control';
import * as coverPositionModule from '@delegates/actions/cover-position';
import * as inputTextModule from '@homeassistant-extras/hass/data/input_text';
import * as mediaPlayerModule from '@homeassistant-extras/hass/data/media-player';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import { fixture } from '@open-wc/testing-helpers';
import { createStateEntity } from '@test/test-helpers';
import type { EntityState } from '@type/room';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('horizontal-slider.ts', () => {
  let element: HorizontalSlider;
  let mockHass: HomeAssistant;
  let mockEntityState: EntityState;
  let setValueStub: sinon.SinonStub;
  let setMediaPlayerVolumeStub: sinon.SinonStub;
  let setBrightnessStub: sinon.SinonStub;
  let setCoverPositionStub: sinon.SinonStub;

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
    setCoverPositionStub = stub(coverPositionModule, 'setCoverPosition');

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
    setCoverPositionStub.restore();
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

    it('should render nothing when the entity state is in hide_when', () => {
      element.slider = {
        entity_id: 'media_player.amp',
        slider: { hide_when: ['off', 'idle', 'unavailable'] },
      };
      setSliderState(createStateEntity('media_player', 'amp', 'off', {}));

      expect(element.render()).to.equal(nothing);

      setSliderState(createStateEntity('media_player', 'amp', 'playing', {}));
      expect(element.render()).to.not.equal(nothing);
    });

    /** Render into a fixture so the ha-slider properties can be read back. */
    async function renderSlider(): Promise<any> {
      const el = await fixture(element.render() as TemplateResult);
      return el.tagName.toLowerCase() === 'ha-slider'
        ? el
        : el.querySelector('ha-slider');
    }

    it('should read min/max/step/value from attributes for a generic domain', async () => {
      element.slider = sliderEntity;
      setSliderState(mockEntityState);

      const slider = await renderSlider();

      expect(slider.min).to.equal(0);
      expect(slider.max).to.equal(100);
      expect(slider.step).to.equal(1);
      expect(slider.value).to.equal(42);
      expect(slider.disabled).to.be.false;
    });

    it('should fall back to default bounds when attributes are missing', async () => {
      element.slider = sliderEntity;
      setSliderState(createStateEntity('input_number', 'brightness', '10', {}));

      const slider = await renderSlider();

      expect(slider.min).to.equal(0);
      expect(slider.max).to.equal(100);
      expect(slider.step).to.equal(1);
      expect(slider.value).to.equal(10);
    });

    it('should render value 0 when the state is not a finite number', async () => {
      element.slider = sliderEntity;
      setSliderState(
        createStateEntity('input_number', 'brightness', 'unavailable', {
          min: 0,
          max: 100,
          step: 1,
        }),
      );

      const slider = await renderSlider();

      expect(slider.value).to.equal(0);
    });

    it('should scale media_player volume_level to a 0-100 range', async () => {
      element.slider = sliderEntity;
      setSliderState(
        createStateEntity('media_player', 'living_room', 'playing', {
          volume_level: 0.42,
        }),
      );

      const slider = await renderSlider();

      expect(slider.value).to.equal(42);
    });

    it('should render media_player volume as 0 when volume_level is null', async () => {
      element.slider = sliderEntity;
      setSliderState(
        createStateEntity('media_player', 'living_room', 'playing', {
          volume_level: null,
        }),
      );

      const slider = await renderSlider();

      expect(slider.value).to.equal(0);
    });

    it('should clamp media_player volume above 1 to 100', async () => {
      element.slider = sliderEntity;
      setSliderState(
        createStateEntity('media_player', 'living_room', 'playing', {
          volume_level: 1.5,
        }),
      );

      const slider = await renderSlider();

      expect(slider.value).to.equal(100);
    });

    it('should use a raw 0-255 brightness range for lights', async () => {
      element.slider = sliderEntity;
      setSliderState(
        createStateEntity('light', 'office', 'on', { brightness: 128 }),
      );

      const slider = await renderSlider();

      expect(slider.min).to.equal(0);
      expect(slider.max).to.equal(255);
      expect(slider.step).to.equal(1);
      expect(slider.value).to.equal(128);
    });

    it('should render brightness 0 when a light is off', async () => {
      element.slider = sliderEntity;
      setSliderState(createStateEntity('light', 'office', 'off', {}));

      const slider = await renderSlider();

      expect(slider.value).to.equal(0);
    });

    it('should use a 0-100 current_position range for covers', async () => {
      element.slider = sliderEntity;
      setSliderState(
        createStateEntity('cover', 'blinds', 'open', {
          current_position: 50,
        }),
      );

      const slider = await renderSlider();

      expect(slider.min).to.equal(0);
      expect(slider.max).to.equal(100);
      expect(slider.step).to.equal(1);
      expect(slider.value).to.equal(50);

      setSliderState(createStateEntity('cover', 'blinds', 'closed', {}));
      const closed = await renderSlider();
      expect(closed.value).to.equal(0);
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

    it('should call setCoverPosition when domain is cover', () => {
      setSliderState(
        createStateEntity('cover', 'blinds', 'open', {
          current_position: 50,
        }),
      );

      element['_handleChange']({
        target: { value: '75' },
      } as unknown as Event);

      expect(setCoverPositionStub.calledOnce).to.be.true;
      expect(setCoverPositionStub.calledWith(mockHass, 'cover.blinds', 75)).to
        .be.true;
      expect(setValueStub.called).to.be.false;
      expect(setBrightnessStub.called).to.be.false;
      expect(setMediaPlayerVolumeStub.called).to.be.false;
    });
  });
});
