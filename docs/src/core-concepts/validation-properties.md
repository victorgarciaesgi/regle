---
title: Validation properties
---

# Validation properties

Validation properties are computed values or methods available in every nested rule status (including `r$` and `regle`)


Let's make a simple exemple to explain the different properties

``` vue twoslash
<script setup lang='ts'>
// @noErrors
import {useRegle} from '@regle/core';
import {required} from '@regle/rules';
import {ref} from 'vue';

const form = ref({email: '', user: {firstName: '', lastName: ''}});

const {r$} = useRegle(form, {
  email: {required},
  user: {
    firstName: {required},
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

Indicates the state of validation for given model becomes true when any of its children rules specified in options returns a falsy value.


### `$valid`
- Type: `readonly boolean`
  
This will be true only if the field is `$dirty` and the value is not empty. It's useful to display UI indicators that the field is correct.


### `$dirty`
- Type: `readonly boolean`
  

A flag indicating whether the field being validated has been interacted with by the user at least once. It's typically used to determine if a message should be displayed to the user. You can control this flag manually using the `$touch` and `$reset` methods. The `$dirty` flag is considered true if the current model has been touched or if all its child models are `$dirty`. 


### `$anyDirty`
- Type: `readonly boolean`

A flag very similar to `$dirty`, with one exception. The `$anyDirty` flag is considered true if given model was $touched or any of its children are `$anyDirty` which means at least one descendant is `$dirty`.


### `$value`
- Type: `TValue` (The current property value type)
  
A reference to the original validated model. It can be used to bind your form with `v-model` too


### `$pending`
- Type: `readonly boolean`

Indicates if any child async rule is currently pending. Always false if all rules are synchronous.

### `$ready`: 
- Type: `readonly boolean`

A computed state indicating if your form is ready to submit (to compute a disabled state on a button). It's equivalent to `!$invalid && !$pending`.


### `$error`
- Type: `readonly boolean`

Convenience flag to easily decide if a message should be displayed. Equivalent to `$dirty && !$pending && $invalid`


### `$errors`
- Type: `readonly string[]`

Collection of all the error messages, collected for all child properties and nested forms. Only contains errors from properties where $dirty equals true.

### `$silentErrors`
- Type: `readonly string[]`

Collection of all the error messages, collected for all child properties.

### `$name`
- Type: `readonly string`

Return the current key name of the field.

## Common methods for fields


### `$validate`
- Type: `() => Promise<false | SafeOutput<TState>>`

Sets all properties as dirty, triggering all rules. 
It returns a promise that will either resolve to `false` or a type safe copy of your form state. Values that had the `required` rule will be transformed into a non-nullable value (type only)

### `$extractDirtyFields`
- Type: `(filterNullishValues = true) => PartialDeep<TState>`

Will return a copy of your state with only the fields that are dirty.
By default it will filter out nullish values or objects, but you can override it with the first parameter `$extractDirtyFields(false)`.

### `$touch`
- Type: `() => void`

Sets its property and all nested properties $dirty state to true.

### `$reset`
- Type: `() => void`

Resets the $dirty state on all nested properties of a form.

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
To know more about the rule properties check the [rules properties section](/core-concepts/rules-properties)


## Specific properties for nested objects

### `$fields`
- Type: `Record<string, RegleStatu | RegleFieldStatus | RegleCollectionStatus>`

This represents all the children of your object. You can access any nested child at any depth to get the relevant data you need for your form.


## Specific properties for collections


### `$each`

### `$field`
