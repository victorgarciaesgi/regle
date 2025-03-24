---
title: Introduction
---

<script setup>
import QuickUsage from '../parts/components/QuickUsage.vue';
</script>

# Introduction

Regle is a type safe and headless form validation library made for Vue.

It's entirely data-driven, allowing the validation logic to mirror your data structure, enabling a clear separation between the UI and validation logic.

The API is made to mimic **Vuelidate's** one, so migration is a breeze.


## Basic example

```ts twoslash
// @noErrors
import { useRegle } from '@regle/core';
import { required, minLength, email } from '@regle/rules';

const { r$ } = useRegle({ email: '' }, {
  email: { required, email, minLength: minLength(4), ma },
  //                                                   ^|
})
```

<br/>

From `r$` , you can build any UI around your forms fields, like displaying error messages, handling **dirty** fields, reseting and validating values etc...


## Complete example

<!-- @include: @/parts/QuickUsage.md -->

Result:

<QuickUsage/>


## Learn to use Regle

:::tip
You can jump directly to [core concepts](/core-concepts/) to learn usage.
:::
