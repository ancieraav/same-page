import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import tseslint from 'typescript-eslint';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    name: 'samepage/strict-typescript',
    files: ['**/*.{ts,tsx,mts,cts}'],
    extends: [
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // TypeScript owns unused-symbol correctness through noUnusedLocals/Parameters.
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    name: 'samepage/strict-inline-configs',
    linterOptions: {
      reportUnusedInlineConfigs: 'error',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'node_modules/**',
    'archive/**',
    'test-results/**',
    'coverage/**',
    'dist/**',
    'outputs/**',
    'work/**',
    'redesigns/**',
    '.sites-runtime/**',
    '*.html',
    'styles.css',
    'URLS.md',
  ]),
]);
