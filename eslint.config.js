import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Feature-sliced layers, highest to lowest. A layer may import only from layers below it.
const layers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];

export default tseslint.config(
  {
    ignores: ['dist', 'coverage', 'storybook-static', 'playwright-report', 'test-results', '.lighthouseci'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked, jsxA11y.flatConfigs.strict],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: 'Raw HTML injection is not allowed.',
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': layers.map((type) => ({ type, pattern: `src/${type}/*` })),
      'boundaries/include': ['src/**/*'],
      'import/resolver': { typescript: true, node: true },
    },
    rules: {
      'boundaries/no-unknown-dependencies': 'error',
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          message:
            '{{ from.element.types.[0] }} must not import from {{ to.element.types.[0] }}: layers may only import downwards',
          policies: layers.map((type, i) => ({
            from: { element: { type } },
            allow: {
              to: { element: { types: [...layers.slice(i + 1), ...(type === 'shared' ? ['shared'] : [])] } },
            },
          })),
        },
      ],
      // Slices are consumed through their public index, never by reaching into internals.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^@/(pages|widgets|features|entities)/[^/]+/.+',
              message: 'Import slices through their public index (e.g. @/entities/member).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/*.stories.tsx', 'src/test/**', 'e2e/**'],
    rules: {
      'boundaries/dependencies': 'off',
      'boundaries/no-unknown-dependencies': 'off',
      'no-restricted-imports': 'off',
    },
  },
  {
    // The route table is configuration, not a component module.
    files: ['src/app/routes.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    files: ['*.config.{js,ts}', 'e2e/**/*.ts', 'scripts/**/*.{js,ts}', '.storybook/**/*.ts'],
    languageOptions: { globals: globals.node },
  },
);
