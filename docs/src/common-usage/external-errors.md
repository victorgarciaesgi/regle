---
title: Server errors
description: Handle server side errors with Regle
---

<script setup>
import ExternalErrors from '../parts/components/modifiers/ExternalErrors.vue';
</script>

# External errors

Regle handles only client side errors. But some validation may need to be submitted to a server and returned to the client.

To handle this, you can use the `externalErrors` modifier.

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
    externalErrors.value = {
      email: ["Email already exists"],
      name: {
        pseudo: ["Pseudo already exists"]
      },
    }
  }
}
```

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

`externalErrors` can also be used to handle dot path errors. 

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
    externalErrors.value = {
      email: ["Email already exists"],
      "name.pseudo": ["Pseudo already exists"],
      "collection.0.name": ["Name already exists"]
    }
  }
}
``` 


## Clearing errors

By default, when you set the external errors, Regle will keep them until the form is validated or modified again.

You can modify this behavior by setting the `clearExternalErrorsOnChange` modifier to `false`.

```ts
import { useRegle } from '@regle/core';

const { r$ } = useRegle(form, {}, { 
  externalErrors, 
  clearExternalErrorsOnChange: false 
})
```

You can also clear the errors manually by calling the `$clearExternalErrors` method.

```ts
r$.$clearExternalErrors();
```



