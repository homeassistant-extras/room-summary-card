import cardSpec from './card.spec';
import entityCollectionSpec from './components/entity-collection.spec';
import sensorCollectionSpec from './components/sensor-collection.spec';
import editorSpec from './editor.spec';

describe('cards', () => {
  describe('components', () => {
    entityCollectionSpec();
    sensorCollectionSpec();
  });

  cardSpec();
  editorSpec();
});
