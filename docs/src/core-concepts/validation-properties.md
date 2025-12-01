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

r$.email.$e
//         ^|
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


### `$initialValue` 
- Type: `TValue` 

Initial value of the field.

  
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

### `$issues` 
- Type: `RegleFieldIssue[]`

Collect all metadata of validators (errors, messages etc). Only contains metadata from properties where $dirty equals true.

### `$name` 
- Type: `readonly string`

Return the current key name of the field.

## Common methods for fields


### `$validate` 
- Type: `(forceValues?: TState) => Promise<false | SafeOutput<TState>>`

Sets all properties as dirty, triggering all rules. 
It returns a promise that will either resolve to `false` or a Headless copy of your form state. Values that had the `required` rule will be transformed into a non-nullable value (type only).

### `forceValues` parameter

The first argument is optional and can be used to assign a new state before validating. It's equivalent to use `r$.$value = x` and `r$.$validate();`.

### `$extractDirtyFields` 
- Type: `(filterNullishValues = true) => PartialDeep<TState>`

Will return a copy of your state with only the fields that are dirty.
By default it will filter out nullish values or objects, but you can override it with the first parameter `$extractDirtyFields(false)`.

### `$touch` 
- Type: `() => void`

Marks the field and all nested properties as `$dirty`.

### `$reset` 
- Type: `(options?: ResetOptions) => void`

Reset the validation status to a pristine state while keeping the current state.
The current state is treated as the new initial state.

#### Options


| Option                | Type                          | Description                                                                                                                                                                                                                 |
|-----------------------|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `toInitialState`      | `boolean`                     | Reset validation status and reset form state to its initial state.<br><br>Initial state is different from the original state, as it can be mutated when using `$reset`. This serves as the base comparison for `$edited`.<br><br>⚠️ This doesn't work if the state is a `reactive` object. |
| `toOriginalState`     | `boolean`                     | Reset validation status and reset form state to its original state.<br><br>Original state is the unmutated state that was passed to the form when it was initialized.                                                       |
| `toState`             | `TState` or `() => TState`    | Reset validation status and reset form state to the given state. Also sets the new state as the new initial state.                                                                    |
| `clearExternalErrors` | `boolean`                     | Clears the `$externalErrors` state back to an empty object.                                                                                                                           |
     

Example:

```ts
r$.$reset(); // Only reset validation state
```

```ts
r$.$reset({ toInitialState: true }); // Reset validation state and form state to initial state
```

```ts
r$.$reset({ toOriginalState: true }); // Reset validation state and form state to original state
```

```ts
r$.$reset({ toState: { email: 'test@test.com' } }); // Reset validation state and form state to the given state
```

```ts
r$.$reset({ clearExternalErrors: true }); // Clear $externalErrors state
```

### `$clearExternalErrors` 
- Type: `() => void`

Clears the $externalResults state back to an empty object.



## Specific properties for fields

### `$rules` 
- Type: `Record<string, RegleRuleStatus>`

This is reactive tree containing all the declared rules of your field.
To know more about the rule properties check the [rules properties section](/core-concepts/rules/rules-properties)

   
### `$silentIssues` 
- Type: `RegleFieldIssue[]`

Collect all metadata of validators (errors, messages etc).
   

## Specific properties for nested objects

### `$fields` 
- Type: `Record<string, RegleStatus | RegleFieldStatus | RegleCollectionStatus>`

This represents all the children of your object. You can access any nested child at any depth to get the relevant data you need for your form.


## Specific properties for collections

Check documentation for [collections here](/common-usage/collections)


### `$each`
- Type: `Array<string, RegleStatus>`

This will store the status of every item in your collection. Each item will be a field you can access, or map on it to display your elements.

### `$self` 
- Type: `RegleFieldStatus`
Represents the status of the collection itself. You can have validation rules on the array like `minLength`, this field represents the isolated status of the collection.
