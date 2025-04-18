import { defineNuxtModule, addImportsSources } from '@nuxt/kit';

export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'regle',
    configKey: 'regle',
  },
  defaults: {},
  async setup(_options, _nuxt) {
    addImportsSources({
      from: '@regle/core',
      imports: [
        'useRegle',
        'createRule',
        'defineRegleConfig',
        'inferRules',
        'extendRegleConfig',
        'createVariant',
        'narrowVariant',
        'useScopedRegle',
        'useCollectScope',
      ] as Array<keyof typeof import('@regle/core')>,
    });

    addImportsSources({
      from: '@regle/rules',
      imports: ['withAsync', 'withMessage', 'withParams', 'withTooltip'] as Array<keyof typeof import('@regle/rules')>,
    });

    try {
      const regleSchema = await import('@regle/schemas');
      if (regleSchema) {
        addImportsSources({
          from: '@regle/schemas',
          imports: ['useRegleSchema', 'inferSchema', 'withDeps', 'defineRegleSchemaConfig'] as Array<
            keyof typeof import('@regle/schemas')
          >,
        });
      }
    } catch (e) {
      // do nothing
    }
  },
});
