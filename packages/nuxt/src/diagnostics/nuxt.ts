import { createConsoleReporter, defineDiagnostics } from 'nostics';

export const diagnostics = /*#__PURE__*/ defineDiagnostics({
  docsBase: (code) => `https://reglejs.dev/errors/${code.replace('REGLE_', '').toLowerCase()}`,
  reporters: [/*#__PURE__*/ createConsoleReporter()],
  codes: {
    REGLE_C0101: {
      why: (p: { setupFile: string }) => `[regle] Couldn't find your setup file at ${p.setupFile}.`,
      fix: 'Set regle.setupFile in nuxt.config to a valid path relative to your project root (e.g. "./app/regle.config.ts").',
    },
    REGLE_C0102: {
      why: 'Failed to import skipHydrate from pinia.',
      fix: 'Ensure pinia is installed and compatible (>=2.2.5). Regle needs skipHydrate for SSR hydration of store state.',
    },
    REGLE_C0103: {
      why: '@regle/schemas could not be imported. Schema helpers will not be auto-imported.',
      fix: 'Install @regle/schemas as a dependency if you use useRegleSchema or inferSchema.',
    },
  },
});
