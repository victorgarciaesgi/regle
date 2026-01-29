import {
  defineNuxtModule,
  addImportsSources,
  addImports,
  resolvePath,
  addTemplate,
  createResolver,
  addPlugin,
} from '@nuxt/kit';
import path from 'path';
export interface ModuleOptions {
  /**
   * Path to your setupFile, it needs to return a useRegle composable
   */
  setupFile: string;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@regle/nuxt',
    configKey: 'regle',
  },
  defaults: {},
  async setup(options) {
    const { resolve } = createResolver(import.meta.url);

    addPlugin({
      src: resolve('runtime/plugins/regle.plugin.js'),
      mode: 'client',
    });

    if (options.setupFile) {
      try {
        const setupFilePathOS = await resolvePath(options.setupFile);
        // Ensure the path is normalized for POSIX compatibility (https://github.com/victorgarciaesgi/regle/issues/152)
        // console.log(setupFilePath);
        if (setupFilePathOS) {
          const relativePath = resolve(setupFilePathOS);

          const setupFilePathWithoutExtension = path.join(
            path.dirname(relativePath),
            path.basename(relativePath, path.extname(relativePath))
          );

          /**
           * Ensure absolute paths work on Windows OS
           */
          const setupFilePathWithoutExtensionCleaned = path.posix.normalize(
            setupFilePathWithoutExtension.replaceAll(/\\/gi, '/')
          );

          const regleImports = [
            { name: 'inferRules', type: false },
            { name: 'useRegle', type: false },
            { name: 'useCollectScope', type: false },
            { name: 'useScopedRegle', type: false },
            { name: 'RegleFieldStatus', type: true },
          ];

          const template = addTemplate({
            filename: 'regle-exports.ts',
            write: true,
            getContents: () => `
import type { InferRegleRules, RegleCustomFieldStatus } from '@regle/core';
import ReglePlugin from "${setupFilePathWithoutExtensionCleaned}";
export const { ${regleImports
              .filter(({ type }) => !type)
              .map(({ name }) => name)
              .join(', ')} } = ReglePlugin;

export type RegleFieldStatus<
  TState extends unknown = any,
  TRules extends keyof InferRegleRules<typeof useRegle> = keyof InferRegleRules<typeof useRegle>,
> = RegleCustomFieldStatus<typeof useRegle, TState, TRules>;

`,
          });

          regleImports.forEach(({ name, type }) => addImports({ name, as: name, from: template.dst, type }));

          addImportsSources({
            from: '@regle/core',
            imports: [
              'createRule',
              'defineRegleConfig',
              'extendRegleConfig',
              'createVariant',
              'narrowVariant',
            ] as Array<keyof typeof import('@regle/core')>,
          });

          await addDefaultImportSources();
        } else {
          console.error(`[regle] Couldn't find your setup file at ${options.setupFile}`);
        }
      } catch (e) {
        console.error(`[regle] Couldn't find your setup file at ${options.setupFile}`, e);
      }
    } else {
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

      await addDefaultImportSources();
    }

    async function addDefaultImportSources() {
      addImportsSources({
        from: '@regle/rules',
        imports: ['withAsync', 'withMessage', 'withParams', 'withTooltip'] as Array<
          keyof typeof import('@regle/rules')
        >,
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
      } catch {
        // do nothing
      }
    }
  },
});
