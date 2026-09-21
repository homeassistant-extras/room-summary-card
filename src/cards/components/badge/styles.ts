import { css } from 'lit';

/**
 * Badge component styles
 *
 * Home Assistant's ha-tile-badge hardcodes a 16px circle and 12px icon
 * inside its shadow root. --user-badge-size scales that native badge
 * (default 16px). --user-badge-icon-size overrides the inner icon size
 * (default 12px). Transform origin follows the corner so larger badges
 * grow outward instead of covering more of the entity icon.
 */
export const styles = css`
  :host {
    position: absolute;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  ha-tile-badge {
    --mdc-icon-size: var(--user-badge-icon-size, 12px) !important;
    transform: scale(calc(var(--user-badge-size, 16px) / 16px));
  }

  :host([position='top-right']) {
    top: -5%;
    right: -5%;
  }

  :host([position='top-right']) ha-tile-badge {
    transform-origin: top right;
  }

  :host([position='top-left']) {
    top: -5%;
    left: -5%;
  }

  :host([position='top-left']) ha-tile-badge {
    transform-origin: top left;
  }

  :host([position='bottom-right']) {
    bottom: -5%;
    right: -5%;
  }

  :host([position='bottom-right']) ha-tile-badge {
    transform-origin: bottom right;
  }

  :host([position='bottom-left']) {
    bottom: -5%;
    left: -5%;
  }

  :host([position='bottom-left']) ha-tile-badge {
    transform-origin: bottom left;
  }
`;
