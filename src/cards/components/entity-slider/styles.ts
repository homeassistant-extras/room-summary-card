import { css } from 'lit';

/**
 * Entity slider styles for single entity icon display
 * Includes positioning, dragging functionality, and entity-specific styles
 */
export const styles = css`
  :host {
    position: relative;
    aspect-ratio: 0.23 / 1;
    height: 80%;
    margin: auto 0;
    display: flex;
    justify-content: center;
  }

  /* Sunken track/well that the icon slides along */
  :host([slider='track'])::before {
    content: '';
    position: absolute;
    top: -12%;
    bottom: -12%;
    left: 50%;
    transform: translateX(-50%);
    width: 50%;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 100px;
    box-shadow:
      inset 0 2px 4px rgba(0, 0, 0, 0.3),
      inset 0 -1px 2px rgba(255, 255, 255, 0.1);
    z-index: 0;
  }

  /* Thin line slider */
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
    z-index: 0;
  }

  /* Filled/Progress bar - shows brightness level */
  :host([slider='filled'])::before {
    content: '';
    position: absolute;
    top: var(--slider-position, 50%);
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 50%;
    background: rgba(var(--rgb-primary-color, 0, 0, 0), 0.2);
    border-radius: 100px;
    z-index: 0;
    transition: top 0.1s ease;
  }

  /* Gradient line */
  :host([slider='gradient'])::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 3px;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.5),
      rgba(0, 0, 0, 0.3)
    );
    border-radius: 3px;
    z-index: 0;
  }

  /* Dual rail - two parallel lines */
  :host([slider='dual-rail'])::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 12px;
    background: linear-gradient(
      to right,
      rgba(0, 0, 0, 0.2) 0%,
      rgba(0, 0, 0, 0.2) 2px,
      transparent 2px,
      transparent 10px,
      rgba(0, 0, 0, 0.2) 10px,
      rgba(0, 0, 0, 0.2) 12px
    );
    z-index: 0;
  }

  /* Dots/Ticks at regular intervals */
  :host([slider='dots'])::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0%,
      transparent calc(25% - 3px),
      rgba(0, 0, 0, 0.3) calc(25% - 3px),
      rgba(0, 0, 0, 0.3) calc(25% + 3px),
      transparent calc(25% + 3px)
    );
    border-radius: 4px;
    z-index: 0;
  }

  /* Notched track with indents */
  :host([slider='notched'])::before {
    content: '';
    position: absolute;
    top: -12%;
    bottom: -12%;
    left: 50%;
    transform: translateX(-50%);
    width: 50%;
    background: repeating-linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.15) 0%,
      rgba(0, 0, 0, 0.15) 10%,
      rgba(0, 0, 0, 0.25) 10%,
      rgba(0, 0, 0, 0.25) 12%,
      rgba(0, 0, 0, 0.15) 12%
    );
    border-radius: 100px;
    z-index: 0;
  }

  /* Grid with horizontal lines */
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
    z-index: 0;
  }

  /* Glow line with blur effect */
  :host([slider='glow'])::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 3px;
    background: rgba(var(--rgb-primary-color, 66, 133, 244), 0.4);
    border-radius: 3px;
    box-shadow:
      0 0 8px rgba(var(--rgb-primary-color, 66, 133, 244), 0.6),
      0 0 12px rgba(var(--rgb-primary-color, 66, 133, 244), 0.3);
    z-index: 0;
  }

  /* Shadow trail that follows icon position */
  :host([slider='shadow-trail'])::after {
    content: '';
    position: absolute;
    top: var(--slider-position, 50%);
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 40px;
    background: radial-gradient(
      ellipse at center,
      rgba(0, 0, 0, 0.15) 0%,
      transparent 70%
    );
    z-index: 0;
    transition: top 0.1s ease;
    pointer-events: none;
  }

  /* Outlined track */
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
    z-index: 0;
  }

  .icon-container {
    width: 100%;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    cursor: grab;
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
    transition: opacity 0.2s ease;
    z-index: 1;
  }

  .icon-container.dragging {
    cursor: grabbing;
    opacity: 0.8;
    transition: none;
  }
`;
