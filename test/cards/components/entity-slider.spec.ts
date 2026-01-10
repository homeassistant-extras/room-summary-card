import { EntitySlider } from '@cards/components/entity-slider/entity-slider';
import { styles } from '@cards/components/entity-slider/styles';
import * as brightnessControlModule from '@delegates/actions/brightness-control';
import * as iconEntitiesModule from '@delegates/entities/icon-entities';
import * as stateActiveModule from '@hass/common/entity/state_active';
import type { HomeAssistant } from '@hass/types';
import * as iconModule from '@html/icon';
import { fixture } from '@open-wc/testing-helpers';
import * as customThemeModule from '@theme/custom-theme';
import * as styleConverterModule from '@theme/util/style-converter';
import type { Config } from '@type/config';
import type { EntityConfig } from '@type/config/entity';
import type { EntityInformation, EntityState } from '@type/room';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import * as sinon from 'sinon';
import { stub } from 'sinon';

describe('entity-slider.ts', () => {
  let element: EntitySlider;
  let mockHass: HomeAssistant;
  let getIconEntitiesStub: sinon.SinonStub;
  let renderRoomIconStub: sinon.SinonStub;
  let stylesToHostCssStub: sinon.SinonStub;
  let setBrightnessStub: sinon.SinonStub;
  let stateActiveStub: sinon.SinonStub;
  let getThemeColorOverrideStub: sinon.SinonStub;

  const mockEntityState: EntityState = {
    entity_id: 'light.living_room',
    state: 'on',
    attributes: {
      friendly_name: 'Living Room Light',
      brightness: 128,
    },
    domain: 'light',
  };

  const mockEntityConfig: EntityConfig = {
    entity_id: 'light.living_room',
  } as EntityConfig;

  const mockEntity: EntityInformation = {
    config: mockEntityConfig,
    state: mockEntityState,
  };

  beforeEach(() => {
    // Register custom element if not already registered
    if (!customElements.get('entity-slider')) {
      customElements.define('entity-slider', EntitySlider);
    }

    getIconEntitiesStub = stub(iconEntitiesModule, 'getIconEntities').returns([
      mockEntity,
    ]);
    renderRoomIconStub = stub(iconModule, 'renderRoomIcon').returns(
      html`<room-state-icon></room-state-icon>`,
    );
    stylesToHostCssStub = stub(styleConverterModule, 'stylesToHostCss').returns(
      html`<style>
        :host {
          display: block;
        }
      </style>`,
    );
    setBrightnessStub = stub(
      brightnessControlModule,
      'setBrightness',
    ).resolves();
    stateActiveStub = stub(stateActiveModule, 'stateActive').returns(true);
    getThemeColorOverrideStub = stub(
      customThemeModule,
      'getThemeColorOverride',
    ).returns('rgb(255, 200, 100)');

    mockHass = {
      states: {
        'light.living_room': mockEntityState,
      },
      formatEntityState: () => 'formatted state',
    } as any as HomeAssistant;

    element = new EntitySlider();
    element.config = {
      area: 'living_room',
      entities: ['light.living_room'],
    } as Config;
  });

  afterEach(() => {
    getIconEntitiesStub.restore();
    renderRoomIconStub.restore();
    stylesToHostCssStub.restore();
    setBrightnessStub.restore();
    stateActiveStub.restore();
    getThemeColorOverrideStub.restore();
  });

  describe('hass property setter', () => {
    it('should set internal hass and update entity', () => {
      element.hass = mockHass;

      expect(element['_hass']).to.equal(mockHass);
      expect(getIconEntitiesStub.calledWith(mockHass, element.config)).to.be
        .true;
      expect(element['_entity']).to.exist;
      expect(element['_entity']?.state?.entity_id).to.equal(
        'light.living_room',
      );
    });

    it('should update slider style from config', () => {
      element.config = {
        ...element.config,
        slider_style: 'filled',
      } as Config;

      element.hass = mockHass;

      expect(element.sliderStyle).to.equal('filled');
    });

    it('should default to minimalist style when slider_style not in config', () => {
      element.hass = mockHass;

      expect(element.sliderStyle).to.equal('minimalist');
    });

    it('should update position based on brightness attribute', () => {
      element.hass = mockHass;

      // Brightness 128 should result in position approximately 50% (100 - (128/255)*100)
      // Actual calculation: 100 - (128/255)*100 = 49.8039...
      expect(element['_yPosition']).to.be.closeTo(50, 0.2);
    });

    it('should set position to 100 when brightness is undefined', () => {
      const entityWithoutBrightness: EntityInformation = {
        config: mockEntityConfig,
        state: {
          ...mockEntityState,
          attributes: {
            friendly_name: 'Living Room Light',
          },
        },
      };

      getIconEntitiesStub.returns([entityWithoutBrightness]);

      element.hass = mockHass;

      expect(element['_yPosition']).to.equal(100);
    });

    it('should set position to 0 when brightness is 255', () => {
      const entityWithMaxBrightness: EntityInformation = {
        config: mockEntityConfig,
        state: {
          ...mockEntityState,
          attributes: {
            ...mockEntityState.attributes,
            brightness: 255,
          },
        },
      };

      getIconEntitiesStub.returns([entityWithMaxBrightness]);

      element.hass = mockHass;

      expect(element['_yPosition']).to.equal(0);
    });

    it('should disable actions on entity config', () => {
      element.hass = mockHass;

      const entity = element['_entity'];
      expect(entity?.config?.tap_action?.action).to.equal('none');
      expect(entity?.config?.hold_action?.action).to.equal('none');
      expect(entity?.config?.double_tap_action?.action).to.equal('none');
    });

    it('should set bar color CSS variable when slider style is bar', () => {
      const setPropertySpy = stub();
      Object.defineProperty(element, 'style', {
        value: {
          setProperty: setPropertySpy,
          getPropertyValue: stub().returns(''),
        },
        writable: true,
        configurable: true,
      });

      element.config = {
        ...element.config,
        slider_style: 'bar',
      } as Config;

      element.hass = mockHass;

      expect(
        setPropertySpy.calledWith('--slider-bar-color', 'rgb(255, 200, 100)'),
      ).to.be.true;
      expect(stateActiveStub.called).to.be.true;
      expect(getThemeColorOverrideStub.called).to.be.true;
    });

    it('should use default color when entity color is not found for bar style', () => {
      getThemeColorOverrideStub.returns(undefined);
      const setPropertySpy = stub();
      Object.defineProperty(element, 'style', {
        value: {
          setProperty: setPropertySpy,
          getPropertyValue: stub().returns(''),
        },
        writable: true,
        configurable: true,
      });

      element.config = {
        ...element.config,
        slider_style: 'bar',
      } as Config;

      element.hass = mockHass;

      expect(
        setPropertySpy.calledWith('--slider-bar-color', 'var(--primary-color)'),
      ).to.be.true;
    });

    it('should update slider style to bar', () => {
      // Mock style for bar style color setting
      Object.defineProperty(element, 'style', {
        value: {
          setProperty: stub(),
          getPropertyValue: stub().returns(''),
        },
        writable: true,
        configurable: true,
      });

      element.config = {
        ...element.config,
        slider_style: 'bar',
      } as Config;

      element.hass = mockHass;

      expect(element.sliderStyle).to.equal('bar');
    });
  });

  describe('render', () => {
    beforeEach(() => {
      element.hass = mockHass;
      // Mock style property to avoid DOM attachment issues
      if (!element.style) {
        Object.defineProperty(element, 'style', {
          value: {
            setProperty: stub(),
            getPropertyValue: stub().returns(''),
          },
          writable: true,
        });
      }
    });

    it('should render nothing when hass is not set', () => {
      element['_hass'] = undefined as any;
      expect(element.render()).to.equal(nothing);
    });

    it('should render nothing when entity is not set', () => {
      element['_entity'] = undefined;
      expect(element.render()).to.equal(nothing);
    });

    it('should render entity when both hass and entity are available', async () => {
      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      // Verify renderRoomIcon is called
      expect(renderRoomIconStub.called).to.be.true;
      const call = renderRoomIconStub.getCall(0);
      expect(call.args[0]).to.equal(mockHass);
      expect(call.args[1]).to.equal(element['_entity']);
      expect(call.args[2]).to.equal(element.config);
    });

    it('should not apply dragging class when not dragging', async () => {
      element['_isDragging'] = false;
      const result = element.render() as TemplateResult;

      // Verify renderRoomIcon is called (indicating icon-container is used)
      expect(renderRoomIconStub.called).to.be.true;
      // Verify the template does not include the dragging class by checking values
      const hasDragging = result.values.some(
        (val) => typeof val === 'string' && val.includes('dragging'),
      );
      expect(hasDragging).to.be.false;
    });

    it('should render bar-container when slider style is bar', async () => {
      element.config = {
        ...element.config,
        slider_style: 'bar',
      } as Config;
      element.hass = mockHass;
      element['_isDragging'] = false;

      const result = element.render() as TemplateResult;

      // Check that bar-container class is in the values
      const hasBarContainer = result.values.some(
        (val) => typeof val === 'string' && val.includes('bar-container'),
      );
      expect(hasBarContainer).to.be.true;
      // Icon should not be rendered for bar style
      expect(renderRoomIconStub.called).to.be.false;
    });

    it('should set slider position CSS variable in render', async () => {
      const setPropertySpy = stub();
      Object.defineProperty(element, 'style', {
        value: {
          setProperty: setPropertySpy,
          getPropertyValue: stub().returns(''),
        },
        writable: true,
      });

      element.hass = mockHass;
      element.render();

      expect(setPropertySpy.calledWith('--slider-position', sinon.match.string))
        .to.be.true;
    });

    it('should render icon-container when slider style is not bar', async () => {
      element.config = {
        ...element.config,
        slider_style: 'filled',
      } as Config;
      element.hass = mockHass;
      element['_isDragging'] = false;

      const result = element.render() as TemplateResult;

      // Check that icon-container class is in the values
      const hasIconContainer = result.values.some(
        (val) => typeof val === 'string' && val.includes('icon-container'),
      );
      expect(hasIconContainer).to.be.true;
      expect(renderRoomIconStub.called).to.be.true;
    });

    it('should call stylesToHostCss with config styles', async () => {
      element.config = {
        ...element.config,
        styles: { entities: { 'background-color': 'red' } },
      } as any as Config;

      const result = element.render() as TemplateResult;
      await fixture(result);

      expect(stylesToHostCssStub.calledWith({ 'background-color': 'red' })).to
        .be.true;
    });
  });

  describe('drag handlers - mouse', () => {
    beforeEach(() => {
      element.hass = mockHass;
      // Set up element dimensions
      Object.defineProperty(element, 'offsetHeight', {
        value: 200,
        writable: true,
      });
      // Set explicit position for tests that need a known starting position
      element['_yPosition'] = 50;
    });

    it('should handle drag start', () => {
      const addEventListenerSpy = stub(document, 'addEventListener');
      const mouseEvent = {
        clientY: 100,
      } as MouseEvent;

      element['_handleDragStart'](mouseEvent);

      expect(element['_isDragging']).to.be.true;
      expect(element['_dragStartY']).to.equal(100);
      expect(element['_dragStartPosition']).to.equal(element['_yPosition']);
      expect(addEventListenerSpy.calledTwice).to.be.true;
      expect(
        addEventListenerSpy.calledWith('mousemove', element['_handleDragMove']),
      ).to.be.true;
      expect(
        addEventListenerSpy.calledWith('mouseup', element['_handleDragEnd']),
      ).to.be.true;

      addEventListenerSpy.restore();
    });

    it('should handle drag move', () => {
      element['_isDragging'] = true;
      element['_dragStartY'] = 100;
      element['_dragStartPosition'] = 50;

      const mouseEvent = {
        clientY: 150, // 50px down
      } as MouseEvent;

      element['_handleDragMove'](mouseEvent);

      // 50px / 200px * 100 = 25% down, so position should be 50 + 25 = 75%
      expect(element['_yPosition']).to.equal(75);
    });

    it('should not update position when container height is 0', () => {
      element['_isDragging'] = true;
      element['_dragStartY'] = 100;
      element['_dragStartPosition'] = 50;
      Object.defineProperty(element, 'offsetHeight', {
        value: 0,
        writable: true,
      });

      const mouseEvent = {
        clientY: 150,
      } as MouseEvent;

      element['_handleDragMove'](mouseEvent);

      // Position should remain unchanged when container height is 0
      expect(element['_yPosition']).to.equal(50);
    });

    it('should constrain position to 0-100%', () => {
      element['_isDragging'] = true;
      element['_dragStartY'] = 100;
      element['_dragStartPosition'] = 0;

      const mouseEvent = {
        clientY: 0, // Moving up beyond bounds
      } as MouseEvent;

      element['_handleDragMove'](mouseEvent);

      expect(element['_yPosition']).to.equal(0);
    });

    it('should not update position if not dragging', () => {
      element['_isDragging'] = false;
      const initialPosition = element['_yPosition'];

      const mouseEvent = {
        clientY: 150,
      } as MouseEvent;

      element['_handleDragMove'](mouseEvent);

      expect(element['_yPosition']).to.equal(initialPosition);
    });

    it('should handle drag end and call setBrightness', async () => {
      const removeEventListenerSpy = stub(document, 'removeEventListener');
      element['_isDragging'] = true;
      element['_yPosition'] = 25; // 25% from top = 75% brightness

      element['_handleDragEnd']();

      expect(element['_isDragging']).to.be.false;
      expect(setBrightnessStub.called).to.be.true;
      expect(setBrightnessStub.calledWith(mockHass, 'light.living_room', 191))
        .to.be.true; // (100 - 25) * 2.55 = 191.25 ≈ 191
      expect(removeEventListenerSpy.calledTwice).to.be.true;
      expect(
        removeEventListenerSpy.calledWith(
          'mousemove',
          element['_handleDragMove'],
        ),
      ).to.be.true;
      expect(
        removeEventListenerSpy.calledWith('mouseup', element['_handleDragEnd']),
      ).to.be.true;

      removeEventListenerSpy.restore();
    });
  });

  describe('drag handlers - touch', () => {
    beforeEach(() => {
      element.hass = mockHass;
      Object.defineProperty(element, 'offsetHeight', {
        value: 200,
        writable: true,
      });
      // Set explicit position for tests that need a known starting position
      element['_yPosition'] = 50;
    });

    it('should handle touch start', () => {
      const addEventListenerSpy = stub(document, 'addEventListener');
      const touchEvent = {
        touches: [
          {
            clientY: 100,
          } as Touch,
        ],
      } as unknown as TouchEvent;

      element['_handleTouchStart'](touchEvent);

      expect(element['_isDragging']).to.be.true;
      expect(element['_dragStartY']).to.equal(100);
      expect(addEventListenerSpy.calledTwice).to.be.true;
      expect(
        addEventListenerSpy.calledWith(
          'touchmove',
          element['_handleTouchMove'],
        ),
      ).to.be.true;
      expect(
        addEventListenerSpy.calledWith('touchend', element['_handleTouchEnd']),
      ).to.be.true;

      addEventListenerSpy.restore();
    });

    it('should not handle touch start if no touches', () => {
      const touchEvent = {
        touches: [],
      } as unknown as TouchEvent;

      element['_handleTouchStart'](touchEvent);

      expect(element['_isDragging']).to.be.false;
    });

    it('should handle touch move', () => {
      element['_isDragging'] = true;
      element['_dragStartY'] = 100;
      element['_dragStartPosition'] = 50;

      const touchEvent = {
        touches: [
          {
            clientY: 150,
          } as Touch,
        ],
      } as unknown as TouchEvent;

      element['_handleTouchMove'](touchEvent);

      expect(element['_yPosition']).to.equal(75);
    });

    it('should not update position when container height is 0 during touch move', () => {
      element['_isDragging'] = true;
      element['_dragStartY'] = 100;
      element['_dragStartPosition'] = 50;
      Object.defineProperty(element, 'offsetHeight', {
        value: 0,
        writable: true,
      });

      const touchEvent = {
        touches: [
          {
            clientY: 150,
          } as Touch,
        ],
      } as unknown as TouchEvent;

      element['_handleTouchMove'](touchEvent);

      // Position should remain unchanged when container height is 0
      expect(element['_yPosition']).to.equal(50);
    });

    it('should not update position when no touches in touch move', () => {
      element['_isDragging'] = true;
      element['_dragStartY'] = 100;
      element['_dragStartPosition'] = 50;

      const touchEvent = {
        touches: [],
      } as unknown as TouchEvent;

      element['_handleTouchMove'](touchEvent);

      // Position should remain unchanged when no touches
      expect(element['_yPosition']).to.equal(50);
    });

    it('should not update position if not dragging during touch move', () => {
      element['_isDragging'] = false;
      const initialPosition = element['_yPosition'];

      const touchEvent = {
        touches: [
          {
            clientY: 150,
          } as Touch,
        ],
      } as unknown as TouchEvent;

      element['_handleTouchMove'](touchEvent);

      expect(element['_yPosition']).to.equal(initialPosition);
    });

    it('should handle touch end and call setBrightness', async () => {
      const removeEventListenerSpy = stub(document, 'removeEventListener');
      element['_isDragging'] = true;
      element['_yPosition'] = 30; // 30% from top = 70% brightness

      element['_handleTouchEnd']();

      expect(element['_isDragging']).to.be.false;
      expect(setBrightnessStub.called).to.be.true;
      expect(setBrightnessStub.calledWith(mockHass, 'light.living_room', 179))
        .to.be.true; // (100 - 30) * 2.55 = 178.5 ≈ 179
      expect(removeEventListenerSpy.calledTwice).to.be.true;
      expect(
        removeEventListenerSpy.calledWith(
          'touchmove',
          element['_handleTouchMove'],
        ),
      ).to.be.true;
      expect(
        removeEventListenerSpy.calledWith(
          'touchend',
          element['_handleTouchEnd'],
        ),
      ).to.be.true;

      removeEventListenerSpy.restore();
    });
  });

  describe('styles', () => {
    it('should return styles', () => {
      expect(EntitySlider.styles).to.equal(styles);
    });
  });
});
