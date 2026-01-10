import { css } from 'lit';

/**
 * Outlined slider style - outlined track border with transparent fill
 */
export const outlinedStyle = css`
  :host([slider='outlined'])::before {
    content: '';
    position: absolute;
    top: -12%;
    bottom: -12%;
    left: 50%;
    transform: translateX(-50%);
    width: 50%;
    background: transparent;
    border: 2px solid rgba(0, 0, 0, 0.2);
    border-radius: 100px;
  }
`;
