---
title: Server errors
description: Handle server side errors with Regle
---

<script setup>
import ExternalErrors from '../parts/components/modifiers/ExternalErrors.vue';
</script>

# External errors and issues

Regle handles only client side errors. But some validation may need to be submitted to a server and returned to the client.

To handle this, you can use the `externalErrors` modifier, or `externalIssues` when the server returns structured metadata.

It matches the structure of your form, but you can also use dot path to define the errors.


## Basic usage

```ts
import { type RegleExternalErrorTree, useRegle } from '@regle/core'

const form = reactive({
  email: '',
  name: {
    pseudo: '',
  },
})

const externalErrors = ref<RegleExternalErrorTree<typeof form>>({});

const { r$ } = useRegle(
  form,
  {
    email: { required },
    name: { pseudo: { required } },
  },
  {
    externalErrors,
  }
);

async function submit() {
  const {valid} = await r$.$validate();

  if (valid) {
    r$.$setExternalErrors({
      email: ["Email already exists"],
      name: {
        pseudo: ["Pseudo already exists"]
      },
    })
  }
}
```

Use `externalIssues` when you need to keep metadata on each server issue. Its `$message` is still reflected in `$errors`, while the full object is available from `$issues`.

```ts
import { type RegleExternalIssueTree, useRegle } from '@regle/core'

const externalIssues = ref<RegleExternalIssueTree<typeof form>>({});

const { r$ } = useRegle(form, rules, { externalIssues });

r$.$setExternalIssues({
  email: [
    {
      $message: 'Email already exists',
      $property: 'email',
      code: 'EMAIL_TAKEN',
    },
  ],
});
```

### Typing issue metadata

Server payloads often include extra fields (`code`, `field`, i18n keys, and so on). Regle exposes them on `$issues` while still using `$message` for `$errors`.

Augment `RegleIssueCustomMetadata` once (for example in `regle.d.ts` next to your app entry). Keys you add are merged into `RegleFieldIssue` and typed on field `$issues`, including issues coming from `externalIssues`.

`RegleExternalFieldIssue` only requires `$message`. Built-in fields such as `$property` and your custom metadata stay optional when you build the object passed to `externalIssues` or `$setExternalIssues`.

```ts [regle.d.ts]
declare module '@regle/core' {
  interface RegleIssueCustomMetadata {
    code?: string;
  }
}
```

```ts
const externalIssues = ref<RegleExternalIssueTree<typeof form>>({
  email: [{ $message: 'Email already exists', code: 'EMAIL_TAKEN' }],
});

// After Regle applies the issue:
r$.email.$issues[0].code; // string | undefined
r$.email.$errors[0]; // 'Email already exists'
```

`externalErrors` and `externalIssues` are mutually exclusive. Setting one clears the other, so the latest server payload is the source of truth.

Result:

<ExternalErrors/>


:::warning

If you're working with collections and server-only validations, you'll have to at least specify an empty `$each` object in the client rules to tell Regle that the array is to be treated as a collection

```ts
const { r$ } = useRegle({collection: []}, {
  collection: {
    $each: {}
  },
}, { externalErrors })

```

:::


## Dot path errors

`externalErrors` and `externalIssues` can also be used to handle dot path errors. 

It can be handy for some backend frameworks that return errors with dot path.

```ts
import { useRegle } from '@regle/core';

const form = reactive({
  email: '',
  name: {
    pseudo: '',
  },
  collection: [{name: ''}]
})

const externalErrors = ref<Record<string, string[]>>({});

const { r$ } = useRegle(form, {}, { externalErrors })

async function submit() {
  const {valid} = await r$.$validate();

  if (valid) {
    r$.$setExternalErrors({
      email: ["Email already exists"],
      "name.pseudo": ["Pseudo already exists"],
      "collection.0.name": ["Name already exists"]
    })
  }
}
``` 

## Without the `externalErrors` option

`r$.$setExternalErrors` also works when you don't provide the `externalErrors` option.
Regle stores those errors internally.

```ts
const form = reactive({
  email: '',
  name: {
    pseudo: '',
  },
})

const { r$ } = useRegle(form, {
  email: { required },
  name: { pseudo: { required } },
})

async function submit() {
  const { valid } = await r$.$validate();

  if (!valid) return;

  r$.$setExternalErrors({
    email: ['Email already exists'],
    'name.pseudo': ['Pseudo already exists'],
  });
}
```


## Clearing errors

By default, when you set the external errors, Regle will keep them until the form is validated or modified again.

This behavior can be modified with these options:


### `clearExternalErrors`

```ts
r$.$reset({ clearExternalErrors: false });
```

### `clearExternalErrorsOnValidate`

```ts
import { useRegle } from '@regle/core';

const { r$ } = useRegle(form, {}, { 
  externalErrors, 
  clearExternalErrorsOnValidate: true 
})
```

### `clearExternalErrorsOnChange`

```ts
import { useRegle } from '@regle/core';

const { r$ } = useRegle(form, {}, { 
  externalErrors, 
  clearExternalErrorsOnChange: false 
})
```

### `$clearExternalErrors()`

You can also clear the errors manually by calling the `$clearExternalErrors` method.

```ts
r$.$clearExternalErrors();
```

For structured issues, use the matching methods and options:

```ts
r$.$setExternalIssues({
  email: [{ $message: 'Email already exists', code: 'EMAIL_TAKEN' }],
});

r$.$clearExternalIssues();

r$.$reset({ clearExternalErrors: true });
```

`clearExternalErrorsOnValidate`, `clearExternalErrorsOnChange`, and `clearExternalErrors` also apply to structured external issues.



