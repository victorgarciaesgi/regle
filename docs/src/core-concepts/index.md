---
title: useRegle
---

# `useRegle`

`useRegle` serves as the foundation for validation logic.

It accepts the following inputs:

- **State:** This can be a plain object, a `ref`, a `reactive` object, or a structure containing nested refs.
- **Rules:** These should align with the structure of your state.
- **Modifiers:** (optional)

<br/>

```vue [App.vue]
<script setup lang='ts'>
import { useRegle } from '@regle/core';

const { r$ } = useRegle(/* state */, /* rules */, /* modifiers */);
</script>
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

The second parameter of `useRegle` is the rules declaration, you can declare a tree matching your input state. 

Each property can then declare a record of validation rules to define its `$invalid` state.

Regle provide a list of default rules that you can use from `@regle/rules`.

You can find the [list of built-in rules here](/core-concepts/rules/built-in-rules)

<br/>

``` vue twoslash [App.vue]
<script setup lang='ts'>

import {ref} from 'vue';
// @noErrors
// ---cut---
import { useRegle } from '@regle/core';
import { required } from '@regle/rules';

const state = ref({ 
  user: { 
    firstName: '', 
    lastName: '' 
  }
  title: '', 
})

const { r$ } = useRegle(state, {
  user: {
    firstName: { required },
    lastName: { required },
  },
  title: { m }
  //        ^|
})
</script>

```

## `r$`

If you’ve used Vuelidate before, useRegle behaves similarly to `v$`.

Regle is a reactive object containing various computed properties and methods that you can freely use based on your requirements.

You can find all the [available properties here](/core-concepts/validation-properties)

``` vue twoslash [App.vue]
<script setup lang='ts'>
// @noErrors
import { useRegle } from '@regle/core';
import { required } from '@regle/rules';

const { r$ } = useRegle({ email: '' }, {
  email: { required }
})

r$.$fields.
//         ^|
</script>

```

