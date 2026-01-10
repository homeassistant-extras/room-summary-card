import { css } from 'lit';

/**
 * Line slider style - thin vertical line for a subtle appearance
 */
export const lineStyle = css`
  :host([slider='line'])::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
`;
