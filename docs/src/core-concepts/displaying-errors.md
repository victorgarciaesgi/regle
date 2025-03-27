---
title: Displaying errors
---

<script setup>
import QuickUsage from '../parts/components/QuickUsage.vue';
import DisplayingErrors from '../parts/components/DisplayingErrors.vue';
</script>

# Displaying errors

Regle is a headless library, allowing you to display error messages in any way you choose. You can also use its internal state to apply classes or trigger behaviors dynamically.


## Showing errors messages

You can display your errors by iterating though `r$.$errors.xxx`, `xxx` being the field you need to check.

You can also access `r$.$fields.xxx.$errors` or `r$.$fields.xxx.$silentErrors`.

<!-- @include: @/parts/QuickUsage.md -->

Result:

<QuickUsage />


## Applying an error and valid class

<!-- @include: @/parts/DisplayingErrors.md -->

Result:

<DisplayingErrors />


## Display flat errors

If you want to display the complete list of errors of a form, or the total count of errors, you can use the `flatErrors` utility.

It will return an array of error strings.

```ts twoslash
import { flatErrors, useRegle } from '@regle/core';
import { email, minLength, required } from '@regle/rules';

const { r$ } = useRegle(
  { name: '', level0: { email: 'bar' } },
  {
    name: { required, minLength: minLength(5) },
    level0: {
      email: { email },
    },
  }
);

r$.$validate();

const flattenErrors = flatErrors(r$.$errors);
//     [
//      "This field is required", 
//      "Value must be an valid email address"
//     ]
```


### `includePath` option

This helper also include an option to have the path of the property (compatible with lodash `get`) next to the error.


```ts twoslash
import { flatErrors, useRegle } from '@regle/core';
import { email, minLength, required } from '@regle/rules';

const { r$ } = useRegle(
  { name: '', level0: { email: 'bar' } },
  {
    name: { required, minLength: minLength(5) },
    level0: {
      email: { email },
    },
  }
);

r$.$validate();

const flattenErrors = flatErrors(r$.$errors, {includePath: true});
//     [
//      { error: "This field is required", path: "name" }, 
//      { error: "Value must be an valid email address", path: "level0.email"}
//     ]
```