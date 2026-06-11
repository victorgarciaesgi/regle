---
name: regle-migrate-vuelidate
description: Migrate Vuelidate form validation to Regle. Use when porting forms that import from `@vuelidate/core`/`@vuelidate/validators` or call `useVuelidate` over to `useRegle`/`useScopedRegle`, including rules, validation properties, `v-model` bindings, nested/scoped validation, and parent-child form propagation.
license: MIT
compatibility: Requires Vue 3.3+, TypeScript 5.1+, `@regle/core`, and `@regle/rules`. Works with any agent supporting the Agent Skills spec.
metadata:
  author: Victor Garcia
  version: "1.27.0"
  source: https://reglejs.dev/introduction/migrate-from-vuelidate
---

# Migrate Vuelidate to Regle

Convert form validations built with [Vuelidate](https://vuelidate-next.netlify.app/) to [Regle](https://reglejs.dev/). Take every form, rule, and validation property into account.

## Knowledge sources

Use these for API details, patterns, and TypeScript typing (in priority order):

1. **Regle MCP server** (if available): search for "Migrate from Vuelidate" and other topics. If it is not active, ask the user to enable it or enable it yourself.
2. **Sibling Regle skills**:
   - **regle** — `useRegle`, validation properties (`$error`, `$errors`, `$validate`, `$reset`), modifiers, displaying errors.
   - **regle-rules** — built-in rules, `createRule`, wrappers (`withMessage`), operators (`requiredIf`, `applyIf`, `assignIf`).
   - **regle-advanced** — scoped validation (`useScopedRegle`, `useCollectScope`), collections, async rules, server errors, `$self`.
   - **regle-schemas** — schema-based validation (Zod, Valibot, ArkType) when a form uses a schema.
   - **regle-typescript** — `inferRules`, typing rules and props (`RegleRoot`, `InferRegleRoot`, `SuperCompatibleRegleRoot`).
3. **Docs / LLM-friendly references**: https://reglejs.dev/introduction/migrate-from-vuelidate, https://reglejs.dev/llms.txt (glossary), https://reglejs.dev/llms-full.txt (full docs).

## Global rules

- `$autoDirty` is `true` by default in Regle — do not set it, and remove manual `$touch()` calls.
- Keep the variable name when renaming the composable result: a Vuelidate `v$` (or any other name) becomes `r$` with the same identifier.
- Bind form values to the `*.$value` properties from Regle.
- Do not use `r$.$fields.xxx`; access fields directly as `r$.xxx`.
- Before writing a custom rule, check for an equivalent built-in rule first.
- If a specific case is unclear, ask the user or leave it unchanged rather than guessing.

## Workflow

Copy this checklist and track progress:

```
- [ ] 1. Identify the Vuelidate form
- [ ] 2. Replace the imports
- [ ] 3. Replace the state
- [ ] 4. Replace the validation rules
- [ ] 5. Replace the validation properties
- [ ] 6. Replace binding events
- [ ] 7. Replace nested-component validation (scoped)
- [ ] 8. Inspect form propagation (parent <-> child)
- [ ] 9. Self-review and run typecheck + lint
```

Follow the detailed step-by-step instructions in [migration-steps](references/migration-steps.md).
