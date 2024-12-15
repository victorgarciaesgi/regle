import { defineConfig } from 'tsup';
import { defaultOptions } from '../../tsup.common.build';

export default defineConfig({
  ...defaultOptions,
  external: ['vue', 'zod'],
});
