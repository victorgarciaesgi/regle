/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*.{js,ts,vue}': [`pnpm format:staged`, `pnpm lint:staged`],
};
