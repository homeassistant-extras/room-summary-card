import { handleClickAction } from '@/delegates/action-handler-delegate';
import type { ActionHandlerEvent } from '@hass/data/lovelace/action_handler';

import type { EntityInformation } from '@type/config';
import { expect } from 'chai';
import { stub } from 'sinon';
const proxyquire = require('proxyquire');

// Create a function that will be returned when _actionHandler is called with options
const mockDirectiveFunction = (options: any) => {
  return 'mock directive result';
};

// Create stubs for the lit directive system
const directiveStub = stub().returns(mockDirectiveFunction); // Now returns a function that returns a value
const noChangeStub = Symbol('noChange');

// Use proxyquire to replace both the lit and lit/directive modules
const { actionHandler } = proxyquire('@delegates/action-handler-delegate.ts', {
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

describe('action-handler.ts', () => {
  describe('actionHandler directive', () => {
    it('should call the directive function', () => {
      // Your test logic here
      expect(directiveStub.called).to.be.true;
    });

    // it('should call _actionHandler which binds', () => {
    //   const element = document.createElement('div') as ActionHandlerElement;
    //   const result = actionHandler({
    //     config: {
    //       entity_id: 'light.test',
    //       tap_action: { action: 'toggle' },
    //     },
    //     state: undefined,
    //   });
    //   expect(result).to.equal('mock directive result');
    // });
  });

  describe('handleClickAction', () => {
    let element: HTMLElement;
    let mockEvent: ActionHandlerEvent;
    let entityInfo: EntityInformation;
    let dispatchStub: sinon.SinonStub;

    beforeEach(() => {
      element = document.createElement('div');
      dispatchStub = stub(element, 'dispatchEvent');
      mockEvent = {
        detail: { action: 'hold' },
      } as ActionHandlerEvent;
      entityInfo = {
        config: {
          entity_id: 'light.test',
          tap_action: { action: 'toggle' },
        },
        state: undefined,
      };
    });

    afterEach(() => {
      dispatchStub.restore();
    });

    it('should dispatch hass-action event with correct config', () => {
      const handler = handleClickAction(element, entityInfo);
      handler.handleEvent(mockEvent);

      // Ensure the stub was called once
      expect(dispatchStub.calledOnce).to.be.true;

      // Retrieve the event argument passed to dispatchEvent
      const event = dispatchStub.firstCall.args[0] as CustomEvent;
      expect(event.type).to.equal('hass-action');
      expect(event.detail.config.entity).to.equal('light.test');

      // Restore the original method
      dispatchStub.restore();
    });

    it('should not dispatch event if no action in event detail', () => {
      const handler = handleClickAction(element, entityInfo);
      handler.handleEvent({} as ActionHandlerEvent);

      expect(dispatchStub.called).to.be.false;
    });
  });
});
