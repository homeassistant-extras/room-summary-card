import commonSpec from './common/index.spec';
import dataSpec from './data/index.spec';
import actionHandlerDirectiveSpec from './panels/lovelace/common/directives/action-handler-directive.spec';

describe('hass', () => {
  commonSpec();

  dataSpec();

  describe('panels', () => {
    describe('lovelace', () => {
      describe('common', () => {
        describe('directives', () => {
          actionHandlerDirectiveSpec();
        });
      });
    });
  });
});
