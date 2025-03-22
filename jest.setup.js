// Add Jest DOM matchers
import '@testing-library/jest-dom';

// Mock Web API globals that aren't included in jsdom
class MockHeaders {
  append() {}
  delete() {}
  get() {}
  has() {}
  set() {}
  entries() {
    return [][Symbol.iterator]();
  }
  keys() {
    return [][Symbol.iterator]();
  }
  values() {
    return [][Symbol.iterator]();
  }
  forEach() {}
}

class MockURLSearchParams {
  append() {}
  delete() {}
  get() {
    return null;
  }
  getAll() {
    return [];
  }
  has() {
    return false;
  }
  set() {}
  sort() {}
  toString() {
    return '';
  }
  keys() {
    return [][Symbol.iterator]();
  }
  values() {
    return [][Symbol.iterator]();
  }
  entries() {
    return [][Symbol.iterator]();
  }
  forEach() {}
}

// Mock FormData
class MockFormData {
  append() {}
  delete() {}
  get() {
    return null;
  }
  getAll() {
    return [];
  }
  has() {
    return false;
  }
  set() {}
  entries() {
    return [][Symbol.iterator]();
  }
  keys() {
    return [][Symbol.iterator]();
  }
  values() {
    return [][Symbol.iterator]();
  }
  forEach() {}
}

globalThis.Headers = MockHeaders;
globalThis.URLSearchParams = MockURLSearchParams;
globalThis.FormData = MockFormData;

// Mock Next.js navigation for Next.js 15
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new MockURLSearchParams(),
  useParams: () => ({}),
  redirect: jest.fn(),
  notFound: jest.fn(),
  permanentRedirect: jest.fn(),
  createLocalizedPathnameGetter: jest.fn(() => jest.fn(pathname => pathname)),
}));

// Mock Telegram login
jest.mock('./components/TelegramLogin', () => ({
  __esModule: true,
  default: () => null,
}));

// Mock viewport hook with configurable values
const defaultViewport = {
  width: 1024,
  height: 768,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isLargeDesktop: false,
};

let currentViewport = { ...defaultViewport };

jest.mock('./hooks/useViewport', () => ({
  useViewport: () => currentViewport,
  setViewport: viewport => {
    currentViewport = { ...defaultViewport, ...viewport };
  },
}));

// Mock global fetch with configurable responses
globalThis.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new MockHeaders(),
    clone: function () {
      return this;
    },
  })
);

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
globalThis.IntersectionObserver = MockIntersectionObserver;

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
};

// Mock window.matchMedia
Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock React.useId() for stable IDs in tests
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  let id = 0;
  return {
    ...originalReact,
    useId: () => `test-id-${id++}`,
  };
});

// Mock Cloudflare environment
globalThis.caches = {
  default: {
    match: jest.fn(() => Promise.resolve(null)),
    put: jest.fn(() => Promise.resolve()),
    delete: jest.fn(() => Promise.resolve(false)),
  },
};

// Mock Error Tracking
jest.mock('./utils/errorTracking', () => ({
  errorTracker: {
    captureException: jest.fn(),
    captureMessage: jest.fn(),
  },
}));

// Suppress React warning messages during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    /Warning.*not wrapped in act/.test(args[0]) ||
    /Warning.*ReactDOM.render is no longer supported/.test(args[0]) ||
    /Warning.*useState in a component/.test(args[0]) ||
    /Warning.*createContext.*value/.test(args[0])
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

// Reset all mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
  currentViewport = { ...defaultViewport };
});

// Clean up after each test
afterEach(() => {
  jest.restoreAllMocks();
});

// Restore console after all tests
afterAll(() => {
  console.error = originalConsoleError;
});
