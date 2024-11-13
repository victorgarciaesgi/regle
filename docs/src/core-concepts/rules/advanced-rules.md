---
title: Advanced rules
---

# Advanced rule declaration with `createRule`

If you want to create a reusable rule, it's advised to create using `createRule`. It will help you define the type, the params, the active state etc...

Exemple: Recreating a simple `required` rule

```ts twoslash
// @noErrors
import { createRule, defineType } from '@regle/core';
import { ruleHelpers } from '@regle/rules';

export const required = createRule({
  type: defineType('required'),
  validator: (value) => {
    return ruleHelpers.isFilled(value);
  },
  message: 'This field is required',
});
```
Let's break down the options 

### `type` 
Type: `ReturnType<defineType>`

*required*

This property value should always be `defineType`. This tool will help you define the name of the validator and it's type. It will default to `unknwown`.

If you want to force a type for your validator to be used with you can do it like this:

```ts
type: defineType<number | string>('numeric')
```

### `validator`
Type: `(value, ...params?) => boolean | {$valid: boolean, [x: string]: any}`

*required*

The `validator` function is what should define if the field is valid or not. You can write it exactly like a Inline rule.

### `message`
Type: `string | (value, ...metadata) => (string | string[])`

*required*

This will define what error message you assign to your rule. It can be a string or a function receiving the value, params and metadata as parameters

### `active`
Type: `boolean | (value, ...metadata) => boolean`

*optional*

This will define the `$active` state of the rule. This will compute wether or not the rule is currently validating or not (More informations on the [Parameters and active mode](#parameters-and-active-mode))



## Parameters and active mode

With `createRule` you can easily define a rule that will depends on external parameters, and having an `$active` state

To declare parameters you need to provide a second type parameter to the `defineType` helper

```ts
type: defineType<unknown, [foo: number]>('bar')
// Optional params
type: defineType<unknown, [optional?: string]>('bar')
// Multiple params
type: defineType<unknown, [param1: string, param2?: number]>('bar')
```

Declaring a parameter will transform your rule as a function accepting the params you declared as either a raw value, a Ref, or a getter function.

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

```ts twoslash
// @noErrors
import { createRule, defineType, useRegle } from '@regle/core';
import { ruleHelpers } from '@regle/rules';
import { ref } from 'vue';

export const requiredIf = createRule({
  type: defineType<unknown, [condition: boolean]>('required'),
  validator(value, condition) {
    // Params like `condition` will always be unwrapped here
    // no need to check if it's a value or a getter function
    if (condition) {
      return ruleHelpers.isFilled(value);
    }
    return true;
  },
  message(value, {$params: [condition]}) {
    return `This field is required`,
  }
  active(value, { $params: [condition] }) {
    return condition;
  },
});

```

 Then use it in your form

```vue
<script setup lang='ts'>
import { useRegle } from '@regle/core';
import {requiredIf} from './';
import {ref} from 'vue';

const condition = ref(false);

const {regle, errors, resetAll} = useRegle({name: ''}, {
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
    <input v-model='form.name' :placeholder='`Type your name${regle.$fields.name.$rules.required.$active ? "*": ""}`'/>
    <button type="button" @click="resetAll">Reset</button>
  </div>
  <ul v-if="errors.name.length">
    <li v-for="error of errors.name">
      {{ error }}
    </li>
  </ul>
</template>
```

Result: 

<div class="demo-container">
  <div>
    <input v-model="condition" type='checkbox'/>
    <label>The field is required</label>
  </div>
  <div>
    <input v-model='form.name' :placeholder='`Type your name${regle.$fields.name.$rules.required.$active ? "*": ""}`'/>
    <button type="button" @click="resetAll">Reset</button>
  </div>
  <ul v-if="errors.name.length">
    <li v-for="error of errors.name">
      {{ error }}
    </li>
  </ul>
</div>

<script setup lang='ts'>
import { useRegle } from '@regle/core';
import { requiredIf } from '@regle/rules';
import { ref } from 'vue';

const form = ref({name: ''});
const condition = ref(false);

const {regle, errors, resetAll} = useRegle(form, {
  name: {required: requiredIf(condition)}
})
</script>


## Metadata

Like in inline rules, you can return any data from your validator function as long as it returns at least `$valid: boolean`

It can be useful for returning computed data from the validator, or in async function to process api result, or api errors.

```ts twoslash
import { createRule, defineType } from '@regle/core';

export const example = createRule({
  type: defineType('example'),
  validator: (value) => {
    if (value === 'regle') {
      return {
        $valid: false,
        foo: 'bar'
      }
    }
    return true;
  },
  message(value, {foo}) {
//                 ^?
    return 'Error example';
  },
});
```