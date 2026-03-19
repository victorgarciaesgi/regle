/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*.{js,ts,vue,yml,json}': [`pnpm fmt`, `pnpm lint:staged`],
};
