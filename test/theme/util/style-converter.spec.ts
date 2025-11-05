import { fixture } from '@open-wc/testing-helpers';
import { stylesToHostCss, stylesToMap } from '@theme/util/style-converter';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import { styleMap } from 'lit-html/directives/style-map.js';

describe('styles-converter.ts', () => {
  describe('stylesToHostCss', () => {
    it('should return nothing for undefined styles', () => {
      const result = stylesToHostCss(undefined);
      expect(result).to.equal(nothing);
    });

    it('should return nothing for null styles', () => {
      const result = stylesToHostCss(null as any);
      expect(result).to.equal(nothing);
    });

    it('should return nothing for empty object', () => {
      const result = stylesToHostCss({});
      expect(result).to.equal(nothing);
    });

    it('should render style tag with single property', async () => {
      const styles = { 'font-size': '14px' };
      const result = stylesToHostCss(styles) as TemplateResult;
      const el = await fixture(result);

      expect(el.tagName).to.equal('STYLE');
      expect(el.textContent?.trim()).to.include(':host');
      expect(el.textContent?.trim()).to.include('font-size: 14px;');
    });

    it('should render style tag with multiple properties', async () => {
      const styles = {
        'font-size': '14px',
        color: 'red',
        'font-weight': 'bold',
      };
      const result = stylesToHostCss(styles) as TemplateResult;
      const el = await fixture(result);

      expect(el.tagName).to.equal('STYLE');
      const content = el.textContent?.trim() || '';
      expect(content).to.include(':host');
      expect(content).to.include('font-size: 14px;');
      expect(content).to.include('color: red;');
      expect(content).to.include('font-weight: bold;');
    });

    it('should handle CSS custom properties in style tag', async () => {
      const styles = {
        '--mdc-icon-size': '24px',
        color: 'var(--primary-color)',
      };
      const result = stylesToHostCss(styles) as TemplateResult;
      const el = await fixture(result);

      expect(el.tagName).to.equal('STYLE');
      const content = el.textContent?.trim() || '';
      expect(content).to.include('--mdc-icon-size: 24px;');
      expect(content).to.include('color: var(--primary-color);');
    });

    it('should be memoized - same object returns cached result', () => {
      const styles = { 'font-size': '14px' };
      const result1 = stylesToHostCss(styles);
      const result2 = stylesToHostCss(styles);

      // Should be the exact same reference (memoized)
      expect(result1).to.equal(result2);
      expect(result1).to.not.equal(nothing);
    });

    it('should handle keyframes in style tag', async () => {
      const styles = {
        keyframes:
          'breathing { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }',
      };
      const result = stylesToHostCss(styles) as TemplateResult;
      const el = await fixture(result);

      expect(el.tagName).to.equal('STYLE');
      const content = el.textContent?.trim() || '';
      expect(content).to.include('@keyframes breathing');
      expect(content).to.include('0%, 100% { transform: scale(1); }');
      expect(content).to.include('50% { transform: scale(1.2); }');
    });

    it('should handle mixed styles with keyframes and regular properties', async () => {
      const styles = {
        'font-size': '14px',
        color: 'red',
        keyframes: 'fadeIn { from { opacity: 0; } to { opacity: 1; } }',
      };
      const result = stylesToHostCss(styles) as TemplateResult;
      const el = await fixture(result);

      expect(el.tagName).to.equal('STYLE');
      const content = el.textContent?.trim() || '';

      // Should contain keyframes
      expect(content).to.include('@keyframes fadeIn');
      expect(content).to.include('from { opacity: 0; }');
      expect(content).to.include('to { opacity: 1; }');

      // Should contain regular styles in :host
      expect(content).to.include(':host');
      expect(content).to.include('font-size: 14px;');
      expect(content).to.include('color: red;');
    });

    it('should handle multiple keyframes entries', async () => {
      const styles = {
        keyframes: 'fadeIn { from { opacity: 0; } to { opacity: 1; } }',
        'custom-animation': 'slideIn 2s ease-in-out',
      };
      const result = stylesToHostCss(styles) as TemplateResult;
      const el = await fixture(result);

      expect(el.tagName).to.equal('STYLE');
      const content = el.textContent?.trim() || '';

      // Should contain the keyframes (only the 'keyframes' key is processed as keyframes)
      expect(content).to.include('@keyframes fadeIn');
      expect(content).to.include('from { opacity: 0; }');
      expect(content).to.include('to { opacity: 1; }');

      // The 'custom-animation' key should be treated as a regular CSS property
      expect(content).to.include(':host');
      expect(content).to.include('custom-animation: slideIn 2s ease-in-out;');
    });

    it('should handle complex keyframes with multiple steps', async () => {
      const styles = {
        keyframes:
          'bounce { 0% { transform: translateY(0); } 25% { transform: translateY(-10px); } 50% { transform: translateY(0); } 75% { transform: translateY(-5px); } 100% { transform: translateY(0); } }',
      };
      const result = stylesToHostCss(styles) as TemplateResult;
      const el = await fixture(result);

      expect(el.tagName).to.equal('STYLE');
      const content = el.textContent?.trim() || '';
      expect(content).to.include('@keyframes bounce');
      expect(content).to.include('0% { transform: translateY(0); }');
      expect(content).to.include('25% { transform: translateY(-10px); }');
      expect(content).to.include('50% { transform: translateY(0); }');
      expect(content).to.include('75% { transform: translateY(-5px); }');
      expect(content).to.include('100% { transform: translateY(0); }');
    });

    it('should return different results for different objects', () => {
      const styles1 = { 'font-size': '14px' };
      const styles2 = { 'font-size': '16px' };

      const result1 = stylesToHostCss(styles1);
      const result2 = stylesToHostCss(styles2);

      expect(result1).to.not.equal(result2);
    });
  });

  describe('stylesToMap', () => {
    it('should return empty styleMap for undefined styles', () => {
      const result = stylesToMap(undefined);

      // Should be a styleMap directive result
      expect(result).to.exist;
      expect(typeof result).to.equal('object');
    });

    it('should return empty styleMap for null styles', () => {
      const result = stylesToMap(null as any);

      expect(result).to.exist;
      expect(typeof result).to.equal('object');
    });

    it('should return empty styleMap for empty object', () => {
      const result = stylesToMap({});

      expect(result).to.exist;
      expect(typeof result).to.equal('object');
    });

    it('should return styleMap directive for valid styles', () => {
      const styles = { 'font-size': '14px', color: 'red' };
      const result = stylesToMap(styles);

      expect(result).to.exist;
      expect(typeof result).to.equal('object');
    });

    it('should be memoized - same object returns cached result', () => {
      const styles = { 'font-size': '14px' };
      const result1 = stylesToMap(styles);
      const result2 = stylesToMap(styles);

      // Should be the exact same reference (memoized)
      expect(result1).to.equal(result2);
    });

    it('should work directly in template style attribute', async () => {
      const styles = { 'font-size': '14px', color: 'red' };
      const result = stylesToMap(styles);

      // Test that it works directly in lit-html template
      const template = html`<div style=${result}>Test</div>`;
      const el = await fixture(template);

      expect(el.tagName).to.equal('DIV');
      expect(el.textContent?.trim()).to.equal('Test');
    });

    it('should be equivalent to manual styleMap call', async () => {
      const styles = { 'font-size': '14px', color: 'red' };

      // Compare our function vs manual styleMap
      const ourResult = stylesToMap(styles);
      const manualResult = styleMap(styles);

      // Both should work the same in templates
      const template1 = html`<div style=${ourResult}>Test1</div>`;
      const template2 = html`<div style=${manualResult}>Test2</div>`;

      const el1 = await fixture(template1);
      const el2 = await fixture(template2);

      expect(el1.tagName).to.equal('DIV');
      expect(el2.tagName).to.equal('DIV');
    });
  });

  describe('memoization behavior', () => {
    it('should cache results and not recalculate for same input', () => {
      const styles = { 'font-size': '14px', color: 'red' };

      // Call multiple times with same object
      const host1 = stylesToHostCss(styles);
      const host2 = stylesToHostCss(styles);
      const map1 = stylesToMap(styles);
      const map2 = stylesToMap(styles);

      // Results should be identical (same reference)
      expect(host1).to.equal(host2);
      expect(map1).to.equal(map2);
    });
  });
});
