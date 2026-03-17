# Regle as a Headless Validation Layer for Vue and Nuxt

Most form systems feel fine at first, then painful once your app gets real.

The problem is usually not validation itself, but where validation lives. If it is too tied to components, every dynamic requirement (schema rules, conditional sections, shared messages, store-backed state) makes the code harder to maintain.

Regle solves this by treating validation as a **headless, model-based layer** for Vue and Nuxt: your UI stays independent, and your validation tree (`r$`) follows your data model with strong typing.

## Why this is a natural step after Vuelidate

Regle keeps a familiar model-first approach, so teams coming from Vuelidate do not need to relearn everything.

The practical upgrades are mostly in:

- type safety across nested validation state
- cleaner support for modern patterns (schemas, variants, scoped setups)
- better consistency with global configuration

References:

- https://reglejs.dev/introduction/comparisons/
- https://reglejs.dev/introduction/migrate-from-vuelidate/

## A flow that matches real project growth

Instead of presenting isolated features, this is the usual sequence in real apps:

1. start from existing schemas
2. standardize behavior globally
3. handle conditional branches safely

### Start from your schemas (Zod / Standard Schema)

Regle supports the Standard Schema ecosystem, so you can keep schema-first validation and still benefit from Vue reactivity and typed output.

References:

- https://reglejs.dev/integrations/schemas-libraries/
- https://standardschema.dev/

```ts
// TODO: Add your real-world schema snippet.
// Suggested: useRegleSchema(state, z.object({ ... }))
// Include one transform/default to illustrate typed output.
```

### Standardize messages and rules with global configuration

Once you have more than one form, duplication appears quickly. Global configuration is the point where Regle starts paying off at team scale.

You can centralize wrapped rules, custom messages, and defaults so every form behaves consistently.

References:

- https://reglejs.dev/advanced-usage/global-config/
- https://reglejs.dev/integrations/nuxt/

```ts
// TODO: Add your shared config snippet.
// Suggested:
// - defineRegleConfig(...)
// - withMessage(...) wrappers
// - Nuxt setupFile usage if relevant
```

### Handle conditional form branches with variants

As flows become conditional (account type, payment method, company vs individual), variants let you encode branch-specific validation without losing typing.

References:

- https://reglejs.dev/advanced-usage/variants/

```ts
// TODO: Add your variant snippet.
// Suggested: createVariant(...) + narrowVariant(...)
```

## Vue and Nuxt integration

Regle stays lightweight in both environments:

- Vue: `useRegle` directly or a preconfigured version from `defineRegleConfig`
- Nuxt: `@regle/nuxt` with optional `setupFile` for shared behavior

References:

- https://reglejs.dev/introduction/installation/
- https://reglejs.dev/integrations/nuxt/

## Migration path and closing

If you are migrating from Vuelidate, move incrementally:

1. migrate one medium form
2. keep UI unchanged, replace validation layer
3. centralize messages/rules with global config
4. roll out pattern by pattern

Regle’s main value is simple: your validation becomes **headless, typed, and scalable** as your Vue/Nuxt app grows.

Useful links:

- Docs: https://reglejs.dev
- Playground: https://play.reglejs.dev
