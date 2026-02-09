# Typing Props

Pass Regle validation state to child components with full type safety.

## `InferRegleRoot` -- Typing the full `r$` prop

Define your form in a composable, then infer its type:

```ts
// useMyForm.ts
import { useRegle } from '@regle/core';
import { required, email, minLength } from '@regle/rules';

export function useMyForm() {
  return useRegle(
    { email: '', user: { firstName: '', lastName: '' } },
    {
      email: { required, email },
      user: {
        firstName: { required, minLength: minLength(6) },
        lastName: { minLength: minLength(6) },
      },
    }
  );
}
```

```vue
<!-- Parent.vue -->
<template>
  <Child :regle="r$" />
</template>

<script setup>
import { useMyForm } from './useMyForm';
const { r$ } = useMyForm();
</script>
```

```vue
<!-- Child.vue -->
<script setup lang="ts">
import { type InferRegleRoot } from '@regle/core';
import { type useMyForm } from './useMyForm';

const props = defineProps<{
  regle: InferRegleRoot<typeof useMyForm>;
}>();
</script>
```

`InferRegleRoot` also works with `@regle/schemas`.

## `RegleRoot` -- Manual typing

If you can't import the composable return type:

```vue
<script setup lang="ts">
import { type RegleRoot } from '@regle/core';

type FormState = { email: string; name: string };
type FormRules = { email: { required: true }; name: { required: true } };

const props = defineProps<{
  regle: RegleRoot<FormState, FormRules>;
}>();
</script>
```

Note: `r$` will be missing rule properties with manual typing.

## `RegleFieldStatus` -- Typing a single field prop

For reusable input components:

```vue
<!-- MyInput.vue -->
<template>
  <div>
    <input
      v-model="modelValue"
      :class="{ valid: field.$correct, error: field.$error }"
      :placeholder="placeholder"
    />
    <ul v-if="field.$errors.length">
      <li v-for="error of field.$errors" :key="error">{{ error }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { type RegleFieldStatus } from '@regle/core';

const modelValue = defineModel<string>();
defineProps<{
  field: RegleFieldStatus;
  placeholder?: string;
}>();
</script>
```

```vue
<!-- Usage -->
<template>
  <MyInput v-model="r$.$value.name" :field="r$.name" placeholder="Name" />
  <MyInput v-model="r$.$value.email" :field="r$.email" placeholder="Email" />
</template>
```

## Enforcing rules for a component

Require a specific rule to be present:

```vue
<script setup lang="ts">
import { type RegleFieldStatus } from '@regle/core';

defineProps<{
  field: RegleFieldStatus<string, { required: any }>;  // must have required rule
}>();
</script>
```

## With global configuration

When using `defineRegleConfig` with shortcuts or custom rules:

```ts
// config.ts
import { defineRegleConfig } from '@regle/core';

export const { useRegle: useCustomRegle } = defineRegleConfig({
  rules: () => ({ strongPassword: withMessage(() => true, 'test') }),
  shortcuts: {
    fields: { $isRequired: (field) => field.$rules.required?.$active ?? false },
  },
});
```

```vue
<script setup lang="ts">
import { type RegleFieldStatus } from '@regle/core';
import { type useCustomRegle } from './config';

defineProps<{
  field: RegleFieldStatus<string, any, typeof useCustomRegle>;
}>();
// field.$isRequired is now available
</script>
```
