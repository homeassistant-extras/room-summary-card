import { expect } from 'chai';
import { stub, type SinonStub } from 'sinon';
import { version } from '../package.json';

describe('index.ts', () => {
  let customElementsStub: SinonStub;
  let customCardsStub: Array<Object> | undefined;
  let consoleInfoStub: sinon.SinonStub;

  beforeEach(() => {
    // Stub customElements.define to prevent actual registration
    customElementsStub = stub(customElements, 'define');
    consoleInfoStub = stub(console, 'info');

    // Create a stub for window.customCards
    customCardsStub = [];
    Object.defineProperty(window, 'customCards', {
      get: () => customCardsStub,
      set: (value) => {
        customCardsStub = value;
      },
      configurable: true,
    });
  });

  afterEach(() => {
    customElementsStub.restore();
    consoleInfoStub.restore();
    customCardsStub = undefined;
    delete require.cache[require.resolve('@/index.ts')];
  });

  it('should register all custom elements including room-state-icon', () => {
    require('@/index.ts');
    expect(customElementsStub.callCount).to.equal(9);
    expect(customElementsStub.firstCall.args[0]).to.equal('room-summary-card');
    expect(customElementsStub.secondCall.args[0]).to.equal(
      'room-summary-card-editor',
    );
    expect(customElementsStub.thirdCall.args[0]).to.equal('sensor-collection');
    expect(customElementsStub.getCall(3).args[0]).to.equal('entity-collection');
    expect(customElementsStub.getCall(4).args[0]).to.equal('room-state-icon');
    expect(customElementsStub.getCall(5).args[0]).to.equal(
      'room-summary-entity-detail-editor',
    );
    expect(customElementsStub.getCall(6).args[0]).to.equal(
      'room-summary-entities-row-editor',
    );
    expect(customElementsStub.getCall(7).args[0]).to.equal(
      'room-summary-states-row-editor',
    );
    expect(customElementsStub.getCall(8).args[0]).to.equal(
      'room-summary-sub-element-editor',
    );
  });

  it('should initialize window.customCards if undefined', () => {
    customCardsStub = undefined;
    require('@/index.ts');

    expect(window.customCards).to.be.an('array');
  });

  it('should add card configuration with all fields to window.customCards', () => {
    require('@/index.ts');

    expect(window.customCards).to.have.lengthOf(1);
    expect(window.customCards[0]).to.deep.equal({
      type: 'room-summary-card',
      name: 'Room Summary',
      description:
        'A card to summarize the status of a room, including temperature, humidity, and any problem entities.',
      preview: true,
      documentationURL:
        'https://github.com/homeassistant-extras/room-summary-card',
    });
  });

  it('should preserve existing cards when adding new card', () => {
    // Add an existing card
    window.customCards = [
      {
        type: 'existing-card',
        name: 'Existing Card',
      },
    ];

    require('@/index.ts');

    expect(window.customCards).to.have.lengthOf(2);
    expect(window.customCards[0]).to.deep.equal({
      type: 'existing-card',
      name: 'Existing Card',
    });
  });

  it('should handle multiple imports without duplicating registration', () => {
    require('@/index.ts');
    require('@/index.ts');

    expect(window.customCards).to.have.lengthOf(1);
    expect(customElementsStub.callCount).to.equal(9);
  });

  it('should log the version with proper formatting', () => {
    require('@/index.ts');

    // Assert that console.info was called once
    expect(consoleInfoStub.calledOnce).to.be.true;

    // Assert that it was called with the expected arguments
    expect(
      consoleInfoStub.calledWithExactly(
        `%c🐱 Poat's Tools: room-summary-card - ${version}`,
        'color: #CFC493;',
      ),
    ).to.be.true;
  });
});
