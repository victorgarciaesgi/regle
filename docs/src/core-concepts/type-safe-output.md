---
title: Type safe output
---

# Type safe output


What would be the benefit of building a validation library without a type safe output?

Inspired by the `Zod` parse output type, `Regle` will also infer your validator types to know which properties are _**garanted**_ to be defined.


## `r$.$validate`

Using `r$.$validate` will asynchronously run and wait for all your validators to finish, and return either `false`, or a type safe output of your state.

It will check if the `required` rule is present, but it will not work with `required: requiredIf(...)`, because we can't know the condition at build time.


```ts twoslash
import {useRegle} from '@regle/core';
import {ref, type Ref, computed} from 'vue';
import {required} from '@regle/rules';

type Form = {
  firstName?: string;
  lastName?: string;
}

const form: Ref<Form> = ref({firstName: '', lastName: ''})

const {r$} = useRegle(form, {
  lastName: {required},
});

async function submit() {
  const {result, data} = await r$.$validate();
  if (result) {
    console.log(data);
    //            ^?
  }
}
```