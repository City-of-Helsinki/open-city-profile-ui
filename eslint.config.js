import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importX from 'eslint-plugin-import-x';
import sonarjs from 'eslint-plugin-sonarjs';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import vitestGlobals from 'eslint-plugin-vitest-globals';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  // Ignore patterns (replaces .eslintignore)
  {
    ignores: ['src/serviceWorker.ts', 'build/**', 'dist/**', 'node_modules/**'],
  },

  // Base recommended configs
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Main configuration
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...vitestGlobals.environments.env.globals,
        fetchMock: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react,
      'react-hooks': reactHooks,
      'import-x': importX,
      sonarjs,
      'jsx-a11y': jsxA11y,
      'vitest-globals': vitestGlobals,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import-x/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          paths: ['src'],
        },
      },
    },
    rules: {
      // ESLint core rules
      'no-use-before-define': 'off',
      'no-console': 'warn',
      'no-plusplus': 'error',
      'curly': 'error',
      'consistent-return': 'error',
      'no-shadow': [
        'error',
        {
          hoist: 'all',
        },
      ],
      'arrow-body-style': ['error', 'as-needed'],
      'object-shorthand': ['error', 'properties'],

      // TypeScript rules
      '@typescript-eslint/no-use-before-define': ['error'],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/member-ordering': ['warn'],
      '@typescript-eslint/no-require-imports': ['error'],
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',

      // React rules
      ...react.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+ JSX transform
      'react/no-unused-prop-types': [
        'warn',
        {
          skipShapeProps: true,
        },
      ],

      // React Hooks rules
      ...reactHooks.configs.recommended.rules,

      // Import rules
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            ['internal', 'parent', 'sibling', 'index'],
          ],
          'newlines-between': 'always',
        },
      ],
      'import-x/no-named-as-default': 'off',
      'import-x/no-named-as-default-member': 'off',

      // SonarJS rules
      'sonarjs/no-duplicate-string': 'error',

      // JSX a11y rules
      ...jsxA11y.configs.recommended.rules,
      'jsx-a11y/no-autofocus': 'off',

      // Vitest globals
      ...vitestGlobals.configs.recommended.rules,
    },
  },

  // Disable TypeScript parsing for config files
  {
    files: ['*.config.{js,ts,mjs,mts}', '*.js', '*.mjs'],
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
  },

  // Prettier config (disables conflicting rules) - must be last
  prettier,
);
