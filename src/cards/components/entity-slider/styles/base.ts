import { css } from 'lit';

/**
 * Base styles for the entity slider component
 * Includes host positioning and container styles
 */
export const baseStyles = css`
  :host {
    position: relative;
    aspect-ratio: 0.23 / 1;
    height: 80%;
    margin: auto 0;
    display: flex;
    justify-content: center;
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

  .bar-container {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    cursor: grab;
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
    z-index: 1;
  }

  .bar-container.dragging {
    cursor: grabbing;
  }
`;
