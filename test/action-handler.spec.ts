import { expect } from 'chai';
import { spy, stub } from 'sinon';
import { handleClickAction } from '../src/action-handler';
import type { ActionHandlerElement, ActionHandlerEvent } from '../src/types';
import type { EntityInformation } from '../src/types/config';
const proxyquire = require('proxyquire');

// Create a function that will be returned when _actionHandler is called with options
const mockDirectiveFunction = (options: any) => {
  return 'mock directive result';
};

// Create stubs for the lit directive system
const directiveStub = stub().returns(mockDirectiveFunction); // Now returns a function that returns a value
const noChangeStub = Symbol('noChange');

// Use proxyquire to replace both the lit and lit/directive modules
const { actionHandler } = proxyquire('../src/action-handler', {
  lit: {
    noChange: noChangeStub,
  },
  'lit/directive.js': {
    directive: directiveStub,
    Directive: class MockDirective {
      update() {
        return noChangeStub;
      }
      render() {}
    },
  },
});

// Your test suite
describe('Action Handler Module', () => {
  it('should call the directive function', () => {
    // Your test logic here
    expect(directiveStub.called).to.be.true;
  });
});

describe('actionHandler directive', () => {
  it('should call _actionHandler which binds', () => {
    const element = document.createElement('div') as ActionHandlerElement;
    const result = actionHandler({
      config: {
        entity_id: 'light.test',
        tap_action: { action: 'toggle' },
      },
      state: undefined,
    });
    expect(result).to.equal('mock directive result');
  });
});

describe('handleClickAction', () => {
  let element: HTMLElement;
  let mockEvent: ActionHandlerEvent;
  let entityInfo: EntityInformation;

  beforeEach(() => {
    element = document.createElement('div');
    mockEvent = {
      detail: { action: 'tap' },
    } as ActionHandlerEvent;
    entityInfo = {
      config: {
        entity_id: 'light.test',
        tap_action: { action: 'toggle' },
      },
      state: undefined,
    };

    it('should dispatch hass-action event with correct config', () => {
      const dispatchSpy = spy(element, 'dispatchEvent');
      const handler = handleClickAction(element, entityInfo);
      handler.handleEvent(mockEvent);

      expect(dispatchSpy.calledOnce).to.be.true;
      const event = dispatchSpy.firstCall.args[0] as CustomEvent;
      expect(event.type).to.equal('hass-action');
      expect(event.detail.config.entity).to.equal('light.test');
    });

    it('should not dispatch event if no action in event detail', () => {
      const dispatchSpy = spy(element, 'dispatchEvent');
      const handler = handleClickAction(element, entityInfo);
      handler.handleEvent({} as ActionHandlerEvent);

      expect(dispatchSpy.called).to.be.false;
    });
  });
});
