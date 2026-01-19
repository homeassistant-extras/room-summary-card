import { css } from 'lit';

/**
 * Badge component styles
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

  :host([position='top-right']) {
    top: -5%;
    right: -5%;
  }

  :host([position='top-left']) {
    top: -5%;
    left: -5%;
  }

  :host([position='bottom-right']) {
    bottom: -5%;
    right: -5%;
  }

  :host([position='bottom-left']) {
    bottom: -5%;
    left: -5%;
  }
`;
