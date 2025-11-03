/**
 * Translation keys for the application.
 */
export type TranslationKey =
  | 'editor.area'
  | 'editor.area_name'
  | 'editor.area_side_entities'
  | 'editor.background'
  | 'editor.background_image'
  | 'editor.background_image_entity'
  | 'editor.background_opacity'
  | 'editor.bottom'
  | 'editor.card_border_color_occupied'
  | 'editor.card_styles'
  | 'editor.content'
  | 'editor.css_styles'
  | 'editor.default_in_label_area'
  | 'editor.disable_background_image'
  | 'editor.disable_card_border'
  | 'editor.disable_card_border_animations'
  | 'editor.disable_icon_animations'
  | 'editor.disable_icon_color'
  | 'editor.entities_container_styles'
  | 'editor.entity_icon_styles'
  | 'editor.equal'
  | 'editor.exclude_default_entities'
  | 'editor.features'
  | 'editor.greater_than'
  | 'editor.greater_than_or_equal'
  | 'editor.hide_area_stats'
  | 'editor.hide_icon_only'
  | 'editor.hide_room_icon'
  | 'editor.hide_sensor_icons'
  | 'editor.hide_sensor_labels'
  | 'editor.hide_sensors'
  | 'editor.humidity_entity'
  | 'editor.humidity_operator'
  | 'editor.humidity_threshold'
  | 'editor.icon_background'
  | 'editor.icon_background_color_occupied'
  | 'editor.ignore_entity'
  | 'editor.individual_sensor_entities'
  | 'editor.interactions'
  | 'editor.less_than'
  | 'editor.less_than_or_equal'
  | 'editor.light_entities'
  | 'editor.main_room_entity'
  | 'editor.mold_threshold'
  | 'editor.motion_occupancy_presence_sensors'
  | 'editor.multi_light_background'
  | 'editor.navigate_path'
  | 'editor.occupancy_options'
  | 'editor.occupancy_presence_detection'
  | 'editor.options'
  | 'editor.room_entity'
  | 'editor.sensor_classes'
  | 'editor.sensor_layout'
  | 'editor.sensor_styles'
  | 'editor.show_entity_labels'
  | 'editor.skip_card_background_styles'
  | 'editor.skip_climate_styles'
  | 'editor.stats_styles'
  | 'editor.styles'
  | 'editor.temperature_entity'
  | 'editor.temperature_operator'
  | 'editor.temperature_threshold'
  | 'editor.thresholds'
  | 'editor.title_styles'
  | 'editor.vertical_stack';

export interface Translation {
  /** The translation key */
  key: TranslationKey;

  /** The translation string */
  search: string;

  /** The string to replace the search string with */
  replace: string;
}
