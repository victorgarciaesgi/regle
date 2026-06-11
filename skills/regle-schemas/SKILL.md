---
name: regle-schemas
description: Validate Regle forms with schema libraries via `@regle/schemas` — Zod, Valibot, ArkType, and any Standard Schema spec library using `useRegleSchema`, `useRules`, `refineRules`, and `InferInput`. Use when a form's validation is defined by an external schema instead of `@regle/rules`. For native rules see regle-rules; for form setup see regle.
license: MIT
compatibility: Requires Vue 3.3+, TypeScript 5.1+, and `@regle/schemas`. Works with any agent supporting the Agent Skills spec.
metadata:
  author: Victor Garcia
  version: "1.27.0"
  source: https://reglejs.dev
---

# Regle Schemas

Regle can drive validation from a schema library instead of `@regle/rules`. Install `@regle/schemas` and use `useRegleSchema` with a Zod, Valibot, or ArkType schema (or any Standard Schema compliant validator).

```ts
import { useRegleSchema } from '@regle/schemas';
import { z } from 'zod';

const { r$ } = useRegleSchema(
  { email: '' },
  z.object({ email: z.string().email() })
);
```

## Key Concepts

- `useRegleSchema(state, schema)` replaces `useRegle`; the `r$` object behaves the same.
- Works with any Standard Schema library; Zod, Valibot, and ArkType are first-class.
- `useRules` / `refineRules` let you mix schema validation with native Regle rules.
- `InferInput` infers the state type from the schema.

## References

| Topic | Description | Reference |
|-------|-------------|-----------|
| Schema Libraries | `useRegleSchema` with Zod, Valibot, ArkType | [schemas-libraries](references/schemas-libraries.md) |
| Standard Schema | Standard Schema spec, `useRules`, `refineRules`, `InferInput` | [schemas-standard-schema](references/schemas-standard-schema.md) |

## Related skills

- **regle** — form setup with `useRegle`, validation properties, displaying errors.
- **regle-rules** — native rules when not using a schema library.
- **regle-typescript** — type-safe output and typing props.
