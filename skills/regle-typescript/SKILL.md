---
name: regle-typescript
description: TypeScript integration for Regle form validation -- type-safe output, typing rules schemas, typing component props. Use when you need type-safe form validation output, typed rule schemas, or typed component props with Regle.
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
