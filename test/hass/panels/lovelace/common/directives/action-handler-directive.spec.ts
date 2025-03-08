import { actionHandlerBind } from '@hass/panels/lovelace/common/directives/action-handler-directive';
import { expect } from 'chai';
import * as sinon from 'sinon';

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
  });
};
