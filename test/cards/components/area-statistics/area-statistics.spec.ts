import { AreaStatistics } from '@cards/components/area-statistics/area-statistics';
import { styles } from '@cards/components/area-statistics/styles';
import type { DeviceRegistryEntry } from '@hass/data/device_registry';
import type { EntityRegistryDisplayEntry } from '@hass/data/entity_registry';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import { fixture } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';

describe('area-statistics.ts', () => {
  const areaId = 'living_room';

  function hassForArea(): HomeAssistant {
    return {
      devices: {
        dev_in_area: {
          area_id: areaId,
          id: 'dev_in_area',
          name: 'In area',
          name_by_user: null,
        } as DeviceRegistryEntry,
        dev_other: {
          area_id: 'other_room',
          id: 'dev_other',
          name: 'Other',
          name_by_user: null,
        } as DeviceRegistryEntry,
      },
      entities: {
        'light.in_area': {
          entity_id: 'light.in_area',
          area_id: areaId,
          device_id: '',
          labels: [],
        } as EntityRegistryDisplayEntry,
        'sensor.via_device': {
          entity_id: 'sensor.via_device',
          area_id: 'other_room',
          device_id: 'dev_in_area',
          labels: [],
        } as EntityRegistryDisplayEntry,
        'switch.excluded': {
          entity_id: 'switch.excluded',
          area_id: 'other_room',
          device_id: 'dev_other',
          labels: [],
        } as EntityRegistryDisplayEntry,
      },
    } as unknown as HomeAssistant;
  }

  it('should expose shared static styles', () => {
    expect(AreaStatistics.styles).to.equal(styles);
  });

  it('should render nothing without hass', () => {
    const el = new AreaStatistics();
    el.hass = undefined as unknown as HomeAssistant;
    el.config = { area: areaId } as Config;

    expect(el.render()).to.equal(nothing);
  });

  it('should render nothing without config', () => {
    const el = new AreaStatistics();
    el.hass = hassForArea();
    el.config = undefined as unknown as Config;

    expect(el.render()).to.equal(nothing);
  });

  it('should render nothing when hide_area_stats is enabled', () => {
    const el = new AreaStatistics();
    el.hass = hassForArea();
    el.config = {
      area: areaId,
      features: ['hide_area_stats'],
    } as Config;

    expect(el.render()).to.equal(nothing);
  });

  it('should render a stats span with device and entity counts', async () => {
    const el = new AreaStatistics();
    el.hass = hassForArea();
    el.config = { area: areaId } as Config;

    const root = await fixture(el.render() as TemplateResult);
    const stats = root.matches('span.stats.text')
      ? root
      : root.querySelector('span.stats.text');

    expect(stats).to.exist;
    expect(stats?.textContent?.trim()).to.equal('1 devices 2 entities');
  });
});
