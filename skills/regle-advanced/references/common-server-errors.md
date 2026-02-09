# Server Errors (External Errors)

Handle server-side validation errors with the `externalErrors` modifier.

## Basic usage

```ts
import { type RegleExternalErrorTree, useRegle } from '@regle/core';

const form = reactive({ email: '', name: { pseudo: '' } });
const externalErrors = ref<RegleExternalErrorTree<typeof form>>({});

const { r$ } = useRegle(form, {
  email: { required },
  name: { pseudo: { required } },
}, {
  externalErrors,
});

async function submit() {
  const { valid } = await r$.$validate();
  if (valid) {
    // Set errors from server response
    externalErrors.value = {
      email: ['Email already exists'],
      name: { pseudo: ['Pseudo already exists'] },
    };
  }
}
```

## Dot-path errors

Useful for backends that return errors with dot notation:

```ts
const externalErrors = ref<Record<string, string[]>>({});

const { r$ } = useRegle(form, {}, { externalErrors });

async function submit() {
  externalErrors.value = {
    email: ['Email already exists'],
    'name.pseudo': ['Pseudo already exists'],
    'collection.0.name': ['Name already exists'],
  };
}
```

## Clearing errors

By default, external errors clear when the form value changes. Change this behavior:

```ts
const { r$ } = useRegle(form, {}, {
  externalErrors,
  clearExternalErrorsOnChange: false, // Keep errors until manually cleared
});

// Manual clear
r$.$clearExternalErrors();
```

## Collections with external errors

Declare `$each` (even empty) for Regle to treat the array as a collection:

```ts
const { r$ } = useRegle({ collection: [] }, {
  collection: { $each: {} },
}, { externalErrors });
```
