import { createConsoleReporter, defineDiagnostics } from 'nostics';

export const diagnostics = /*#__PURE__*/ defineDiagnostics({
  docsBase: (code) => `https://reglejs.dev/errors/${code.replace('REGLE_', '').toLowerCase()}`,
  reporters: [/*#__PURE__*/ createConsoleReporter()],
  codes: {
    REGLE_C0001: {
      why: 'Only "standard-schema" compatible libraries are supported.',
      fix: 'Use a schema library that implements the Standard Schema spec (Zod v4, Valibot, ArkType). Pass the schema object directly to useRegleSchema().',
    },
  },
});
