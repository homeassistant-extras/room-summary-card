import { RoomBackgroundImage } from '@cards/components/room-background-image/room-background-image';
import { styles } from '@cards/components/room-background-image/styles';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import { fixture } from '@open-wc/testing-helpers';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { html } from 'lit';

const mockHass = {
  states: {},
  areas: {},
} as any as HomeAssistant;

const entityWithPicture = (features: string[] = []) =>
  ({
    config: { entity_id: 'person.gina', features },
    state: {
      entity_id: 'person.gina',
      state: 'home',
      attributes: { entity_picture: '/api/image/serve/abc/512x512' },
      domain: 'person',
    },
  }) as any;

describe('room-background-image.ts', () => {
  it('should be registered as a custom element', () => {
    expect(customElements.get('room-background-image')).to.equal(
      RoomBackgroundImage,
    );
  });

  it('should expose shared static styles', () => {
    expect(RoomBackgroundImage.styles).to.equal(styles);
  });

  it('should render the color layer', async () => {
    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image></room-background-image>`,
    );
    expect(el.shadowRoot!.querySelector('.color')).to.exist;
  });

  it('should not render the image layer without an image source', async () => {
    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        .hass=${mockHass}
        .config=${{ area: 'test' } as Config}
      ></room-background-image>`,
    );
    expect(el.shadowRoot!.querySelector('.image')).to.not.exist;
    expect(el.hasAttribute('image')).to.be.false;
  });

  it('should not render the card image layer in icon_background mode', async () => {
    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        .hass=${mockHass}
        .config=${{
          area: 'test',
          background: {
            image: '/local/bg.jpg',
            options: ['icon_background'],
          },
        } as Config}
      ></room-background-image>`,
    );
    expect(el.shadowRoot!.querySelector('.image')).to.not.exist;
    expect(el.hasAttribute('image')).to.be.false;
  });

  it('should not render the icon image layer when the card owns the background', async () => {
    // No icon_background option and no entity picture: the card layer
    // shows the image, the (main) icon shows nothing.
    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        icon
        .room=${true}
        .hass=${mockHass}
        .config=${{
          area: 'test',
          background: { image: '/local/bg.jpg' },
        } as Config}
      ></room-background-image>`,
    );
    expect(el.shadowRoot!.querySelector('.image')).to.not.exist;
    expect(el.hasAttribute('image')).to.be.false;
  });

  it('should render the mapped background in the main icon in icon_background mode', async () => {
    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        icon
        .room=${true}
        .hass=${mockHass}
        .config=${{
          area: 'test',
          background: {
            image: '/local/bg.jpg',
            options: ['icon_background'],
          },
        } as Config}
      ></room-background-image>`,
    );
    expect(el.hasAttribute('image')).to.be.true;
    const huiImage = el.shadowRoot!.querySelector('hui-image') as any;
    expect(huiImage.image).to.equal('/local/bg.jpg');
  });

  it('should not render the mapped background in non-room icons in icon_background mode', async () => {
    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        icon
        .hass=${mockHass}
        .config=${{
          area: 'test',
          background: {
            image: '/local/bg.jpg',
            options: ['icon_background'],
          },
        } as Config}
      ></room-background-image>`,
    );
    expect(el.shadowRoot!.querySelector('.image')).to.not.exist;
    expect(el.hasAttribute('image')).to.be.false;
  });

  it('should reflect icon-bg on the card layer in icon_background mode', async () => {
    // Drives CSS that keeps the user-configured opacity off the card
    // color layer when it belongs to the icon instead.
    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        .hass=${mockHass}
        .config=${{
          area: 'test',
          background: {
            image: '/local/bg.jpg',
            options: ['icon_background'],
          },
        } as Config}
      ></room-background-image>`,
    );
    expect(el.hasAttribute('icon-bg')).to.be.true;
  });

  it('should not reflect icon-bg without the option or in icon placement', async () => {
    const card = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        .hass=${mockHass}
        .config=${{
          area: 'test',
          background: { image: '/local/bg.jpg' },
        } as Config}
      ></room-background-image>`,
    );
    expect(card.hasAttribute('icon-bg')).to.be.false;

    const icon = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        icon
        .room=${true}
        .hass=${mockHass}
        .config=${{
          area: 'test',
          background: {
            image: '/local/bg.jpg',
            options: ['icon_background'],
          },
        } as Config}
      ></room-background-image>`,
    );
    expect(icon.hasAttribute('icon-bg')).to.be.false;
  });

  it('should render hui-image above the color layer for a configured background', async () => {
    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        .hass=${mockHass}
        .config=${{
          area: 'test',
          background: { image: '/local/bg.jpg' },
        } as Config}
      ></room-background-image>`,
    );
    expect(el.hasAttribute('image')).to.be.true;
    const image = el.shadowRoot!.querySelector('.image');
    expect(image).to.exist;
    // color paints below the image in DOM order
    expect(image!.previousElementSibling?.className).to.equal('color');

    const huiImage = image!.querySelector('hui-image') as any;
    expect(huiImage).to.exist;
    expect(huiImage.image).to.equal('/local/bg.jpg');
    expect(huiImage.fitMode).to.equal('cover');
  });

  it('should map a camera image_entity to hui-image camera properties', async () => {
    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        .hass=${mockHass}
        .config=${{
          area: 'test',
          background: { image_entity: 'camera.front_door' },
        } as Config}
      ></room-background-image>`,
    );
    const huiImage = el.shadowRoot!.querySelector('hui-image') as any;
    expect(huiImage).to.exist;
    expect(huiImage.image).to.be.undefined;
    expect(huiImage.cameraImage).to.equal('camera.front_door');
    expect(huiImage.cameraView).to.equal('auto');
  });

  it('should prefer the entity picture over the mapped background config', async () => {
    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        icon
        .entity=${entityWithPicture()}
        .hass=${mockHass}
        .config=${{
          area: 'test',
          background: { image: '/local/bg.jpg' },
        } as Config}
      ></room-background-image>`,
    );
    const huiImage = el.shadowRoot!.querySelector('hui-image') as any;
    expect(huiImage.image).to.equal('/api/image/serve/abc/512x512');
  });

  it('should render the image layer from the entity picture alone', async () => {
    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        icon
        .entity=${entityWithPicture()}
      ></room-background-image>`,
    );
    expect(el.shadowRoot!.querySelector('.image hui-image')).to.exist;
    expect(el.hasAttribute('image')).to.be.true;
  });

  it('should ignore the entity picture when use_entity_icon is enabled', async () => {
    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        icon
        .entity=${entityWithPicture(['use_entity_icon'])}
      ></room-background-image>`,
    );
    expect(el.shadowRoot!.querySelector('.image')).to.not.exist;
    expect(el.hasAttribute('image')).to.be.false;
  });

  it('should ignore the entity picture in card placement', async () => {
    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image
        .entity=${entityWithPicture()}
        .hass=${mockHass}
        .config=${{ area: 'test' } as Config}
      ></room-background-image>`,
    );
    expect(el.shadowRoot!.querySelector('.image')).to.not.exist;
    expect(el.hasAttribute('image')).to.be.false;
  });

  it('should default to card placement (no icon attribute)', async () => {
    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image></room-background-image>`,
    );
    expect(el.icon).to.be.false;
    expect(el.hasAttribute('icon')).to.be.false;
  });

  it('should reflect the icon attribute for icon-placement styling', async () => {
    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image icon></room-background-image>`,
    );
    expect(el.icon).to.be.true;
    expect(el.hasAttribute('icon')).to.be.true;
  });
});
