import { RoomBackgroundImage } from '@cards/components/room-background-image/room-background-image';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import { fixture } from '@open-wc/testing-helpers';
import * as backgroundToHuiConfigModule from '@theme/image/background-to-hui-config';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { html } from 'lit';
import { stub, type SinonStub } from 'sinon';

if (!customElements.get('room-background-image')) {
  customElements.define('room-background-image', RoomBackgroundImage);
}

describe('room-background-image.ts', () => {
  let mockHass: HomeAssistant;
  let mockConfig: Config;
  let backgroundToHuiConfigStub: SinonStub;
  let mockCreateHuiElement: SinonStub;

  beforeEach(() => {
    // hui-image ships in HA's Lovelace bundle; stand in a fake so
    // customElements.get('hui-image') resolves without a real frontend.
    if (!customElements.get('hui-image')) {
      customElements.define(
        'hui-image',
        class extends HTMLElement {
          hass?: unknown;
          entity?: string;
          image?: string;
          cameraImage?: string;
          cameraView?: string;
        },
      );
    }

    mockCreateHuiElement = stub().returns(document.createElement('div'));
    globalThis.poatCardHelpers = {
      createCardElement: stub(),
      createRowElement: stub(),
      createHuiElement: mockCreateHuiElement,
    };

    backgroundToHuiConfigStub = stub(
      backgroundToHuiConfigModule,
      'backgroundToHuiConfig',
    );

    mockHass = {} as HomeAssistant;
    mockConfig = { area: 'living_room' };
  });

  afterEach(() => {
    backgroundToHuiConfigStub.restore();
    Reflect.deleteProperty(globalThis, 'poatCardHelpers');
  });

  it('renders no image when hass is not set', async () => {
    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        .config=${mockConfig}
      ></room-background-image>`,
    );

    expect(el.shadowRoot?.querySelector('hui-image')).to.not.exist;
  });

  it('renders only the color layer when no background is mapped', async () => {
    backgroundToHuiConfigStub.returns(undefined);

    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        .hass=${mockHass}
        .config=${mockConfig}
      ></room-background-image>`,
    );

    expect(el.shadowRoot?.querySelector('hui-image')).to.not.exist;
    expect(el.shadowRoot?.querySelector('.overlay')).to.not.exist;
    expect(el.shadowRoot?.querySelector('.color')).to.exist;
  });

  it('renders the color layer under the image in card placement', async () => {
    backgroundToHuiConfigStub.returns({
      type: 'image',
      image: '/local/room.jpg',
      tap_action: { action: 'none' },
    });

    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        .hass=${mockHass}
        .config=${mockConfig}
      ></room-background-image>`,
    );

    const color = el.shadowRoot?.querySelector('.color');
    const huiImage = el.shadowRoot?.querySelector('hui-image');
    expect(color).to.exist;
    expect(huiImage).to.exist;
    // color paints under the image
    expect(
      color!.compareDocumentPosition(huiImage!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).to.not.equal(0);
  });

  it('skips the image at card level when icon_background is set', async () => {
    backgroundToHuiConfigStub.returns({
      type: 'image',
      image: '/local/room.jpg',
      tap_action: { action: 'none' },
    });
    mockConfig = {
      area: 'living_room',
      background: { options: ['icon_background'] },
    };

    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        .hass=${mockHass}
        .config=${mockConfig}
      ></room-background-image>`,
    );

    expect(el.shadowRoot?.querySelector('hui-image')).to.not.exist;
    expect(el.shadowRoot?.querySelector('.overlay')).to.not.exist;
    expect(el.shadowRoot?.querySelector('.color')).to.exist;
  });

  it('renders the image without a color layer in icon placement', async () => {
    backgroundToHuiConfigStub.returns({
      type: 'image',
      image: '/local/room.jpg',
      tap_action: { action: 'none' },
    });
    mockConfig = {
      area: 'living_room',
      background: { options: ['icon_background'] },
    };

    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        icon
        .hass=${mockHass}
        .config=${mockConfig}
      ></room-background-image>`,
    );

    expect(el.shadowRoot?.querySelector('hui-image')).to.exist;
    expect(el.shadowRoot?.querySelector('.overlay')).to.exist;
    expect(el.shadowRoot?.querySelector('.color')).to.not.exist;
  });

  it('skips the gradient overlay when hide_gradient is set', async () => {
    backgroundToHuiConfigStub.returns({
      type: 'image',
      image: '/local/room.jpg',
      tap_action: { action: 'none' },
    });
    mockConfig = {
      area: 'living_room',
      background: { options: ['hide_gradient'] },
    };

    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        .hass=${mockHass}
        .config=${mockConfig}
      ></room-background-image>`,
    );

    expect(el.shadowRoot?.querySelector('hui-image')).to.exist;
    expect(el.shadowRoot?.querySelector('.overlay')).to.not.exist;
  });

  it('skips the gradient overlay in icon placement when hide_gradient is set', async () => {
    backgroundToHuiConfigStub.returns({
      type: 'image',
      image: '/local/room.jpg',
      tap_action: { action: 'none' },
    });
    mockConfig = {
      area: 'living_room',
      background: { options: ['icon_background', 'hide_gradient'] },
    };

    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        icon
        .hass=${mockHass}
        .config=${mockConfig}
      ></room-background-image>`,
    );

    expect(el.shadowRoot?.querySelector('hui-image')).to.exist;
    expect(el.shadowRoot?.querySelector('.overlay')).to.not.exist;
  });

  it('renders nothing in icon placement when no background is mapped', async () => {
    backgroundToHuiConfigStub.returns(undefined);

    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        icon
        .hass=${mockHass}
        .config=${mockConfig}
      ></room-background-image>`,
    );

    expect(el.shadowRoot?.querySelector('hui-image')).to.not.exist;
    expect(el.shadowRoot?.querySelector('.color')).to.not.exist;
  });

  it('renders hui-image with a plain image source', async () => {
    backgroundToHuiConfigStub.returns({
      type: 'image',
      image: '/local/room.jpg',
      tap_action: { action: 'none' },
    });

    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        .hass=${mockHass}
        .config=${mockConfig}
      ></room-background-image>`,
    );

    const huiImage = el.shadowRoot?.querySelector('hui-image') as any;
    expect(huiImage).to.exist;
    expect(huiImage.image).to.equal('/local/room.jpg');
    expect(huiImage.hass).to.equal(mockHass);
    expect(el.shadowRoot?.querySelector('.overlay')).to.exist;
  });

  it('unwraps a media source object to its media_content_id', async () => {
    backgroundToHuiConfigStub.returns({
      type: 'image',
      image: {
        media_content_id: 'media-source://image/foo',
        media_content_type: 'image/jpeg',
      },
      tap_action: { action: 'none' },
    });

    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        .hass=${mockHass}
        .config=${mockConfig}
      ></room-background-image>`,
    );

    const huiImage = el.shadowRoot?.querySelector('hui-image') as any;
    expect(huiImage.image).to.equal('media-source://image/foo');
  });

  it('passes camera_image and camera_view through to hui-image', async () => {
    backgroundToHuiConfigStub.returns({
      type: 'image',
      camera_image: 'camera.front_door',
      camera_view: 'auto',
      tap_action: { action: 'none' },
    });

    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        .hass=${mockHass}
        .config=${mockConfig}
      ></room-background-image>`,
    );

    const huiImage = el.shadowRoot?.querySelector('hui-image') as any;
    expect(huiImage.cameraImage).to.equal('camera.front_door');
    expect(huiImage.cameraView).to.equal('auto');
  });

  it('passes image_entity through to hui-image as entity', async () => {
    backgroundToHuiConfigStub.returns({
      type: 'image',
      image_entity: 'image.floorplan',
      tap_action: { action: 'none' },
    });

    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        .hass=${mockHass}
        .config=${mockConfig}
      ></room-background-image>`,
    );

    const huiImage = el.shadowRoot?.querySelector('hui-image') as any;
    expect(huiImage.entity).to.equal('image.floorplan');
  });
});
