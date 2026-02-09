# Type Safe Output

Regle infers which fields are guaranteed to be defined after validation, inspired by Zod's parse output.

## `$validate` return type

```ts
const { valid, data, errors, issues } = await r$.$validate();
```

When `valid` is `true`, `data` is type-safe:
- Fields with `required`, `literal`, or `checked` rules become non-nullable
- Fields without `required` stay optional
- `requiredIf`/`requiredUnless` are excluded (condition unknown at build time)

```ts
type Form = {
  firstName?: string;
  lastName?: string;
};

const form = ref<Form>({ firstName: '', lastName: '' });

const { r$ } = useRegle(form, {
  lastName: { required },
});

async function submit() {
  const { valid, data } = await r$.$validate();
  if (valid) {
    // data.firstName is string | undefined
    // data.lastName is string (guaranteed by required)
    console.log(data);
  }
}
```

## `InferSafeOutput`

Statically infer the safe output type from any `r$`:

```ts
import { useRegle, type InferSafeOutput } from '@regle/core';

const { r$ } = useRegle(form, {
  lastName: { required },
});

type FormRequest = InferSafeOutput<typeof r$>;
// { firstName?: string; lastName: string }
```

## `$validateSync`

Synchronous validation that skips async rules:

```ts
const isValid = r$.$validateSync();
// Returns boolean, not a Promise

// Field-level
const isEmailValid = r$.email.$validateSync();
```

Use `$validate()` for full validation including async rules before final submission.
