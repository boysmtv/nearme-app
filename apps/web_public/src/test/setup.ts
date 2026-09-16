import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

// Mock fetch globally
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock scrollTo
window.scrollTo = vi.fn();

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Polyfill DataTransfer for jsdom (drag-drop tests)
class DataTransferItem {
  kind = 'string' as const;
  type = '';
  getAsString(callback: (data: string) => void) { callback(''); }
  getAsFile() { return null; }
}
class DataTransfer {
  dropEffect = 'none';
  effectAllowed = 'all';
  files: File[] = [];
  items: DataTransferItem[] = [];
  types: string[] = [];
  clearData() {}
  setData(format: string, data: string) {}
  getData(format: string) { return ''; }
  setDragImage() {}
}
Object.defineProperty(window, 'DataTransfer', { writable: true, value: DataTransfer });

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
