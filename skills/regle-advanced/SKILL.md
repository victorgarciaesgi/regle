---
name: regle-advanced
description: Advanced Regle form validation patterns — collection validation with `$each`, async rules and `$pending`, server/`externalErrors`, `$reset` options, global config with `defineRegleConfig`, discriminated-union variants, cross-component `useScopedRegle`/`useCollectScope`, `mergeRegles`, and object-level `$self`. Use for arrays of fields, async/server validation, scoped or merged forms, i18n messages, or variant forms. For schema libraries see regle-schemas.
license: MIT
compatibility: Requires Vue 3.3+ and TypeScript 5.1+. Works with any agent supporting the Agent Skills spec.
metadata:
  author: Victor Garcia
  version: "1.27.0"
  source: https://reglejs.dev
---

# Regle Advanced Patterns

Advanced usage patterns for Regle form validation in Vue 3. Covers collections, async validation, server errors, reset options, global configuration, discriminated unions (variants), scoped validation, merging, and object-level self validation.

## Common Patterns

| Topic | Description | Reference |
|-------|-------------|-----------|
| Collections | `$each` for array validation, collection errors, custom keys | [common-collections](references/common-collections.md) |
| Async Validation | Async rules, `$pending` state, debouncing | [common-async-validation](references/common-async-validation.md) |
| Server Errors | `externalErrors`, dot-path errors, clearing errors | [common-server-errors](references/common-server-errors.md) |
| Reset Forms | `$reset` options: `toInitialState`, `toOriginalState`, `toState` | [common-reset-forms](references/common-reset-forms.md) |

## Advanced

| Topic | Description | Reference |
|-------|-------------|-----------|
| Global Config | `defineRegleConfig`, custom messages, i18n, global modifiers | [advanced-global-config](references/advanced-global-config.md) |
| Variants | `createVariant`, `narrowVariant`, discriminated unions | [advanced-variants](references/advanced-variants.md) |
| Scoped Validation | `useScopedRegle`, `useCollectScope`, cross-component validation | [advanced-scoped-validation](references/advanced-scoped-validation.md) |
| Merge Regles | `mergeRegles` to combine multiple form instances | [advanced-merge-regles](references/advanced-merge-regles.md) |
| Self Validation | `$self` for object-level cross-field validation | [advanced-self-validation](references/advanced-self-validation.md) |

## Related skills

- **regle** — form setup with `useRegle`, validation properties, displaying errors, modifiers.
- **regle-rules** — built-in/custom rules, wrappers, and operators.
- **regle-schemas** — Zod, Valibot, ArkType, and Standard Schema integration.
- **regle-typescript** — typing rules schemas and component props.
