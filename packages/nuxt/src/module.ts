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
      imports: ['ruleHelpers', 'withAsync', 'withMessage', 'withParams', 'withTooltip'] as Array<
        keyof typeof import('@regle/rules')
      >,
    });

    try {
      const regleZod = await import('@regle/zod');
      if (regleZod) {
        addImportsSources({
          from: '@regle/zod',
          imports: ['useZodRegle'] as Array<keyof typeof import('@regle/zod')>,
        });
      }
    } catch (e) {
      //
    }
  },
});
