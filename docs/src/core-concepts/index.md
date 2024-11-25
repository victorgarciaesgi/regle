---
title: useRegle
---

# `useRegle`

`useRegle` is the center piece of all your forms. The composable will take a state and rules as input and return everything you need as an ouput.

Let's see how to use it with the simplest case example

``` ts twoslash [useRegle.ts]
import {useRegle} from '@regle/core';

const {r$, state, ready, validateState, resetAll} = useRegle({name: ''}, {
  name: {
    // rules
  }
})
```

In the returned helpers we have:

- `r$`: it's the source of truth of all your form validation state (if you used **Vuelidate**, it's the same as `v$`)
- `state`: a copy of your form state. You can bind your model on this state if you have a non-reactive one as parameter
- `ready`: a computed state indicating if your form is ready to submit (to compute a disabled state on a button). It's equivalent to `!$invalid && !$pending`.
- `validateState`: a Promise that will turn all the fields dirty, and run all their validation rules. It will return either `false` or a type safe copy of your form state. Values that had the `required` rule will be transformed into a non-nullable value (type only)
- `resetAll`: Will reset both your validation state and your form state to their initial values. If you want only the validation to be reset you can call `r$.$reset()`


## `regle`

Regle is a reactive object containing a bunch of computed properties and methods you can use freely depending on your need.


``` ts twoslash
// @noErrors
import {useRegle} from '@regle/core';
import {required} from '@regle/rules';

const {r$, state, ready, validateState, resetAll} = useRegle({name: ''}, {
  name: {required}
})
r$.$fields.
//         ^|
```

## State

The first parameter is the state. It was will be targeted by your rules to be matched with.

State given as parameter can be either a raw object, a `Ref` object, a `Reactive` object, or an raw Object containing nested `Refs`. If you give a reactive state, you can either bind your model to the original one, or to the returned `state` proxy.

## Rules

In the rules sections, you can declare a tree matching your input state. Each property can then declare a record of validation rules to define its `$invalid` state.
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

