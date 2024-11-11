import eslintPluginVue from 'eslint-plugin-vue';
import prettierPlugin from 'eslint-config-prettier';
import ts from 'typescript-eslint';

export default [
  ...ts.configs.recommended,
  ...eslintPluginVue.configs['flat/recommended'],
  {
    files: ['**/*.ts', '*.vue', '**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
    ignores: ['dist', 'node_modules'],
    rules: {
      semi: 'off',
      'prefer-const': 'off',
      'no-console': 'off',
      'import/default': 'off',
      'import/no-named-as-default-member': 'off',
      'promise/param-names': 'off',
      'no-use-before-define': 'off',
      'import/named': 'off',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-unused-vars': ['off'],
      '@typescript-eslint/consistent-type-imports': ['error', { disallowTypeAnnotations: false }],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  prettierPlugin,
];
