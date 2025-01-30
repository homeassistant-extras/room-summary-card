/**
 * Room Summary Card Registration Module
 *
 * This module handles the registration of the Room Summary Card custom element
 * with the browser and Home Assistant's custom card registry. It makes the
 * component available for use in Home Assistant dashboards.
 */

import { RoomSummaryCard } from './card';

// Register the custom element with the browser
customElements.define('room-summary-card', RoomSummaryCard);

// Ensure the customCards array exists on the window object
window.customCards = window.customCards || [];

// Register the card with Home Assistant's custom card registry
window.customCards.push({
  // Unique identifier for the card type
  type: 'room-summary-card',

  // Display name in the UI
  name: 'Room Summary Card',

  // Card description for the UI
  description:
    'A card to summarize the status of a room, including temperature, humidity, and any problem entities.',
});
