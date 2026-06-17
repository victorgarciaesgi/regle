import { createConsoleReporter, defineDiagnostics } from 'nostics';

export const diagnostics = /*#__PURE__*/ defineDiagnostics({
  docsBase: (code) => `https://reglejs.dev/errors/${code.replace('REGLE_', '').toLowerCase()}`,
  reporters: [/*#__PURE__*/ createConsoleReporter()],
  codes: {
    REGLE_R0101: {
      why: (p: { rule: string; value?: unknown; param: unknown }) =>
        p.value !== undefined
          ? `[${p.rule}] Value or parameter aren't numbers, got value: ${p.value}, parameter: ${p.param}`
          : `[${p.rule}] Parameter isn't a number, got parameter: ${p.param}`,
      fix: 'Pass numeric values and parameters to comparison and length rules (e.g. minValue(5), not minValue("5")).',
    },
    REGLE_R0102: {
      why: 'An async validator was used in a synchronous pipe() step.',
      fix: 'Use pipeAsync() for async validators, or mark individual rules with withAsync() and use an async pipe.',
    },
    REGLE_R0103: {
      why: 'Cannot extract validator from invalid rule.',
      fix: 'Pass a createRule() rule or an inline validator function to rule helpers like not(), and(), or().',
    },
    REGLE_R0104: {
      why: 'not(): the inner async validator threw an error. The negated rule passes validation.',
      fix: 'Fix the inner validator so it does not throw. Avoid using not() with validators that throw on failure.',
    },
    REGLE_R0019: {
      why: (p: { operator: string }) =>
        `${p.operator}(): no rules were provided. The combined rule always fails validation.`,
      fix: 'Pass at least one rule to and() or or(). An empty combinator always returns false.',
    },
    REGLE_R0016: {
      why: 'withAsync() received a createRule rule but passes parameters incorrectly for non-inline rules.',
      fix: 'Use an inline async function validator, or set async: true on createRule() instead of wrapping with withAsync().',
    },
  },
});
