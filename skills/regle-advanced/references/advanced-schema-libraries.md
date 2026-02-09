# Schema Libraries (Zod, Valibot, ArkType)

Regle supports the Standard Schema Spec. Use `@regle/schemas` for schema-based validation.

```sh
pnpm add @regle/schemas
```

Supported libraries:
- Zod `3.24+`
- Valibot `1+`
- ArkType `2+`
- Any Standard Schema compliant library

## Usage

Use `useRegleSchema` instead of `useRegle`:

```ts
// Zod
import { useRegleSchema } from '@regle/schemas';
import { z } from 'zod';

const { r$ } = useRegleSchema({ name: '' }, z.object({
  name: z.string().min(1),
}));
```

```ts
// Valibot
import { useRegleSchema } from '@regle/schemas';
import * as v from 'valibot';

const { r$ } = useRegleSchema({ name: '' }, v.object({
  name: v.pipe(v.string(), v.minLength(3)),
}));
```

```ts
// ArkType
import { useRegleSchema } from '@regle/schemas';
import { type } from 'arktype';

const { r$ } = useRegleSchema({ name: '' }, type({
  name: 'string > 1',
}));
```

## Limitations

Schema-based validation parses the entire tree instead of per-field:
- `$validate` and `$pending` only available at root
- No `$rules` access on children (can't check `$rules.required.$active`)

## Computed schema

Use `inferSchema` for type-safe computed schemas, and `withDeps` for tracking dependencies in refinements:

```ts
import { useRegleSchema, inferSchema, withDeps } from '@regle/schemas';
import { z } from 'zod';

const form = ref({ firstName: '', lastName: '' });

const schema = computed(() =>
  inferSchema(form, z.object({
    firstName: z.string(),
    lastName: withDeps(
      z.string().refine((v) => v !== form.value.firstName, {
        message: "Last name can't be equal to first name",
      }),
      [() => form.value.firstName]
    ),
  }))
);

const { r$ } = useRegleSchema(form, schema);
```

`withDeps` is needed because Vue can't track dependencies inside schema refinement callbacks.

## `syncState`

Allow schema transforms to update your form state:

```ts
const { r$ } = useRegleSchema(form, schema, {
  syncState: {
    onUpdate: true,    // Apply transforms on every update
    onValidate: true,  // Apply transforms only on $validate
  },
});
```

## Type-safe output

`$validate` returns typed output based on the schema:

```ts
const { valid, data } = await r$.$validate();
if (valid) {
  // data is typed according to the schema output
  console.log(data);
}
```
