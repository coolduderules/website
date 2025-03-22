import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

const ignoredFiles = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
  '**/public/**',
  '**/.wrangler/**',
];

// JavaScript configurations without TypeScript plugins
const jsConfigs = [
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    ignores: ignoredFiles,
    rules: {
      'no-undef': 'off', // Disable no-undef for JS files as they often use globals
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        process: true,
        console: true,
        module: true,
        require: true,
        __dirname: true,
        __filename: true,
        exports: true,
        global: true,
        Buffer: true,
        jest: true,
        describe: true,
        it: true,
        expect: true,
        beforeEach: true,
        afterEach: true,
        afterAll: true,
        globalThis: true,
      },
    },
  },
];

// TypeScript configurations with all TypeScript and React plugins
const tsConfigs = [
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ignoredFiles,
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    rules: {
      // React
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-require-imports': 'off',

      // General
      'no-prototype-builtins': 'off',
      'getter-return': 'error',
      'no-case-declarations': 'error',
      'no-func-assign': 'error',
      'no-cond-assign': ['error', 'except-parens'],
      'no-constant-condition': 'error',
      'no-undef': 'error',
      'no-unused-vars': 'off', // Use TypeScript's version instead
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];

export default [...jsConfigs, ...tsConfigs];
