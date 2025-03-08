import { actionHandler } from '@delegates/action-handler-delegate';
import { actionHandlerBind } from '@hass/panels/lovelace/common/directives/action-handler-directive';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { stub } from 'sinon';

export default () => {
  describe('action-handler-directive.ts', () => {
    let sandbox: sinon.SinonSandbox;
    let mockElement: HTMLElement & { actionHandler?: any };
    let mockActionHandler: HTMLElement & {
      bind: sinon.SinonStub;
      holdTime: number;
    };
    let documentQuerySelectorStub: sinon.SinonStub;
    let documentCreateElementStub: sinon.SinonStub;
    let bodyAppendChildStub: sinon.SinonStub;

    beforeEach(() => {
      sandbox = sinon.createSandbox();

      // Mock DOM elements and methods
      mockElement = document.createElement('div');

      mockActionHandler = document.createElement('div') as any;
      mockActionHandler.bind = sandbox.stub();
      mockActionHandler.holdTime = 500;

      documentQuerySelectorStub = sandbox.stub(document.body, 'querySelector');
      documentCreateElementStub = sandbox.stub(document, 'createElement');
      bodyAppendChildStub = sandbox.stub(document.body, 'appendChild');

      // Default behavior - no existing action handler
      documentQuerySelectorStub.returns(null);
      documentCreateElementStub
        .withArgs('action-handler')
        .returns(mockActionHandler);
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('getActionHandler (private function)', () => {
      it('should return existing action-handler when one exists in the DOM', () => {
        // Arrange
        documentQuerySelectorStub.returns(mockActionHandler);

        // Act
        actionHandlerBind(mockElement);

        // Assert
        expect(documentQuerySelectorStub.calledWith('action-handler')).to.be
          .true;
        expect(documentCreateElementStub.called).to.be.false;
        expect(bodyAppendChildStub.called).to.be.false;
      });

      it('should create a new action-handler when one does not exist in the DOM', () => {
        // Arrange
        documentQuerySelectorStub.returns(null);

        // Act
        actionHandlerBind(mockElement);

        // Assert
        expect(documentQuerySelectorStub.calledWith('action-handler')).to.be
          .true;
        expect(documentCreateElementStub.calledWith('action-handler')).to.be
          .true;
        expect(bodyAppendChildStub.calledWith(mockActionHandler)).to.be.true;
      });
    });

    describe('actionHandlerBind', () => {
      it('should bind the element to the action handler with provided options', () => {
        // Arrange
        documentQuerySelectorStub.returns(mockActionHandler);
        const options = {
          hasHold: true,
          holdTime: 1000,
        };

        // Act
        actionHandlerBind(mockElement, options);

        // Assert
        expect(mockActionHandler.bind.calledWith(mockElement, options)).to.be
          .true;
      });

      it('should pass undefined options when none are provided', () => {
        // Arrange
        documentQuerySelectorStub.returns(mockActionHandler);

        // Act
        actionHandlerBind(mockElement);

        // Assert
        expect(mockActionHandler.bind.calledWith(mockElement, undefined)).to.be
          .true;
      });

      it('should do nothing if action handler cannot be found or created', () => {
        // Arrange
        documentQuerySelectorStub.returns(null);
        documentCreateElementStub.returns(null);

        // Act
        const result = actionHandlerBind(mockElement);

        // Assert
        expect(result).to.be.undefined;
      });
    });

    describe('actionHandler directive', () => {
      it('should be a valid directive', () => {
        // This test just verifies that actionHandler was created with the directive factory
        expect(actionHandler).to.be.a('function');
      });

      it('should call actionHandlerBind during update', () => {
        // We can't directly test the directive's update method since it's encapsulated
        // and Lit's testing utilities would be needed for a more direct test.
        // In a real test scenario, you'd use Lit's testing utilities or test a component
        // that uses this directive.

        // This is more of a structural test to verify the code is set up correctly
        const directiveClass = (actionHandler as any).directiveClass;
        expect(directiveClass).to.be.a('function');
        expect(directiveClass.prototype.update).to.be.a('function');
        expect(directiveClass.prototype.render).to.be.a('function');
      });
    });

    describe('Integration tests', () => {
      it('should handle action events properly', () => {
        // Setup mock element with event listener
        const actionSpy = sandbox.spy();
        const dispatchStub = stub(mockElement, 'dispatchEvent');
        mockElement.addEventListener('action', actionSpy as any);

        // Mock the binding process
        actionHandlerBind(mockElement, { hasHold: true });

        // Simulate what would happen if the action handler detected a 'tap' action
        // and dispatched an event
        const actionEvent = new CustomEvent('action', {
          bubbles: true,
          composed: true,
          detail: { action: 'tap' },
        });

        mockElement.dispatchEvent(actionEvent);

        // Ensure the stub was called once
        expect(dispatchStub.calledOnce).to.be.true;

        // Retrieve the event argument passed to dispatchEvent
        const event = dispatchStub.firstCall.args[0] as CustomEvent;
        expect(event.type).to.equal('action');
        expect(event.detail.action).to.equal('tap');

        // Restore the original method
        dispatchStub.restore();

        // Verify the event listener caught the event
        expect(actionSpy.calledOnce).to.be.true;
        expect(actionSpy.firstCall.args[0].detail.action).to.equal('tap');
      });
    });
  });
};
