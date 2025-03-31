---
title: Typing props
---

<script setup>
import Parent from '../parts/components/typing-props/Parent.vue';
</script>

# Typing props

Forms often span multiple components, and splitting your logic across components is a common practice. Regle offers tools to help type your props correctly, ensuring type safety and improving developer experience.

The best way to manage a centralized form state with inferred types is by using a Pinia store. Learn more in the Usage with Pinia guide [explained here](/advanced-usage/usage-with-pinia).

If you cannot use Pinia, here are the alternative approaches.

## Typing component props

As Regle's types are complex and based on both your state and your rules, it's hard to replicate manually.

`@regle/core` exports all its utility types, it can be long to explain each one of them, so we'll show the simplest way to type your props.


To avoid juggling with complex generic types, you can declare your form in a composable inside a file outside your component, and use this composable to type your props.


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
  <input v-model="r$.$value.email" placeholder="age" />
  <Child :regle="r$" />
</template>

<script setup lang="ts">
// @include: useMyForm
// ---cut---
// @noErrors
import Child from './Child.vue';
import { useMyForm } from './myForm';

const { r$ } = useMyForm();
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
import type { InferRegleRoot } from '@regle/core';

const props = defineProps<{
  regle: InferRegleRoot<typeof useMyForm>;
}>();
</script>
```
:::



## Typing a field prop

It's possible that you have a `MyInput` like component that contains your business logic.
You may want to pass regle computed properties to this component to display useful information to the user.

Here's how you can do it:

:::code-group

```vue twoslash [MyInput.vue]
<template>
  <div class="my-input">
    <input
      v-model="modelValue"
      :class="{ valid: field.$correct, error: field.$error }"
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
```

```vue twoslash [myForm.vue]
<template>
  <form>
    <MyInput v-model="r$.$value.name" :field="r$.$fields.name" placeholder="Type your name" />
    <MyInput v-model="r$.$value.email" :field="r$.$fields.email" placeholder="Type your email" />
  </form>
</template>

<script setup lang="ts">
// @noErrors
import MyInput from './MyInput.vue';
import { useRegle } from '@regle/core';
import { email, required } from '@regle/rules';

const { r$ } = useRegle({ name: '', email: '' }, {
  name: { required },
  email: { required, email },
})
</script>
```
:::

<Parent/>


## Enforcing rules for a specific component


On your common Input component, you can also enforce a rule to be present in the field.


```vue twoslash [MyPassword.vue]
<script setup lang="ts">
import { computed } from 'vue';
// @noErrors
// ---cut---
import {
  type RegleEnforceRequiredRules,
  type RegleFieldStatus,
} from '@regle/core';

const props = defineProps<{
  field: RegleFieldStatus<
    string | undefined,
    RegleEnforceRequiredRules<'required' | 'minLength'>,
  >;
}>();
</script>
```


### For a custom rule

:::code-group


```ts twoslash include config [config.ts]
// @module: esnext
// @filename config.ts
import { withMessage } from '@regle/rules';
// ---cut---
import { defineRegleConfig } from '@regle/core';

export const { useRegle: useCustomRegle } = defineRegleConfig({
  rules: () => ({
    strongPassword: withMessage(() => true, 'test')
  }),
  shortcuts: {
    fields: {
      $test: () => true
    }
  }
});
```

```vue twoslash [MyPassword.vue]
<script setup lang="ts">
import { computed } from 'vue';
// @include: config
// @noErrors
// ---cut---
import {
  type RegleEnforceCustomRequiredRules,
  type RegleFieldStatus,
} from '@regle/core';
import type { useCustomRegle } from './config';

const props = defineProps<{
  field: RegleFieldStatus<
    string,
    RegleEnforceCustomRequiredRules<typeof useCustomRegle, 'strongPassword'>,
  >;
}>();
</script>
```

:::

### For custom shortcuts





```vue twoslash [MyPassword.vue]
<script setup lang="ts">
import { computed } from 'vue';
// @include: config
// @noErrors
// ---cut---
import {
  type RegleEnforceCustomRequiredRules,
  type RegleFieldStatus,
  type InferRegleShortcuts,
} from '@regle/core';
import type { useCustomRegle } from './config';

const props = defineProps<{
  field: RegleFieldStatus<
    string,
    {},
    InferRegleShortcuts<typeof useCustomRegle>
  >;
}>();
</script>
```

