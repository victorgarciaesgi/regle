---
title: Advanced rules
---

<script setup>
  import ParametersAndActiveMode from '../../parts/components/rules/ParametersAndActiveMode.vue';
    import AsyncRule from '../../parts/components/rules/AsyncRule.vue';

</script>

# Advanced rules


## `createRule`

If you want to create a reusable rule, it's advised to create using `createRule`. It will help you define the type, the params, the active state etc...

Exemple: Recreating a simple `required` rule

```ts twoslash
// @noErrors
import { createRule } from '@regle/core';
import { ruleHelpers } from '@regle/rules';

export const required = createRule({
  type: 'required',
  validator: (value: unknown) => {
    return ruleHelpers.isFilled(value);
  },
  message: 'This field is required',
});
```
Let's break down the options 

### `validator`
_**Type**_: `(value, ...params?) => boolean | {$valid: boolean, [x: string]: any}`

*required*

The `validator` function is what should define if the field is valid or not. You can write it exactly like a Inline rule.

### `message`
_**Type**_: `string | (value, ...metadata) => (string | string[])`

*required*

This will define what error message you assign to your rule. It can be a string or a function receiving the value, params and metadata as parameters

### `type` 
_**Type**_: `string`

*optional*

This property define a type of validator, because multiple rules can share the same target as a result (like `required` & `requiredIf`)


### `active`
_**Type**_: `boolean | (value, ...metadata) => boolean`

*optional*

This will define the `$active` state of the rule. This will compute wether or not the rule is currently validating or not (More informations on the [Parameters and active mode](#parameters-and-active-mode))



## Parameters and active mode

With `createRule` you can easily define a rule that will depends on external parameters, and having an `$active` state

Regle will detect that your validator requires parameters and transform your rule to a function accepting the params you declared as either a raw value, a Ref, or a getter function.

```ts
myValidator(5);
const max = ref(5);
myValidator(max)
myValidator(() => max.value)
```

:::warning
If you pass a raw value as a parameter, it will only be reactive if all your rules are declared as a computed or a getter function

```ts
// Getter rule function
useRegle({}, () => ({}))

const rules = computed(() => ({}))
useRegle({}, rules);

```
:::

Exemple: Recreating `requiredIf` rules


::: code-group
```ts twoslash include requiredIf [requiredIf.ts]
// @noErrors
import { createRule, useRegle } from '@regle/core';
import { ruleHelpers } from '@regle/rules';
import { ref } from 'vue';

export const requiredIf = createRule({
  type: 'required',
  validator(value: unknown, condition: boolean) {
    // Params like `condition` will always be unwrapped here
    // no need to check if it's a value, a ref or a getter function
    if (condition) {
      return ruleHelpers.isFilled(value);
    }
    return true;
  },
  message({ $params: [condition] }) {
    return `This field is required`,
  }
  active({ $params: [condition] }) {
    return condition;
  },
});
```

```vue twoslash {20} [Form.vue]
<script setup lang='ts'>
// @include: requiredIf
import { ref } from 'vue';
// ---cut---
import { useRegle } from '@regle/core';

const condition = ref(false);

const {r$} = useRegle({name: ''}, {
  name: {required: requiredIf(condition)}
})
</script>

<template>
  <div>
    <input v-model="condition" type='checkbox'/>
    <label>The field is required</label>
  </div>
  <div>
    <!-- Here we can use $active to know if the rule is enabled -->
    <input 
      v-model='form.name'
      :placeholder='`Type your name${r$.$fields.name.$rules.required.$active ? "*": ""}`'/>
    <button type="button" @click="r$.$resetAll">Reset</button>
  </div>
  <ul v-if="r$.$errors.name.length">
    <li v-for="error of r$.$errors.name" :key='error'>
      {{ error }}
    </li>
  </ul>
</template>
```
:::

Result: 

<ParametersAndActiveMode/>

## Async rules


Async rules let you handle validations that are only possible on server, or expensive local ones. It will update the `$pending` status each time it's called.

```vue twoslash [App.vue]
<template>
  <div class="demo-container">
    <div>
      <input
        v-model="form.email"
        :class="{ pending: r$.$fields.email.$pending }"
        placeholder="Type your email"
      />
      <button type="button" @click="r$.$resetAll">Reset</button>
      <button type="button" @click="r$.$validate">Submit</button>
    </div>
    <span v-if="r$.$fields.email.$pending"> Checking... </span>
    <ul v-if="r$.$errors.email.length">
      <li v-for="error of r$.$errors.email" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
function randomBoolean(): boolean {
  return [1, 2][Math.floor(Math.random() * 2)] === 1 ? true : false;
}

function timeout(count: number) {
  return new Promise((resolve) => setTimeout(resolve, count));
}
// ---cut---
import { createRule, useRegle, type Maybe } from '@regle/core';
import { email, ruleHelpers } from '@regle/rules';
import { ref } from 'vue';

const checkEmailExists = createRule({
  async validator(value: Maybe<string>) {
    if (ruleHelpers.isEmpty(value) || !email.exec(value)) {
      return true;
    }
    await timeout(1000);
    return randomBoolean();
  },
  message: 'This email already exists',
});

const form = ref({ email: '' });

const { r$ } = useRegle(form, {
  email: { email, checkEmailExists },
});
</script>
```


<AsyncRule/>

## Metadata

Like in inline rules, you can return any data from your validator function as long as it returns at least `$valid: boolean`

It can be useful for returning computed data from the validator, or in async function to process api result, or api errors.

```ts twoslash {9}
import { createRule } from '@regle/core';

export const example = createRule({
  validator: (value) => {
    if (value === 'regle') {
      return {
        $valid: false,
        foo: 'bar'
      }
    }
    return true;
  },
  message({foo}) {
//           ^?
    return 'Error example';
  },
});
```