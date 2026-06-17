import { createConsoleReporter, defineDiagnostics } from 'nostics';

export const diagnostics = /*#__PURE__*/ defineDiagnostics({
  docsBase: (code) => `https://reglejs.dev/errors/${code.replace('REGLE_', '').toLowerCase()}`,
  reporters: [/*#__PURE__*/ createConsoleReporter()],
  codes: {
    REGLE_R0001: {
      why: (p: { path: string; ruleKey: string }) => `Error in "active" function for "${p.path}.${p.ruleKey}" rule.`,
      fix: 'Ensure the rule active callback does not throw. Check reactive dependencies inside active().',
    },
    REGLE_R0002: {
      why: (p: { path: string; ruleKey: string; processor: string }) =>
        `Error in "${p.processor}" function for "${p.path}.${p.ruleKey}" rule.`,
      fix: 'Ensure the rule message or tooltip callback does not throw. Return a string or string[].',
    },
    REGLE_R0003: {
      why: (p: { path: string }) =>
        `${p.path}: Incorrect rule format, it needs to be either a function or created with "createRule".`,
      fix: 'Use createRule() or an inline validator function. Plain objects without createRule are not valid rules.',
    },
    REGLE_R0004: {
      why: 'You used an async validator function on a non-async rule.',
      fix: 'Mark the rule with async: true in createRule(), or wrap the validator with withAsync() from @regle/rules.',
    },
    REGLE_R0005: {
      why: (p: { path: string }) =>
        `${p.path} is an Array of primitives. Tracking can be lost when reassigning the Array.`,
      fix: 'Use an array of objects instead of primitives when using $each rules on a collection.',
    },
    REGLE_R0006: {
      why: '[createRule] validator must be a function.',
      fix: 'Pass a validator function to createRule({ validator: (value) => ... }).',
    },
    REGLE_R0007: {
      why: (p: { path: string; ruleKey: string }) =>
        `Validator for "${p.path}.${p.ruleKey}" threw an error. The field is treated as invalid.`,
      fix: 'Wrap the validator body in try/catch or fix the underlying error. Check rule parameters and reactive refs.',
    },
    REGLE_R0008: {
      why: (p: { path: string }) =>
        `${p.path}: schemaMode is enabled but no onValidate handler was provided. $validate always returns { valid: false }.`,
      fix: 'Provide an onValidate callback in useRegle options when using schemaMode.',
    },
    REGLE_R0009: {
      why: (p: { discriminantKey: string; value: unknown }) =>
        `createVariant: no variant matched discriminant "${p.discriminantKey}" (value: ${JSON.stringify(p.value)}). An empty rules object is applied.`,
      fix: 'Use literal() on the discriminant field in each variant branch, or add a catch-all variant.',
    },
    REGLE_R0010: {
      why: (p: { path: string; reason: string }) => `${p.path}: ${p.reason}`,
      fix: 'Align your rules tree shape with your state shape (field vs nested object vs collection with $each).',
    },
    REGLE_R0011: {
      why: 'Failed to unwrap rule parameters. Empty parameters are used instead.',
      fix: 'Pass plain values, refs, or getters to rule factories. Avoid passing invalid reactive wrappers.',
    },
    REGLE_R0012: {
      why: 'Passing customStore to createScopedUseRegle resets the entire global scope store.',
      fix: 'Do not pass customStore after instances have been registered, or use a dedicated namespace.',
    },
    REGLE_R0013: {
      why: (p: { path: string; ruleKey: string }) =>
        `No error message defined for ${p.path}.${p.ruleKey}. A generic fallback message is shown.`,
      fix: 'Add a message to the rule definition or use withMessage() from @regle/rules.',
    },
    REGLE_R0014: {
      why: (p: { path: string }) => `${p.path}: An error occurred while committing rule changes during $commit.`,
      fix: 'Avoid changing rule definitions while a commit is in progress. Check for reactive side effects in rules factories.',
    },
    REGLE_R0015: {
      why: 'mergeRegles: validation failed because a scoped Regle instance threw during $validate.',
      fix: 'Inspect each scoped instance in the merge for validation errors or thrown validators.',
    },
    REGLE_R0017: {
      why: (p: { namespace: string }) =>
        `useCollectScope: namespace "${p.namespace}" has no registered instances. mergeRegles received an empty set.`,
      fix: 'Check the namespace string matches useScopedRegle registrations. Typos cause silent empty merges.',
    },
    REGLE_R0018: {
      why: 'useScopedRegle with asRecord: true requires an id option to avoid key collisions.',
      fix: 'Pass a unique id when using asRecord: true in useScopedRegle options.',
    },
    REGLE_R0021: {
      why: 'createRule detected an async validator but async was not set to true. Async detection via constructor.name may be unreliable after minification.',
      fix: 'Set async: true explicitly in createRule({ async: true, validator: async () => ... }).',
    },
  },
});
