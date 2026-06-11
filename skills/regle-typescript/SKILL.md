---
name: regle-typescript
description: TypeScript integration for Regle — type-safe validated output (`InferSafeOutput`, `$validate`), inferring state from rules (`InferInput`), typing computed rules (`inferRules`, `RegleComputedRules`), and typing component props (`InferRegleRoot`, `RegleRoot`, `RegleFieldStatus`, `SuperCompatibleRegleRoot`). Use when typing rules schemas, passing `r$` between components, or extracting validated data types.
license: MIT
compatibility: Requires Vue 3.3+ and TypeScript 5.1+. Works with any agent supporting the Agent Skills spec.
metadata:
  author: Victor Garcia
  version: "1.27.0"
  source: https://reglejs.dev
---

# Regle TypeScript

Regle provides first-class TypeScript support with full type inference. This skill covers type-safe validation output, typing rules schemas, and typing component props.

## Key Exports

| Export | Package | Purpose |
|--------|---------|---------|
| `InferInput` | `@regle/core` | Infer state type from rules |
| `InferSafeOutput` | `@regle/core` | Infer validated output type from `r$` |
| `inferRules` | `@regle/core` | Preserve autocompletion in computed rules |
| `RegleComputedRules` | `@regle/core` | Type helper for explicit rule typing |
| `InferRegleRoot` | `@regle/core` | Extract `r$` type from a composable |
| `RegleFieldStatus` | `@regle/core` | Type for a single field status prop |

## References

| Topic | Description | Reference |
|-------|-------------|-----------|
| Type Safe Output | `$validate` return types, `InferSafeOutput` | [typescript-type-safe-output](references/typescript-type-safe-output.md) |
| Typing Rules | `inferRules`, `RegleComputedRules`, nested properties | [typescript-typing-rules](references/typescript-typing-rules.md) |
| Typing Props | `InferRegleRoot`, `RegleFieldStatus`, typing component props | [typescript-typing-props](references/typescript-typing-props.md) |

## Related skills

- **regle** — form setup with `useRegle`, validation properties.
- **regle-rules** — `inferRules` is used when typing computed rule objects.
- **regle-advanced** — scoped validation and patterns where typed props matter.
