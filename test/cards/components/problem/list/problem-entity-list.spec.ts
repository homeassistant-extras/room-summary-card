import { ProblemEntityList } from '@cards/components/problem/list/problem-entity-list';
import type { HomeAssistant } from '@hass/types';
import { fixture } from '@open-wc/testing-helpers';
import { createStateEntity } from '@test/test-helpers';
import type { EntityState } from '@type/room';
import { expect } from 'chai';
import { nothing } from 'lit';

describe('problem-entity-list.ts', () => {
  let element: ProblemEntityList;
  let mockHass: HomeAssistant;

  const mockProblemEntities: EntityState[] = [
    createStateEntity('binary_sensor', 'problem1', 'on', {}),
    createStateEntity('binary_sensor', 'problem2', 'on', {}),
  ];

  beforeEach(() => {
    mockHass = {
      localize: (key: string) => key,
      language: 'en',
    } as any as HomeAssistant;

    element = new ProblemEntityList();
    element.hass = mockHass;
  });

  describe('render', () => {
    it('should return nothing when hass is not set', () => {
      element.hass = undefined as any;
      element.entities = mockProblemEntities;

      const result = element.render();
      expect(result).to.equal(nothing);
    });

    it('should render empty state when entities is empty', async () => {
      element.hass = mockHass;
      element.entities = [];

      const result = element.render();
      const el = await fixture(result as any);

      expect(el.classList.contains('empty-state')).to.be.true;
    });

    it('should render list with problem-entity-row components', async () => {
      element.hass = mockHass;
      element.entities = mockProblemEntities;

      const result = element.render();
      const el = await fixture(result as any);
      const rows = el.querySelectorAll('problem-entity-row');

      expect(el.classList.contains('problem-entity-list')).to.be.true;
      expect(rows.length).to.equal(2);
    });
  });
});
