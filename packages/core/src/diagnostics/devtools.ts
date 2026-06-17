import { createConsoleReporter, defineDiagnostics } from 'nostics';

export const devtoolsDiagnostics = /*#__PURE__*/ defineDiagnostics({
  docsBase: (code) => `https://reglejs.dev/errors/${code.replace('REGLE_', '').toLowerCase()}`,
  reporters: [/*#__PURE__*/ createConsoleReporter()],
  codes: {
    REGLE_R0020: {
      why: 'Regle Devtools are not available. The Regle Vue plugin is not installed in your app.',
      fix: 'Install and register the Regle plugin: app.use(RegleVuePlugin). See https://reglejs.dev/introduction/devtools',
    },
  },
});
