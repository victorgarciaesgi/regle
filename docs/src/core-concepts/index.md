---
title: useRegle
---

# `useRegle`

`useRegle` is the core of all your forms. This composable takes a state and a set of rules as inputs and provides everything you need as output.

Let’s look at a simple example to understand how it works:

``` ts twoslash [useRegle.ts]
import { useRegle } from '@regle/core';

const { r$ } = useRegle({ name: '' }, {
  name: {
    // rules
  }
})
```

## `r$`

If you’ve used Vuelidate before, useRegle functions similarly to `v$`.

Regle is a reactive object containing various computed properties and methods that you can freely use based on your requirements.

You can find all the [available properties here](/core-concepts/validation-properties)

``` ts twoslash
// @noErrors
import { useRegle } from '@regle/core';
import { required } from '@regle/rules';

const { r$ } = useRegle({ name: '' }, {
  name: { required }
})

r$.$fields.
//         ^|
```

## State

The first parameter of `useRegle` is the state. It will be targeted by your rules.

The state can be:

- A raw object
- A Ref object
- A Reactive object
- A raw object containing nested Refs

If you pass a reactive state, you have the flexibility to bind your model either to the original state or to the state proxy returned by useRegle.

## Rules

The second parameter of `useRegle` is the rules declaration, you can declare a tree matching your input state. Each property can then declare a record of validation rules to define its `$invalid` state.
Regle provide a list of default rules that you can use from `@regle/rules`.

You can find the [list of built-in rules here](/core-concepts/rules/built-in-rules)

``` ts twoslash 
// @noErrors
import { useRegle } from '@regle/core';
import { required, num } from '@regle/rules';
//                    ^|

const { r$ } = useRegle({ title: '', user: { firstName: '', lastName: '' }}, {
  user: {
    firstName: { required },
    lastName: { required },
  },
  title: { "" }
  //        ^|
})
```

