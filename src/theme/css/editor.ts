import { css } from 'lit';

/**
 * Editor styles for the Room Summary Card editor
 * Includes tab bar, scroll indicators, form, and info header styles
 */
export const styles = css`
  .card-config {
    display: flex;
    flex-direction: column;
  }

  .tab-bar-wrapper {
    position: relative;
    border-bottom: 1px solid var(--divider-color);
  }

  .tab-bar-container {
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin; /* Firefox */
    -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  }

  /* Scroll hint gradients */
  .scroll-indicator {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 40px;
    pointer-events: none;
    z-index: 1;
    opacity: 0;
    transition: opacity 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .scroll-indicator.visible {
    opacity: 1;
  }

  .scroll-indicator-left {
    left: 0;
    background: linear-gradient(
      to right,
      var(--card-background-color, var(--primary-background-color)) 0%,
      transparent 100%
    );
  }

  .scroll-indicator-right {
    right: 0;
    background: linear-gradient(
      to left,
      var(--card-background-color, var(--primary-background-color)) 0%,
      transparent 100%
    );
  }

  .scroll-arrow {
    width: 20px;
    height: 20px;
    fill: var(--primary-text-color);
    opacity: 0.6;
    filter: drop-shadow(0 0 2px var(--card-background-color));
  }

  /* Custom scrollbar styling for Chrome, Safari and Opera */
  .tab-bar-container::-webkit-scrollbar {
    height: 4px;
  }

  .tab-bar-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .tab-bar-container::-webkit-scrollbar-thumb {
    background: var(--divider-color);
    border-radius: 2px;
  }

  .tab-bar-container::-webkit-scrollbar-thumb:hover {
    background: var(--secondary-text-color);
  }

  .custom-tab-bar {
    display: flex;
    min-width: min-content;
    gap: 0;
  }

  .custom-tab {
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--primary-text-color);
    cursor: pointer;
    font-family: var(
      --mdc-typography-button-font-family,
      var(--mdc-typography-font-family, Roboto, sans-serif)
    );
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.0892857143em;
    min-width: 72px;
    padding: 0 16px;
    text-transform: uppercase;
    transition:
      border-color 0.2s ease,
      color 0.2s ease;
    white-space: nowrap;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .custom-tab:hover {
    color: var(--primary-color);
  }

  .custom-tab.active {
    border-bottom-color: var(--primary-color);
    color: var(--primary-color);
  }

  .custom-tab:focus {
    outline: none;
  }

  .custom-tab:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
  }

  ha-form {
    padding: 16px 0;
  }

  .entities-tab {
    padding: 16px 0;
    gap: 16px;
    display: flex;
    flex-direction: column;
  }

  .info-header {
    padding: 16px;
    background-color: var(--info-background-color, rgba(33, 150, 243, 0.1));
    border-left: 4px solid var(--info-color, var(--primary-color));
    border-radius: 4px;
    color: var(--primary-text-color);
    font-size: 0.9em;
    line-height: 1.5;
  }

  ha-expansion-panel {
    margin-top: 10px;
    display: block;
    --expansion-panel-content-padding: 0;
    border-radius: var(--ha-border-radius-md);
    --ha-card-border-radius: var(--ha-border-radius-md);
  }

  .thresholds-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .thresholds-title {
    font-weight: 500;
  }

  .thresholds-section {
    padding: 16px 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .debug-panel {
    margin: 8px 0 0;
    --expansion-panel-summary-padding: 0 12px;
    --expansion-panel-content-padding: 0 12px;
    border-color: var(--warning-color, #ff9800);
  }

  .debug-panel-header {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    font-weight: 500;
    color: var(--warning-color, #ff9800);
  }

  .debug-panel-header ha-icon-button {
    margin-left: auto;
  }

  .debug-panel-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .debug-panel-hint {
    margin: 0;
    font-size: 0.85em;
    line-height: 1.4;
    color: var(--secondary-text-color);
  }

  .debug-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .debug-preset {
    appearance: none;
    margin: 0;
    padding: 6px 14px;
    border: 1px solid var(--divider-color);
    border-radius: var(--ha-border-radius-sm, 4px);
    background: var(--card-background-color, var(--primary-background-color));
    color: var(--primary-color);
    cursor: pointer;
    font: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.25;
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease,
      color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .debug-preset:hover {
    border-color: var(--primary-color);
    background: rgba(var(--rgb-primary-color), 0.12);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  }

  .debug-preset:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  .debug-preset.active {
    border-color: var(--primary-color);
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }

  .debug-preset.active:hover {
    filter: brightness(1.05);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .debug-yaml {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: var(--code-editor-background-color, rgba(0, 0, 0, 0.05));
    border-radius: var(--ha-border-radius-sm, 4px);
  }

  .debug-yaml code {
    font-family: var(--code-font-family, monospace);
    font-size: 0.8em;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .debug-copy-yaml {
    appearance: none;
    align-self: flex-start;
    margin: 0;
    padding: 0;
    border: none;
    background: none;
    color: var(--primary-color);
    cursor: pointer;
    font: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .debug-copy-yaml:hover {
    color: var(--light-primary-color, var(--primary-color));
    filter: brightness(1.15);
  }

  .debug-copy-yaml:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
    border-radius: 2px;
  }
`;
