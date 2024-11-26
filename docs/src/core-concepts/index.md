---
title: useRegle
---

# `useRegle`

`useRegle` is the center piece of all your forms. The composable will take a state and rules as input and return everything you need as an ouput.

Let's see how to use it with the simplest case example

``` ts twoslash [useRegle.ts]
import {useRegle} from '@regle/core';

const {r$} = useRegle({name: ''}, {
  name: {
    // rules
  }
})
```

## `r$`

if you used **Vuelidate**, it's the same as `v$`.

Regle is a reactive object containing a bunch of computed properties and methods you can use freely depending on your need.


``` ts twoslash
// @noErrors
import {useRegle} from '@regle/core';
import {required} from '@regle/rules';

const {r$} = useRegle({name: ''}, {
  name: {required}
})
r$.$fields.
//         ^|
```

## State

The first parameter of `useRegle` is the state. It was will be targeted by your rules to be matched with.

State given as parameter can be either a raw object, a `Ref` object, a `Reactive` object, or an raw Object containing nested `Refs`. If you give a reactive state, you can either bind your model to the original one, or to the returned `state` proxy.

## Rules

The second parameter of `useRegle` is the rules declaration, you can declare a tree matching your input state. Each property can then declare a record of validation rules to define its `$invalid` state.
Regle provide a list of default rules that you can use from `@regle/rules`.

You can find the [list of built-in rules here](/core-concepts/rules/built-in-rules)

``` ts twoslash 
// @noErrors
import {useRegle} from '@regle/core';
import {required, num } from '@regle/rules';
//                   ^|


const {r$} = useRegle({title: '', user: {firstName: '', lastName: ''}}, {
  user: {
    firstName: {required},
    lastName: {required},
  },
  title: { "" }
  //        ^|

})
```

