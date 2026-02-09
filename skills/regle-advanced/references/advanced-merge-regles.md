# Merge Multiple Regles

Combine multiple `useRegle` instances into one unified validation object.

## When to use

- Forms split across multiple components
- Composing reusable form sections into a larger form
- Different validation lifecycles that need unified submission

## Basic usage

```ts
import { mergeRegles, useRegle } from '@regle/core';
import { required, email } from '@regle/rules';

const { r$ } = useRegle({ email: '' }, {
  email: { required, email },
});

const { r$: otherR$ } = useRegle({ firstName: '' }, {
  firstName: { required },
});

const r$Merged = mergeRegles({ r$, otherR$ });
```

## Accessing merged data

```ts
// Values
r$Merged.$value.r$.email;
r$Merged.$value.otherR$.firstName;

// Validation states
r$Merged.r$.email.$error;
r$Merged.otherR$.firstName.$invalid;

// Errors
r$Merged.$errors.r$.email;
r$Merged.$errors.otherR$.firstName;
```

## Global operations

Methods operate on all child instances:

```ts
await r$Merged.$validate();              // Validate all
r$Merged.$reset({ toInitialState: true }); // Reset all
r$Merged.$touch();                       // Touch all
```

`$valid`, `$error`, and `$pending` reflect the combined state of all child instances.
