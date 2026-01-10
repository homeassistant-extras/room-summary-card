import { css } from 'lit';

/**
 * Bar slider style - bar filled with light color, with a black line indicator
 * The icon is hidden and the entire bar is draggable
 */
export const barStyle = css`
  /* Bar filled with light color - gradient from darker bottom to lighter top */
  :host([slider='bar'])::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    background:
      linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent),
      var(--slider-bar-color, var(--primary-color));
    border: 2px solid rgba(0, 0, 0, 0.2);
    border-radius: 100px;
    opacity: 0.8;
  }

  /* Black line indicator that moves up and down */
  :host([slider='bar'])::after {
    content: '';
    position: absolute;
    /* Clamp so 8px indicator stays fully visible (4px from each edge) */
    top: clamp(4px, var(--slider-position, 100%), calc(100% - 4px));
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    height: 8px;
    background: rgba(0, 0, 0, 0.9);
    border-radius: 1.5px;
    transition: top 0.1s ease;
    pointer-events: none;
  }

  :host([slider='bar']) {
    height: 90%;
    cursor: grab;
    /* Clip to pill shape matching the bar (60% wide centered = 20% inset each side) */
    clip-path: inset(0 20% round 100px);
  }
`;
