// Fix bug with exported types on CI
import type {} from 'nuxt/app';
import { defineNuxtModule, addImportsSources } from '@nuxt/kit';
import { createRequire } from 'module';

export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'regle',
    configKey: 'regle',
  },
  defaults: {},
  async setup(_options, _nuxt) {
    const require = createRequire(import.meta.url);
    addImportsSources({
      from: '@regle/core',
      imports: ['useRegle', 'createRule', 'defineRegleConfig', 'inferRules'] as Array<
        keyof typeof import('@regle/core')
      >,
    });

    addImportsSources({
      from: '@regle/rules',
      imports: ['withAsync', 'withMessage', 'withParams', 'withTooltip'] as Array<keyof typeof import('@regle/rules')>,
    });

    try {
      const regleZod = await import('@regle/schemas');
      if (regleZod) {
        addImportsSources({
          from: '@regle/schemas',
          imports: ['useRegleSchema', 'inferSchema', 'withDeps'] as Array<keyof typeof import('@regle/schemas')>,
        });
      }
    } catch (e) {
      // do nothing
    }
  },
});
