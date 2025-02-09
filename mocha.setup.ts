import { JSDOM } from 'jsdom';

declare global {
  interface Window {
    customCards: Array<Object>;
    matchMedia: (query: string) => MediaQueryList;
  }
}

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});

// Set up browser environment globals
global.window = dom.window as any;
global.document = dom.window.document;
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);

// Add missing DOM features
global.window.matchMedia =
  global.window.matchMedia ||
  (() => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    media: '',
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
