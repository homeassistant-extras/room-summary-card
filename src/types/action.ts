/**
 * Action configuration for navigation events.
 */
export interface NavigateActionConfig extends BaseActionConfig {
  action: 'navigate';
  /** Path to navigate to when action is triggered */
  navigation_path: string;
}

/**
 * Action configuration for toggle events.
 */
export interface ToggleActionConfig extends BaseActionConfig {
  action: 'toggle';
}

/**
 * Action configuration for displaying more information.
 */
export interface MoreInfoActionConfig extends BaseActionConfig {
  action: 'more-info';
}

/**
 * Action configuration for no-operation events.
 */
export interface NoActionConfig extends BaseActionConfig {
  action: 'none';
}

/**
 * Base configuration for all action types.
 */
export interface BaseActionConfig {
  action: string;
}

/**
 * Union type of all possible action configurations.
 */
export type ActionConfig =
  | ToggleActionConfig
  | NavigateActionConfig
  | NoActionConfig
  | MoreInfoActionConfig;

/**
 * Parameters for configuring entity actions.
 */
export type ActionConfigParams = {
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
};

export type ActionParams = { config: ActionConfigParams; action: string };
