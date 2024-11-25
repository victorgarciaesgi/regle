---
title: Typing props
---

<script setup>
import Parent from '../parts/components/typing-props/Parent.vue';
</script>

# Typing props

You form don't necessary stays in one component. It's common sense to split your logic into multiple ones.

For this I recommend as a first solution a `Pinia` store, so types are infered automatically.
You can find it [explained here](/advanced-usage/usage-with-pinia).

But if you can't use Pinia, we'll go though the options.

## Typing component props

As Regle's types are complex and based on both your state and your rules, it's hard to replicate manually.

`@regle/core` exports all its utility types, it can be long to explain each one of them, so we'll show the simplest way to type your props.


To avoid jungling with complex generic types, you can declare your form in a composable inside a file outside your component, and use this composable to type your props.


:::code-group

```ts twoslash include useMyForm [useMyForm.ts]
import { useRegle } from '@regle/core';
import { email, maxValue, minLength, numeric, required } from '@regle/rules';

export function useMyForm() {
  return useRegle(
    { email: '', user: { firstName: '', lastName: '' } },
    {
      email: { required, email: email },
      user: {
        firstName: {
          required,
          minLength: minLength(6),
        },
        lastName: {
          minLength: minLength(6),
        },
      },
    }
  );
}
```

```vue twoslash [Parent.vue]
<template>
  <input v-model="state.email" placeholder="age" />
  <Child :regle="r$" />
</template>

<script setup lang="ts">
// @include: useMyForm
// ---cut---
// @noErrors
import Child from './Child.vue';
import { useMyForm } from './myForm';

const { r$, state} = useMyForm();
</script>
```

```vue twoslash [Child.vue]
<template>
  <ul>
    <li v-for="error of regle.$errors.email" :key="error">
      {{ error }}
    </li>
  </ul>
</template>

<script setup lang="ts">
// @include: useMyForm
// ---cut---
// @noErrors
import type { useMyForm } from './myForm';

const props = defineProps<{
  regle: ReturnType<typeof useMyForm>['r$'];
}>();
</script>
```
:::



## Typing a field prop

It's possible that you have an `MyInput` like component that contains your business logic.
You may want to pass regle computed properties to this component to display useful information to the user.

Here's how you can do it:

:::code-group

```vue twoslash [MyInput.vue]
<template>
  <div class="my-input">
    <input
      v-model="modelValue"
      :class="{ valid: field.$valid, error: field.$error }"
      :placeholder="placeholder"
    />
    <ul v-if="field.$errors.length">
      <li v-for="error of field.$errors" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { RegleFieldStatus } from '@regle/core';

const modelValue = defineModel<string>();

const props = defineProps<{
  field: RegleFieldStatus<string>;
  placeholder: string;
}>();
</script>
````

```vue twoslash [myForm.vue]
<template>
  <form>
    <MyInput v-model="state.name" :field="r$.$fields.name" placeholder="Type your name" />
    <MyInput v-model="state.email" :field="r$.$fields.email" placeholder="Type your email" />
  </form>
</template>

<script setup lang="ts">
// @noErrors
import MyInput from './MyInput.vue';
import { useRegle } from '@regle/core';
import { email, required } from '@regle/rules';


const {r$, state} = useRegle({name: '', email: ''}, {
  name: {required},
  email: {required, email},
})
</script>
```

:::

<Parent/>