import { RoomBadgeLabel } from '@cards/components/badge/badge-label';
import type { HomeAssistant } from '@hass/types';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { html, nothing } from 'lit';
import { restore, stub } from 'sinon';

describe('badge-label.ts', () => {
  afterEach(() => {
    restore();
  });

  it('should render plain badge label text', async () => {
    const element = new RoomBadgeLabel();
    element.label = '72F';

    const result = element.render();
    const el = await fixture(html`<span>${result}</span>`);

    expect(el.textContent).to.equal('72F');
  });

  it('should render nothing when no label is configured', () => {
    const element = new RoomBadgeLabel();

    expect(element.render()).to.equal(nothing);
  });

  it('should sync template labels using the badge entity context', () => {
    const element = new RoomBadgeLabel();
    const hass = { connection: {} } as HomeAssistant;
    const labelTemplateConn = (element as any)._labelTemplateConn;
    const syncStub = stub(labelTemplateConn, 'sync').callsFake(() => {
      labelTemplateConn._displayedText = '72F';
    });

    element.hass = hass;
    element.entityId = 'sensor.temperature';
    element.label = '{{ states("sensor.temperature") }}';
    const result = element.render();

    expect(result).to.not.equal(nothing);
    expect(
      syncStub.calledWith(
        hass,
        'sensor.temperature',
        '{{ states("sensor.temperature") }}',
      ),
    ).to.be.true;
  });
});
