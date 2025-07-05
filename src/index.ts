/**
 * Room Summary Card Registration Module
 *
 * This module handles the registration of the Room Summary Card custom element
 * with the browser and Home Assistant's custom card registry. It makes the
 * component available for use in Home Assistant dashboards.
 */

import { RoomSummaryCard } from '@cards/card';
import { EntityCollection } from '@cards/components/entity-collection/entity-collection';
import { SensorCollection } from '@cards/components/sensor-collection/sensor-collection';
import { RoomSummaryCardEditor } from '@cards/editor';
import { version } from '../package.json';

// Register the custom element with the browser
customElements.define('room-summary-card', RoomSummaryCard);
customElements.define('room-summary-card-editor', RoomSummaryCardEditor);
customElements.define('sensor-collection', SensorCollection);
customElements.define('entity-collection', EntityCollection);

// Ensure the customCards array exists on the window object
window.customCards = window.customCards || [];

// Register the card with Home Assistant's custom card registry
window.customCards.push({
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
