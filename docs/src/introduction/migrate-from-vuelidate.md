---
title: Migrate from Vuelidate
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

Nested fields are not mixed up with other properties now.

```ts
v$.nested.child // [!code --]
r$.$fields.nested.$fields.child // [!code ++]
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
const { r$ } = useRegle({collection: [{name: ''}]}, { // [!code ++]
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
const {result, data} = await r$.$validate(); // [!code ++]
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

You can remove it and do configure it with [global config](/advanced-usage/global-config#replace-built-in-rules-messages).

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
    firstGroup: [fields.number, fields.nested.$fields.word]// [!code ++]
  })// [!code ++]
})// [!code ++]
r$.$groups.firstGroup// [!code ++]
```