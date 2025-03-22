import createJestConfig from 'next/jest.js';

// Custom environment handling for GitHub compatibility
const getEnv = () => {
  return {
    CI: process.env.CI || false,
  };
};

const env = getEnv();

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',

  // Improved module resolution
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    '^@/public/(.*)$': '<rootDir>/public/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.svg$': '<rootDir>/__mocks__/svg.js',
  },

  // Test patterns and ignores
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/.wrangler/',
    '<rootDir>/coverage/',
    '<rootDir>/out/',
  ],

  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coverageReporters: ['json', 'lcov', 'text', 'clover'],

  // Performance optimizations
  maxWorkers: env.CI ? 2 : '50%',
  timers: 'modern',
  detectOpenHandles: true,
  forceExit: true,

  // Improved error reporting
  verbose: true,
  testTimeout: 10000,

  // Transform configuration for ESM support
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': ['babel-jest', { presets: ['next/babel'] }],
  },

  // Environment setup
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
    customExportConditions: [''],
  },

  // Cleanup
  clearMocks: true,
  resetMocks: false,
  restoreMocks: true,
};

// Create and export the Next.js Jest configuration
const createConfig = createJestConfig({
  dir: './',
});

// Fix for ESM modules in Jest
export default async () => {
  const nextJestConfig = await createConfig(customJestConfig);
  return {
    ...nextJestConfig,
    transformIgnorePatterns: [
      '/node_modules/(?!(next|@next|@tanstack|@heroicons)/)',
    ],
    moduleNameMapper: {
      ...nextJestConfig.moduleNameMapper,
      '^@/(.*)$': '<rootDir>/$1',
    },
  };
};
