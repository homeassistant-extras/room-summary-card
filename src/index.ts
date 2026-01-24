/**
 * Room Summary Card Registration Module
 *
 * This module handles the registration of the Room Summary Card custom element
 * with the browser and Home Assistant's custom card registry. It makes the
 * component available for use in Home Assistant dashboards.
 */

import { RoomSummaryCard } from '@cards/card';
import { Badge } from '@cards/components/badge/badge';
import { RoomSummaryBadgeRowEditor } from '@cards/components/editor/badge-row-editor';
import { RoomSummaryEntitiesRowEditor } from '@cards/components/editor/entities-row-editor';
import { RoomSummaryEntityDetailEditor } from '@cards/components/editor/entity-detail-editor';
import { RoomSummaryStatesRowEditor } from '@cards/components/editor/states-row-editor';
import { RoomSummarySubElementEditor } from '@cards/components/editor/sub-element-editor';
import { RoomSummaryThresholdsRowEditor } from '@cards/components/editor/thresholds-row-editor';
import { EntityCollection } from '@cards/components/entity-collection/entity-collection';
import { EntitySlider } from '@cards/components/entity-slider/entity-slider';
import { RoomStateIcon } from '@cards/components/room-state-icon/room-state-icon';
import { SensorCollection } from '@cards/components/sensor-collection/sensor-collection';
import { RoomSummaryCardEditor } from '@cards/editor';
import { version } from '../package.json';

declare global {
  // eslint-disable-next-line no-var
  var customCards: Array<{
    type: string;
    name: string;
    description: string;
    preview: boolean;
    documentationURL: string;
  }>;
}

// Register the custom element with the browser
customElements.define('room-summary-card', RoomSummaryCard);
customElements.define('room-summary-card-editor', RoomSummaryCardEditor);
customElements.define('sensor-collection', SensorCollection);
customElements.define('entity-collection', EntityCollection);
customElements.define('entity-slider', EntitySlider);
customElements.define('room-state-icon', RoomStateIcon);
customElements.define('room-badge', Badge);
customElements.define(
  'room-summary-entity-detail-editor',
  RoomSummaryEntityDetailEditor,
);
customElements.define(
  'room-summary-entities-row-editor',
  RoomSummaryEntitiesRowEditor,
);
customElements.define(
  'room-summary-states-row-editor',
  RoomSummaryStatesRowEditor,
);
customElements.define(
  'room-summary-thresholds-row-editor',
  RoomSummaryThresholdsRowEditor,
);
customElements.define(
  'room-summary-badge-row-editor',
  RoomSummaryBadgeRowEditor,
);
customElements.define(
  'room-summary-sub-element-editor',
  RoomSummarySubElementEditor,
);

// Ensure the customCards array exists on the window object
globalThis.customCards = globalThis.customCards || [];

// Register the card with Home Assistant's custom card registry
globalThis.customCards.push({
  // Unique identifier for the card type
  type: 'room-summary-card',

  // Display name in the UI
  name: 'Room Summary',

  // Card description for the UI
  description:
    'A card to summarize the status of a room, including temperature, humidity, and any problem entities.',

  // Show a preview of the card in the UI
  preview: true,

  // URL for the card's documentation
  documentationURL: 'https://github.com/homeassistant-extras/room-summary-card',
});

console.info(
  `%c🐱 Poat's Tools: room-summary-card - ${version}`,
  'color: #CFC493;',
);
