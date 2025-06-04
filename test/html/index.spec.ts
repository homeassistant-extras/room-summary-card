import areaStatisticsSpec from './area-statistics.spec';
import iconSpec from './icon.spec';
import infoSpec from './info.spec';
import textSpec from './sensors.spec';
import stateDisplaySpec from './state-display.spec';

describe('html', () => {
  areaStatisticsSpec();
  iconSpec();
  infoSpec();
  stateDisplaySpec();
  textSpec();
});
