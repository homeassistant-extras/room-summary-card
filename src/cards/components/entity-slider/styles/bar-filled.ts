import { css } from 'lit';

/**
 * Bar-filled slider style - outlined bar with proportional fill based on brightness level
 * The icon is hidden and the entire bar is draggable
 * The fill color matches the light's color and fills from bottom to top proportionally
 */
export const barFilledStyle = css`
  /* Outlined container - transparent fill with border */
  :host([slider='bar-filled'])::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    background: transparent;
    border: 2px solid rgba(0, 0, 0, 0.2);
    border-radius: 100px;
  }

  /* Proportional fill that grows from bottom to top based on brightness */
  :host([slider='bar-filled'])::after {
    content: '';
    position: absolute;
    top: var(--slider-position, 100%);
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    background: var(--slider-bar-color, var(--primary-color));
    border-radius: 0 0 100px 100px;
    transition: top 0.1s ease;
    pointer-events: none;
  }

  :host([slider='bar-filled']) {
    height: 90%;
    cursor: grab;
    /* Clip to pill shape matching the bar (60% wide centered = 20% inset each side) */
    clip-path: inset(0 20% round 100px);
  }
`;
