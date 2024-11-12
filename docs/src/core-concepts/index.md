---
title: useRegle
---


# `useRegle`

`useRegle` is the center piece of all your forms. The composable will take a state and rules as input and return everything you need as an ouput.

Let's see how to use it with the simplest case example

``` vue twoslash
<script setup lang='ts'>
import {useRegle} from '@regle/core';

const {regle, state, errors, invalid, validateForm, resetForm} = useRegle({name: ''}, {
  name: {
    // rules
  }
})

</script>
```

In the returned helpers we have:

- `regle`: it's the source of truth of all your form validation state (if you used Vuelidate, it's the same as `v$`)
- `state`: a copy of your form state. You can bind your model on this state if you have a non-reactive one as parameter
- `errors`: a computed tree focusing only on displaying errors to the user when it's needed. You can map on this tree to display the field error. It will contain an error only if the field is dirty
- `invalid`: a computed state returning the current invalid state of your form.
- `validateForm`: a Promise that will turn all the fields dirty, and run all their validation rules. It will return either `false` or a type safe copy of your form state. Values that had the `required` rule will be transformed into a non-nullable value (type only)
- `resetForm`: Will reset both your validation state and your form state to their initial values. If you want only the validation to be reset you can call `regle.$reset()`


Let's deep dive in details what each property can do

## `regle`

Regle is a reactive object containing a bunch of computed properties and methods you can use freely depending on your need.

Most of the time, you would only need the `errors` property, but for custom behaviours it's really useful

``` ts twoslash
// @noErrors
import {useRegle} from '@regle/core';

const {regle, state, errors, invalid, validateForm, resetForm} = useRegle({name: ''}, {
  name: {
    // rules
  }
})
```

You can find a complete description of the properties in the [properties section](/core-concepts/common-properties)