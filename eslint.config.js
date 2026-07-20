import js from '@eslint/js';
import eslintReact from '@eslint-react/eslint-plugin';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import importX from 'eslint-plugin-import-x';
import sonarjs from 'eslint-plugin-sonarjs';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

const reactFiles = ['**/*.{js,jsx,ts,tsx}'];

export default tseslint.config(
  // Ignore patterns (replaces .eslintignore)
  {
    ignores: ['src/serviceWorker.ts', 'build/**', 'dist/**', 'node_modules/**'],
  },

  // Base recommended configs
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // @eslint-react (replaces eslint-plugin-react; supports ESLint 10)
  { files: reactFiles, ...eslintReact.configs['recommended-typescript'] },
  { files: reactFiles, ...eslintReact.configs['disable-conflict-eslint-plugin-react-hooks'] },
  {
    files: reactFiles,
    rules: {
      '@eslint-react/static-components': 'off',
      '@eslint-react/no-use-context': 'off',
      '@eslint-react/use-state': 'off',
      '@eslint-react/set-state-in-effect': 'off',
      '@eslint-react/no-nested-component-definitions': 'off',
      '@eslint-react/no-context-provider': 'off',
      '@eslint-react/naming-convention-ref-name': 'off',
      '@eslint-react/exhaustive-deps': 'off',
      '@eslint-react/web-api-no-leaked-fetch': 'off',
      '@eslint-react/purity': 'off',
      '@eslint-react/no-array-index-key': 'off',
    },
  },

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
        ...globals.vitest,
        fetchMock: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooks,
      'import-x': importX,
      sonarjs,
      'jsx-a11y': jsxA11y,
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

      // React Hooks rules
      ...reactHooks.configs.recommended.rules,
      // React Compiler rules — deferred; codebase predates React Compiler idioms.
      // Re-enable and fix in a follow-up ticket.
      'react-hooks/refs': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',

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
