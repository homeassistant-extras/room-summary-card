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
    Object.defineProperty(globalThis, 'customCards', {
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
    const tags = customElementsStub.getCalls().map((c) => c.args[0] as string);

    /** Explicit registrations from {@link src/index.ts} */
    const indexTags = [
      'room-summary-card',
      'room-summary-card-editor',
      'sensor-collection',
      'entity-collection',
      'entity-slider',
      'room-state-icon',
      'room-badge',
      'room-summary-entity-detail-editor',
      'room-summary-entities-row-editor',
      'room-summary-states-row-editor',
      'room-summary-thresholds-row-editor',
      'room-summary-badge-row-editor',
      'room-summary-sub-element-editor',
    ];

    expect(tags).to.include.members(indexTags);
    expect(tags.length).to.be.at.least(indexTags.length);
    /** Side-effect import from {@link src/html/info.ts} when the card module graph loads */
    if (tags.length > indexTags.length) {
      expect(tags).to.include('area-statistics');
    }
  });

  it('should initialize window.customCards if undefined', () => {
    customCardsStub = undefined;
    require('@/index.ts');

    expect(globalThis.customCards).to.be.an('array');
  });

  it('should add card configuration with all fields to window.customCards', () => {
    require('@/index.ts');

    expect(globalThis.customCards).to.have.lengthOf(1);
    expect(globalThis.customCards[0]).to.deep.equal({
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
    globalThis.customCards = [
      {
        type: 'existing-card',
        name: 'Existing Card',
        description: 'Existing Card Description',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/room-summary-card',
      },
    ];

    require('@/index.ts');

    expect(globalThis.customCards).to.have.lengthOf(2);
    expect(globalThis.customCards[0]).to.deep.equal({
      type: 'existing-card',
      name: 'Existing Card',
      description: 'Existing Card Description',
      preview: true,
      documentationURL:
        'https://github.com/homeassistant-extras/room-summary-card',
    });
  });

  it('should handle multiple imports without duplicating registration', () => {
    require('@/index.ts');
    const definesAfterFirstLoad = customElementsStub.callCount;
    require('@/index.ts');

    expect(globalThis.customCards).to.have.lengthOf(1);
    expect(customElementsStub.callCount).to.equal(definesAfterFirstLoad);
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
