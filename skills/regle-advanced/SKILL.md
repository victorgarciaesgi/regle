---
name: regle-advanced
description: Advanced patterns for Regle form validation, including arrays, async, server errors, global config, variants, scoped validation, and schema integration.
---

# Regle Advanced Patterns

Advanced usage patterns for Regle form validation in Vue 3. Covers collections, async validation, server errors, global configuration, discriminated unions (variants), scoped validation, and schema library integration.

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

## Schema Integration

| Topic | Description | Reference |
|-------|-------------|-----------|
| Schema Libraries | `useRegleSchema` with Zod, Valibot, ArkType | [advanced-schema-libraries](references/advanced-schema-libraries.md) |
| Standard Schema | Standard Schema spec, `useRules`, `refineRules`, `InferInput` | [advanced-standard-schema](references/advanced-standard-schema.md) |
