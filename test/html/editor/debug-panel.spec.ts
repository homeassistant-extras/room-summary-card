import { DEBUG_PRESETS } from '@editor/debug-constants';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import { renderDebugPanel } from '@html/editor/debug-panel';
import { fixture } from '@open-wc/testing-helpers';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('debug-panel.ts', () => {
  let mockHass: HomeAssistant;
  let mockConfig: Config;
  let onConfigChanged: sinon.SinonStub;
  let onClose: sinon.SinonStub;

  const render = (config: Config = mockConfig) =>
    fixture(
      renderDebugPanel({
        hass: mockHass,
        config,
        onConfigChanged,
        onClose,
      }) as TemplateResult,
    );

  beforeEach(() => {
    mockHass = {
      entities: {},
      devices: {},
      areas: {},
      states: {},
    } as any as HomeAssistant;

    mockConfig = { area: 'living_room' } as any as Config;

    onConfigChanged = stub();
    onClose = stub();
  });

  describe('render', () => {
    it('should render an expanded debug panel', async () => {
      const el = await render();

      expect(el).to.exist;
      expect(el.classList.contains('debug-panel')).to.be.true;
      expect(el.querySelector('.debug-panel-header')).to.exist;
      expect(el.querySelector('.debug-panel-body')).to.exist;
    });

    it('should render a button for every preset', async () => {
      const el = await render();
      const presets = el.querySelectorAll('.debug-preset');

      expect(presets).to.have.lengthOf(DEBUG_PRESETS.length);
      expect(
        Array.from(presets).map((button) => button.textContent?.trim()),
      ).to.deep.equal(DEBUG_PRESETS.map((preset) => preset.label));
    });

    it('should mark the matching preset active', async () => {
      const el = await render({ ...mockConfig, debug: {} } as Config);
      const active = el.querySelectorAll('.debug-preset.active');

      expect(active).to.have.lengthOf(1);
      expect(active[0]!.textContent?.trim()).to.equal('Everything');
      expect(active[0]!.getAttribute('aria-pressed')).to.equal('true');
    });

    it('should mark the "off" preset active when debug is absent', async () => {
      const el = await render();
      const active = el.querySelector('.debug-preset.active');

      expect(active?.textContent?.trim()).to.equal('Off');
    });

    it('should render ha-form with panel data and the debug schema', async () => {
      const el = await render({
        ...mockConfig,
        debug: { categories: ['render'], scope: ['badge'] },
      } as Config);
      const form = el.querySelector('ha-form') as any;

      expect(form).to.exist;
      expect(form.hass).to.equal(mockHass);
      expect(form.data).to.deep.equal({
        enabled: true,
        scope: ['badge'],
        categories: ['render'],
      });
      expect(form.schema.map((entry: any) => entry.name)).to.deep.equal([
        'enabled',
        'categories',
        'scope',
      ]);
    });

    it('should render the yaml snippet for the current debug config', async () => {
      const el = await render({
        ...mockConfig,
        debug: { categories: ['render'] },
      } as Config);

      expect(el.querySelector('.debug-yaml code')?.textContent).to.contain(
        'categories:',
      );
    });

    it('should render a disabled yaml snippet when debug is absent', async () => {
      const el = await render();

      expect(
        el.querySelector('.debug-yaml code')?.textContent?.trim(),
      ).to.equal('# debug disabled');
    });
  });

  describe('interaction', () => {
    it('should call onClose and stop propagation when close is clicked', async () => {
      const el = await render();
      const closeButton = el.querySelector('ha-icon-button') as HTMLElement;
      // Construct through the element's own realm so jsdom accepts the dispatch
      const view = el.ownerDocument.defaultView!;
      const event = new view.MouseEvent('click', { bubbles: true });
      const stopPropagation = stub(event, 'stopPropagation');

      closeButton.dispatchEvent(event);

      expect(onClose.calledOnce).to.be.true;
      expect(stopPropagation.calledOnce).to.be.true;
    });

    it('should apply the preset config when a preset is clicked', async () => {
      const el = await render();
      const presets = el.querySelectorAll('.debug-preset');

      (presets[1] as HTMLElement).click();

      expect(onConfigChanged.calledOnce).to.be.true;
      expect(onConfigChanged.firstCall.args[0]).to.deep.equal({
        ...mockConfig,
        debug: { categories: ['render'] },
      });
    });

    it('should strip debug from the config for the "off" preset', async () => {
      const el = await render({ ...mockConfig, debug: {} } as Config);
      const presets = el.querySelectorAll('.debug-preset');

      (presets[0] as HTMLElement).click();

      expect(onConfigChanged.calledOnce).to.be.true;
      expect(onConfigChanged.firstCall.args[0]).to.deep.equal(mockConfig);
      expect(onConfigChanged.firstCall.args[0]).to.not.have.property('debug');
    });

    it('should propagate ha-form value changes to onConfigChanged', async () => {
      const el = await render();
      const form = el.querySelector('ha-form') as HTMLElement;
      const view = el.ownerDocument.defaultView!;

      form.dispatchEvent(
        new view.CustomEvent('value-changed', {
          detail: {
            value: { enabled: true, scope: ['badge'], categories: [] },
          },
        }),
      );

      expect(onConfigChanged.calledOnce).to.be.true;
      expect(onConfigChanged.firstCall.args[0]).to.deep.equal({
        ...mockConfig,
        debug: { scope: ['badge'] },
      });
    });

    it('should copy the yaml snippet to the clipboard', async () => {
      const writeText = stub().resolves();
      const original = (globalThis.navigator as any).clipboard;
      Object.defineProperty(globalThis.navigator, 'clipboard', {
        value: { writeText },
        configurable: true,
      });

      try {
        const el = await render({ ...mockConfig, debug: {} } as Config);

        (el.querySelector('.debug-copy-yaml') as HTMLElement).click();

        expect(writeText.calledOnce).to.be.true;
        expect(writeText.firstCall.args[0]).to.contain('debug:');
      } finally {
        Object.defineProperty(globalThis.navigator, 'clipboard', {
          value: original,
          configurable: true,
        });
      }
    });

    it('should swallow clipboard errors', async () => {
      const writeText = stub().rejects(new Error('insecure context'));
      const original = (globalThis.navigator as any).clipboard;
      Object.defineProperty(globalThis.navigator, 'clipboard', {
        value: { writeText },
        configurable: true,
      });

      try {
        const el = await render();
        const button = el.querySelector('.debug-copy-yaml') as HTMLElement;

        expect(() => button.click()).to.not.throw();
        // let the rejected promise settle inside the handler's catch
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(writeText.calledOnce).to.be.true;
      } finally {
        Object.defineProperty(globalThis.navigator, 'clipboard', {
          value: original,
          configurable: true,
        });
      }
    });
  });
});
