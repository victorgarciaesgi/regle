/**
 * @type {import("prettier").Config}
 */
export default {
  printWidth: 120,
  tabWidth: 2,
  singleQuote: true,
  semi: true,
  bracketSpacing: true,
  trailingComma: 'es5',
  htmlWhitespaceSensitivity: 'strict',
  overrides: [
    {
      files: ['**/*.jsonc'],
      options: {
        trailingComma: 'none',
      },
    },
  ],
};
