/**
 * https://github.com/home-assistant/frontend/blob/dev/src/data/icon.ts
 */

export const FALLBACK_DOMAIN_ICONS = {
  air_quality: 'mdi:air-filter',
  alert: 'mdi:alert',
  automation: 'mdi:robot',
  calendar: 'mdi:calendar',
  climate: 'mdi:thermostat',
  configurator: 'mdi:cog',
  conversation: 'mdi:forum-outline',
  counter: 'mdi:counter',
  date: 'mdi:calendar',
  datetime: 'mdi:calendar-clock',
  demo: 'mdi:home-assistant',
  device_tracker: 'mdi:account',
  google_assistant: 'mdi:google-assistant',
  group: 'mdi:google-circles-communities',
  homeassistant: 'mdi:home-assistant',
  homekit: 'mdi:home-automation',
  image_processing: 'mdi:image-filter-frames',
  image: 'mdi:image',
  input_boolean: 'mdi:toggle-switch',
  input_button: 'mdi:button-pointer',
  input_datetime: 'mdi:calendar-clock',
  input_number: 'mdi:ray-vertex',
  input_select: 'mdi:format-list-bulleted',
  input_text: 'mdi:form-textbox',
  lawn_mower: 'mdi:robot-mower',
  light: 'mdi:lightbulb',
  notify: 'mdi:comment-alert',
  number: 'mdi:ray-vertex',
  persistent_notification: 'mdi:bell',
  person: 'mdi:account',
  plant: 'mdi:flower',
  proximity: 'mdi:apple-safari',
  remote: 'mdi:remote',
  scene: 'mdi:palette',
  schedule: 'mdi:calendar-clock',
  script: 'mdi:script-text',
  select: 'mdi:format-list-bulleted',
  sensor: 'mdi:eye',
  simple_alarm: 'mdi:bell',
  siren: 'mdi:bullhorn',
  stt: 'mdi:microphone-message',
  sun: 'mdi:white-balance-sunny',
  text: 'mdi:form-textbox',
  time: 'mdi:clock',
  timer: 'mdi:timer-outline',
  todo: 'mdi:clipboard-list',
  tts: 'mdi:speaker-message',
  vacuum: 'mdi:robot-vacuum',
  wake_word: 'mdi:chat-sleep',
  weather: 'mdi:weather-partly-cloudy',
  zone: 'mdi:map-marker-radius',
};

type PlatformIcons = Record<
  string,
  {
    state: Record<string, string>;
    range?: Record<string, string>;
    state_attributes: Record<
      string,
      {
        state: Record<string, string>;
        range?: Record<string, string>;
        default: string;
      }
    >;
    default: string;
  }
>;

export type ComponentIcons = Record<
  string,
  {
    state?: Record<string, string>;
    range?: Record<string, string>;
    state_attributes?: Record<
      string,
      {
        state: Record<string, string>;
        range?: Record<string, string>;
        default: string;
      }
    >;
    default: string;
  }
>;

type ServiceIcons = Record<
  string,
  { service: string; sections?: Record<string, string> }
>;

export interface IconResources<
  T extends ComponentIcons | PlatformIcons | ServiceIcons,
> {
  resources: Record<string, T>;
}

export interface CategoryType {
  entity: PlatformIcons;
  entity_component: ComponentIcons;
  services: ServiceIcons;
}
