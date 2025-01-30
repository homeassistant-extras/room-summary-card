/**
 * @file General TypeScript type definitions
 * @description Core type definitions and action handlers.
 */

/**
 * Global window interface extension for custom cards.
 */
declare global {
  interface Window {
    customCards: Array<Object>;
  }
}

/**
 * Details for action handler events.
 */
export interface ActionHandlerDetail {
  action: 'hold' | 'tap' | 'double_tap';
}

/**
 * Generic Home Assistant DOM event interface.
 */
export interface HASSDomEvent<T> extends Event {
  detail: T;
}

export type ActionHandlerEvent = HASSDomEvent<ActionHandlerDetail>;

/**
 * Interface for action handler HTML elements.
 */
export interface ActionHandlerType extends HTMLElement {
  /** Time in milliseconds to wait before triggering a hold action */
  holdTime: number;
  /**
   * Binds action handling to an element
   * @param element - Element to bind actions to
   * @param options - Configuration options for the action handler
   */
  bind(element: Element, options?: ActionHandlerOptions): void;
}

/**
 * Interface for HTML elements that can handle actions.
 */
export interface ActionHandlerElement extends HTMLElement {
  actionHandler?: {
    options: ActionHandlerOptions;
    start?: (ev: Event) => void;
    end?: (ev: Event) => void;
    handleKeyDown?: (ev: KeyboardEvent) => void;
  };
}

/**
 * Configuration options for action handlers.
 */
export interface ActionHandlerOptions {
  /** Whether hold actions are enabled */
  hasHold?: boolean;
  /** Whether double-click actions are enabled */
  hasDoubleClick?: boolean;
  /** Whether the action handler is disabled */
  disabled?: boolean;
}