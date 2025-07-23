import eslintPluginVue from 'eslint-plugin-vue';
import prettierPlugin from 'eslint-config-prettier';
import ts from 'typescript-eslint';

export default [
  ts.configs.base,
  ...eslintPluginVue.configs['flat/recommended'],
  {
    files: ['**/*.ts', '*.vue', '**/*.vue', '**/*.spec.ts', 'packages/**'],
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser',
        tsconfigRootDir: process.cwd(),
      },
    },
    ignores: ['**/*.js', '**/*.d.ts', '**/dist/**', 'node_modules'],
    rules: {
      semi: 'off',
      'prefer-const': 'off',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'import/default': 'off',
      'import/no-named-as-default-member': 'off',
      'promise/param-names': 'off',
      'no-use-before-define': 'off',
      'import/named': 'off',
      // vue
      'vue/multi-word-component-names': 'off',
      'vue/one-component-per-file': 'off',
      'vue/require-default-prop': 'off',
      // typescript
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/consistent-type-imports': ['error', { disallowTypeAnnotations: false }],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    ignores: ['**/.output/', '**/dist/**/*.js', 'playground/**/*', 'docs/.vitepress/cache/**/*'],
  },
  prettierPlugin,
];
