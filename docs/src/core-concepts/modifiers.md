---
title: Modifiers
description: Modifiers allow you to control the behavior and settings of validation rules in your application
---

<script setup>
import ExternalErrors from '../parts/components/modifiers/ExternalErrors.vue';
</script>

# Modifiers

Modifiers allow you to control the behavior and settings of validation rules in your application. They can be applied globally to all fields or customized per field.

## Deep modifiers

Deep modifiers are specified as the third argument of the `useRegle` composable. They apply recursively to all fields within your state.

```ts
const { r$ } = useRegle({}, {}, {
 /* modifiers */
})
```

### `autoDirty`

__Type__: `boolean`

__Default__: `true`

Automatically set the dirty set without the need of `$value` or `$touch`.

### `silent`

__Type__: `boolean`

__Default__: `false`

Regle Automatically tracks changes in the state for all nested rules. If set to `true`, you must manually call `$touch` or `$validate` to display errors.



### `lazy`

__Type__: `boolean`

__Default__: `false`

Usage:

When set to false, tells the rules to be called on init, otherwise they are lazy and only called when the field is dirty.

### `externalErrors`

__Type__: `RegleExternalErrorTree<State>` 

Pass an object, matching your error state, that holds external validation errors. These can be from a backend validations or something else.

Check the [External errors](/advanced-usage/external-errors) section for more details.


### `rewardEarly`

__Type__: `boolean`

__Default__: `false`

__Side effect__: disable `$autoDirty` when `true`.

Enables the `reward-early-punish-late` mode of Regle. This mode will not set fields as invalid once they are valid, unless manually triggered by `$validate` method.

This will have no effect only if you use `autoDirty: true`.

### `clearExternalErrorsOnChange`

__Type__: `boolean`

__Default__: `true`

This mode is similar to `rewardEarly`, but only applies to external errors.
Setting it to `false` will keep the server errors until `$clearExternalErrors` is called.

### `validationGroups`

__Type__: `(fields) => Record<string, (RegleFieldStatus |RegleCollectionStatus)[]>`

Validation groups let you merge field properties under one, to better handle validation status.

You will have access to your declared groups in the `r$.$groups` object.

```ts twoslash
// @noErrors
import { ref } from 'vue';
// ---cut---
import { useRegle } from '@regle/core';
import { required } from '@regle/rules';

const { r$ } = useRegle({ email: '', user: { firstName: '' } }, {
  email: { required },
  user: {
    firstName: { required },
  }
}, {
  validationGroups: (fields) => ({
    group1: [fields.email, fields.user.firstName]
  })
})

r$.$groups.group1.
//                ^|
```
<br><br><br><br>

## Per-field modifiers

Per-field modifiers allow to customize more precisely which behavior you want for each field.

```ts twoslash
// @noErrors
import { useRegle } from '@regle/core';
// ---cut---
const { r$ } = useRegle({ name: '' }, {
  name: { $ }
//         ^|    
})
```

<br><br>


`$autoDirty` `$lazy`, `$silent` and `$rewardEarly` work the same as the deep modifiers.

### `$debounce`
Type: `number` (ms)

This let you declare the number of milliseconds the rule needs to wait before executing. Useful for async or heavy computations.

:::tip
All async rules have a default debounce of `200ms`, you can disable or modify this setting with `$debounce`
:::


## Array specific modifiers

This modifiers are only impacting Array collections.

```ts
const { r$ } = useRegle({ collection: [] }, {
  collection: { /** Deep modifiers */ }
})
```

### `$deepCompare`
Type: `boolean`

Default: `false`

Allow deep compare of array children to compute the `$edited` property.

It's disabled by default for performance reasons.
