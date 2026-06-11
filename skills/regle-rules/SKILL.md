---
name: regle-rules
description: Regle validation rules — built-in rules from `@regle/rules`, custom rules with `createRule`, rule wrappers (`withMessage`, `withParams`, `withAsync`, `withTooltip`), and rule operators (`and`, `or`, `xor`, `not`, `applyIf`, `assignIf`, `pipe`). Use when declaring, customizing, composing, or conditionally applying validation rules in a Regle form. For form setup see regle.
license: MIT
compatibility: Requires Vue 3.3+ and TypeScript 5.1+. Works with any agent supporting the Agent Skills spec.
metadata:
  author: Victor Garcia
  version: "1.27.0"
  source: https://reglejs.dev
---

# Regle Rules

Validation rules for Regle. Rules come from `@regle/rules`, but you can also write your own with `createRule`, customize them with wrappers, and combine them with operators.

```ts
import { useRegle } from '@regle/core';
import { required, email, minLength } from '@regle/rules';

const { r$ } = useRegle(
  { email: '' },
  { email: { required, email, minLength: minLength(5) } }
);
```

## Key Concepts

- All rules are optional by default; add `required` to enforce a field.
- Built-in rules are imported from `@regle/rules`; some are factories that take parameters (e.g. `minLength(3)`).
- Custom rules use `createRule` for reusability, or an inline function for one-offs.
- Wrappers adapt an existing rule (message, params, async, tooltip) without rewriting it.
- Operators combine or conditionally apply rules.

## References

| Topic | Description | Reference |
|-------|-------------|-----------|
| Built-in Rules | All validation rules from `@regle/rules` | [rules-built-in](references/rules-built-in.md) |
| Custom Rules | Inline rules, `createRule`, reactive parameters, async rules, metadata | [rules-custom](references/rules-custom.md) |
| Rule Wrappers | `withMessage`, `withParams`, `withAsync`, `withTooltip`, chaining | [rules-wrappers](references/rules-wrappers.md) |
| Rule Operators | `and`, `or`, `xor`, `not`, `applyIf`, `assignIf`, `pipe` | [rules-operators](references/rules-operators.md) |

## Related skills

- **regle** — form setup with `useRegle`, validation properties, displaying errors, modifiers.
- **regle-typescript** — typing rules schemas with `inferRules` and `RegleComputedRules`.
