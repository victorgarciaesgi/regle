---
title: useRegle
---

# Understanding `useRegle`

`useRegle` is the heart of Regle. It's the composable that transforms your data and validation rules into a powerful, reactive validation system.

Think of it as a bridge between your form data and your validation logic. You give it your state and rules, and it gives you back everything you need.

## The Big Picture

Here's how `useRegle` works at a high level:

```vue [App.vue]
<script setup lang='ts'>
import { useRegle } from '@regle/core';

const { r$ } = useRegle(
  /* 1. Your data (state) */,
  /* 2. Your validation rules */,
  /* 3. Optional modifiers */
);

// r$ now contains your validation state, errors, and methods
</script>
```

Let's break down each piece:

:::tip
Regle only works with the [Composition API](https://vuejs.org/guide/extras/composition-api-faq). There's no plan to support the Options or Class API—the Composition API's reactivity system is essential for Regle to work.
:::

## State: Your Form Data

The first parameter is your form data—the actual values users will be entering. Regle is flexible about how you define this state.

### Different Ways to Define State

**Raw Object** (simplest approach):
```ts
const { r$ } = useRegle(
  { name: '', email: '', age: 0 }, 
  /* rules */
)
```

**Reactive Object** (when you need the state elsewhere):
```ts
const formData = reactive({ name: '', email: '', age: 0 });
const { r$ } = useRegle(formData, /* rules */)

// You can bind to either formData or r$.$value
```

**Ref Object** (for complex scenarios):
```ts
const formData = ref({ name: '', email: '', age: 0 });
const { r$ } = useRegle(formData, /* rules */)
```

**Mixed Refs** (when individual fields need to be refs):
```ts
const formData = { 
  name: ref(''), 
  email: ref(''), 
  age: ref(0) 
}
const { r$ } = useRegle(formData, /* rules */)
```

**Single Value** (for validating just one field):
```ts
const email = ref('');
const { r$ } = useRegle(email, /* rules */)
```

## Rules: Your Validation Logic

The second parameter defines how your data should be validated. The beautiful thing about Regle is that your rules structure mirrors your data structure exactly.

### Basic Rules Declaration

```ts
import { required, email, minLength } from '@regle/rules';

const { r$ } = useRegle(
  { 
    user: { 
      name: '', 
      email: '' 
    },
    message: ''
  },
  {
    user: {
      name: { required, minLength: minLength(2) },
      email: { required, email }
    },
    message: { required, minLength: minLength(10) }
  }
)
```

See how the rules structure matches the data structure? This makes it easy to understand and maintain.

### Dynamic Rules object

Sometimes your validation rules need to change based on other values or conditions. Regle handles this elegantly:

:::code-group
```ts [Inline]
import { useRegle } from '@regle/core';

// The rule object will not react to computed changes
useRegle({ name: '' }, {
  name: { required }
})
```

```ts [Getter]
import { useRegle } from '@regle/core';

// The rules can now detect computed properties inside the object
useRegle({ name: '' }, () => ({
  name: { required }
}))
```

```ts [Computed]
import { inferRules } from '@regle/core';

const state = ref({name: ''});

// inferRules preserves TypeScript autocompletion
const rules = computed(() => {
  return inferRules(state, {
    name: { required }
  })
})

const { r$ } = useRegle(state, rules);
```
:::


### Available Rules

Regle comes with a comprehensive set of built-in rules:

```ts
import { 
  required, email, minLength, maxLength,
  numeric, between, url, regex,
  // ... and many more
} from '@regle/rules';
```

Check out the [complete list of built-in rules](/core-concepts/rules/built-in-rules) to see everything available.

:::tip Type-First Validation
If you prefer to define your validation schema first (like with Zod) and infer your TypeScript types from it, check out [how to infer state from rules](/typescript/infer-state-from-rules).
:::

## The stored result : `r$`

When you call `useRegle`, you get back an object containing `r$`—your validation state. If you've used Vuelidate before, `r$` works similarly to `v$`.

`r$` is a reactive object that contains everything you need to build your form UI:


<br/>

### Common `r$` Properties

If you’ve used Vuelidate before, useRegle behaves similarly to `v$`.

`r$` is a reactive object containing the values, errors, dirty state and all the necessary validations properties you'll need to display information.

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
