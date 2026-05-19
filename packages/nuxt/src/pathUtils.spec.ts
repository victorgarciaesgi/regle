import { resolveBuildDir, resolveRegleExportsTemplatePath, resolveTemplateImportPath } from './pathUtils';

describe('resolveTemplateImportPath', () => {
  it('should resolve setupFile imports relative to the generated template', () => {
    expect(
      resolveTemplateImportPath('/app/.nuxt/regle-exports.ts', '/app/app/common/config/nuxt/regle.nuxt.config.ts')
    ).toBe('../app/common/config/nuxt/regle.nuxt.config');
  });

  it('should keep setupFile imports valid when Nuxt buildDir is cached elsewhere', () => {
    expect(
      resolveTemplateImportPath(
        '/app/node_modules/.cache/nuxt/.nuxt/regle-exports.ts',
        '/app/app/common/config/nuxt/regle.nuxt.config.ts'
      )
    ).toBe('../../../../app/common/config/nuxt/regle.nuxt.config');
  });

  it('should prefix same-directory setupFile imports with a relative marker', () => {
    expect(resolveTemplateImportPath('/app/.nuxt/regle-exports.ts', '/app/.nuxt/regle.nuxt.config.ts')).toBe(
      './regle.nuxt.config'
    );
  });
});

describe('resolveBuildDir', () => {
  it('should resolve relative Nuxt buildDir values from rootDir', () => {
    expect(resolveBuildDir('.nuxt', '/app')).toBe('/app/.nuxt');
  });

  it('should preserve absolute Nuxt buildDir values', () => {
    expect(resolveBuildDir('/app/node_modules/.cache/nuxt/.nuxt', '/app')).toBe('/app/node_modules/.cache/nuxt/.nuxt');
  });
});

describe('resolveRegleExportsTemplatePath', () => {
  it('should resolve the generated regle-exports template path from Nuxt buildDir', () => {
    expect(resolveRegleExportsTemplatePath('.nuxt', '/app')).toBe('/app/.nuxt/regle-exports.ts');
  });
});
