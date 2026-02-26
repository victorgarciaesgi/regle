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

### `immediateDirty`

__Type__: `boolean`

__Default__: `false`

Set the dirty state to true when the form is initialized.

### `disabled`

__Type__: `boolean`

__Default__: `false`

Temporarily pauses Regle reactivity and validation computation.

When `disabled` is `true`, state changes still happen, but validation status does not update until you enable it again.

```ts
import { ref } from 'vue';
import { useRegle } from '@regle/core';
import { required } from '@regle/rules';

const disabled = ref(false);

const { r$ } = useRegle(
  { name: '' },
  { name: { required } },
  { disabled }
);

disabled.value = true;
r$.$value.name = 'John'; // value updates, validation is paused

disabled.value = false; // validation reactivity resumes
```


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

Check the [External errors](/common-usage/external-errors) section for more details.


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


### `clearExternalErrorsOnValidate`

__Type__: `boolean`

__Default__: `false`

This mode is similar to `clearExternalErrorsOnChange`, but for the `$validate` and `$validateSync` methods.
Setting it to `false` will keep the server errors until `$clearExternalErrors` is called manually, or the `externalErrors` is set again.

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


`$autoDirty` `$lazy`, `$silent`, `$immediateDirty` and `$rewardEarly` work the same as the deep modifiers.

### `$debounce`
Type: `number` (ms)

This let you declare the number of milliseconds the rule needs to wait before executing. Useful for async or heavy computations.

:::tip
All async rules have a default debounce of `200ms`, you can disable or modify this setting with `$debounce`
:::

### `$isEdited`
Type: `(currentValue: MaybeInput<TValue>, initialValue: MaybeInput<TValue>, defaultHandlerFn: (currentValue: unknown, initialValue: unknown) => boolean) => boolean`

Override the default `$edited` property handler. Useful to handle custom comparisons for complex object types.

:::warning
It's highly recommended to use this modifier with the [`markStatic`](/advanced-usage/immutable-constructors) helper to handle immutable constructors.
:::

```ts
import { markStatic, useRegle } from '@regle/core';
import { Decimal } from 'decimal.js';
import { required } from '@regle/rules';

const { r$ } = useRegle({ decimal: markStatic(new Decimal(1)) }, {
  decimal: {
    required,
    $isEdited(currentValue, initialValue, defaultHandlerFn) {
      if (currentValue != null && initialValue != null) {
        return currentValue.toNearest(0.01).toString() !== initialValue.toNearest(0.01).toString();
      }
      // fallback to the default handler
      return defaultHandlerFn(currentValue, initialValue);
    },
  },
})
```


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
