/**
 * https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace/config/action.ts
 */

export interface ToggleActionConfig extends BaseActionConfig {
  action: 'toggle';
}

export interface NavigateActionConfig extends BaseActionConfig {
  action: 'navigate';
  navigation_path: string;
  navigation_replace?: boolean;
}

export interface MoreInfoActionConfig extends BaseActionConfig {
  action: 'more-info';
}

export interface NoActionConfig extends BaseActionConfig {
  action: 'none';
}

export interface BaseActionConfig {
  action: string;
}

export type ActionConfig =
  | ToggleActionConfig
  | NavigateActionConfig
  | NoActionConfig
  | MoreInfoActionConfig;
