import { defineConfig } from 'vite-plus';

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  fmt: {
    printWidth: 120,
    tabWidth: 2,
    singleQuote: true,
    semi: true,
    bracketSpacing: true,
    trailingComma: 'es5',
    htmlWhitespaceSensitivity: 'strict',
    ignorePatterns: ['**/*.md'],
    experimentalSortPackageJson: false,
    vueIndentScriptAndStyle: true,
    overrides: [
      {
        files: ['**/*.jsonc'],
        options: {
          trailingComma: 'none',
        },
      },
    ],
  },
  lint: {
    env: {
      builtin: true,
    },
    ignorePatterns: ['**/.output/', '**/dist/**/*.js', 'playground/**/*', 'docs/.vitepress/cache/**/*'],
    overrides: [
      {
        files: ['**/*.ts', '*.vue', '**/*.vue', '**/*.spec.ts', 'packages/**', '**/*.json', '**/*.jsonc'],
        rules: {
          curly: 'off',
          'vue/valid-define-emits': 'error',
          'vue/valid-define-props': 'error',
          'vue/no-multiple-slot-args': 'warn',
          'no-unexpected-multiline': 'off',
          'unicorn/empty-brace-spaces': 'off',
          'unicorn/no-nested-ternary': 'off',
          'unicorn/number-literal-case': 'off',
          'no-console': [
            'error',
            {
              allow: ['warn', 'error', 'info'],
            },
          ],
          'import/default': 'off',
          'import/no-named-as-default-member': 'off',
          'promise/param-names': 'off',
          '@typescript-eslint/no-inferrable-types': 'off',
          '@typescript-eslint/consistent-type-imports': [
            'error',
            {
              disallowTypeAnnotations: false,
            },
          ],
          '@typescript-eslint/no-explicit-any': 'off',
          'no-unused-vars': 'warn',
        },
        plugins: ['import', 'promise', 'typescript', 'eslint', 'vue', 'unicorn', 'vitest', 'oxc', 'jsdoc'],
      },
    ],
    options: {
      typeAware: false,
      typeCheck: false,
    },
  },
});
