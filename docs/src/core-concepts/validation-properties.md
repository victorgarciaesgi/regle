---
title: Validation properties
description: Validation properties are computed values or methods available for every nested rule status
---

# Validation properties

Validation properties are computed values or methods available for every nested rule status, including `r$` and `regle`.

Let's take a look at a simple example to explain the different properties.

``` vue twoslash
<script setup lang='ts'>
// @noErrors
import { useRegle } from '@regle/core';
import { required } from '@regle/rules';
import { ref } from 'vue';

const form = ref({ email: '', user: { firstName: '', lastName: '' } });

const { r$ } = useRegle(form, {
  email: { required },
  user: {
    firstName: { required },
  }
})

r$.$fields.email.$e
//                 ^|
</script>
```
<br/>

## Computed properties for fields

### `$invalid` 
- Type: `readonly boolean`

Indicates whether the field is invalid. It becomes `true` if any associated rules return `false`.


### `$correct`
- Type: `readonly boolean`
  
This is not the opposite of `$invalid`. Correct is meant to display UI validation report. 
This will be `true` only if:
- The field have at least one active rule
- Is dirty and not empty
- Passes validation


### `$dirty`
- Type: `readonly boolean`
  
Indicates whether a field has been validated or interacted with by the user at least once. It's typically used to determine if a message should be displayed to the user. You can change this flag manually using the `$touch` and `$reset` methods. The `$dirty` flag is considered true if the current model has been touched or if all its children are dirty. 


### `$anyDirty`
- Type: `readonly boolean`

Similar to `$dirty`, with one exception. The `$anyDirty` flag is considered true if given model was touched or any of its children are `$anyDirty` which means at least one descendant is `$dirty`.


### `$edited`
- Type: `readonly boolean`
  
Indicates whether a field has been touched and if the value is different than the initial one.


### `$anyEdited`
- Type: `readonly boolean`

Similar to `$edited`, with one exception. The $anyEdited flag is considered true if given model was edited or any of its children are $anyEdited which means at least one descendant is `$edited`.


### `$value`
- Type: `TValue` (The current property value type)

A reference to the original validated model. It can be used to bind your form with `v-model`.

### `$silentValue`
- Type: `TValue` (The current property value type)
  

`$value` variant that will not "touch" the field and update the value silently, running only the rules, so you can easily swap values without impacting user interaction.


### `$pending`
- Type: `readonly boolean`

Indicates if any async rule for the field is currently running. Always `false` for synchronous rules.

### `$ready`
- Type: `readonly boolean`

Indicates whether the field is ready for submission. Equivalent to `!$invalid && !$pending`.


### `$error`
- Type: `readonly boolean`

Convenience flag to easily decide if a message should be displayed. Equivalent to `$dirty && !$pending && $invalid`.


### `$errors`
- Type: `readonly string[]`

Collection of all the error messages, collected for all children properties and nested forms. Only contains errors from properties where $dirty equals `true`.

### `$silentErrors`
- Type: `readonly string[]`

Collection of all the error messages, collected for all children properties.

### `$name`
- Type: `readonly string`

Return the current key name of the field.

## Common methods for fields


### `$validate`
- Type: `() => Promise<false | SafeOutput<TState>>`

Sets all properties as dirty, triggering all rules. 
It returns a promise that will either resolve to `false` or a type safe copy of your form state. Values that had the `required` rule will be transformed into a non-nullable value (type only).

### `$extractDirtyFields`
- Type: `(filterNullishValues = true) => PartialDeep<TState>`

Will return a copy of your state with only the fields that are dirty.
By default it will filter out nullish values or objects, but you can override it with the first parameter `$extractDirtyFields(false)`.

### `$touch`
- Type: `() => void`

Marks the field and all nested properties as `$dirty`.

### `$reset`
- Type: `() => void`

- Restore the validation state to a pristine state while keeping the current state.
- Resets the `$dirty` state on all nested properties of a form.
- Rerun rules if `$lazy` is false

### `$resetAll`
- Type: `() => void`

Will reset both your validation state and your form state to their initial values.

### `$clearExternalErrors`
- Type: `() => void`

Clears the $externalResults state back to an empty object.



## Specific properties for fields

### `$rules`
- Type: `Record<string, RegleRuleStatus>`

This is reactive tree containing all the declared rules of your field.
To know more about the rule properties check the [rules properties section](/core-concepts/rules/rules-properties)


## Specific properties for nested objects

### `$fields`
- Type: `Record<string, RegleStatus | RegleFieldStatus | RegleCollectionStatus>`

This represents all the children of your object. You can access any nested child at any depth to get the relevant data you need for your form.


## Specific properties for collections
- Type: `Array<string, RegleStatus>`


### `$each`

This will store the status of every item in your collection. Each item will be a field you can access, or map on it to display your elements.

### `$self`

Represents the status of the collection itself. You can have validation rules on the array like `minLength`, this field represents the isolated status of the collection.
