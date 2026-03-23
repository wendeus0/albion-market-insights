import '@testing-library/jest-dom';

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock LocalStorage for tests
const localStorageMock = (function() {
  let store: Record<string, string> = {};

  return {
    getItem: function(key: string) {
      return store[key] ?? null;
    },
    setItem: function(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem: function(key: string) {
      delete store[key];
    },
    clear: function() {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: function(index: number) {
      return Object.keys(store)[index] ?? null;
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}

if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}

if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
