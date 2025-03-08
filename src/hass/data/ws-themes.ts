/**
 * https://github.com/home-assistant/frontend/blob/dev/src/data/ws-themes.ts
 */

export interface Themes {
  // Currently effective dark mode. Will never be undefined. If user selected "auto"
  // in theme picker, this property will still contain either true or false based on
  // what has been determined via system preferences and support from the selected theme.
  darkMode: boolean;
  // Currently globally active theme name
  theme: string;
}
