# Vuelidate to Regle: migration steps

Detailed steps for migrating a Vuelidate form to Regle. Consult the Regle MCP and the sibling Regle skills (regle, regle-rules, regle-advanced, regle-typescript) for API details as you go.

## 1. Identify the form

- Vuelidate forms import from `@vuelidate/core` and `@vuelidate/validators`.
- The validation is declared with the `useVuelidate` composable.

## 2. Replace the imports

- Replace Vuelidate imports with the equivalent Regle imports:
  - `useVuelidate` from `@vuelidate/core` -> `useRegle` from `@regle/core` (or `useScopedRegle` for component-scoped validation).
  - Validators from `@vuelidate/validators` -> built-in rules from `@regle/rules`.
  - `helpers` from `@vuelidate/validators` -> the equivalent named helpers from `@regle/rules` (`withMessage`, `withParams`, `withAsync`, `isEmpty`, etc.).

Renamed helpers (Vuelidate -> Regle, all from `@regle/rules`):

| Vuelidate | Regle |
|-----------|-------|
| `helpers.req` | `isFilled` |
| `helpers.len` | `getSize` |
| `helpers.regex` | `matchRegex` |
| `helpers.forEach` | removed — use `$each` directly (see step 4) |
| `helpers.unwrap` | use `toValue` from Vue; parameters are auto-unwrapped inside `createRule` |

## 3. Replace the state

- Adapt the argument order: Vuelidate's `useVuelidate(rules, state, options)` becomes `useRegle(state, rules, options)`.
- If the initial state is empty (every property `undefined` or an empty string), declare the state inline directly in the `useRegle` call.

## 4. Replace the validation rules

1. Map Vuelidate validators to the equivalent built-in rules from `@regle/rules`. Use `inferRules` when rules live in a computed property to keep autocompletion and type-checking.
2. If rules are declared in a `computed`, check whether it is actually needed:
   - It is needed only if a rule value depends on a reactive value.
   - If not needed, declare the rules inline.
   - If kept in a computed, wrap them with `inferRules` to preserve typing.
3. Conditional rules using a ternary:
   - Use `requiredIf` from `@regle/rules` when the conditional rule is `required`.
   - Use `applyIf` for other conditional rules.
4. When multiple rules are applied conditionally together, use `assignIf` from `@regle/rules`.
5. For custom rules that compare dates, use `dateAfter`, `dateBefore`, or `dateBetween` from `@regle/rules`.
6. Replace custom rules that are identical to a Regle built-in rule with the built-in.
7. If the state has a single property, use Regle's single-field validation pattern.
8. Custom rules written as inline functions or via Vuelidate helpers should be replaced with the `createRule` helper from `@regle/rules`.
9. Before creating a custom rule, confirm no native Regle rule already covers it. For object-level "at least one filled field" cases, use `atLeastOne` from `@regle/rules` together with object self-validation via `$self`.

## 5. Replace validation properties

1. Replace Vuelidate validation properties with the Regle equivalents (`$error`, `$errors`, `$invalid`, `$pending`, `$validate`, `$reset`). Renamed properties:

   | Vuelidate | Regle |
   |-----------|-------|
   | `$model` | `$value` |
   | `$response` | `$metadata` |
   | `$externalResults` | `$externalErrors` |

2. Always bind form values to the `*.$value` properties.
3. Errors are plain strings in Regle, not objects. Update the display shape and the access path:
   - `v$.name.$errors` (array of objects, `error.$message`) becomes `r$.$errors.name` (array of strings).
   - Access nested errors with the same dot path: `v$.nested.child.$error` -> `r$.nested.child.$error`.
4. `$validate` now returns a typed result. `await v$.$validate()` (boolean) becomes `const { valid, data } = await r$.$validate()`, where `data` is the type-safe validated output.
5. If `$autoDirty` is not explicitly `false`, remove every `$touch()` call on the same `r$` instance (dirty state is automatic).
6. Where state is reset manually before a `v$.$reset()`, use `r$.$reset` with its options (`toInitialState`, `toOriginalState`, `toState`) instead.
7. Look for custom validation error messages in both script and template, and reapply them with `withMessage` on the Regle rules. The argument order is swapped: `helpers.withMessage('msg', required)` becomes `withMessage(required, 'msg')`. Keep generic/shared messages as plain built-in rules (do not force `withMessage` for defaults); for app-wide messages, prefer `defineRegleConfig`.
8. Do not use `r$.$fields.xxx`; use `r$.xxx`.

## 6. Replace binding events

- Use `v-model` where possible; remove explicit `@update:modelValue` handlers that `v-model` can replace.
- Remove explicit `$touch()` calls — dirty state is handled automatically.

## 7. Replace nested-component validation

- A `useVuelidate()` call without arguments collects child validations; replace it with Regle's scoped validation (`useScopedRegle` / `useCollectScope`).
- Find child components that use Vuelidate and migrate them to scoped validation too.
- See the regle-advanced skill (scoped validation) to wire it correctly.

## 8. Inspect form propagation

When a `r$` instance is passed from a parent to a child that **mutates form fields**, use this two-way pattern:

- **Parent template**: pass both the bound state and the Regle root:
  ```vue
  <ChildForm v-model="r$.$value" :r$="r$" />
  ```
- **Child script**:
  - Declare `defineModel<FormState>({ required: true })` for the form object (same shape as `r$.$value`). Do not fake `r$` with a `computed`.
  - Declare `defineProps<{ r$: ... }>()` only for `r$` (and non-model props). Do not put `r$` inside `defineModel`.
- **Child template**: bind field values with `modelValue.fieldName` (or `v-model` on `modelValue.*`). Use `r$.fieldName.$error` / `r$.fieldName.$errors` from `r$` for validation UI, not from `modelValue`.
- **Typing `r$`**: prefer `RegleRoot<FormState>` (or `RegleRoot<Required<FormState>>` when the parent uses a `Required<...>` shape) when it type-checks. If TypeScript complains (optional fields, inference from `useRegle`), use `SuperCompatibleRegleRoot` from `@regle/core` for the prop type so the child stays assignable from the parent's `r$`. See the regle-typescript skill for `InferRegleRoot`, `RegleFieldStatus`, and related patterns.

Additional guidance:

- If several components share the same `r$` instance, consider a shared composable exporting it. If only one child receives `r$`, a shared composable is usually unnecessary.
- Use a store (e.g. Pinia) only if the form is complex and spread out enough to justify it.
- Convert runtime prop declarations to type annotations with `defineProps`. Declare prop types inline; do not create a separate interface file unless the codebase already does so for that feature.

## Validation groups

Vuelidate declares groups with a `$validationGroups` key inside the rules object. In Regle they move to the `validationGroups` option (third argument), built from the `fields` accessor, and are read from `r$.$groups`:

```ts
// Vuelidate
const v$ = useVuelidate({
  number: { isEven },
  nested: { word: { required } },
  $validationGroups: { firstGroup: ['number', 'nested.word'] },
}, state);

// Regle
const { r$ } = useRegle(state, {
  number: { isEven },
  nested: { word: { required } },
}, {
  validationGroups: (fields) => ({
    firstGroup: [fields.number, fields.nested.word],
  }),
});
r$.$groups.firstGroup;
```

## 9. Self-review and verify

1. Review your own changes against every rule above and fix anything missed.
2. Run the project's type-check script and resolve type errors.
3. Run the project's lint script and resolve lint errors.
