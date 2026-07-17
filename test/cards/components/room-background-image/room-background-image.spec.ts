import { RoomBackgroundImage } from '@cards/components/room-background-image/room-background-image';
import { styles } from '@cards/components/room-background-image/styles';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { html } from 'lit';

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

  it('should not render the image layer without an image', async () => {
    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image></room-background-image>`,
    );
    expect(el.shadowRoot!.querySelector('.image')).to.not.exist;
  });

  it('should render the image layer above the color layer when image is set', async () => {
    const el = await fixture<RoomBackgroundImage>(
      html`<room-background-image .image=${true}></room-background-image>`,
    );
    const image = el.shadowRoot!.querySelector('.image');
    expect(image).to.exist;
    // color paints below the image in DOM order
    expect(image!.previousElementSibling?.className).to.equal('color');
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
