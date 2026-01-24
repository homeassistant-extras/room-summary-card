import * as featureModule from '@config/feature';
import type { HomeAssistant } from '@hass/types';
import { renderStateDisplay } from '@html/render-state-display';
import * as stateDisplayModule from '@html/state-display';
import { fixture } from '@open-wc/testing-helpers';
import type { EntityInformation, EntityState } from '@type/room';
import * as shouldHideStateDisplayModule from '@util/should-hide-state-display';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('render-state-display.ts', () => {
  let mockHass: HomeAssistant;
  let mockEntityState: EntityState;
  let hasEntityFeatureStub: sinon.SinonStub;
  let shouldHideStateDisplayWhenInactiveStub: sinon.SinonStub;
  let stateDisplayStub: sinon.SinonStub;

  beforeEach(() => {
    // Mock entity state
    mockEntityState = {
      entity_id: 'light.living_room',
      domain: 'light',
      state: 'on',
      attributes: { brightness: 100 },
    } as EntityState;

    // Mock Home Assistant
    mockHass = {
      entities: {
        'light.living_room': {
          area_id: 'test_area',
          device_id: 'test_device',
          labels: [],
        },
      },
    } as any as HomeAssistant;

    // Stub hasEntityFeature
    hasEntityFeatureStub = stub(featureModule, 'hasEntityFeature');

    // Stub shouldHideStateDisplayWhenInactive
    shouldHideStateDisplayWhenInactiveStub = stub(
      shouldHideStateDisplayModule,
      'shouldHideStateDisplayWhenInactive',
    );

    // Stub stateDisplay to avoid rendering real custom elements
    stateDisplayStub = stub(stateDisplayModule, 'stateDisplay').returns(
      html`<state-display class="test-state-display"></state-display>`,
    );
  });

  afterEach(() => {
    hasEntityFeatureStub.restore();
    shouldHideStateDisplayWhenInactiveStub.restore();
    stateDisplayStub.restore();
  });

  describe('renderStateDisplay', () => {
    it('should return nothing when show_state feature is disabled', () => {
      // Arrange
      hasEntityFeatureStub.returns(false);
      const entity: EntityInformation = {
        config: { entity_id: 'light.living_room' },
        state: mockEntityState,
      };

      // Act
      const result = renderStateDisplay(mockHass, entity, false);

      // Assert
      expect(result).to.equal(nothing);
      expect(hasEntityFeatureStub.calledWith(entity, 'show_state')).to.be.true;
    });

    it('should return nothing when hideIconContent is true', () => {
      // Arrange
      hasEntityFeatureStub.returns(true);
      const entity: EntityInformation = {
        config: { entity_id: 'light.living_room' },
        state: mockEntityState,
      };

      // Act
      const result = renderStateDisplay(mockHass, entity, true);

      // Assert
      expect(result).to.equal(nothing);
    });

    it('should return nothing when hide_zero_attribute_domains is enabled and shouldHideStateDisplayWhenInactive returns true', () => {
      // Arrange
      hasEntityFeatureStub.callsFake(
        (entity: EntityInformation, feature: string) => {
          if (feature === 'show_state') return true;
          if (feature === 'hide_zero_attribute_domains') return true;
          return false;
        },
      );
      shouldHideStateDisplayWhenInactiveStub.returns(true);

      const entity: EntityInformation = {
        config: { entity_id: 'light.living_room' },
        state: mockEntityState,
      };

      // Act
      const result = renderStateDisplay(mockHass, entity, false);

      // Assert
      expect(result).to.equal(nothing);
      expect(shouldHideStateDisplayWhenInactiveStub.calledWith(mockEntityState))
        .to.be.true;
    });

    it('should render state display when show_state is enabled and hide_zero_attribute_domains is disabled', async () => {
      // Arrange
      hasEntityFeatureStub.callsFake(
        (entity: EntityInformation, feature: string) => {
          if (feature === 'show_state') return true;
          return false;
        },
      );

      const entity: EntityInformation = {
        config: { entity_id: 'light.living_room' },
        state: mockEntityState,
      };

      // Act
      const result = renderStateDisplay(mockHass, entity, false);

      // Assert
      expect(result).to.not.equal(nothing);
      const el = await fixture(result as TemplateResult);
      // The root element should be the div with class "entity-state"
      expect(el.classList.contains('entity-state')).to.be.true;
      expect(stateDisplayStub.calledWith(mockHass, mockEntityState)).to.be.true;
    });

    it('should render state display when hide_zero_attribute_domains is enabled but shouldHideStateDisplayWhenInactive returns false', async () => {
      // Arrange
      hasEntityFeatureStub.callsFake(
        (entity: EntityInformation, feature: string) => {
          if (feature === 'show_state') return true;
          if (feature === 'hide_zero_attribute_domains') return true;
          return false;
        },
      );
      shouldHideStateDisplayWhenInactiveStub.returns(false);

      const entity: EntityInformation = {
        config: { entity_id: 'light.living_room' },
        state: mockEntityState,
      };

      // Act
      const result = renderStateDisplay(mockHass, entity, false);

      // Assert
      expect(result).to.not.equal(nothing);
      const el = await fixture(result as TemplateResult);
      // The root element should be the div with class "entity-state"
      expect(el.classList.contains('entity-state')).to.be.true;
      expect(shouldHideStateDisplayWhenInactiveStub.calledWith(mockEntityState))
        .to.be.true;
      expect(stateDisplayStub.calledWith(mockHass, mockEntityState)).to.be.true;
    });

    it('should render state display when state is undefined (stateDisplay handles undefined)', async () => {
      // Arrange
      hasEntityFeatureStub.callsFake(
        (entity: EntityInformation, feature: string) => {
          if (feature === 'show_state') return true;
          if (feature === 'hide_zero_attribute_domains') return true;
          return false;
        },
      );

      const entity: EntityInformation = {
        config: { entity_id: 'light.living_room' },
        state: undefined,
      };

      // Act
      const result = renderStateDisplay(mockHass, entity, false);

      // Assert
      // When state is undefined, hideZeroAttributeDomains check is skipped (because of && state)
      // and it proceeds to render. The stateDisplay function will receive undefined.
      expect(result).to.not.equal(nothing);
      const el = await fixture(result as TemplateResult);
      // The root element should be the div with class "entity-state"
      expect(el.classList.contains('entity-state')).to.be.true;
      expect(shouldHideStateDisplayWhenInactiveStub.called).to.be.false;
      expect(stateDisplayStub.calledWith(mockHass, undefined)).to.be.true;
    });
  });
});
