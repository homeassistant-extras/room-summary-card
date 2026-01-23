import { ProblemDialog } from '@cards/components/problem/dialog/problem-dialog';
import * as fireEventModule from '@hass/common/dom/fire_event';
import type { HomeAssistant } from '@hass/types';
import { fixture } from '@open-wc/testing-helpers';
import { createStateEntity } from '@test/test-helpers';
import type { EntityState } from '@type/room';
import { expect } from 'chai';
import { nothing } from 'lit';
import { restore, stub, type SinonStub } from 'sinon';

describe('problem-dialog.ts', () => {
  let element: ProblemDialog;
  let mockHass: HomeAssistant;
  let fireEventStub: SinonStub;

  const mockProblemEntities: EntityState[] = [
    createStateEntity('binary_sensor', 'problem1', 'on', {}),
    createStateEntity('binary_sensor', 'problem2', 'on', {}),
  ];

  beforeEach(() => {
    fireEventStub = stub(fireEventModule, 'fireEvent');

    mockHass = {
      localize: (key: string) => key,
      language: 'en',
    } as any as HomeAssistant;

    element = new ProblemDialog();
    element.hass = mockHass;
  });

  afterEach(() => {
    restore();
  });

  describe('showDialog', () => {
    it('should set problemEntities and open dialog', () => {
      element.showDialog({ entities: mockProblemEntities });

      expect(element.problemEntities).to.deep.equal(mockProblemEntities);
      expect(element['_opened']).to.be.true;
    });
  });

  describe('closeDialog', () => {
    it('should close dialog and return true', () => {
      element['_opened'] = true;
      const result = element.closeDialog();

      expect(element['_opened']).to.be.false;
      expect(result).to.be.true;
    });
  });

  describe('render', () => {
    it('should return nothing when hass is not set', () => {
      element.hass = undefined as any;
      element.problemEntities = mockProblemEntities;

      const result = element.render();
      expect(result).to.equal(nothing);
    });

    it('should return nothing when problemEntities is empty', () => {
      element.hass = mockHass;
      element.problemEntities = [];

      const result = element.render();
      expect(result).to.equal(nothing);
    });

    it('should render dialog and problem-entity-list with entities', async () => {
      element.hass = mockHass;
      element.problemEntities = mockProblemEntities;
      element['_opened'] = true;

      const result = element.render();
      const el = await fixture(result as any);
      const entityList = el.querySelector('problem-entity-list');

      expect(entityList).to.exist;
      expect((entityList as any).entities).to.deep.equal(mockProblemEntities);
    });
  });

  describe('_dialogClosed', () => {
    it('should close dialog and fire dialog-closed event', () => {
      element['_opened'] = true;
      element['_dialogClosed']();

      expect(element['_opened']).to.be.false;
      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[0]).to.equal(element);
      expect(fireEventStub.firstCall.args[1]).to.equal('dialog-closed');
    });
  });
});
