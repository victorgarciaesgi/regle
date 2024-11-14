---
title: useRegle
---


# `useRegle`

`useRegle` is the center piece of all your forms. The composable will take a state and rules as input and return everything you need as an ouput.

Let's see how to use it with the simplest case example

``` ts twoslash
import {useRegle} from '@regle/core';

const {regle, state, errors, invalid, validateState, resetAll} = useRegle({name: ''}, {
  name: {
    // rules
  }
})
```

In the returned helpers we have:

- `regle`: it's the source of truth of all your form validation state (if you used Vuelidate, it's the same as `v$`)
- `state`: a copy of your form state. You can bind your model on this state if you have a non-reactive one as parameter
- `errors`: a computed tree focusing only on displaying errors to the user when it's needed. You can map on this tree to display the field error. It will contain an error only if the field is dirty
- `invalid`: a computed state returning the current invalid state of your form.
- `validateState`: a Promise that will turn all the fields dirty, and run all their validation rules. It will return either `false` or a type safe copy of your form state. Values that had the `required` rule will be transformed into a non-nullable value (type only)
- `resetAll`: Will reset both your validation state and your form state to their initial values. If you want only the validation to be reset you can call `regle.$reset()`


## `regle`

Regle is a reactive object containing a bunch of computed properties and methods you can use freely depending on your need.

Most of the time, you would only need the `errors` property, but for custom behaviours it's really useful

``` ts twoslash
// @noErrors
import {useRegle} from '@regle/core';
import {required} from '@regle/rules';

const {regle, state, errors, invalid, validateState, resetAll} = useRegle({name: ''}, {
  name: {required}
})
regle.$fields.
//            ^|
```

## `errors`

Errors is a shortcut to avoid diging into the deep `regle` object for errors. It will returns a tree matching your state with all the current `$errors` (So when the field is `$dirty` and `$invalid`)

You can find a complete description of the properties in the [properties section](/core-concepts/validation-properties)

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


const {regle} = useRegle({title: '', user: {firstName: '', lastName: ''}}, {
  user: {
    firstName: {required},
    lastName: {required},
  },
  title: { "" }
  //        ^|

})
```

