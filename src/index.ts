import { RoomSummaryCard } from './card';

// Register our custom card
customElements.define('room-summary-card', RoomSummaryCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'room-summary-card',
  name: 'Room Summary Card',
  description:
    'A card to summarize the status of a room, including temperature, humidity, and any problem entities.',
});
