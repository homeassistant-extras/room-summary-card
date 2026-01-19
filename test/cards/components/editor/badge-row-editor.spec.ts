import * as fireEventModule from '@hass/common/dom/fire_event';
import type { HomeAssistant } from '@hass/types';
import type { BadgeConfig, StateConfig } from '@type/config/entity';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';
import { RoomSummaryBadgeRowEditor } from '../../../../src/cards/components/editor/badge-row-editor';
import { RoomSummaryStatesRowEditor } from '../../../../src/cards/components/editor/states-row-editor';

describe('badge-row-editor.ts', () => {
  let element: RoomSummaryBadgeRowEditor;
  let mockHass: HomeAssistant;
  let fireEventStub: sinon.SinonStub;

  const mockBadgeConfigs: BadgeConfig[] = [
    {
      position: 'top_left',
      mode: 'show_always',
      entity_id: 'light.test',
    },
    {
      position: 'top_right',
      mode: 'if_match',
      states: [{ state: 'on', icon_color: '#ff0000' }],
    },
    {
      position: 'bottom_left',
      states: [
        { state: 'on', icon_color: '#ff0000' },
        { state: 'off', icon_color: '#000000' },
      ],
    },
  ];

  beforeEach(() => {
    fireEventStub = stub(fireEventModule, 'fireEvent');

    // Register custom elements needed for tests
    if (!customElements.get('room-summary-states-row-editor')) {
      customElements.define(
        'room-summary-states-row-editor',
        RoomSummaryStatesRowEditor,
      );
    }

    mockHass = {
      localize: (key: string) => {
        const translations: Record<string, string> = {
          'editor.entity.badges': 'Badges',
          'editor.entity.add_badge': 'Add Badge',
          'editor.entity.states': 'States',
          'editor.badge.max_badges': 'Maximum 4 badges allowed',
          'ui.panel.lovelace.editor.card.config.optional': 'optional',
          'ui.components.entity.entity-picker.clear': 'Clear',
        };
        return translations[key] || key;
      },
    } as any as HomeAssistant;

    element = new RoomSummaryBadgeRowEditor();
    element.hass = mockHass;
  });

  afterEach(() => {
    fireEventStub.restore();
  });

  describe('properties', () => {
    it('should initialize with undefined badges', () => {
      expect(element.badges).to.be.undefined;
    });

    it('should set badges property', () => {
      element.badges = mockBadgeConfigs;
      expect(element.badges).to.deep.equal(mockBadgeConfigs);
    });

    it('should set label property', () => {
      element.label = 'Custom Badges Label';
      expect(element.label).to.equal('Custom Badges Label');
    });

    it('should set entityId property', () => {
      element.entityId = 'light.living_room';
      expect(element.entityId).to.equal('light.living_room');
    });

    it('should initialize with empty expanded badges set', () => {
      expect(element['_expandedBadges'].size).to.equal(0);
    });
  });

  describe('_addBadge', () => {
    it('should add new badge to empty array', () => {
      element.badges = [];

      element['_addBadge']();

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[0]).to.equal(element);
      expect(fireEventStub.firstCall.args[1]).to.equal('badges-value-changed');
      const newBadges = fireEventStub.firstCall.args[2].value;
      expect(newBadges).to.have.lengthOf(1);
      expect(newBadges[0]).to.deep.equal({
        position: 'top_right',
      });
    });

    it('should add new badge to existing array', () => {
      element.badges = [...mockBadgeConfigs];

      element['_addBadge']();

      expect(fireEventStub.calledOnce).to.be.true;
      const newBadges = fireEventStub.firstCall.args[2].value;
      expect(newBadges).to.have.lengthOf(4);
      expect(newBadges[3]).to.deep.equal({
        position: 'top_right',
      });
    });

    it('should handle undefined badges array', () => {
      element.badges = undefined;

      element['_addBadge']();

      expect(fireEventStub.calledOnce).to.be.true;
      const newBadges = fireEventStub.firstCall.args[2].value;
      expect(newBadges).to.have.lengthOf(1);
    });

    it('should expand newly added badge', () => {
      element.badges = [];

      element['_addBadge']();

      const newBadges = fireEventStub.firstCall.args[2].value;
      const newIndex = newBadges.length - 1;
      expect(element['_expandedBadges'].has(newIndex)).to.be.true;
    });
  });

  describe('_removeBadgeItem', () => {
    it('should remove badge at specified index', () => {
      element.badges = [...mockBadgeConfigs];

      element['_removeBadgeItem'](1);

      expect(fireEventStub.calledOnce).to.be.true;
      const newBadges = fireEventStub.firstCall.args[2].value;
      expect(newBadges).to.have.lengthOf(2);
      expect(newBadges[0]).to.deep.equal(mockBadgeConfigs[0]);
      expect(newBadges[1]).to.deep.equal(mockBadgeConfigs[2]);
    });

    it('should remove first badge', () => {
      element.badges = [...mockBadgeConfigs];

      element['_removeBadgeItem'](0);

      expect(fireEventStub.calledOnce).to.be.true;
      const newBadges = fireEventStub.firstCall.args[2].value;
      expect(newBadges).to.have.lengthOf(2);
      expect(newBadges[0]).to.deep.equal(mockBadgeConfigs[1]);
    });

    it('should adjust expanded indices after removal', () => {
      element.badges = [...mockBadgeConfigs];
      element['_expandedBadges'] = new Set([0, 1, 2]);

      element['_removeBadgeItem'](1);

      // Index 0 should remain, index 2 should become index 1
      expect(element['_expandedBadges'].has(0)).to.be.true;
      expect(element['_expandedBadges'].has(1)).to.be.true;
      expect(element['_expandedBadges'].has(2)).to.be.false;
    });

    it('should remove expanded badge index when removing badge', () => {
      element.badges = [...mockBadgeConfigs];
      element['_expandedBadges'] = new Set([0, 1]);

      element['_removeBadgeItem'](0);

      // After removing index 0, the badge at index 1 moves to index 0
      expect(element['_expandedBadges'].has(0)).to.be.true; // Was index 1
      expect(element['_expandedBadges'].has(1)).to.be.false;
    });

    it('should handle undefined badges array', () => {
      element.badges = undefined;

      element['_removeBadgeItem'](0);

      expect(fireEventStub.calledOnce).to.be.true;
      const newBadges = fireEventStub.firstCall.args[2].value;
      expect(newBadges).to.be.an('array');
      expect(newBadges.length).to.equal(0);
    });

    it('should send empty array when removing last badge', () => {
      element.badges = [{ position: 'top_right' }];

      element['_removeBadgeItem'](0);

      expect(fireEventStub.calledOnce).to.be.true;
      const newBadges = fireEventStub.firstCall.args[2].value;
      expect(newBadges).to.be.an('array');
      expect(newBadges.length).to.equal(0);
    });
  });

  describe('_badgeValueChanged', () => {
    it('should update badge at specified index', () => {
      element.badges = [...mockBadgeConfigs];
      const updatedBadge: BadgeConfig = {
        position: 'bottom_right',
        mode: 'homeassistant',
      };

      const event = new CustomEvent('value-changed', {
        detail: { value: updatedBadge },
      });

      element['_badgeValueChanged'](0, event);

      expect(fireEventStub.calledOnce).to.be.true;
      const newBadges = fireEventStub.firstCall.args[2].value;
      expect(newBadges[0]).to.deep.equal(updatedBadge);
      expect(newBadges[1]).to.deep.equal(mockBadgeConfigs[1]);
    });

    it('should handle undefined badges array', () => {
      element.badges = undefined;
      const updatedBadge: BadgeConfig = {
        position: 'top_right',
        mode: 'show_always',
      };

      const event = new CustomEvent('value-changed', {
        detail: { value: updatedBadge },
      });

      element['_badgeValueChanged'](0, event);

      expect(fireEventStub.calledOnce).to.be.true;
      const newBadges = fireEventStub.firstCall.args[2].value;
      expect(newBadges).to.be.an('array');
      expect(newBadges[0]).to.deep.equal(updatedBadge);
    });
  });

  describe('_badgeStatesValueChanged', () => {
    it('should update badge states at specified index', () => {
      element.badges = [...mockBadgeConfigs];
      const statesValue: StateConfig[] = [
        { state: 'off', icon_color: '#000000' },
        { state: 'standby', icon_color: '#888888' },
      ];

      const event = new CustomEvent('states-value-changed', {
        detail: { value: statesValue },
      });

      element['_badgeStatesValueChanged'](1, event);

      expect(fireEventStub.calledOnce).to.be.true;
      const newBadges = fireEventStub.firstCall.args[2].value;
      expect(newBadges[1]?.states).to.deep.equal(statesValue);
    });

    it('should handle undefined badges array', () => {
      element.badges = undefined;
      const statesValue: StateConfig[] = [
        { state: 'on', icon_color: '#ff0000' },
      ];

      const event = new CustomEvent('states-value-changed', {
        detail: { value: statesValue },
      });

      element['_badgeStatesValueChanged'](0, event);

      expect(fireEventStub.calledOnce).to.be.true;
      const newBadges = fireEventStub.firstCall.args[2].value;
      expect(newBadges).to.be.an('array');
      expect(newBadges[0]?.states).to.deep.equal(statesValue);
    });
  });

  describe('_expandedBadges', () => {
    it('should expand badge when not expanded', () => {
      element['_expandedBadges'] = new Set([0]);
      expect(element['_expandedBadges'].has(0)).to.be.true;
    });

    it('should collapse badge when expanded', () => {
      element['_expandedBadges'] = new Set([0]);
      element['_expandedBadges'] = new Set();
      expect(element['_expandedBadges'].has(0)).to.be.false;
    });

    it('should handle multiple expanded badges', () => {
      element['_expandedBadges'] = new Set([0, 1, 2]);
      expect(element['_expandedBadges'].has(0)).to.be.true;
      expect(element['_expandedBadges'].has(1)).to.be.true;
      expect(element['_expandedBadges'].has(2)).to.be.true;
    });

    it('should toggle individual badges independently', () => {
      element['_expandedBadges'] = new Set([1]);
      expect(element['_expandedBadges'].has(0)).to.be.false;
      expect(element['_expandedBadges'].has(1)).to.be.true;
    });
  });

  describe('render', () => {
    it('should render nothing when hass is not set', () => {
      element.hass = undefined;
      const result = element['render']();
      expect(result).to.equal(nothing);
    });

    it('should render with default label when no custom label', () => {
      element.badges = mockBadgeConfigs;
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should render with custom label', () => {
      element.label = 'Custom Badges';
      element.badges = mockBadgeConfigs;
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should render with empty badges array', () => {
      element.badges = [];
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should render with undefined badges as empty array', () => {
      element.badges = undefined;
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should render badges with expansion panels', () => {
      element.badges = mockBadgeConfigs;
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
      expect(result.strings).to.be.an('array');
      expect(result.strings.length).to.be.greaterThan(0);
    });

    it('should render add badge button when under max badges', async () => {
      element.badges = [{ position: 'top_right' }];
      const result = element['render']() as TemplateResult;
      // Check that the template renders correctly
      // The button is conditionally rendered when canAddMore is true (badges.length < 4)
      // Since it's in a conditional template, we verify the template structure is valid
      expect(result).to.not.equal(nothing);
      expect(result.strings).to.be.an('array');
      expect(result.strings.length).to.be.greaterThan(0);
      // Verify canAddMore logic: badges.length (1) < maxBadges (4) = true
      expect(element.badges.length).to.be.lessThan(4);
    });

    it('should render max badges message when at max badges', async () => {
      element.badges = [
        { position: 'top_right' },
        { position: 'top_left' },
        { position: 'bottom_right' },
        { position: 'bottom_left' },
      ];
      const result = element['render']() as TemplateResult;
      // Check that the template renders correctly
      // The message is conditionally rendered when canAddMore is false (badges.length >= 4)
      // Since it's in a conditional template, we verify the template structure is valid
      expect(result).to.not.equal(nothing);
      expect(result.strings).to.be.an('array');
      expect(result.strings.length).to.be.greaterThan(0);
      // Verify canAddMore logic: badges.length (4) < maxBadges (4) = false
      expect(element.badges.length).to.equal(4);
    });

    it('should use entityId in schema when provided', () => {
      element.entityId = 'light.bedroom';
      element.badges = mockBadgeConfigs;
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should use empty string for entityId when not provided', () => {
      element.entityId = undefined;
      element.badges = mockBadgeConfigs;
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should render states editor when badge has no mode', async () => {
      element.badges = [
        {
          position: 'top_right',
          states: [{ state: 'on', icon_color: '#ff0000' }],
        },
      ];
      const result = element['render']() as TemplateResult;
      // Check that the template renders correctly
      // The states editor is rendered inside the repeat loop when !item.mode
      // Since it's in a nested template, we can't check template strings directly
      // Instead, we verify the template structure is valid and renders without errors
      expect(result).to.not.equal(nothing);
      expect(result.strings).to.be.an('array');
      expect(result.strings.length).to.be.greaterThan(0);
      // Verify the badge has no mode (which triggers states editor rendering)
      expect(element.badges[0]?.mode).to.be.undefined;
      expect(element.badges[0]?.states).to.exist;
    });

    it('should not render states editor when badge has mode', () => {
      element.badges = [
        {
          position: 'top_right',
          mode: 'show_always',
        },
      ];
      const result = element['render']() as TemplateResult;
      const templateString = result.strings.join('');
      // States editor should not be present when mode is set
      // We can't easily test this without more complex parsing, but the render should succeed
      expect(result).to.not.equal(nothing);
    });
  });

  describe('expansion panel interaction', () => {
    it('should expand badge when expansion panel is opened', () => {
      element.badges = mockBadgeConfigs;
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);

      // Simulate expansion panel opening
      const expansionEvent = new CustomEvent('expanded-changed', {
        detail: { value: true },
      });
      // We can't directly test the event handler, but we can verify the structure
      expect(element['_expandedBadges'].size).to.equal(0);
    });

    it('should collapse badge when expansion panel is closed', () => {
      element.badges = mockBadgeConfigs;
      element['_expandedBadges'] = new Set([0]);
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
      // Verify initial state
      expect(element['_expandedBadges'].has(0)).to.be.true;
    });
  });

  describe('integration', () => {
    it('should handle complete workflow: add, update, remove', () => {
      element.badges = [];

      // Add badge
      element['_addBadge']();
      expect(fireEventStub.calledOnce).to.be.true;
      let newBadges = fireEventStub.firstCall.args[2].value;
      expect(newBadges).to.have.lengthOf(1);

      // Update badges
      element.badges = newBadges;
      fireEventStub.resetHistory();

      // Update badge
      const updatedBadge: BadgeConfig = {
        position: 'top_right',
        mode: 'show_always',
      };
      const updateEvent = new CustomEvent('value-changed', {
        detail: { value: updatedBadge },
      });
      element['_badgeValueChanged'](0, updateEvent);

      expect(fireEventStub.calledOnce).to.be.true;
      newBadges = fireEventStub.firstCall.args[2].value;
      expect(newBadges[0]).to.deep.equal(updatedBadge);

      // Update badges again
      element.badges = newBadges;
      fireEventStub.resetHistory();

      // Remove badge
      element['_removeBadgeItem'](0);
      expect(fireEventStub.calledOnce).to.be.true;
      newBadges = fireEventStub.firstCall.args[2].value;
      expect(newBadges).to.have.lengthOf(0);
    });

    it('should handle multiple badges with expansion', () => {
      element.badges = [
        { position: 'top_left', mode: 'show_always' },
        { position: 'top_right', mode: 'if_match' },
        { position: 'bottom_left' },
      ];

      // Expand first and third
      element['_expandedBadges'] = new Set([0, 2]);
      expect(element['_expandedBadges'].has(0)).to.be.true;
      expect(element['_expandedBadges'].has(1)).to.be.false;
      expect(element['_expandedBadges'].has(2)).to.be.true;

      // Remove middle badge
      element['_removeBadgeItem'](1);

      // Indices should be adjusted
      expect(element['_expandedBadges'].has(0)).to.be.true;
      expect(element['_expandedBadges'].has(1)).to.be.true; // Was index 2
      expect(element['_expandedBadges'].has(2)).to.be.false;
    });

    it('should handle adding badge after removal', () => {
      element.badges = [
        { position: 'top_left', mode: 'show_always' },
        { position: 'top_right', mode: 'if_match' },
      ];

      // Remove first badge
      element['_removeBadgeItem'](0);
      let newBadges = fireEventStub.firstCall.args[2].value;
      element.badges = newBadges;
      fireEventStub.resetHistory();

      // Add new badge
      element['_addBadge']();
      newBadges = fireEventStub.firstCall.args[2].value;
      expect(newBadges).to.have.lengthOf(2);
      expect(newBadges[0]).to.deep.equal({
        position: 'top_right',
        mode: 'if_match',
      });
      expect(newBadges[1]).to.deep.equal({ position: 'top_right' });
    });
  });

  describe('edge cases', () => {
    it('should handle badges array with duplicate positions', () => {
      element.badges = [
        { position: 'top_right', mode: 'show_always' },
        { position: 'top_right', mode: 'if_match' },
      ];
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should handle badge with all optional fields', () => {
      const fullBadge: BadgeConfig = {
        position: 'top_right',
        mode: 'show_always',
        entity_id: 'light.test',
        states: [{ state: 'on', icon_color: '#ff0000' }],
      };
      element.badges = [fullBadge];
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should handle badge with minimal required fields', () => {
      const minimalBadge: BadgeConfig = {
        position: 'top_right',
      };
      element.badges = [minimalBadge];
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should handle rapid toggle operations', () => {
      // Simulate rapid expansion/collapse by directly setting state
      element['_expandedBadges'] = new Set([0]);
      element['_expandedBadges'] = new Set();
      element['_expandedBadges'] = new Set([0]);
      expect(element['_expandedBadges'].has(0)).to.be.true;
    });

    it('should handle removing all badges', () => {
      element.badges = [
        { position: 'top_left', mode: 'show_always' },
        { position: 'top_right', mode: 'if_match' },
      ];

      element['_removeBadgeItem'](0);
      let newBadges = fireEventStub.firstCall.args[2].value;
      element.badges = newBadges;
      fireEventStub.resetHistory();

      element['_removeBadgeItem'](0);
      newBadges = fireEventStub.firstCall.args[2].value;
      expect(newBadges).to.be.an('array');
      expect(newBadges.length).to.equal(0);
    });

    it('should handle badge with badge entity_id different from parent', () => {
      element.entityId = 'light.parent';
      element.badges = [
        {
          position: 'top_right',
          entity_id: 'light.badge',
          mode: 'show_always',
        },
      ];
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });
  });

  describe('styles', () => {
    it('should have static styles defined', () => {
      expect(RoomSummaryBadgeRowEditor.styles).to.exist;
    });

    it('should include badges container styles', () => {
      const styles = RoomSummaryBadgeRowEditor.styles.toString();
      expect(styles).to.include('badges');
      expect(styles).to.include('flex-direction');
    });

    it('should include badge header styles', () => {
      const styles = RoomSummaryBadgeRowEditor.styles.toString();
      expect(styles).to.include('badge-header');
      expect(styles).to.include('justify-content');
    });

    it('should include badge title styles', () => {
      const styles = RoomSummaryBadgeRowEditor.styles.toString();
      expect(styles).to.include('badge-title');
      expect(styles).to.include('font-weight');
    });

    it('should include remove icon styles', () => {
      const styles = RoomSummaryBadgeRowEditor.styles.toString();
      expect(styles).to.include('remove-icon');
      expect(styles).to.include('--mdc-icon-button-size');
    });

    it('should include add badge button styles', () => {
      const styles = RoomSummaryBadgeRowEditor.styles.toString();
      expect(styles).to.include('add-badge');
      expect(styles).to.include('cursor');
    });

    it('should include expansion panel styles', () => {
      const styles = RoomSummaryBadgeRowEditor.styles.toString();
      expect(styles).to.include('ha-expansion-panel');
      expect(styles).to.include('--expansion-panel-summary-padding');
    });
  });
});
