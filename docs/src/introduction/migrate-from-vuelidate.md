---
title: Migrate from Vuelidate
description: Migrate to Regle with ease
---

# Migrate from Vuelidate

Migrating from Vuelidate is really simple. Regle API is similar to Vuelidate's one on purpose, so the mental model stays the same.

Regle type safety will ensure you make no mistakes while making the migration.

## Imports

```ts
import { useVuelidate } from '@vuelidate/core'; // [!code --]
import { required } from '@vuelidate/validators'; // [!code --]
import { useRegle } from '@regle/core'; // [!code ++]
import { required } from '@regle/rules'; // [!code ++]
```

```ts
const v$ = useVuelidate(rules, state, options); // [!code --]
const { r$ } = useRegle(state, rules, options); // [!code ++]
```


## Helpers

```ts
import { helpers } from '@vuelidate/validators'; // [!code --]
import { withMessage, withParams, withAsync, isEmpty, ... } from '@regle/rules'; // [!code ++]
```

Helpers which have been renamed:

- `req` -> `isFilled`
- `len` -> `getSize`
- `regex` -> `matchRegex`
- `forEach` -> Deleted, you can use `$each` directly.
- `unwrap` -> use `toValue` from [Vue](https://vuejs.org/api/reactivity-utilities#tovalue)
  - Parameters are automatically unwrapped when using `createRule`


## Displaying errors


Vuelidate:
```vue
<template> 
  <p 
    v-for="error of v$.name.$errors"
    :key="error.$uid" 
  >
      {{error.$message}}
  </p>
</template>
```

Regle: 
```vue
<template>
  <p
    v-for="(error, index) of r$.$errors.name"
    :key="index"
  >
      {{ error }} 
  </p>
</template>
```

### `withMessage`

Order of parameters are swapped

```ts
const rule = helpers.withMessage('This field cannot be empty', required) // [!code --]
const rule = withMessage(required, 'This field cannot be empty') // [!code ++]
```

### `withParams`

You can create rules with parameters with [createRule](/core-concepts/rules/reusable-rules#createrule) helper

```ts
const contains = (param) => // [!code --]
  helpers.withParams( // [!code --]
    { type: 'contains', value: param }, // [!code --]
    (value) => !helpers.req(value) || value.includes(param) // [!code --]
  ) // [!code --]

const contains = createRule({ // [!code ++]
  validator(value: Maybe<string>, param: Maybe<string>) { // [!code ++]
    return isEmpty(value) && value.includes(param); // [!code ++]
  }, // [!code ++]
  message: ({$params: [param]}) => `Value must contain ${param}`; // [!code ++]
}) // [!code ++]
```

## Properties

Some properties have been renamed

- `$model` -> `$value`
- `$response` -> `$metadata`  [Using metadata from rules](/advanced-usage/rule-metadata#using-metadata-from-rules)
- `$externalResults` -> `$externalErrors`

### Accessing nested fields

```ts
v$.nested.child.$error // [!code --]
r$.nested.child.$error // [!code ++]
```

## Collections

[Working with collections](/advanced-usage/collections)

```ts
const v$ = useVuelidate({ // [!code --]
  collection: { // [!code --]
    $each: helpers.forEach({ // [!code --]
      name: { // [!code --]
        required // [!code --]
      } // [!code --]
    }) // [!code --]
  } // [!code --]
}, {collection: [{name: ''}]}) // [!code --]
const { r$ } = useRegle({ collection: [{name: ''}]}, { // [!code ++]
  collection: {// [!code ++]
    $each: {// [!code ++]
      name: {// [!code ++]
        required// [!code ++]
      }// [!code ++]
    }// [!code ++]
  }// [!code ++]
})// [!code ++]
```

## Methods

[Type safe output](/core-concepts/type-safe-output)


```ts
const result = await v$.$validate(); // [!code --]
const { valid, data } = await r$.$validate(); // [!code ++]
```

## Custom messages

If you used to declare this kind of helper methods with Vuelidate:

```ts
import {helpers, required, numeric, minLength} from '@vuelidate/validators';

export const requiredValidator = helpers.withMessage(
  'This field is required.',
  required
);
export const numericValidator = helpers.withMessage(
  'Please enter a valid value.',
  numeric
);

export const minLengthValidator = (value) =>
  helpers.withMessage(
    ({ $model, $params }) =>
      `Please enter a value greater than or equal to  ${$params.max}.`,
    minLength(value)
  );
```

You can remove it and configure it with [global config](/advanced-usage/global-config#replace-built-in-rules-messages).

```ts twoslash
import { defineRegleConfig } from '@regle/core';
import { withMessage, minLength, required, numeric } from '@regle/rules';

const { useRegle: useCustomRegle } = defineRegleConfig({
  rules: () => ({
    required: withMessage(required, 'This field is required.'),
    numeric: withMessage(numeric, 'Please enter a valid value.'),
    minLength: withMessage(minLength, ({ $value, $params: [max] }) => {
      return `Minimum length is ${max}. Current length: ${$value?.length}`;
    })
  })
})

const { r$ } = useCustomRegle({ name: '' }, {
  name: {
    required,
    numeric,
    minLength: minLength(6)
  }
})
```

## Nested component validation

__**Nested component**__ validation is replaced by __**Scoped validation**__.

See [docs for scoped validation](/advanced-usage/scoped-validation) for more details

```ts twoslash
// [scoped-config.ts]
import { useScopedRegle, useCollectScope, useRegle } from '@regle/core'; // [!code ++]

// @noErrors
// Parent.vue
const v$ = useVuelidate(); // [!code --]
const v$ = useVuelidate({}, {}, {$scope: 'foo'}); // [!code --]

const { r$ } = useCollectScope(); // [!code ++]
const { r$ } = useCollectScope('foo'); // [!code ++]


// Child.vue

const v$ = useVuelidate(validations, state); // [!code --]
const v$ = useVuelidate(validations, state, { $scope: false }); // [!code --]
const v$ = useVuelidate(validations, state, { $scope: 'foo' }); // [!code --]
const v$ = useVuelidate(validations, state, { $stopPropagation: true }); // [!code --]

const { r$ } = useScopedRegle(state, validations); // [!code ++]
const { r$ } = useRegle(state, validations); // [!code ++]
const { r$ } = useScopedRegle(state, validations, {namespace: 'foo'}); // [!code ++]
const { r$ } = useScopedRegle(state, validations); // [!code ++]
```

## Validation groups

```ts
const rules = { // [!code --]
  number: { isEven },// [!code --]
  nested: {// [!code --]
    word: { required: v => !!v }// [!code --]
  },// [!code --]
  $validationGroups: {// [!code --]
    firstGroup: ['number', 'nested.word']// [!code --]
  }// [!code --]
}// [!code --]
const v$ = useVuelidate(rules, ...);// [!code --]

const { r$ } = useRegle(..., { // [!code ++]
  number: {isEven},// [!code ++]
  nested: {// [!code ++]
    word: { required: v => !!v }// [!code ++]
  }// [!code ++]
}, {// [!code ++]
  validationGroups: (fields) => ({// [!code ++]
    firstGroup: [fields.number, fields.nested.word]// [!code ++]
  })// [!code ++]
})// [!code ++]
r$.$groups.firstGroup// [!code ++]
```