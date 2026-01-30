---
title: Type safe output
---

# Type safe output


What would be the benefit of building a validation library without a type safe output?

Inspired by the `Zod` parse output type, `Regle` will also infer your validator types to know which properties are _**guaranteed**_ to be defined.


## `$validate`  

Using `r$.$validate` will asynchronously run and wait for all your validators to finish, and will return an object containing the status of your form.

```ts
const { valid, data, errors, issues } = await r$.$validate();
```

If your *_result_* is `true`, the **data** will be type safe.

It will check the rules to get the ones that ensure the value is set (`required`, `literal`, `checked`)

Tt will not work with `requiredIf` or `requiredUnless`, because we can't know the condition at build time.


```ts twoslash
import { useRegle } from '@regle/core';
import { ref, type Ref, computed } from 'vue';
import { required } from '@regle/rules';
// ---cut---
type Form = {
  firstName?: string;
  lastName?: string;
}

const form = ref<Form>({ firstName: '', lastName: '' })

const { r$ } = useRegle(form, {
  lastName: { required },
});

async function submit() {
  const { valid, data, errors, issues } = await r$.$validate();

  if (valid) {
    console.log(data);
    //            ^?
  }
}
```

<br/>

### `InferSafeOutput`

You can also statically infer the safe output from any `r$` instance.


```ts twoslash
import { ref, type Ref, computed } from 'vue';
import { required } from '@regle/rules';
// ---cut---
import { useRegle, InferSafeOutput } from '@regle/core';
type Form = {
  firstName?: string;
  lastName?: string;
}

const form: Ref<Form> = ref({ firstName: '', lastName: '' })

const { r$ } = useRegle(form, {
  lastName: { required },
});

type FormRequest = InferSafeOutput<typeof r$>;
//    ^?
```
