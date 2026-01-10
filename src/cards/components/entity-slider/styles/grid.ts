import { css } from 'lit';

/**
 * Grid slider style - grid pattern with horizontal lines for precise visual feedback
 */
export const gridStyle = css`
  :host([slider='grid'])::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0%,
      transparent calc(25% - 1px),
      rgba(0, 0, 0, 0.15) calc(25% - 1px),
      rgba(0, 0, 0, 0.15) calc(25% + 1px),
      transparent calc(25% + 1px)
    );
  }
`;
